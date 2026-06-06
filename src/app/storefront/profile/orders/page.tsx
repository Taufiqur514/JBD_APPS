import Link from "next/link";
import { CreditCard, Package, Star, Truck } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { formatRupiah } from "@/lib/commerce";
import { getOrders } from "@/lib/mvp-store";

const tabs = [
  { label: "Belum dibayar", href: "/storefront/profile/orders?status=unpaid", count: 1 },
  { label: "Dikemas", href: "/storefront/profile/orders?status=packed", count: 3 },
  { label: "Dikirim", href: "/storefront/profile/orders?status=shipped", count: 2 },
  { label: "Selesai", href: "/storefront/profile/orders?status=done", count: 12 },
];

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  unpaid: "Belum dibayar",
  paid: "Dikemas",
  picking: "Dikemas",
  qc: "Dikemas",
  packing: "Dikemas",
  shipped: "Dikirim",
  delivered: "Selesai",
};

export default async function StorefrontOrdersPage() {
  const orders = (await getOrders()).filter((order) => order.userId === "demo-customer");
  const tabCounts = {
    unpaid: orders.filter((order) => order.status === "unpaid").length,
    packed: orders.filter((order) => ["paid", "picking", "qc", "packing"].includes(order.status)).length,
    shipped: orders.filter((order) => order.status === "shipped").length,
    done: orders.filter((order) => order.status === "delivered").length,
  };
  const dynamicTabs = tabs.map((tab) => ({
    ...tab,
    count: tab.href.includes("unpaid") ? tabCounts.unpaid : tab.href.includes("packed") ? tabCounts.packed : tab.href.includes("shipped") ? tabCounts.shipped : tabCounts.done,
  }));
  return (
    <PrototypeShell compact eyebrow="My Orders" title="Pesanan Saya" description="">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-4">
          {dynamicTabs.map((tab, index) => (
            <Link key={tab.label} href={tab.href} className={`rounded-2xl px-4 py-3 text-center text-sm font-semibold ${index === 0 ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700"}`}>
              {tab.label}
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">{tab.count}</span>
            </Link>
          ))}
        </div>

        <div className="mt-5 grid gap-4">
          {orders.map((order) => {
            const Icon = order.status === "unpaid" ? CreditCard : order.status === "shipped" ? Truck : Package;
            const product = order.items.map((item) => `${item.name} x${item.qty}`).join(", ");
            return (
              <Link key={order.id} href={order.status === "unpaid" ? `/storefront/payment?order=${order.id}` : `/storefront/orders/${order.id}`} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[52px_1fr_auto] md:items-center">
                <span className="grid h-13 w-13 place-items-center rounded-xl bg-white text-emerald-700">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold text-slate-950">{order.id}</span>
                  <span className="mt-1 block text-sm text-slate-500">{product}</span>
                </span>
                <span className="text-left md:text-right">
                  <span className="block font-semibold text-slate-950">{formatRupiah(order.total)}</span>
                  <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{statusLabel[order.status]}</span>
                </span>
              </Link>
            );
          })}
        </div>

        <Link href="/storefront/review" className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white">
          <Star className="h-4 w-4" />
          Review order selesai
        </Link>
      </section>
    </PrototypeShell>
  );
}
