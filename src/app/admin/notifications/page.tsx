import Link from "next/link";
import { Bell, Mail, MessageSquareText, Send } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { getNotifications } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

const channelTone: Record<string, string> = {
  whatsapp: "bg-emerald-50 text-emerald-700",
  email: "bg-sky-50 text-sky-700",
  push: "bg-violet-50 text-violet-700",
  sms: "bg-amber-50 text-amber-700",
  "in-app": "bg-slate-100 text-slate-700",
};

export default async function AdminNotificationsPage() {
  const notifications = await getNotifications();
  const queued = notifications.filter((item) => item.status === "queued").length;

  return (
    <PrototypeShell compact eyebrow="Notification Service" title="Email, WhatsApp, Push, SMS, In-app" description="">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={Bell} label="Total notification" value={String(notifications.length)} />
        <Metric icon={Send} label="Queued" value={String(queued)} />
        <Metric icon={MessageSquareText} label="WhatsApp" value={String(notifications.filter((item) => item.channel === "whatsapp").length)} />
        <Metric icon={Mail} label="Email" value={String(notifications.filter((item) => item.channel === "email").length)} />
      </div>
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3">
          {notifications.map((item) => (
            <Link key={item.id} href={`/admin/notifications?template=${item.template}`} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm transition hover:border-emerald-300 hover:bg-white md:grid-cols-[0.8fr_0.8fr_1fr_0.7fr_0.7fr] md:items-center">
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${channelTone[item.channel]}`}>{item.channel}</span>
              <p className="font-semibold text-slate-950">{item.title}</p>
              <p className="text-slate-600">{item.recipient}</p>
              <p className="text-slate-500">{item.template}</p>
              <p className={item.status === "sent" ? "text-emerald-700" : "text-amber-700"}>{item.status}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Info title="Event trigger" text="Payment success, low stock, shipment update, abandoned cart, dan promo publish bisa masuk queue." />
        <Info title="Template control" text="Template menyimpan copy WhatsApp/email/in-app dan bisa dikaitkan ke segment CRM." />
        <Info title="Delivery log" text="Status queued, sent, failed dipakai admin untuk audit follow-up." />
      </section>
    </PrototypeShell>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Bell; label: string; value: string }) {
  return (
    <Link href="/admin/notifications" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-emerald-700" />
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </Link>
  );
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <Link href="/admin/notifications" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </Link>
  );
}
