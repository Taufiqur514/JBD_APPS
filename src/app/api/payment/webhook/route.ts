import { advanceOrder, getOrder, trackEvent } from "@/lib/mvp-store";
import { enqueueNotification } from "@/lib/notification-service";
import { securityHeaders } from "@/lib/security";
import { verifyWebhookSignature } from "@/lib/payment-provider";
import { isSupabaseConfigured, queryPostgres } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("x-jbd-signature") || request.headers.get("x-callback-signature");
  if (!verifyWebhookSignature(payload, signature)) {
    return Response.json({ error: "invalid_signature" }, { status: 401, headers: securityHeaders() });
  }
  let event: { orderId?: string; status?: string; providerReference?: string };
  try {
    event = JSON.parse(payload) as typeof event;
  } catch {
    return Response.json({ error: "invalid_payload" }, { status: 400, headers: securityHeaders() });
  }
  if (isSupabaseConfigured()) {
    await queryPostgres(
      `insert into public.provider_events (provider, reference, event_type, payload, status)
       values ('payment', $1, $2, $3::jsonb, 'received')`,
      [event.providerReference ?? event.orderId ?? "unknown", event.status ?? "unknown", payload],
    ).catch(() => undefined);
  }
  if (event.orderId && event.status === "paid") {
    await advanceOrder(event.orderId, "paid");
    const order = await getOrder(event.orderId);
    await trackEvent("payment_webhook_paid", order?.userId, "payment", order?.total, { orderId: event.orderId });
    await enqueueNotification({
      channel: "in_app",
      recipient: order?.userId ?? "customer",
      template: "payment_success",
      payload: { orderId: event.orderId },
    });
  }
  return Response.json({ ok: true }, { headers: securityHeaders() });
}
