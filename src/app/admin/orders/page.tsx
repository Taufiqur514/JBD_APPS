import Link from "next/link";
import { CheckCircle2, Clock3, Package, Search, Truck } from "lucide-react";
import { CompactFilterBar } from "@/components/compact-filter-bar";
import { PrototypeShell } from "@/components/prototype-shell";
import { formatRupiah } from "@/lib/commerce";
import { getOrders } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

const statusIcon = {
  Paid: Clock3,
  Processing: Package,
  Packed: CheckCircle2,
  Shipped: Truck,
};

export default async function AdminOrdersPage() {
  const ordersPromise = getOrders();

  return (
    <PrototypeShell compact eyebrow="Admin Commerce" title="Daftar Pesanan" description="">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <CompactFilterBar
          categories={["Semua status", "Paid", "Processing", "Packed", "Shipped"]}
          sorts={["Terbaru", "Nilai terbesar", "Perlu diproses"]}
        />

        <div className="mt-5 grid gap-3">
          {(await ordersPromise).map((order) => {
            const Icon = statusIcon[order.status as keyof typeof statusIcon] ?? Search;
            return (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white md:grid-cols-[48px_1fr_auto] md:items-center"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-emerald-700">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold text-slate-950">{order.id}</span>
                  <span className="mt-1 block text-sm text-slate-500">{order.userId} | Storefront</span>
                </span>
                <span className="md:text-right">
                  <span className="block font-semibold text-slate-950">{formatRupiah(order.total)}</span>
                  <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {order.status}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </PrototypeShell>
  );
}
