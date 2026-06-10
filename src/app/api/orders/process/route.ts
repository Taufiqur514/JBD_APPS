import { advanceOrder, trackEvent, type DbOrder } from "@/lib/mvp-store";
import { enqueueNotification } from "@/lib/notification-service";
import { redirectResponse } from "@/lib/redirect-response";
import { enforceRateLimit, requireRole } from "@/lib/security";

export async function POST(request: Request) {
  const auth = await requireRole(["admin", "warehouse"], "Akses proses order hanya untuk admin/warehouse.");
  if (auth.response) return auth.response;
  const limited = await enforceRateLimit({ scope: "orders:process", limit: 30, windowMs: 60_000 });
  if (limited) return limited;
  const formData = await request.formData();
  const id = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "paid") as DbOrder["status"];
  const back = String(formData.get("back") ?? `/admin/orders/${id}`);
  if (id) {
    await advanceOrder(id, status);
    await trackEvent("order_status_update", "admin-ops", "operations", undefined, { orderId: id, status });
    await enqueueNotification({
      channel: "in_app",
      recipient: "demo-customer",
      template: "order_status_update",
      payload: { orderId: id, status },
    });
  }
  return redirectResponse(back, request);
}
