import { getDb, demoUserId } from "@/lib/db";
import { ensureSeed, invalidateMvpCache, trackEvent } from "@/lib/mvp-store";
import { updateProductionCartLine } from "@/lib/production-commerce";
import { redirectResponse } from "@/lib/redirect-response";
import { enforceRateLimit } from "@/lib/security";
import { isSupabaseConfigured } from "@/lib/supabase-server";

type CartItem = { productSlug: string; qty: number; variant: string; note: string };

export async function POST(request: Request) {
  const limited = await enforceRateLimit({ scope: "cart:update", limit: 60, windowMs: 60_000 });
  if (limited) return limited;
  await ensureSeed();
  const formData = await request.formData();
  const slug = String(formData.get("slug") ?? "");
  const variant = String(formData.get("variant") ?? "");
  const action = String(formData.get("action") ?? "inc");
  if (isSupabaseConfigured()) {
    await updateProductionCartLine(slug, variant, action);
    await trackEvent("cart_update", demoUserId, "storefront", undefined, { product: slug, variant, action });
    invalidateMvpCache();
    return redirectResponse("/storefront/cart", request);
  }
  const db = await getDb();
  const cart = await db.collection<{ items?: CartItem[] }>("carts").findOne({ userId: demoUserId, status: "active" });

  if (cart && slug) {
    if (action === "remove") {
      await db
        .collection<{ items: CartItem[] }>("carts")
        .updateOne({ _id: cart._id }, { $pull: { items: { productSlug: slug, variant } }, $set: { updatedAt: new Date().toISOString() } });
    }

    if (action === "inc") {
      await db.collection("carts").updateOne(
        { _id: cart._id, "items.productSlug": slug, "items.variant": variant },
        { $inc: { "items.$.qty": 1 }, $set: { updatedAt: new Date().toISOString() } },
      );
    }

    if (action === "dec") {
      const item = cart.items?.find((entry) => entry.productSlug === slug && entry.variant === variant);
      if ((item?.qty ?? 0) <= 1) {
        await db
          .collection<{ items: CartItem[] }>("carts")
          .updateOne({ _id: cart._id }, { $pull: { items: { productSlug: slug, variant } }, $set: { updatedAt: new Date().toISOString() } });
      } else {
        await db.collection("carts").updateOne(
          { _id: cart._id, "items.productSlug": slug, "items.variant": variant },
          { $inc: { "items.$.qty": -1 }, $set: { updatedAt: new Date().toISOString() } },
        );
      }
    }
  }

  await trackEvent("cart_update", demoUserId, "storefront", undefined, { product: slug, variant, action });
  return redirectResponse("/storefront/cart", request);
}
