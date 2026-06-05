import Link from "next/link";
import { BadgeDollarSign, Building2, CreditCard, QrCode, Smartphone } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { formatRupiah, getOrderSummary } from "@/lib/commerce";

const methods = [
  { name: "QRIS", icon: QrCode, active: true },
  { name: "VA BCA", icon: Building2, active: false },
  { name: "E-Wallet", icon: Smartphone, active: false },
  { name: "Kartu Kredit", icon: CreditCard, active: false },
  { name: "COD", icon: BadgeDollarSign, active: false },
];

export default function PaymentPage() {
  const summary = getOrderSummary();

  return (
    <PrototypeShell compact eyebrow="Payment" title="Pilih metode pembayaran" description="">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2">
            {methods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.name}
                  type="button"
                  className={`flex items-center justify-between rounded-2xl border p-4 text-left ${
                    method.active
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
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
                </button>
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
                <p className="mt-1 text-3xl font-semibold text-slate-950">{formatRupiah(summary.total)}</p>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Simulasi payment gateway. Klik tombol bayar untuk melanjutkan ke payment success.
                </p>
                <Link
                  href="/storefront/success"
                  className="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-emerald-700 px-6 text-sm font-semibold text-white"
                >
                  Bayar sekarang
                </Link>
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
          <p className="text-sm text-emerald-300">Order ID</p>
          <p className="mt-1 text-2xl font-semibold">JBD-240605-0127</p>
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            <p>Invoice dibuat otomatis setelah pembayaran berhasil.</p>
            <p>Status order akan masuk ke stock reservation dan WMS.</p>
            <p>Customer bisa langsung melihat tracking.</p>
          </div>
        </aside>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        <Link
          href="/storefront/success"
          className="flex h-12 w-full items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white"
        >
          Bayar sekarang
        </Link>
      </div>
    </PrototypeShell>
  );
}
