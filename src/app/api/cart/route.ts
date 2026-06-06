import { getDb, demoUserId } from "@/lib/db";
import { ensureSeed, trackEvent } from "@/lib/mvp-store";
import { redirectResponse } from "@/lib/redirect-response";

export async function POST(request: Request) {
  await ensureSeed();
  const formData = await request.formData();
  const slug = String(formData.get("slug") ?? "chocolate-premium-500g");
  const variant = String(formData.get("variant") ?? "500g");
  const qty = Math.max(1, Number(formData.get("qty") ?? 1));
  const db = await getDb();
  const existing = await db.collection("carts").findOne({ userId: demoUserId, status: "active" });
  if (!existing) {
    await db.collection("carts").insertOne({
      userId: demoUserId,
      status: "active",
      items: [{ productSlug: slug, qty, variant, note: "Ditambahkan dari storefront" }],
      updatedAt: new Date().toISOString(),
    });
  } else {
    const item = (existing.items as Array<{ productSlug: string }>).find((entry) => entry.productSlug === slug);
    if (item) {
      await db.collection("carts").updateOne({ _id: existing._id, "items.productSlug": slug }, { $inc: { "items.$.qty": qty } });
    } else {
      await db.collection<{ items: Array<{ productSlug: string; qty: number; variant: string; note: string }> }>("carts").updateOne(
        { _id: existing._id },
        { $push: { items: { productSlug: slug, qty, variant, note: "Ditambahkan dari storefront" } } },
      );
    }
  }
  await trackEvent("add_to_cart", demoUserId, "storefront", undefined, { product: slug, qty });
  return redirectResponse("/storefront/cart", request);
}
