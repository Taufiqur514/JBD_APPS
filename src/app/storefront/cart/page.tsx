import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { formatRupiah, getCartLines, getOrderSummary } from "@/lib/commerce";

export default function CartPage() {
  const lines = getCartLines();
  const summary = getOrderSummary();

  return (
    <PrototypeShell compact eyebrow="Cart" title="Keranjang Belanja" description="">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-950">{lines.length} produk dipilih</p>
            <Link href="/storefront" className="text-sm font-medium text-emerald-700">
              Tambah produk
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {lines.map((line) => (
              <div key={line.product.slug} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[96px_1fr_auto]">
                <div className={`h-24 rounded-2xl ${line.product.imageTone}`} />
                <div>
                  <p className="font-semibold text-slate-950">{line.product.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{line.variant}</p>
                  <p className="mt-2 text-sm text-slate-600">{line.note}</p>
                  <div className="mt-3 flex h-10 w-fit items-center rounded-full border border-slate-200 bg-white">
                    <button type="button" className="flex h-10 w-10 items-center justify-center">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{line.qty}</span>
                    <button type="button" className="flex h-10 w-10 items-center justify-center">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-between gap-4 md:flex-col md:items-end">
                  <p className="text-lg font-semibold text-slate-950">{formatRupiah(line.lineTotal)}</p>
                  <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <p className="font-semibold text-slate-950">Ringkasan</p>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <SummaryRow label="Subtotal" value={formatRupiah(summary.subtotal)} />
            <SummaryRow label="Voucher JBD25" value={`-${formatRupiah(summary.discount)}`} />
            <SummaryRow label="Estimasi ongkir" value={formatRupiah(summary.shipping)} />
            <SummaryRow label="Asuransi" value={formatRupiah(summary.insurance)} />
          </div>
          <div className="mt-5 border-t border-slate-200 pt-5">
            <SummaryRow label="Total" value={formatRupiah(summary.total)} strong />
          </div>
          <Link
            href="/storefront/checkout"
            className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white"
          >
            Checkout
          </Link>
        </aside>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        <Link
          href="/storefront/checkout"
          className="flex h-12 w-full items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white"
        >
          Checkout
        </Link>
      </div>
    </PrototypeShell>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={strong ? "font-semibold text-slate-950" : "text-slate-500"}>{label}</span>
      <span className={strong ? "text-xl font-semibold text-slate-950" : "font-medium text-slate-900"}>{value}</span>
    </div>
  );
}
