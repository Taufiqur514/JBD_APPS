import Link from "next/link";
import { ArrowLeft, Monitor } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { analyticCards } from "@/lib/prototype-data";

export default function ReportsPage() {
  return (
    <PrototypeShell compact eyebrow="Analytics & Reporting" title="Real-time Dashboard" description="">
      <Link href="/insights" className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Insights
      </Link>
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4 md:grid-cols-3">
          {analyticCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <Icon className="h-6 w-6 text-emerald-700" />
                <p className="mt-4 font-semibold text-slate-950">{card.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.text}</p>
              </div>
            );
          })}
        </div>
        <aside className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
          <Monitor className="h-8 w-8 text-emerald-300" />
          <p className="mt-4 text-xl font-semibold">Dashboard modules</p>
          <div className="mt-4 grid gap-3 text-sm text-slate-300">
            {["Penjualan", "Produk", "Pelanggan", "Marketing", "Keuangan", "Operasional"].map((item) => (
              <div key={item} className="rounded-2xl bg-white/5 p-3">{item}</div>
            ))}
          </div>
        </aside>
      </section>
    </PrototypeShell>
  );
}
