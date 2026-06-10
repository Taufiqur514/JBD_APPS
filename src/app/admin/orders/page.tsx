import Link from "next/link";
import { CheckCircle2, Clock3, Package, Search, Truck } from "lucide-react";
import { CompactFilterBar } from "@/components/compact-filter-bar";
import { PrototypeShell } from "@/components/prototype-shell";
import { formatRupiah } from "@/lib/commerce";
import { getOrders } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

const statusIcon = {
  unpaid: Clock3,
  paid: Clock3,
  picking: Package,
  qc: Package,
  packing: CheckCircle2,
  shipped: Truck,
  delivered: CheckCircle2,
};

const statusLabel = {
  unpaid: "Menunggu bayar",
  paid: "Paid",
  picking: "Picking",
  qc: "QC check",
  packing: "Packing",
  shipped: "Shipped",
  delivered: "Delivered",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sort?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const status = params.status;
  const sort = params.sort;
  const filter = params.filter;
  let orders = await getOrders();
  if (status && status !== "Semua status") {
    const normalized = status.toLowerCase();
    if (normalized === "processing") orders = orders.filter((order) => ["picking", "qc", "packing"].includes(order.status));
    else if (normalized === "packed") orders = orders.filter((order) => order.status === "packing");
    else orders = orders.filter((order) => order.status === normalized);
  }
  if (filter === "Ada AWB") orders = orders.filter((order) => Boolean(order.awb));
  if (filter === "Belum AWB") orders = orders.filter((order) => !order.awb);
  if (filter === "Paid belum diproses") orders = orders.filter((order) => order.status === "paid");
  if (sort === "Nilai terbesar") orders = orders.sort((a, b) => b.total - a.total);
  if (sort === "Perlu diproses") {
    const rank: Record<string, number> = { paid: 0, picking: 1, qc: 2, packing: 3, shipped: 4, delivered: 5, unpaid: 6 };
    orders = orders.sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9));
  }

  return (
    <PrototypeShell compact eyebrow="Admin Commerce" title="Daftar Pesanan" description="">
      <section id="admin-order-list" className="scroll-mt-36 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <CompactFilterBar
          categories={["Semua status", "Paid", "Processing", "Packed", "Shipped"]}
          categoryLabel="Status"
          categoryParam="status"
          sorts={["Terbaru", "Nilai terbesar", "Perlu diproses"]}
          filters={["Paid belum diproses", "Ada AWB", "Belum AWB"]}
          currentParams={{ status, sort, filter }}
          targetId="admin-order-list"
        />
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
          {status && status !== "Semua status" ? <span className="rounded-full bg-slate-50 px-3 py-1">Status: {status}</span> : null}
          {sort ? <span className="rounded-full bg-slate-50 px-3 py-1">Sort: {sort}</span> : null}
          {filter ? <span className="rounded-full bg-slate-50 px-3 py-1">Filter: {filter}</span> : null}
        </div>

        <div className="mt-5 grid gap-3">
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-lg font-semibold text-slate-950">Tidak ada pesanan sesuai filter</p>
              <p className="mt-2 text-sm text-slate-500">Gunakan status lain atau kembali ke semua pesanan untuk memantau order.</p>
            </div>
          ) : null}
          {orders.map((order) => {
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
                  <span className="mt-1 block text-sm text-slate-500">
                    {order.userId} | {order.items.length} item | {order.courier ?? "Kurir belum dipilih"}
                  </span>
                  <span className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-white px-3 py-1 text-slate-600">Payment: {order.paymentStatus}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-slate-600">Shipment: {order.shipmentStatus}</span>
                    {order.awb ? <span className="rounded-full bg-white px-3 py-1 text-slate-600">{order.awb}</span> : null}
                  </span>
                </span>
                <span className="md:text-right">
                  <span className="block font-semibold text-slate-950">{formatRupiah(order.total)}</span>
                  <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {statusLabel[order.status as keyof typeof statusLabel] ?? order.status}
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
