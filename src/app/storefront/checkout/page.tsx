import Link from "next/link";
import { MapPin, ShieldCheck, Ticket, Truck } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { formatRupiah, getCartLines, getOrderSummary } from "@/lib/commerce";

export default function CheckoutPage() {
  const lines = getCartLines();
  const summary = getOrderSummary();

  return (
    <PrototypeShell compact eyebrow="Checkout" title="Alamat, Kurir, Voucher" description="">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <CheckoutBlock icon={MapPin} title="Alamat pengiriman">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-semibold text-emerald-950">Kedai Teman Kopi</p>
              <p className="mt-1 text-sm leading-6 text-emerald-800">
                Jl. Melati Raya No. 18, Bekasi Selatan, Jawa Barat
              </p>
            </div>
          </CheckoutBlock>

          <CheckoutBlock icon={Truck} title="Pilih kurir">
            <div className="grid gap-3 md:grid-cols-3">
              {["JNE Reguler", "SiCepat BEST", "Anteraja Cargo"].map((courier, index) => (
                <button
                  key={courier}
                  type="button"
                  className={`rounded-2xl border p-4 text-left ${
                    index === 0
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p className="font-semibold text-slate-950">{courier}</p>
                  <p className="mt-1 text-sm text-slate-500">{index + 1}-{index + 3} hari</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {formatRupiah(index === 0 ? 18000 : index === 1 ? 26000 : 42000)}
                  </p>
                </button>
              ))}
            </div>
          </CheckoutBlock>

          <CheckoutBlock icon={Ticket} title="Voucher dan poin">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-semibold text-emerald-950">JBD25 terpakai</p>
                <p className="mt-1 text-sm text-emerald-700">Diskon Rp 25.000</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">1.250 poin tersedia</p>
                <p className="mt-1 text-sm text-slate-500">Pakai Rp 10.000</p>
              </div>
            </div>
          </CheckoutBlock>
        </div>

        <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-slate-950">Order summary</p>
          <div className="mt-4 space-y-3">
            {lines.map((line) => (
              <div key={line.product.slug} className="flex justify-between gap-4 text-sm">
                <span className="text-slate-600">{line.product.name} x{line.qty}</span>
                <span className="font-medium text-slate-900">{formatRupiah(line.lineTotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-slate-200 pt-5 text-sm">
            <SummaryRow label="Subtotal" value={formatRupiah(summary.subtotal)} />
            <SummaryRow label="Diskon" value={`-${formatRupiah(summary.discount + summary.pointsUsed)}`} />
            <SummaryRow label="Ongkir + asuransi" value={formatRupiah(summary.shipping + summary.insurance)} />
            <SummaryRow label="Total" value={formatRupiah(summary.total)} strong />
          </div>
          <Link
            href="/storefront/payment"
            className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white"
          >
            Lanjut bayar
          </Link>
        </aside>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        <Link
          href="/storefront/payment"
          className="flex h-12 w-full items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white"
        >
          Lanjut bayar
        </Link>
      </div>
    </PrototypeShell>
  );
}

function CheckoutBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof ShieldCheck;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <Icon className="h-5 w-5" />
        </div>
        <p className="font-semibold text-slate-950">{title}</p>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <span className={strong ? "font-semibold text-slate-950" : "text-slate-500"}>{label}</span>
      <span className={strong ? "text-xl font-semibold text-slate-950" : "font-medium text-slate-900"}>{value}</span>
    </div>
  );
}
