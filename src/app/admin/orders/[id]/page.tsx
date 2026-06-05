import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ClipboardCheck,
  CreditCard,
  PackageCheck,
  Printer,
  Truck,
} from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { adminOrders, trackingStatuses } from "@/lib/prototype-data";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = adminOrders.find((item) => item.id === id) ?? adminOrders[0];

  return (
    <PrototypeShell compact eyebrow="Order Management" title={order.id} description="">
      <Link
        href="/admin"
        className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-4">
            <OrderAction icon={CreditCard} label="Paid" active />
            <OrderAction icon={ClipboardCheck} label="Picking" active />
            <OrderAction icon={PackageCheck} label="Packed" active={order.status === "Packed" || order.status === "Shipped"} />
            <OrderAction icon={Truck} label="Shipped" active={order.status === "Shipped"} />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-950">Fulfillment actions</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <button type="button" className="h-11 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white">
                Generate picklist
              </button>
              <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700">
                <Printer className="h-4 w-4" />
                Print AWB
              </button>
              <button type="button" className="h-11 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700">
                Mark ready to ship
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {trackingStatuses.map((item) => (
              <div key={item.status} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-950">{item.status}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Customer</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">{order.customer}</p>
            <p className="mt-4 text-sm text-slate-500">Channel</p>
            <p className="font-medium text-slate-900">{order.channel}</p>
            <p className="mt-4 text-sm text-slate-500">Total</p>
            <p className="text-2xl font-semibold text-slate-950">{order.total}</p>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <p className="text-sm text-emerald-300">Warehouse</p>
            <p className="mt-1 text-xl font-semibold">Bekasi Main WH</p>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Stock reserved. Picking can be generated for Chocolate Premium and Matcha Latte.
            </p>
          </div>
        </aside>
      </section>
    </PrototypeShell>
  );
}

function OrderAction({
  icon: Icon,
  label,
  active,
}: {
  icon: typeof CreditCard;
  label: string;
  active: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${active ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-emerald-700 text-white" : "bg-white text-slate-500"}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 font-semibold text-slate-950">{label}</p>
      <p className="mt-1 text-sm text-slate-500">{active ? "Done" : "Waiting"}</p>
    </div>
  );
}
