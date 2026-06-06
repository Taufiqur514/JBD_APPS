import Link from "next/link";
import { ArrowLeft, PackageCheck, Printer, Truck } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { getOrders } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export default async function PackingPage() {
  const orders = (await getOrders()).filter((order) => order.status === "qc" || order.status === "packing");

  return (
    <PrototypeShell compact eyebrow="Packing" title="Packing & AWB" description="">
      <Link href="/operations" className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Operations
      </Link>
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3">
            {orders.map((order) => (
              <div key={order.id} className="grid grid-cols-[1fr_0.7fr_0.7fr_0.7fr] items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-slate-950">{order.id}</p>
                <p>Box S</p>
                <p>{Math.max(1, order.items.length)} kg</p>
                <form action="/api/orders/process" method="post">
                  <input type="hidden" name="orderId" value={order.id} />
                  <input type="hidden" name="status" value="shipped" />
                  <input type="hidden" name="back" value="/operations/packing" />
                  <button type="submit" className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Print AWB</button>
                </form>
              </div>
            ))}
          </div>
        </div>
        <aside className="space-y-5">
          <PackAction icon={PackageCheck} title="Mark packed" />
          <PackAction icon={Printer} title="Print label / AWB" />
          <PackAction icon={Truck} title="Schedule courier pickup" />
        </aside>
      </section>
    </PrototypeShell>
  );
}

function PackAction({ icon: Icon, title }: { icon: typeof PackageCheck; title: string }) {
  return (
    <Link href="/operations/packing" className="flex w-full items-center gap-4 rounded-[28px] border border-slate-200 bg-white p-5 text-left shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon className="h-5 w-5" />
      </span>
      <span className="font-semibold text-slate-950">{title}</span>
    </Link>
  );
}
