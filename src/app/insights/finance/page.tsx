import Link from "next/link";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { financeMetrics, financeRows } from "@/lib/prototype-data";

export default function FinancePage() {
  return (
    <PrototypeShell compact eyebrow="Finance & Accounting" title="Finance Report" description="">
      <Link href="/insights" className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Insights
      </Link>
      <div className="grid gap-4 md:grid-cols-4">
        {financeMetrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className={`mt-2 text-2xl font-semibold ${metric.tone}`}>{metric.value}</p>
          </div>
        ))}
      </div>
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-5 w-5 text-emerald-700" />
          <p className="font-semibold text-slate-950">Finance flow</p>
        </div>
        <div className="mt-5 grid gap-3">
          {financeRows.map((row) => (
            <div key={row.label} className="grid grid-cols-[1fr_0.8fr_0.7fr] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="font-medium text-slate-950">{row.label}</p>
              <p className="text-slate-700">{row.value}</p>
              <p className="text-right text-emerald-700">{row.type}</p>
            </div>
          ))}
        </div>
      </section>
    </PrototypeShell>
  );
}
