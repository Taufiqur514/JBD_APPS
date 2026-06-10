import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ClipboardCheck,
  CreditCard,
  Package,
  PackageCheck,
  Printer,
  Truck,
} from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { formatRupiah } from "@/lib/commerce";
import { getOrder } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  const activeStatus = order?.status ?? "unpaid";
  const flow = ["paid", "picking", "qc", "packing", "shipped", "delivered"];

  return (
    <PrototypeShell compact eyebrow="Order Management" title={order?.id ?? id} description="">
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
            <OrderAction icon={CreditCard} label="Paid" active={flow.indexOf(activeStatus) >= 0} />
            <OrderAction icon={ClipboardCheck} label="Picking" active={flow.indexOf(activeStatus) >= 1} />
            <OrderAction icon={PackageCheck} label="Packed" active={flow.indexOf(activeStatus) >= 3} />
            <OrderAction icon={Truck} label="Shipped" active={flow.indexOf(activeStatus) >= 4} />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-950">Fulfillment actions</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <form action="/api/orders/process" method="post">
                <input type="hidden" name="orderId" value={order?.id ?? ""} />
                <input type="hidden" name="back" value={`/admin/orders/${order?.id ?? id}`} />
                <input type="hidden" name="status" value="picking" />
                <button type="submit" className="h-11 w-full rounded-full bg-slate-950 px-4 text-sm font-semibold text-white">
                  Generate picklist
                </button>
              </form>
              <form action="/api/orders/process" method="post">
                <input type="hidden" name="orderId" value={order?.id ?? ""} />
                <input type="hidden" name="back" value={`/admin/orders/${order?.id ?? id}`} />
                <input type="hidden" name="status" value="packing" />
                <button type="submit" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700">
                <Printer className="h-4 w-4" />
                Print AWB
                </button>
              </form>
              <form action="/api/orders/process" method="post">
                <input type="hidden" name="orderId" value={order?.id ?? ""} />
                <input type="hidden" name="back" value={`/admin/orders/${order?.id ?? id}`} />
                <input type="hidden" name="status" value="shipped" />
                <button type="submit" className="h-11 w-full rounded-full border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700">
                  Mark ready to ship
                </button>
              </form>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {order?.items.map((item) => (
              <div key={`${item.productSlug}-${item.variant}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">Varian {item.variant} | Qty {item.qty}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatRupiah(item.price * item.qty)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {flow.map((item) => (
              <div key={item} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold capitalize text-slate-950">{item}</p>
                  <p className="mt-1 text-sm text-slate-500">{flow.indexOf(activeStatus) >= flow.indexOf(item) ? "Done" : "Waiting"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Customer</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">{order?.userId ?? "Customer"}</p>
            <p className="mt-4 text-sm text-slate-500">Channel</p>
            <p className="font-medium text-slate-900">Storefront</p>
            <p className="mt-4 text-sm text-slate-500">Total</p>
            <p className="text-2xl font-semibold text-slate-950">{formatRupiah(order?.total ?? 0)}</p>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Payment</p>
            <p className="mt-1 text-lg font-semibold capitalize text-slate-950">{order?.paymentStatus ?? "pending"}</p>
            <p className="mt-4 text-sm text-slate-500">Shipment</p>
            <p className="font-semibold capitalize text-slate-900">{order?.shipmentStatus ?? "pending"}</p>
            <p className="mt-4 text-sm text-slate-500">Courier / AWB</p>
            <p className="font-medium text-slate-900">
              {[order?.courier, order?.service].filter(Boolean).join(" ") || "Belum diproses"}
            </p>
            <p className="mt-1 text-sm font-semibold text-emerald-700">{order?.awb ?? "AWB dibuat saat packing"}</p>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <p className="text-sm text-emerald-300">Warehouse</p>
            <p className="mt-1 text-xl font-semibold">Bekasi Main WH</p>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Stock reserved. Picking can be generated for Chocolate Premium and Matcha Latte.
            </p>
          </div>
          {order?.trackingEvents?.length ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="font-semibold text-slate-950">Tracking log</p>
              <div className="mt-4 space-y-3">
                {order.trackingEvents.slice().reverse().map((event, index) => (
                  <div key={`${event.status}-${event.at}-${index}`} className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-sm font-semibold capitalize text-slate-950">{event.status.replaceAll("_", " ")}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(event.at).toLocaleString("id-ID")}</p>
                    {event.note ? <p className="mt-1 text-sm text-slate-600">{event.note}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
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
