import Link from "next/link";
import { Check, Clock3, Package, Star, Truck } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { trackingStatuses } from "@/lib/prototype-data";

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PrototypeShell compact eyebrow="Order Tracking" title={id} description="">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-slate-950">Timeline pengiriman</p>
          <div className="mt-5 space-y-4">
            {trackingStatuses.map((item, index) => (
              <div key={item.status} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      item.state === "done"
                        ? "bg-emerald-600 text-white"
                        : item.state === "active"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.state === "done" ? <Check className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                  </div>
                  {index < trackingStatuses.length - 1 ? <div className="mt-2 h-12 w-px bg-slate-200" /> : null}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="font-semibold text-slate-950">{item.status}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-emerald-700" />
              <p className="font-semibold text-slate-950">JNE Reguler</p>
            </div>
            <p className="mt-4 text-sm text-slate-500">Resi</p>
            <p className="text-lg font-semibold text-slate-950">JNE-8872-240605</p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-emerald-700" />
              <p className="font-semibold text-slate-950">Pesanan diterima?</p>
            </div>
            <Link
              href="/storefront"
              className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white"
            >
              Konfirmasi diterima
            </Link>
            <button
              type="button"
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700"
            >
              <Star className="h-4 w-4" />
              Beri review
            </button>
            <Link
              href="/storefront/review"
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
