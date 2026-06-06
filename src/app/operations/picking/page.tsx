import Link from "next/link";
import { ArrowLeft, Check, ClipboardList, MapPin, ScanLine } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { getOrders } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export default async function PickingPage() {
  const orders = (await getOrders()).filter((order) => order.status === "paid" || order.status === "picking");

  return (
    <PrototypeShell compact eyebrow="WMS" title="Picking List" description="">
      <Link href="/operations" className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Operations
      </Link>
      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[0.8fr_1fr_1.2fr_0.5fr_0.8fr_0.7fr] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-500">
            <p>Pick ID</p><p>Order</p><p>SKU</p><p>Qty</p><p>Bin</p><p>Status</p>
          </div>
          {orders.flatMap((order) => order.items.map((item) => ({ order, item }))).map(({ order, item }) => (
            <div key={`${order.id}-${item.productSlug}`} className="grid grid-cols-[0.8fr_1fr_1.2fr_0.5fr_0.8fr_0.7fr] items-center gap-4 border-b border-slate-100 px-5 py-4 text-sm last:border-b-0">
              <p className="font-semibold text-slate-950">PICK-{order.id.slice(-4)}</p>
              <p className="text-slate-700">{order.id}</p>
              <p className="text-slate-700">{item.name}</p>
              <p className="font-medium text-slate-950">{item.qty}</p>
              <p className="text-slate-500">A-01</p>
              <form action="/api/orders/process" method="post">
                <input type="hidden" name="orderId" value={order.id} />
                <input type="hidden" name="status" value="qc" />
                <input type="hidden" name="back" value="/operations/qc" />
                <button type="submit" className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  Kirim QC
                </button>
              </form>
            </div>
          ))}
        </div>
        <aside className="space-y-5">
          <ActionCard icon={ClipboardList} title="Generate batch picklist" text="Kelompokkan order berdasarkan gudang dan bin location." />
          <ActionCard icon={ScanLine} title="Scan picked item" text="Simulasi scan SKU sebelum barang masuk QC." />
          <ActionCard icon={MapPin} title="Warehouse map" text="Bekasi Main WH, aisle A-B-C." />
        </aside>
      </section>
    </PrototypeShell>
  );
}

function ActionCard({ icon: Icon, title, text }: { icon: typeof Check; title: string; text: string }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
      <Link href="/operations/picking" className="mt-4 inline-flex h-10 items-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white">Run</Link>
    </div>
  );
}
