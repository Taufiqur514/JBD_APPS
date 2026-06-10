import { getDb, demoUserId } from "@/lib/db";
import { ensureSeed, getCartLines, getOrderSummaryFromCart, invalidateMvpCache, trackEvent } from "@/lib/mvp-store";
import { createProductionOrder } from "@/lib/production-commerce";
import { redirectResponse } from "@/lib/redirect-response";
import { enforceRateLimit } from "@/lib/security";
import { isSupabaseConfigured } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const limited = await enforceRateLimit({ scope: "checkout:create", limit: 10, windowMs: 60_000 });
  if (limited) return limited;
  if (isSupabaseConfigured()) {
    const lines = await getCartLines();
    if (!lines.length) return redirectResponse("/storefront", request);
    const id = await createProductionOrder();
    await trackEvent("checkout_started", demoUserId, "storefront", undefined, { orderId: id });
    invalidateMvpCache();
    return redirectResponse(`/storefront/payment?order=${id}`, request);
  }
  await ensureSeed();
  const db = await getDb();
  const lines = await getCartLines();
  if (!lines.length) return redirectResponse("/storefront", request);
  const summary = await getOrderSummaryFromCart();
  const now = new Date().toISOString();
  const id = `JBD-${new Date().toISOString().slice(2, 10).replaceAll("-", "")}-${Math.floor(1000 + Math.random() * 9000)}`;
  await db.collection("orders").insertOne({
    id,
    userId: demoUserId,
    status: "unpaid",
    items: lines.map((line) => ({
      productSlug: line.product.slug,
      name: line.product.name,
      qty: line.qty,
      price: line.product.numericPrice,
      variant: line.variant,
    })),
    addressId: "addr-main",
    paymentStatus: "pending",
    shipmentStatus: "pending",
    total: summary.total,
    createdAt: now,
    updatedAt: now,
  });
  await db.collection("carts").updateOne({ userId: demoUserId, status: "active" }, { $set: { status: "ordered", orderId: id, updatedAt: now } });
  await trackEvent("checkout_started", demoUserId, "storefront", summary.total, { orderId: id });
  return redirectResponse(`/storefront/payment?order=${id}`, request);
}
