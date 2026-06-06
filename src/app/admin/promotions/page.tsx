import Link from "next/link";
import { Gift, Megaphone, Percent, Repeat2 } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { getPromoRules } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

const typeTone: Record<string, string> = {
  voucher: "bg-emerald-50 text-emerald-700",
  "flash-sale": "bg-rose-50 text-rose-700",
  "tier-pricing": "bg-sky-50 text-sky-700",
  bundle: "bg-amber-50 text-amber-700",
  cashback: "bg-violet-50 text-violet-700",
  referral: "bg-indigo-50 text-indigo-700",
  loyalty: "bg-lime-50 text-lime-700",
};

export default async function AdminPromotionsPage() {
  const rules = await getPromoRules();
  const activeBudget = rules.reduce((total, rule) => total + rule.budget, 0);
  const used = rules.reduce((total, rule) => total + rule.used, 0);

  return (
    <PrototypeShell compact eyebrow="Promotion Engine" title="Voucher, Flash Sale, Bundle, Loyalty" description="">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Budget aktif" value={`Rp ${activeBudget.toLocaleString("id-ID")}`} icon={Megaphone} />
        <Metric label="Terpakai" value={`Rp ${used.toLocaleString("id-ID")}`} icon={Percent} />
        <Metric label="Rules aktif" value={String(rules.filter((rule) => rule.status === "active").length)} icon={Gift} />
      </div>
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3">
          {rules.map((rule) => (
            <Link key={rule.id} href={`/admin/promotions?rule=${rule.id}`} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm transition hover:border-emerald-300 hover:bg-white md:grid-cols-[1fr_0.8fr_0.8fr_0.8fr] md:items-center">
              <div>
                <p className="font-semibold text-slate-950">{rule.name}</p>
                <p className="mt-1 text-slate-500">{rule.trigger}</p>
              </div>
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${typeTone[rule.type] ?? "bg-slate-100 text-slate-700"}`}>{rule.type}</span>
              <p className="text-slate-700">{rule.reward}</p>
              <div>
                <p className="font-medium text-slate-950">Rp {rule.used.toLocaleString("id-ID")}</p>
                <p className="text-xs text-slate-500">dari Rp {rule.budget.toLocaleString("id-ID")}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <RuleBox title="Auto voucher" text="Rule membaca subtotal, segment customer, dan voucher eligibility saat checkout." />
        <RuleBox title="Tier pricing" text="Harga berubah saat qty Horeca melewati batas minimum atau customer VIP reseller." />
        <RuleBox title="Cashback & referral" text="Point dan voucher referral masuk ke loyalty ledger setelah order delivered." />
      </section>
    </PrototypeShell>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Gift }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-emerald-700" />
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function RuleBox({ title, text }: { title: string; text: string }) {
  return (
    <Link href="/admin/promotions" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <Repeat2 className="h-6 w-6 text-emerald-700" />
      <p className="mt-4 font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </Link>
  );
}
