import Link from "next/link";
import { ArrowLeft, ArrowRightLeft, Check } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { returnsBoard } from "@/lib/prototype-data";

export default function ReturnsPage() {
  return (
    <PrototypeShell compact eyebrow="Return & Refund" title="Return Management" description="">
      <Link href="/operations" className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Operations
      </Link>
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3">
            {returnsBoard.map((item) => (
              <div key={item.ref} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{item.ref}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.item} - {item.issue}</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">{item.status}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/operations/returns?status=approved" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Approve</Link>
                  <Link href="/operations/returns?status=refund" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Refund</Link>
                  <Link href="/operations/returns?status=replace" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Replace</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <ArrowRightLeft className="h-8 w-8 text-emerald-700" />
          <p className="mt-4 text-xl font-semibold text-slate-950">Refund flow</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {["Ajukan retur", "Verifikasi CS", "Terima barang", "Refund / tukar", "Selesai"].map((step) => (
              <div key={step} className="flex gap-3">
                <Check className="h-4 w-4 text-emerald-600" />
                {step}
              </div>
            ))}
          </div>
        </aside>
      </section>
    </PrototypeShell>
  );
}
