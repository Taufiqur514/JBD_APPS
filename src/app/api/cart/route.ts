import { getDb, demoUserId } from "@/lib/db";
import { ensureSeed, invalidateMvpCache, trackEvent } from "@/lib/mvp-store";
import { addProductionCartLine } from "@/lib/production-commerce";
import { redirectResponse } from "@/lib/redirect-response";
import { enforceRateLimit } from "@/lib/security";
import { isSupabaseConfigured } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const limited = await enforceRateLimit({ scope: "cart:add", limit: 40, windowMs: 60_000 });
  if (limited) return limited;
  await ensureSeed();
  const formData = await request.formData();
  const slug = String(formData.get("slug") ?? "chocolate-premium-500g");
  const variant = String(formData.get("variant") ?? "500g");
  const qty = Math.max(1, Number(formData.get("qty") ?? 1));
  if (isSupabaseConfigured()) {
    await addProductionCartLine(slug, variant, qty);
    await trackEvent("add_to_cart", demoUserId, "storefront", undefined, { product: slug, qty, variant });
    invalidateMvpCache();
    return redirectResponse("/storefront/cart", request);
  }
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
    const item = (existing.items as Array<{ productSlug: string; variant: string }>).find((entry) => entry.productSlug === slug && entry.variant === variant);
    if (item) {
      await db.collection("carts").updateOne({ _id: existing._id, "items.productSlug": slug, "items.variant": variant }, { $inc: { "items.$.qty": qty } });
    } else {
      await db.collection<{ items: Array<{ productSlug: string; qty: number; variant: string; note: string }> }>("carts").updateOne(
        { _id: existing._id },
        { $push: { items: { productSlug: slug, qty, variant, note: "Ditambahkan dari storefront" } } },
      );
    }
  }
  await trackEvent("add_to_cart", demoUserId, "storefront", undefined, { product: slug, qty, variant });
  return redirectResponse("/storefront/cart", request);
}
