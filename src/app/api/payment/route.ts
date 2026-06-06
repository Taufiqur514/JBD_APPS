import { advanceOrder, getOrder, trackEvent } from "@/lib/mvp-store";
import { redirectResponse } from "@/lib/redirect-response";

export async function POST(request: Request) {
  const formData = await request.formData();
  const id = String(formData.get("orderId") ?? "");
  if (id) {
    await advanceOrder(id, "paid");
    const order = await getOrder(id);
    await trackEvent("payment_success", order?.userId, "payment", order?.total, { orderId: id });
  }
  return redirectResponse(`/storefront/success?order=${id}`, request);
}
