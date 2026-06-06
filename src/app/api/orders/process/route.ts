import { advanceOrder, trackEvent, type DbOrder } from "@/lib/mvp-store";
import { redirectResponse } from "@/lib/redirect-response";

export async function POST(request: Request) {
  const formData = await request.formData();
  const id = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "paid") as DbOrder["status"];
  const back = String(formData.get("back") ?? `/admin/orders/${id}`);
  if (id) {
    await advanceOrder(id, status);
    await trackEvent("order_status_update", "admin-ops", "operations", undefined, { orderId: id, status });
  }
  return redirectResponse(back, request);
}
