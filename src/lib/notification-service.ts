import { queryPostgres, isSupabaseConfigured } from "@/lib/supabase-server";

export type NotificationChannel = "email" | "whatsapp" | "push" | "sms" | "in_app";

export async function enqueueNotification({
  channel,
  recipient,
  template,
  payload,
}: {
  channel: NotificationChannel;
  recipient: string;
  template: string;
  payload: Record<string, unknown>;
}) {
  if (!isSupabaseConfigured()) return;
  await queryPostgres(
    `insert into public.notification_outbox (
      channel, recipient, template, payload, status
    )
    values ($1, $2, $3, $4::jsonb, 'queued')
    on conflict do nothing`,
    [channel, recipient, template, JSON.stringify(payload)],
  ).catch(() => undefined);
}

