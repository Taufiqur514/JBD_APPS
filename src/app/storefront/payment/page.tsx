import { BadgeDollarSign, Building2, CreditCard, QrCode, Smartphone } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { formatRupiah } from "@/lib/commerce";
import { getOrder, getOrders } from "@/lib/mvp-store";
import { createPaymentIntent } from "@/lib/payment-provider";

export const dynamic = "force-dynamic";

const methods = [
  { name: "QRIS", icon: QrCode, active: true },
  { name: "VA BCA", icon: Building2, active: false },
  { name: "E-Wallet", icon: Smartphone, active: false },
  { name: "Kartu Kredit", icon: CreditCard, active: false },
  { name: "COD", icon: BadgeDollarSign, active: false },
];

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  const orders = await getOrders();
  const order = orderId ? await getOrder(orderId) : orders[0];
  const total = order?.total ?? 0;
  const intent = createPaymentIntent({ orderId: order?.id ?? "DRAFT", amount: total, method: "QRIS" });

  return (
    <PrototypeShell compact eyebrow="Payment" title="Pilih metode pembayaran" description="">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2">
            {methods.map((method) => {
              const Icon = method.icon;
              return (
                <label
                  key={method.name}
                  className="cursor-pointer"
                >
                  <input className="peer sr-only" type="radio" name="method" value={method.name} defaultChecked={method.active} />
                  <span className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left peer-checked:border-emerald-300 peer-checked:bg-emerald-50">
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-semibold text-slate-950">{method.name}</span>
                  </span>
                  {method.active ? (
                    <span className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-medium text-white">
                      Dipilih
                    </span>
                  ) : null}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="font-semibold text-slate-950">QRIS JBD Commerce</p>
            <div className="mt-4 grid gap-5 md:grid-cols-[180px_1fr]">
              <div className="grid aspect-square place-items-center rounded-2xl bg-white text-slate-400">
                <QrCode className="h-24 w-24" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total pembayaran</p>
                <p className="mt-1 text-3xl font-semibold text-slate-950">{formatRupiah(total)}</p>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Provider {intent.provider}. Reference pembayaran dibuat untuk order ini dan webhook wajib
                  melewati validasi signature sebelum status berubah.
                </p>
                <div className="mt-4 rounded-2xl bg-white p-3 text-xs text-slate-500">
                  <p className="font-semibold text-slate-900">Reference</p>
                  <p className="mt-1 break-all">{intent.reference}</p>
                  {intent.qrString ? <p className="mt-2 break-all">QR: {intent.qrString}</p> : null}
                </div>
                <form action="/api/payment" method="post">
                  <input type="hidden" name="orderId" value={order?.id ?? ""} />
                  <button
                    type="submit"
                    className="mt-5 hidden h-12 items-center justify-center rounded-full bg-emerald-700 px-6 text-sm font-semibold text-white lg:inline-flex"
                  >
                    Bayar sekarang
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
          <p className="text-sm text-emerald-300">Order ID</p>
          <p className="mt-1 text-2xl font-semibold">{order?.id ?? "Belum ada order"}</p>
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            <p>Invoice dibuat otomatis setelah pembayaran berhasil.</p>
            <p>Status order akan masuk ke stock reservation dan WMS.</p>
            <p>Customer bisa langsung melihat tracking.</p>
          </div>
        </aside>
      </section>

      <div className="fixed inset-x-0 bottom-20 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        <form action="/api/payment" method="post">
          <input type="hidden" name="orderId" value={order?.id ?? ""} />
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white"
          >
            Bayar sekarang
          </button>
        </form>
      </div>
    </PrototypeShell>
  );
}
