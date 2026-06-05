import Link from "next/link";
import { CheckCircle2, FileText, PackageCheck } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { formatRupiah, getOrderSummary } from "@/lib/commerce";

export default function SuccessPage() {
  const summary = getOrderSummary();

  return (
    <PrototypeShell compact eyebrow="Payment Success" title="Pembayaran Berhasil" description="">
      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-8 shadow-sm">
          <CheckCircle2 className="h-16 w-16 text-emerald-700" />
          <h3 className="mt-5 text-3xl font-semibold text-emerald-950">
            Order JBD-240605-0127 sudah dibayar
          </h3>
          <p className="mt-3 text-sm leading-7 text-emerald-800">
            Pesanan masuk ke stock reservation dan akan diproses gudang.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/storefront/orders/JBD-240605-0127"
              className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-700 px-6 text-sm font-semibold text-white"
            >
              Lacak pesanan
            </Link>
            <Link
              href="/storefront"
              className="inline-flex h-12 items-center justify-center rounded-full border border-emerald-300 px-6 text-sm font-semibold text-emerald-800"
            >
              Belanja lagi
            </Link>
          </div>
        </div>

        <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-slate-950">Invoice</p>
          <div className="mt-5 space-y-4">
            <InfoRow icon={FileText} label="Invoice" value="INV/JBD/2026/0605/0127" />
            <InfoRow icon={PackageCheck} label="Total" value={formatRupiah(summary.total)} />
            <InfoRow icon={CheckCircle2} label="Status" value="Paid" />
          </div>
        </aside>
      </section>
    </PrototypeShell>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="font-semibold text-slate-950">{value}</p>
      </div>
    </div>
  );
}
