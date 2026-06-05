import Link from "next/link";
import { ArrowLeft, ChartColumn, Download, FileSpreadsheet } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { adminMetrics, campaigns, productHealth } from "@/lib/prototype-data";

export default function AdminReportsPage() {
  return (
    <PrototypeShell compact eyebrow="Admin Commerce" title="Reports" description="">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Link
          href="/admin"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <button
          type="button"
          className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-emerald-700 px-4 text-sm font-semibold text-white"
        >
          <Download className="h-4 w-4" />
          Export report
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminMetrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{metric.value}</p>
            <p className="mt-2 text-sm text-emerald-700">{metric.delta}</p>
          </div>
        ))}
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <ChartColumn className="h-5 w-5 text-emerald-700" />
            <p className="font-semibold text-slate-950">Campaign performance</p>
          </div>
          <div className="mt-5 grid gap-3">
            {campaigns.map((campaign) => (
              <div key={campaign.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{campaign.name}</p>
                    <p className="mt-1 text-sm text-slate-500">Revenue {campaign.revenue}</p>
                  </div>
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
                    ROAS {campaign.roas}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-5 w-5 text-emerald-700" />
            <p className="font-semibold text-slate-950">Product health</p>
          </div>
          <div className="mt-5 grid gap-3">
            {productHealth.map((product) => (
              <div key={product.sku} className="grid grid-cols-[1fr_0.7fr_0.8fr_0.7fr] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-slate-950">{product.sku}</p>
                <p className="text-slate-500">Stock {product.stock}</p>
                <p className={product.velocity === "High risk" ? "text-rose-600" : "text-emerald-700"}>
                  {product.velocity}
                </p>
                <p className="text-right text-slate-700">{product.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PrototypeShell>
  );
}
