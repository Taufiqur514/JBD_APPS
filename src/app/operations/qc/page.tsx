import Link from "next/link";
import { ArrowLeft, ClipboardCheck, ShieldCheck } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { qcChecklist } from "@/lib/prototype-data";

export default function QcPage() {
  return (
    <PrototypeShell compact eyebrow="Quality Control" title="QC Check" description="">
      <Link href="/operations" className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Operations
      </Link>
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-slate-950">Checklist JBD-240605-0123</p>
          <div className="mt-5 grid gap-3">
            {qcChecklist.map((item) => (
              <label key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <input defaultChecked type="checkbox" className="h-4 w-4 accent-emerald-700" />
                {item}
              </label>
            ))}
          </div>
          <button type="button" className="mt-5 h-11 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white">Approve QC</button>
        </div>
        <aside className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
          <ShieldCheck className="h-8 w-8 text-emerald-300" />
          <p className="mt-4 text-xl font-semibold">QC sampling</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">Untuk produk powder, QC menjaga seal, batch, expiry, dan kondisi kemasan sebelum packing.</p>
          <div className="mt-5 rounded-2xl bg-white/5 p-4 text-sm text-slate-300">
            <ClipboardCheck className="mb-3 h-5 w-5 text-emerald-300" />
            11 order menunggu QC hari ini
          </div>
        </aside>
      </section>
    </PrototypeShell>
  );
}
