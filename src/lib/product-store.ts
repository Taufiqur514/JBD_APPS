import { queryPostgres } from "./supabase-server";

type ProductRow = {
  slug: string;
  sku: string;
  name: string;
  description: string;
  taste: string;
  composition: unknown;
  serving: string;
  price: string;
  rating: string;
  sold_count: number;
  cover_url: string | null;
  active: boolean;
  updated_at: Date;
  category: string | null;
  stock: string;
  variants: { name: string; price: string; sku: string; weightGrams: number | null; stock: string; active: boolean }[];
  images: { url: string; alt: string | null; sortOrder: number; isCover: boolean; mediaType?: string }[];
  videos: { url: string; alt: string | null; sortOrder: number; isCover: boolean; mediaType?: string }[];
};

type InventoryRow = {
  product_slug: string;
  stock: string;
  reserved: string;
  batch: string | null;
  expiry: Date | null;
};

type WarehouseStockRow = {
  product_slug: string;
  warehouse_code: string;
  warehouse_name: string;
  batch_number: string;
  expiry_date: Date | null;
  quantity: number;
  reserved: number;
  fifo_rank: string;
};

export type ProductionCategoryRow = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  product_count: string;
};

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function toneForCategory(category: string) {
  if (category.toLowerCase().includes("matcha")) return "bg-green-200";
  if (category.toLowerCase().includes("taro")) return "bg-violet-200";
  if (category.toLowerCase().includes("red")) return "bg-rose-200";
  if (category.toLowerCase().includes("coffee")) return "bg-orange-200";
  return "bg-amber-200";
}

function isDemoPlaceholderUrl(value: string) {
  return value.includes("example.com/") || value.includes("placeholder");
}

export async function listProductionProducts() {
  const result = await queryPostgres<ProductRow>(
    `select products.slug, products.sku, products.name, products.description,
      products.taste, products.composition, products.serving, products.price,
      products.rating, products.sold_count, products.cover_url, products.active,
      products.updated_at, categories.name as category,
      coalesce(stock.available, 0)::text as stock,
      coalesce(variants.items, '[]'::jsonb) as variants,
      coalesce(images.items, '[]'::jsonb) as images,
      coalesce(videos.items, '[]'::jsonb) as videos
     from public.products
     left join public.categories on categories.id = products.category_id
     left join lateral (
       select sum(inventory_batches.quantity - inventory_batches.reserved) as available
       from public.inventory_batches
       where inventory_batches.product_id = products.id
     ) stock on true
     left join lateral (
       select jsonb_agg(
         jsonb_build_object(
           'name', product_variants.name,
           'price', product_variants.price,
           'sku', product_variants.sku,
           'weightGrams', product_variants.weight_grams,
           'stock', coalesce(variant_stock.available, 0),
           'active', product_variants.active
         )
         order by product_variants.weight_grams nulls last, product_variants.name
       ) filter (where product_variants.active) as items
       from public.product_variants
       left join lateral (
         select sum(inventory_batches.quantity - inventory_batches.reserved) as available
         from public.inventory_batches
         where inventory_batches.variant_id = product_variants.id
       ) variant_stock on true
       where product_variants.product_id = products.id
     ) variants on true
     left join lateral (
       select jsonb_agg(
         jsonb_build_object(
           'url', product_images.media_url,
           'alt', product_images.alt_text,
           'sortOrder', product_images.sort_order,
           'isCover', product_images.is_cover,
           'mediaType', 'image'
         )
         order by product_images.sort_order, product_images.created_at
       ) as items
       from public.product_images
       where product_images.product_id = products.id
     ) images on true
     left join lateral (
       select jsonb_agg(
         jsonb_build_object(
           'url', ranked_videos.media_url,
           'alt', ranked_videos.title,
           'sortOrder', 100 + ranked_videos.row_number,
           'isCover', false,
           'mediaType', 'video'
         )
         order by ranked_videos.created_at desc
       ) as items
       from (
         select content_assets.media_url, content_assets.title, content_assets.created_at,
          row_number() over (order by content_assets.created_at desc)
         from public.content_assets
         where content_assets.product_id = products.id
          and content_assets.type = 'product_video'
          and content_assets.status = 'published'
          and content_assets.media_url is not null
       ) ranked_videos
     ) videos on true
     where products.active
     order by products.updated_at desc`,
  );

  return result.rows.map((row) => {
    const category = row.category ?? "Powder Drink";
    const numericPrice = Number(row.price);
    const images = Array.isArray(row.images)
      ? row.images
          .filter((image) => image?.url && !isDemoPlaceholderUrl(String(image.url)))
          .sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
          .slice(0, 10)
          .map((image) => ({
            url: String(image.url),
            alt: image.alt ? String(image.alt) : row.name,
            sortOrder: Number(image.sortOrder) || 0,
            isCover: Boolean(image.isCover),
            mediaType: image.mediaType === "video" ? "video" : "image",
          }))
      : [];
    const videos = Array.isArray(row.videos)
      ? row.videos
          .filter((video) => video?.url && !isDemoPlaceholderUrl(String(video.url)))
          .slice(0, 3)
          .map((video, index) => ({
            url: String(video.url),
            alt: video.alt ? String(video.alt) : row.name,
            sortOrder: 100 + index,
            isCover: false,
            mediaType: "video",
          }))
      : [];
    const media = [...images, ...videos].sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder));
    const variantDetails = Array.isArray(row.variants)
      ? row.variants
          .filter((variant) => variant?.name)
          .map((variant) => ({
            name: String(variant.name),
            price: Number(variant.price) || numericPrice,
            sku: String(variant.sku ?? ""),
            weightGrams: variant.weightGrams ? Number(variant.weightGrams) : undefined,
            stock: Number(variant.stock ?? 0),
            active: Boolean(variant.active),
          }))
      : [];
    return {
      slug: row.slug,
      sku: row.sku,
      name: row.name,
      taste: row.taste,
      price: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(numericPrice),
      numericPrice,
      imageTone: toneForCategory(category),
      tag: row.sold_count > 1000 ? "Best seller" : row.sold_count > 500 ? "High repeat" : "New",
      info: ["Hot & iced", "Cafe-ready", "QC terjamin"],
      category,
      rating: String(row.rating),
      sold: row.sold_count >= 1000 ? `${(row.sold_count / 1000).toFixed(1)}k` : String(row.sold_count),
      stock: Number(row.stock),
      description: row.description,
      composition: stringArray(row.composition),
      serving: row.serving,
      variants: variantDetails.length ? variantDetails.map((variant) => variant.name) : ["500g", "1kg"],
      variantDetails: variantDetails.length
        ? variantDetails
        : [
            { name: "500g", price: numericPrice, sku: `${row.sku}-500G`, weightGrams: 500, stock: Number(row.stock), active: true },
            { name: "1kg", price: numericPrice * 2, sku: `${row.sku}-1KG`, weightGrams: 1000, stock: 0, active: true },
          ],
      images: media,
      coverUrl: images.find((image) => image.isCover)?.url
        ?? images[0]?.url
        ?? (row.cover_url && !isDemoPlaceholderUrl(row.cover_url) ? row.cover_url : undefined),
      active: row.active,
      updatedAt: row.updated_at.toISOString(),
    };
  });
}

export async function listProductionCategories() {
  const result = await queryPostgres<ProductionCategoryRow>(
    `select categories.id, categories.slug, categories.name, categories.sort_order,
      count(products.id)::text as product_count
     from public.categories
     left join public.products on products.category_id = categories.id and products.active
     where categories.active
     group by categories.id
     order by categories.sort_order, categories.name`,
  );
  return result.rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    sortOrder: Number(row.sort_order) || 0,
    productCount: Number(row.product_count) || 0,
  }));
}

export async function renameProductionCategory(categoryId: string, name: string) {
  const trimmedName = name.trim();
  if (!categoryId || !trimmedName) throw new Error("Nama kategori wajib diisi.");
  const slug = trimmedName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  await queryPostgres(
    `update public.categories
     set name = $2, slug = coalesce(nullif($3, ''), slug)
     where id = $1`,
    [categoryId, trimmedName, slug],
  );
}

export async function upsertProductionCategory(categoryId: string | undefined, name: string) {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error("Nama kategori wajib diisi.");
  const slug = trimmedName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  if (categoryId) {
    await renameProductionCategory(categoryId, trimmedName);
    return;
  }
  const nextSort = await queryPostgres<{ sort_order: number }>(
    "select coalesce(max(sort_order), 0) + 10 as sort_order from public.categories",
  );
  await queryPostgres(
    `insert into public.categories (slug, name, sort_order, active)
     values ($1, $2, $3, true)
     on conflict (slug) do update set name = excluded.name, active = true`,
    [slug || trimmedName.toLowerCase(), trimmedName, nextSort.rows[0]?.sort_order ?? 10],
  );
}

export async function deleteProductionCategory(categoryId: string) {
  const usage = await queryPostgres<{ product_count: string }>(
    `select count(*)::text as product_count
     from public.products
     where category_id = $1 and active`,
    [categoryId],
  );
  if (Number(usage.rows[0]?.product_count ?? 0) > 0) {
    throw new Error("Kategori masih digunakan produk. Pindahkan produk dulu sebelum menghapus kategori.");
  }
  await queryPostgres("update public.categories set active = false where id = $1", [categoryId]);
}

export async function listProductionInventory() {
  const result = await queryPostgres<InventoryRow>(
    `select products.slug as product_slug,
      coalesce(sum(inventory_batches.quantity), 0)::text as stock,
      coalesce(sum(inventory_batches.reserved), 0)::text as reserved,
      min(inventory_batches.batch_number) as batch,
      min(inventory_batches.expiry_date) as expiry
     from public.products
     left join public.inventory_batches on inventory_batches.product_id = products.id
     where products.active
     group by products.id
     order by products.name`,
  );
  return result.rows.map((row) => ({
    productSlug: row.product_slug,
    stock: Number(row.stock),
    reserved: Number(row.reserved),
    batch: row.batch ?? "-",
    expiry: row.expiry?.toISOString().slice(0, 10) ?? "",
  }));
}

export async function listProductionWarehouseStocks() {
  const result = await queryPostgres<WarehouseStockRow>(
    `select products.slug as product_slug, warehouses.code as warehouse_code,
      warehouses.name as warehouse_name, inventory_batches.batch_number,
      inventory_batches.expiry_date, inventory_batches.quantity,
      inventory_batches.reserved,
      row_number() over (
        partition by products.id order by inventory_batches.expiry_date nulls last,
        inventory_batches.created_at
      )::text as fifo_rank
     from public.inventory_batches
     join public.products on products.id = inventory_batches.product_id
     join public.warehouses on warehouses.id = inventory_batches.warehouse_id
     order by warehouses.code, products.name, inventory_batches.expiry_date nulls last`,
  );
  return result.rows.map((row) => ({
    productSlug: row.product_slug,
    warehouseId: row.warehouse_code,
    warehouse: row.warehouse_name,
    batch: row.batch_number,
    expiry: row.expiry_date?.toISOString().slice(0, 10) ?? "",
    stock: row.quantity,
    reserved: row.reserved,
    fifoRank: Number(row.fifo_rank),
  }));
}
