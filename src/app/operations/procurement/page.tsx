import Link from "next/link";
import { ArrowLeft, ClipboardList, PackagePlus } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { procurementItems } from "@/lib/prototype-data";

export default function ProcurementPage() {
  return (
    <PrototypeShell compact eyebrow="Supplier & Procurement" title="Procurement" description="">
      <Link href="/operations" className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Operations
      </Link>
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3">
            {procurementItems.map((item) => (
              <div key={item.item} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm md:grid-cols-[1fr_1fr_0.7fr_0.8fr]">
                <p className="font-semibold text-slate-950">{item.item}</p>
                <p className="text-slate-600">{item.supplier}</p>
                <p className="text-slate-500">{item.eta}</p>
                <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">{item.status}</span>
              </div>
            ))}
          </div>
        </div>
        <aside className="space-y-5">
          <button type="button" className="flex w-full items-center gap-4 rounded-[28px] bg-emerald-700 p-5 text-left text-white shadow-sm">
            <PackagePlus className="h-6 w-6" />
            <span className="font-semibold">Create purchase order</span>
          </button>
          <button type="button" className="flex w-full items-center gap-4 rounded-[28px] border border-slate-200 bg-white p-5 text-left text-slate-950 shadow-sm">
            <ClipboardList className="h-6 w-6 text-emerald-700" />
            <span className="font-semibold">Receive goods</span>
          </button>
        </aside>
      </section>
    </PrototypeShell>
  );
}
