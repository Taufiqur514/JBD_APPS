import { getDb } from "@/lib/db";
import { ensureSeed, invalidateMvpCache } from "@/lib/mvp-store";
import { redirectResponse } from "@/lib/redirect-response";
import { isSupabaseConfigured, queryPostgres } from "@/lib/supabase-server";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request: Request) {
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
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const categorySlug = slugify(category);
    await queryPostgres(
      `insert into public.categories(slug, name, active)
       values ($1, $2, true)
       on conflict (slug) do update set name = excluded.name, active = true`,
      [categorySlug, category],
    );

    await queryPostgres(
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
        updated_at = now()`,
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

    invalidateMvpCache();
    return redirectResponse(`/admin/products/${slug}`, request);
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
        stock,
        description,
        composition: ["Powder blend", "Creamer", "Natural flavor"],
        serving,
        variants: ["500g", "1kg", "Bundle 3 pcs"],
        active: true,
        updatedAt: now,
      },
    },
    { upsert: true },
  );

  await db.collection("inventory").updateOne(
    { productSlug: slug },
    { $set: { productSlug: slug, stock, reserved: 0, batch: `BATCH-${slug.slice(0, 3).toUpperCase()}-2606`, expiry: "2027-06-30" } },
    { upsert: true },
  );

  invalidateMvpCache();
  return redirectResponse(`/admin/products/${slug}`, request);
}
