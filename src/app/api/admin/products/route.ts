import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ensureSeed, invalidateMvpCache } from "@/lib/mvp-store";
import { redirectResponse } from "@/lib/redirect-response";
import {
  getPublicStorageUrl,
  getSupabaseAdminClient,
  isSupabaseConfigured,
  queryPostgres,
} from "@/lib/supabase-server";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const allowedVideoTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const imageTypeByExtension = new Map([
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["png", "image/png"],
  ["webp", "image/webp"],
  ["avif", "image/avif"],
]);
const videoTypeByExtension = new Map([
  ["mp4", "video/mp4"],
  ["webm", "video/webm"],
  ["mov", "video/quicktime"],
]);
const maxImages = 10;
const maxVideos = 3;
const maxImageSize = 10 * 1024 * 1024;
const maxVideoSize = 100 * 1024 * 1024;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function safeFileName(value: string) {
  const extension = value.includes(".") ? `.${value.split(".").pop()?.toLowerCase()}` : "";
  const baseName = slugify(value.replace(/\.[^.]+$/, "")) || "product-image";
  return `${baseName}${extension}`;
}

function fileExtension(value: string) {
  return value.includes(".") ? String(value.split(".").pop() ?? "").toLowerCase() : "";
}

async function inferImageType(file: File) {
  if (allowedImageTypes.has(file.type)) return file.type;
  const extensionType = imageTypeByExtension.get(fileExtension(file.name));
  if (extensionType) return extensionType;
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
  if (String.fromCharCode(...bytes.slice(4, 8)) === "ftyp" && String.fromCharCode(...bytes.slice(8, 12)).includes("avif")) return "image/avif";
  return "";
}

function inferVideoType(file: File) {
  if (allowedVideoTypes.has(file.type)) return file.type;
  return videoTypeByExtension.get(fileExtension(file.name)) ?? "";
}

function formDataStrings(formData: FormData, name: string) {
  return formData.getAll(name).map((item) => String(item ?? "").trim());
}

type ImageManifestItem = {
  kind: "existing" | "new";
  url?: string;
  fileName?: string;
  fileSize?: number;
  sortOrder?: number;
  isCover?: boolean;
};

function parseImageManifest(value: FormDataEntryValue | null): ImageManifestItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is ImageManifestItem => item && typeof item === "object" && ["existing", "new"].includes(String(item.kind)))
      .slice(0, maxImages);
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get("jbd_session")?.value);
  if (!session || !["admin", "seller"].includes(session.role)) {
    return new Response("Akses produk hanya untuk Admin Commerce.", { status: 403 });
  }

  const formData = await request.formData();
  const mode = String(formData.get("mode") ?? "create");
  const currentSlug = String(formData.get("slug") ?? "");
  const name = String(formData.get("name") ?? "JBD New Product");
  const slug = currentSlug || slugify(name);
  const category = String(formData.get("category") ?? "Chocolate");
  const description = String(formData.get("description") ?? "");
  const serving = String(formData.get("serving") ?? "");
  const numericPrice = Number(formData.get("price") ?? 89000);
  const stock = Number(formData.get("stock") ?? 0);
  const variantNames = formDataStrings(formData, "variantName").filter(Boolean);
  const variantPrices = formDataStrings(formData, "variantPrice");
  const variantWeights = formDataStrings(formData, "variantWeight");
  const variantStocks = formDataStrings(formData, "variantStock");
  const effectiveStock = variantNames.length
    ? variantStocks.reduce((total, value) => total + Math.max(0, Number(value) || 0), 0)
    : stock;
  const hasImageManifest = formData.has("imageManifest");
  const imageManifest = parseImageManifest(formData.get("imageManifest"));
  const imageFiles = formData
    .getAll("images")
    .filter((item): item is File => item instanceof File && item.size > 0)
    .slice(0, maxImages);
  const videoFiles = formData
    .getAll("videos")
    .filter((item): item is File => item instanceof File && item.size > 0)
    .slice(0, maxVideos);
  const now = new Date().toISOString();

  if (formData.getAll("images").filter((item) => item instanceof File && item.size > 0).length > maxImages) {
    return new Response("Maksimal upload 10 gambar produk.", { status: 400 });
  }
  if (formData.getAll("videos").filter((item) => item instanceof File && item.size > 0).length > maxVideos) {
    return new Response("Maksimal upload 3 video produk.", { status: 400 });
  }

  const imageContentTypes = new Map<File, string>();
  for (const image of imageFiles) {
    const contentType = await inferImageType(image);
    if (!contentType) {
      return new Response("Format gambar harus JPG, PNG, WebP, atau AVIF.", { status: 415 });
    }
    imageContentTypes.set(image, contentType);
    if (image.size > maxImageSize) {
      return new Response("Ukuran tiap gambar produk maksimal 10 MB.", { status: 413 });
    }
  }
  const videoContentTypes = new Map<File, string>();
  for (const video of videoFiles) {
    const contentType = inferVideoType(video);
    if (!contentType) {
      return new Response("Format video harus MP4, WebM, atau MOV.", { status: 415 });
    }
    videoContentTypes.set(video, contentType);
    if (video.size > maxVideoSize) {
      return new Response("Ukuran tiap video produk maksimal 100 MB.", { status: 413 });
    }
  }

  if (isSupabaseConfigured()) {
    const uploadedPaths: string[] = [];
    const storageBucket = "commerce-media";
    const categorySlug = slugify(category);
    await queryPostgres(
      `insert into public.categories(slug, name, active)
       values ($1, $2, true)
       on conflict (slug) do update set name = excluded.name, active = true`,
      [categorySlug, category],
    );

    const productResult = await queryPostgres<{ id: string }>(
      `insert into public.products (
        category_id, slug, sku, name, description, taste, composition,
        serving, price, active, updated_at
      )
      values (
        (select id from public.categories where slug = $1), $2, $3, $4,
        $5, $6, $7::jsonb, $8, $9, true, now()
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
        active = true,
        updated_at = now()
      returning id`,
      [
        categorySlug,
        slug,
        `JBD-${slug.slice(0, 6).toUpperCase()}`,
        name,
        description,
        category,
        JSON.stringify(["Powder blend", "Creamer", "Natural flavor"]),
        serving,
        numericPrice,
      ],
    );
    const productId = productResult.rows[0].id;

    if (variantNames.length) {
      await queryPostgres("update public.product_variants set active = false where product_id = $1", [productId]);
      for (const [index, variantName] of variantNames.entries()) {
        const variantPrice = Math.max(0, Number(variantPrices[index] || numericPrice) || numericPrice);
        const weight = Number(variantWeights[index] || 0);
        const variantStock = Math.max(0, Number(variantStocks[index] || 0) || 0);
        const variantSku = `JBD-${slug.slice(0, 8).toUpperCase()}-${slugify(variantName).toUpperCase()}`;
        const variantResult = await queryPostgres<{ id: string }>(
          `insert into public.product_variants (
            product_id, name, sku, price, weight_grams, active
          )
          values ($1, $2, $3, $4, $5, true)
          on conflict (sku) do update set
            name = excluded.name,
            price = excluded.price,
            weight_grams = excluded.weight_grams,
            active = true
          returning id`,
          [productId, variantName, variantSku, variantPrice, weight > 0 ? weight : null],
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
          select
            (select id from public.warehouses where code = 'BKS'),
            $1, $2, $3, '2027-06-30', $4, 0
          where not exists (select 1 from updated)`,
          [productId, variantResult.rows[0].id, `BKS-${slug.slice(0, 3).toUpperCase()}-${slugify(variantName).toUpperCase()}-2606`, variantStock],
        );
      }
      await queryPostgres(
        `delete from public.inventory_batches
         where product_id = $1 and variant_id is null`,
        [productId],
      );
    }

    if (!variantNames.length) {
      await queryPostgres(
        `with updated as (
          update public.inventory_batches
          set quantity = $3, updated_at = now()
          where warehouse_id = (select id from public.warehouses where code = 'BKS')
            and product_id = (select id from public.products where slug = $1)
            and variant_id is null
            and batch_number = $2
          returning id
        )
        insert into public.inventory_batches (
          warehouse_id, product_id, batch_number, expiry_date, quantity, reserved
        )
        select
          (select id from public.warehouses where code = 'BKS'),
          (select id from public.products where slug = $1),
          $2, '2027-06-30', $3, 0
        where not exists (select 1 from updated)`,
        [slug, `BKS-${slug.slice(0, 3).toUpperCase()}-2606`, stock],
      );
    }

    if (imageFiles.length || hasImageManifest) {
      const supabase = getSupabaseAdminClient();
      try {
        const existingRows = await queryPostgres<{
          id: string;
          media_url: string;
          storage_bucket: string | null;
          storage_path: string | null;
        }>(
          `select id, media_url, storage_bucket, storage_path
           from public.product_images
           where product_id = $1`,
          [productId],
        );
        const existingByUrl = new Map(existingRows.rows.map((row) => [row.media_url, row]));
        const uploadManifest = imageManifest.slice();
        const uploadManifestKeys = new Set(
          uploadManifest
            .filter((item) => item.kind === "new")
            .map((item) => `${item.fileName ?? ""}:${Number(item.fileSize ?? 0)}`),
        );
        for (const file of imageFiles) {
          const key = `${file.name}:${file.size}`;
          if (uploadManifestKeys.has(key)) continue;
          uploadManifestKeys.add(key);
          uploadManifest.push({
            kind: "new",
            fileName: file.name,
            fileSize: file.size,
            sortOrder: uploadManifest.length,
          });
        }
        const manifestExistingUrls = new Set(
          uploadManifest
            .filter((item) => item.kind === "existing" && item.url)
            .map((item) => String(item.url)),
        );
        const removedRows = existingRows.rows.filter((row) => !manifestExistingUrls.has(row.media_url));
        if (removedRows.length) {
          await queryPostgres(
            `delete from public.product_images
             where product_id = $1
              and media_url = any($2::text[])`,
            [productId, removedRows.map((row) => row.media_url)],
          );
          const storagePaths = removedRows
            .filter((row) => row.storage_bucket === storageBucket && row.storage_path)
            .map((row) => row.storage_path as string);
          if (storagePaths.length) {
            await supabase.storage.from(storageBucket).remove(storagePaths).catch(() => undefined);
          }
        }

        const newFileQueues = new Map<string, File[]>();
        for (const file of imageFiles) {
          const key = `${file.name}:${file.size}`;
          newFileQueues.set(key, [...(newFileQueues.get(key) ?? []), file]);
        }
        const uploadedNewImages: Array<{ fileName: string; fileSize: number; mediaUrl: string; storagePath: string }> = [];

        const newManifestItems = uploadManifest.length
          ? uploadManifest.filter((entry) => entry.kind === "new")
          : imageFiles.map((file, index) => ({
            kind: "new" as const,
            fileName: file.name,
            fileSize: file.size,
            sortOrder: index,
          }));

        for (const item of newManifestItems) {
          const key = `${item.fileName ?? ""}:${Number(item.fileSize ?? 0)}`;
          const queue = newFileQueues.get(key) ?? [];
          const image = queue.shift();
          if (!image) continue;
          newFileQueues.set(key, queue);
          const date = new Date();
          const storagePath = `products/${slug}/${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}-${safeFileName(image.name)}`;
          const { error } = await supabase.storage.from(storageBucket).upload(storagePath, image, {
            contentType: imageContentTypes.get(image) ?? image.type,
            cacheControl: "31536000",
            upsert: false,
          });
          if (error) throw new Error(error.message);
          uploadedPaths.push(storagePath);
          uploadedNewImages.push({
            fileName: image.name,
            fileSize: image.size,
            mediaUrl: getPublicStorageUrl(storagePath, storageBucket),
            storagePath,
          });
        }

        const uploadedQueues = new Map<string, typeof uploadedNewImages>();
        for (const image of uploadedNewImages) {
          const key = `${image.fileName}:${image.fileSize}`;
          uploadedQueues.set(key, [...(uploadedQueues.get(key) ?? []), image]);
        }

        const orderedManifest = uploadManifest.length
          ? uploadManifest
          : imageFiles.map((file, index) => ({ kind: "new" as const, fileName: file.name, fileSize: file.size, sortOrder: index }));
        let coverUrl: string | null = null;
        for (const [index, item] of orderedManifest.entries()) {
          if (item.kind === "existing" && item.url) {
            const existing = existingByUrl.get(item.url);
            if (!existing) continue;
            await queryPostgres(
              `update public.product_images
               set sort_order = $3, is_cover = $4, alt_text = $5
               where id = $1 and product_id = $2`,
              [existing.id, productId, index, index === 0, name],
            );
            if (index === 0) coverUrl = existing.media_url;
            continue;
          }
          const key = `${item.fileName ?? ""}:${Number(item.fileSize ?? 0)}`;
          const queue = uploadedQueues.get(key) ?? [];
          const uploaded = queue.shift();
          if (!uploaded) continue;
          uploadedQueues.set(key, queue);
          await queryPostgres(
            `insert into public.product_images (
              product_id, storage_bucket, storage_path, media_url,
              alt_text, sort_order, is_cover
            )
            values ($1, $2, $3, $4, $5, $6, $7)`,
            [productId, storageBucket, uploaded.storagePath, uploaded.mediaUrl, name, index, index === 0],
          );
          if (index === 0) coverUrl = uploaded.mediaUrl;
        }
        await queryPostgres("update public.products set cover_url = $2 where id = $1", [productId, coverUrl]);
      } catch (error) {
        if (uploadedPaths.length) {
          await supabase.storage.from(storageBucket).remove(uploadedPaths).catch(() => undefined);
        }
        return new Response(
          `Upload gambar produk gagal: ${error instanceof Error ? error.message : "error tidak dikenal"}`,
          { status: 502 },
        );
      }
    }

    if (videoFiles.length) {
      const supabase = getSupabaseAdminClient();
      try {
        for (const [index, video] of videoFiles.entries()) {
          const date = new Date();
          const storagePath = `products/${slug}/videos/${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}-${safeFileName(video.name)}`;
          const { error } = await supabase.storage.from(storageBucket).upload(storagePath, video, {
            contentType: videoContentTypes.get(video) ?? video.type,
            cacheControl: "31536000",
            upsert: false,
          });
          if (error) throw new Error(error.message);
          uploadedPaths.push(storagePath);
          const mediaUrl = getPublicStorageUrl(storagePath, storageBucket);
          await queryPostgres(
            `insert into public.content_assets (
              title, slug, type, status, placement, product_id, product_slug,
              storage_bucket, storage_path, media_url, mime_type, file_size,
              caption, keywords, published_at
            )
            values (
              $1, $2, 'product_video'::public.content_type, 'published'::public.publish_status,
              'Product detail + Live/Reel', $3, $4, $5, $6, $7, $8, $9, $10, $11::text[], now()
            )`,
            [
              `${name} Video ${index + 1}`,
              `${slug}-video-${Date.now()}-${index + 1}`,
              productId,
              slug,
              storageBucket,
              storagePath,
              mediaUrl,
              videoContentTypes.get(video) ?? video.type,
              video.size,
              description || `Video produk ${name}`,
              [slug, categorySlug, "product-video", "reel"],
            ],
          );
        }
      } catch (error) {
        if (uploadedPaths.length) {
          await supabase.storage.from(storageBucket).remove(uploadedPaths).catch(() => undefined);
        }
        return new Response(
          `Upload video produk gagal: ${error instanceof Error ? error.message : "error tidak dikenal"}`,
          { status: 502 },
        );
      }
    }

    invalidateMvpCache();
    return redirectResponse(`/admin/products/${slug}${imageFiles.length || videoFiles.length ? "?tab=media" : ""}`, request);
  }

  await ensureSeed();
  const db = await getDb();
  await db.collection("products").updateOne(
    { slug },
    {
      $set: {
        slug,
        sku: `JBD-${slug.slice(0, 6).toUpperCase()}`,
        name,
        taste: category,
        price: new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(numericPrice),
        numericPrice,
        imageTone: "bg-amber-200",
        tag: mode === "create" ? "New SKU" : "Updated",
        info: ["Hot & iced", "Cafe-ready", "Admin managed"],
        category,
        rating: "4.8",
        sold: "0",
        stock: effectiveStock,
        description,
        composition: ["Powder blend", "Creamer", "Natural flavor"],
        serving,
        variants: variantNames.length ? variantNames : ["500g", "1kg", "Bundle 3 pcs"],
        variantDetails: (variantNames.length ? variantNames : ["500g", "1kg", "Bundle 3 pcs"]).map((variantName, index) => ({
          name: variantName,
          price: Math.max(0, Number(variantPrices[index] || numericPrice) || numericPrice),
          sku: `JBD-${slug.slice(0, 8).toUpperCase()}-${slugify(variantName).toUpperCase()}`,
          weightGrams: Number(variantWeights[index] || 0) || undefined,
          stock: Math.max(0, Number(variantStocks[index] || 0) || 0),
          active: true,
        })),
        active: true,
        updatedAt: now,
      },
    },
    { upsert: true },
  );

  await db.collection("inventory").updateOne(
    { productSlug: slug },
    { $set: { productSlug: slug, stock: effectiveStock, reserved: 0, batch: `BATCH-${slug.slice(0, 3).toUpperCase()}-2606`, expiry: "2027-06-30" } },
    { upsert: true },
  );

  if (variantNames.length) {
    await db.collection("variant_inventory").deleteMany({ productSlug: slug });
    await db.collection("variant_inventory").insertMany(variantNames.map((variantName, index) => ({
      productSlug: slug,
      variantName,
      stock: Math.max(0, Number(variantStocks[index] || 0) || 0),
      reserved: 0,
      warehouse: "Bekasi",
      updatedAt: now,
    })));
  }

  invalidateMvpCache();
  return redirectResponse(`/admin/products/${slug}`, request);
}
