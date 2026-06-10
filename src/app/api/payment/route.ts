import { advanceOrder, getOrder, trackEvent } from "@/lib/mvp-store";
import { enqueueNotification } from "@/lib/notification-service";
import { redirectResponse } from "@/lib/redirect-response";
import { enforceRateLimit } from "@/lib/security";

export async function POST(request: Request) {
  const limited = await enforceRateLimit({ scope: "payment:confirm", limit: 12, windowMs: 60_000 });
  if (limited) return limited;
  const formData = await request.formData();
  const id = String(formData.get("orderId") ?? "");
  if (id) {
    await advanceOrder(id, "paid");
    const order = await getOrder(id);
    await trackEvent("payment_success", order?.userId, "payment", order?.total, { orderId: id });
    await enqueueNotification({
      channel: "in_app",
      recipient: order?.userId ?? "customer",
      template: "payment_success",
      payload: { orderId: id, total: order?.total ?? 0 },
    });
  }
  return redirectResponse(`/storefront/success?order=${id}`, request);
}
