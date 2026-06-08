import { getDb } from "@/lib/db";
import { ensureSeed, invalidateMvpCache } from "@/lib/mvp-store";
import { redirectResponse } from "@/lib/redirect-response";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request: Request) {
  await ensureSeed();
  const formData = await request.formData();
  const db = await getDb();
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
