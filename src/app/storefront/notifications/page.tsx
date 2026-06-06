import Link from "next/link";
import { Bell, Gift, MessageSquareMore, PackageCheck, Truck } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { getNotifications } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export default async function StorefrontNotificationsPage() {
  const notifications = (await getNotifications()).filter((item) => item.recipient === "demo-customer" || item.recipient === "0812-2406-0505");
  const fallback = [
    { channel: "push", title: "Pesanan sedang dikirim", template: "shipment_update", relatedId: "JBD", status: "queued" },
    { channel: "in-app", title: "Voucher JBD25 hampir habis", template: "promo", relatedId: "PROMO-JBD25", status: "sent" },
  ];
  const list = notifications.length ? notifications : fallback;
  return (
    <PrototypeShell compact eyebrow="Notifications" title="Pusat Notifikasi" description="">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-950">Inbox customer</p>
            <p className="text-sm text-slate-500">Order, promo, chat, dan loyalty dalam satu halaman.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          {list.map((item) => {
            const Icon = item.template.includes("shipment") ? Truck : item.template.includes("promo") ? Gift : item.template.includes("review") ? PackageCheck : MessageSquareMore;
            const href = item.template.includes("shipment") ? `/storefront/orders/${item.relatedId}` : item.template.includes("promo") ? "/storefront/profile/vouchers" : item.template.includes("review") ? "/storefront/review" : "/storefront/chat";
            return (
              <Link key={`${item.title}-${item.relatedId}`} href={href} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[44px_1fr_auto] md:items-center">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-emerald-700">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold text-slate-950">{item.title}</span>
                  <span className="mt-1 block text-sm text-slate-500">{item.channel} | {item.template} | {item.status}</span>
                </span>
                <span className="text-sm font-semibold text-emerald-700">Buka</span>
              </Link>
            );
          })}
        </div>
      </section>
    </PrototypeShell>
  );
}
