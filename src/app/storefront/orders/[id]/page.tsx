import Link from "next/link";
import { Check, Clock3, Package, Star, Truck } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { getOrder } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  const flow = ["paid", "picking", "qc", "packing", "shipped", "delivered"];
  const activeIndex = flow.indexOf(order?.status ?? "unpaid");

  return (
    <PrototypeShell compact eyebrow="Order Tracking" title={id} description="">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-slate-950">Timeline pengiriman</p>
          <div className="mt-5 space-y-4">
            {flow.map((item, index) => {
              const state = activeIndex >= index ? "done" : activeIndex + 1 === index ? "active" : "upcoming";
              return (
              <div key={item} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      state === "done"
                        ? "bg-emerald-600 text-white"
                        : state === "active"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {state === "done" ? <Check className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                  </div>
                  {index < flow.length - 1 ? <div className="mt-2 h-12 w-px bg-slate-200" /> : null}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="font-semibold capitalize text-slate-950">{item}</p>
                  <p className="mt-1 text-sm text-slate-500">{state === "done" ? "Selesai" : state === "active" ? "Sedang diproses" : "Menunggu"}</p>
                </div>
              </div>
            )})}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-emerald-700" />
              <p className="font-semibold text-slate-950">JNE Reguler</p>
            </div>
            <p className="mt-4 text-sm text-slate-500">Resi</p>
            <p className="text-lg font-semibold text-slate-950">{order?.awb ?? "Menunggu AWB"}</p>
            <p className="mt-2 text-sm text-slate-500">
              {[order?.courier, order?.service].filter(Boolean).join(" ") || "Kurir akan tampil setelah packing"}
            </p>
          </div>

          {order?.trackingEvents?.length ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="font-semibold text-slate-950">Update terakhir</p>
              <div className="mt-4 space-y-3">
                {order.trackingEvents.slice().reverse().slice(0, 4).map((event, index) => (
                  <div key={`${event.status}-${event.at}-${index}`} className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-sm font-semibold capitalize text-slate-950">{event.status.replaceAll("_", " ")}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(event.at).toLocaleString("id-ID")}</p>
                    {event.note ? <p className="mt-1 text-sm text-slate-600">{event.note}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-emerald-700" />
              <p className="font-semibold text-slate-950">Pesanan diterima?</p>
            </div>
            <form action="/api/orders/process" method="post" className="mt-5">
              <input type="hidden" name="orderId" value={id} />
              <input type="hidden" name="status" value="delivered" />
              <input type="hidden" name="back" value={`/storefront/orders/${id}`} />
              <button type="submit" className="flex h-11 w-full items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                Konfirmasi diterima
              </button>
            </form>
            <Link
              href={`/storefront/review?order=${id}`}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700"
            >
              <Star className="h-4 w-4" />
              Beri review
            </Link>
            <Link
              href={`/storefront/review?order=${id}`}
              className="mt-3 flex h-11 w-full items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white"
            >
              Review produk
            </Link>
          </div>
        </aside>
      </section>
    </PrototypeShell>
  );
}
