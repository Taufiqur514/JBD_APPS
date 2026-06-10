import { cookies } from "next/headers";
import * as XLSX from "xlsx";
import { verifySessionToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ensureSeed, invalidateMvpCache } from "@/lib/mvp-store";
import { redirectResponse } from "@/lib/redirect-response";
import { isSupabaseConfigured, queryPostgres } from "@/lib/supabase-server";

export const runtime = "nodejs";

type BulkRow = Record<string, unknown>;

type ImportProduct = {
  sku: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  taste: string;
  composition: string[];
  serving: string;
  price: number;
  stockTotal: number;
  rating: number;
  soldCount: number;
  active: boolean;
  variants: Array<{ name: string; sku: string; price: number; weightGrams: number | null; stock: number }>;
  imageUrls: string[];
  videoUrls: string[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function text(row: BulkRow, key: string) {
  return String(row[key] ?? "").trim();
}

function numberValue(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const cleaned = String(value ?? "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function numberCell(row: BulkRow, key: string, fallback = 0) {
  return numberValue(row[key], fallback);
}

function uniqueNonEmpty(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function activeFromStatus(value: string) {
  const normalized = value.toLowerCase();
  return !["draft", "inactive", "nonaktif", "arsip", "archived"].includes(normalized);
}

function toProduct(row: BulkRow): ImportProduct | null {
  const name = text(row, "nama_produk") || text(row, "name");
  const category = text(row, "kategori") || text(row, "category");
  const price = Math.max(0, numberCell(row, "harga", numberCell(row, "price", 0)));
  if (!name || !category || price <= 0) return null;

  const slug = slugify(text(row, "slug_opsional") || name);
  const sku = (text(row, "sku") || `JBD-${slug.slice(0, 10).toUpperCase()}`).toUpperCase();
  const variants = Array.from({ length: 5 }, (_, index) => index + 1)
    .map((slot) => {
      const variantName = text(row, `variant_${slot}_nama`);
      if (!variantName) return null;
      const variantSlug = slugify(variantName).toUpperCase() || String(slot);
      return {
        name: variantName,
        sku: `${sku}-${variantSlug}`,
        price: Math.max(0, numberCell(row, `variant_${slot}_harga`, price)),
        weightGrams: numberCell(row, `variant_${slot}_berat_gram`, 0) || null,
        stock: Math.max(0, Math.round(numberCell(row, `variant_${slot}_stok`, 0))),
      };
    })
    .filter((variant): variant is ImportProduct["variants"][number] => Boolean(variant));
  const stockTotal = variants.length
    ? variants.reduce((total, variant) => total + variant.stock, 0)
    : Math.max(0, Math.round(numberCell(row, "stok_total", numberCell(row, "stock", 0))));

  return {
    sku,
    slug,
    name,
    category,
    description: text(row, "deskripsi") || text(row, "description"),
    taste: text(row, "rasa_taste") || category,
    composition: uniqueNonEmpty((text(row, "komposisi_pisah_koma") || "Powder blend,Creamer,Natural flavor").split(",")),
    serving: text(row, "cara_penyajian"),
    price,
    stockTotal,
    rating: Math.min(5, Math.max(0, numberCell(row, "rating_opsional", 4.8))),
    soldCount: Math.max(0, Math.round(numberCell(row, "terjual_opsional", 0))),
    active: activeFromStatus(text(row, "status") || "published"),
    variants,
    imageUrls: uniqueNonEmpty(Array.from({ length: 10 }, (_, index) => text(row, `image_${index + 1}_url`))).slice(0, 10),
    videoUrls: uniqueNonEmpty(Array.from({ length: 3 }, (_, index) => text(row, `video_${index + 1}_url`))).slice(0, 3),
  };
}

async function importSupabaseProduct(product: ImportProduct) {
  const categorySlug = slugify(product.category);
  await queryPostgres(
    `insert into public.warehouses (code, name, address, active)
     values ('BKS', 'Bekasi Main Warehouse', 'Bekasi, Jawa Barat', true)
     on conflict (code) do update set name = excluded.name, active = true`,
  );
  await queryPostgres(
    `insert into public.categories(slug, name, active)
     values ($1, $2, true)
     on conflict (slug) do update set name = excluded.name, active = true`,
    [categorySlug, product.category],
  );

  const productResult = await queryPostgres<{ id: string }>(
    `insert into public.products (
      category_id, slug, sku, name, description, taste, composition, serving,
      price, rating, sold_count, cover_url, active, updated_at
    )
    values (
      (select id from public.categories where slug = $1), $2, $3, $4, $5, $6,
      $7::jsonb, $8, $9, $10, $11, $12, $13, now()
    )
    on conflict (slug) do update set
      category_id = excluded.category_id,
      sku = excluded.sku,
      name = excluded.name,
      description = excluded.description,
      taste = excluded.taste,
      composition = excluded.composition,
      serving = excluded.serving,
      price = excluded.price,
      rating = excluded.rating,
      sold_count = excluded.sold_count,
      cover_url = coalesce(excluded.cover_url, public.products.cover_url),
      active = excluded.active,
      updated_at = now()
    returning id`,
    [
      categorySlug,
      product.slug,
      product.sku,
      product.name,
      product.description,
      product.taste,
      JSON.stringify(product.composition),
      product.serving,
      product.price,
      product.rating,
      product.soldCount,
      product.imageUrls[0] ?? null,
      product.active,
    ],
  );
  const productId = productResult.rows[0].id;

  if (product.variants.length) {
    await queryPostgres("update public.product_variants set active = false where product_id = $1", [productId]);
    for (const variant of product.variants) {
      const variantResult = await queryPostgres<{ id: string }>(
        `insert into public.product_variants (product_id, name, sku, price, weight_grams, active)
         values ($1, $2, $3, $4, $5, true)
         on conflict (sku) do update set
          name = excluded.name,
          price = excluded.price,
          weight_grams = excluded.weight_grams,
          active = true
         returning id`,
        [productId, variant.name, variant.sku, variant.price, variant.weightGrams],
      );
      await queryPostgres(
        `with updated as (
          update public.inventory_batches
          set quantity = $4, updated_at = now()
          where warehouse_id = (select id from public.warehouses where code = 'BKS')
            and product_id = $1
            and variant_id = $2
            and batch_number = $3
          returning id
        )
        insert into public.inventory_batches (
          warehouse_id, product_id, variant_id, batch_number, expiry_date, quantity, reserved
        )
        select (select id from public.warehouses where code = 'BKS'), $1, $2, $3, '2027-06-30', $4, 0
        where not exists (select 1 from updated)`,
        [productId, variantResult.rows[0].id, `BKS-${product.slug.slice(0, 3).toUpperCase()}-${slugify(variant.name).toUpperCase()}-BULK`, variant.stock],
      );
    }
    await queryPostgres("delete from public.inventory_batches where product_id = $1 and variant_id is null", [productId]);
  } else {
    await queryPostgres(
      `with updated as (
        update public.inventory_batches
        set quantity = $3, updated_at = now()
        where warehouse_id = (select id from public.warehouses where code = 'BKS')
          and product_id = $1
          and variant_id is null
          and batch_number = $2
        returning id
      )
      insert into public.inventory_batches (
        warehouse_id, product_id, batch_number, expiry_date, quantity, reserved
      )
      select (select id from public.warehouses where code = 'BKS'), $1, $2, '2027-06-30', $3, 0
      where not exists (select 1 from updated)`,
      [productId, `BKS-${product.slug.slice(0, 3).toUpperCase()}-BULK`, product.stockTotal],
    );
  }

  if (product.imageUrls.length) {
    await queryPostgres("delete from public.product_images where product_id = $1", [productId]);
    for (const [index, imageUrl] of product.imageUrls.entries()) {
      await queryPostgres(
        `insert into public.product_images (
          product_id, media_url, alt_text, sort_order, is_cover
        )
        values ($1, $2, $3, $4, $5)`,
        [productId, imageUrl, product.name, index, index === 0],
      );
    }
    await queryPostgres("update public.products set cover_url = $2 where id = $1", [productId, product.imageUrls[0]]);
  }

  if (product.videoUrls.length) {
    await queryPostgres(
      "delete from public.content_assets where product_id = $1 and type = 'product_video'::public.content_type",
      [productId],
    );
    for (const [index, videoUrl] of product.videoUrls.entries()) {
      await queryPostgres(
        `insert into public.content_assets (
          title, slug, type, status, placement, product_id, product_slug,
          media_url, caption, keywords, published_at
        )
        values (
          $1, $2, 'product_video'::public.content_type, 'published'::public.publish_status,
          'Product detail + Live/Reel', $3, $4, $5, $6, $7::text[], now()
        )
        on conflict (slug) do update set
          title = excluded.title,
          media_url = excluded.media_url,
          caption = excluded.caption,
          status = excluded.status,
          published_at = now()`,
        [
          `${product.name} Video ${index + 1}`,
          `${product.slug}-bulk-video-${index + 1}`,
          productId,
          product.slug,
          videoUrl,
          product.description || `Video produk ${product.name}`,
          [product.slug, categorySlug, "product-video", "reel"],
        ],
      );
    }
  }
}

async function importMongoProduct(product: ImportProduct) {
  await ensureSeed();
  const db = await getDb();
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(product.price);
  await db.collection("products").updateOne(
    { slug: product.slug },
    {
      $set: {
        slug: product.slug,
        sku: product.sku,
        name: product.name,
        taste: product.taste,
        category: product.category,
        price: formattedPrice,
        numericPrice: product.price,
        stock: product.stockTotal,
        description: product.description,
        composition: product.composition,
        serving: product.serving,
        rating: String(product.rating),
        sold: String(product.soldCount),
        coverUrl: product.imageUrls[0],
        images: product.imageUrls.map((url, index) => ({ url, alt: product.name, sortOrder: index, isCover: index === 0 })),
        videos: product.videoUrls,
        active: product.active,
        variants: product.variants.length ? product.variants.map((variant) => variant.name) : ["Default"],
        variantDetails: product.variants,
        updatedAt: new Date().toISOString(),
      },
    },
    { upsert: true },
  );
  await db.collection("inventory").updateOne(
    { productSlug: product.slug },
    { $set: { productSlug: product.slug, stock: product.stockTotal, reserved: 0, batch: `BKS-${product.slug.slice(0, 3).toUpperCase()}-BULK`, expiry: "2027-06-30" } },
    { upsert: true },
  );
  if (product.variants.length) {
    await db.collection("variant_inventory").deleteMany({ productSlug: product.slug });
    await db.collection("variant_inventory").insertMany(
      product.variants.map((variant) => ({
        productSlug: product.slug,
        variantName: variant.name,
        stock: variant.stock,
        reserved: 0,
        warehouse: "Bekasi",
        updatedAt: new Date().toISOString(),
      })),
    );
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get("jbd_session")?.value);
  if (!session || !["admin", "seller"].includes(session.role)) {
    return new Response("Akses bulk upload hanya untuk Admin Commerce.", { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return new Response("Pilih file Excel terlebih dahulu.", { status: 400 });
  }

  const workbook = XLSX.read(Buffer.from(await file.arrayBuffer()), { type: "buffer" });
  const sheet = workbook.Sheets.Produk ?? workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) {
    return new Response("Sheet Produk tidak ditemukan.", { status: 400 });
  }

  const rows = XLSX.utils.sheet_to_json<BulkRow>(sheet, { defval: "", raw: false }).slice(0, 10_000);
  const products = rows.map(toProduct);
  let imported = 0;
  let failed = 0;

  for (const product of products) {
    if (!product) {
      failed += 1;
      continue;
    }
    try {
      if (isSupabaseConfigured()) {
        await importSupabaseProduct(product);
      } else {
        await importMongoProduct(product);
      }
      imported += 1;
    } catch {
      failed += 1;
    }
  }

  invalidateMvpCache();
  return redirectResponse(`/admin/products/bulk-upload?imported=${imported}&failed=${failed}`, request);
}
