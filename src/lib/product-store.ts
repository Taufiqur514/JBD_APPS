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
  variants: string[];
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

export async function listProductionProducts() {
  const result = await queryPostgres<ProductRow>(
    `select products.slug, products.sku, products.name, products.description,
      products.taste, products.composition, products.serving, products.price,
      products.rating, products.sold_count, products.cover_url, products.active,
      products.updated_at, categories.name as category,
      coalesce(sum(inventory_batches.quantity - inventory_batches.reserved), 0)::text as stock,
      coalesce(
        array_agg(distinct product_variants.name)
          filter (where product_variants.id is not null and product_variants.active),
        array[]::text[]
      ) as variants
     from public.products
     left join public.categories on categories.id = products.category_id
     left join public.inventory_batches on inventory_batches.product_id = products.id
     left join public.product_variants on product_variants.product_id = products.id
     where products.active
     group by products.id, categories.name
     order by products.updated_at desc`,
  );

  return result.rows.map((row) => {
    const category = row.category ?? "Powder Drink";
    const numericPrice = Number(row.price);
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
      variants: row.variants.length ? row.variants : ["500g", "1kg"],
      coverUrl: row.cover_url ?? undefined,
      active: row.active,
      updatedAt: row.updated_at.toISOString(),
    };
  });
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
