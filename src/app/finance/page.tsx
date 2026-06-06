import Link from "next/link";
import { Banknote, Calculator, FileSpreadsheet, ReceiptText, ShieldCheck } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { getLedger } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export default async function FinanceWorkspacePage() {
  const ledger = await getLedger();
  const debit = ledger.reduce((sum, row) => sum + row.debit, 0);
  const credit = ledger.reduce((sum, row) => sum + row.credit, 0);
  const cogs = ledger.filter((row) => row.account === "COGS").reduce((sum, row) => sum + row.debit, 0);
  const revenue = ledger.filter((row) => row.account === "AR").reduce((sum, row) => sum + row.debit, 0);

  return (
    <PrototypeShell compact eyebrow="Finance Workspace" title="Financial Control Center" description="">
      <div className="flex items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
        <ShieldCheck className="h-5 w-5 shrink-0" />
        <p>Confidential workspace. Akses dibatasi untuk Finance Controller dan seluruh aktivitas dicatat sebagai audit trail.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={ReceiptText} label="Revenue / AR" value={`Rp ${revenue.toLocaleString("id-ID")}`} />
        <Metric icon={Calculator} label="HPP / COGS" value={`Rp ${cogs.toLocaleString("id-ID")}`} />
        <Metric icon={Banknote} label="Gross profit" value={`Rp ${(revenue - cogs).toLocaleString("id-ID")}`} />
        <Metric icon={FileSpreadsheet} label="Balance check" value={`Rp ${(debit - credit).toLocaleString("id-ID")}`} />
      </div>

      <section className="overflow-x-auto rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[0.7fr_0.7fr_1.2fr_0.8fr_0.8fr_0.7fr] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-500">
            <p>Tanggal</p><p>Akun</p><p>Deskripsi</p><p>Debit</p><p>Credit</p><p>Source</p>
          </div>
          {ledger.map((row) => (
            <Link key={row.id} href={`/finance?source=${row.source}`} className="grid grid-cols-[0.7fr_0.7fr_1.2fr_0.8fr_0.8fr_0.7fr] gap-4 border-b border-slate-100 px-5 py-4 text-sm last:border-b-0 hover:bg-slate-50">
              <p className="text-slate-600">{row.date}</p>
              <p className="font-semibold text-slate-950">{row.account}</p>
              <p className="text-slate-700">{row.description}</p>
              <p>Rp {row.debit.toLocaleString("id-ID")}</p>
              <p>Rp {row.credit.toLocaleString("id-ID")}</p>
              <p className="text-indigo-700">{row.source}</p>
            </Link>
          ))}
        </div>
      </section>
    </PrototypeShell>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Banknote; label: string; value: string }) {
  return (
    <Link href="/finance" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-indigo-700" />
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </Link>
  );
}
