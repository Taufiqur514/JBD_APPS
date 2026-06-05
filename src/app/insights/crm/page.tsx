import Link from "next/link";
import { ArrowLeft, HeartHandshake, MessageSquare, Users } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { crmSegments } from "@/lib/prototype-data";

export default function CrmPage() {
  return (
    <PrototypeShell compact eyebrow="CRM" title="Customer Management" description="">
      <Link href="/insights" className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Insights
      </Link>
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4 md:grid-cols-2">
          {crmSegments.map((segment) => (
            <div key={segment.name} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <Users className="h-6 w-6 text-emerald-700" />
              <p className="mt-4 text-xl font-semibold text-slate-950">{segment.name}</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950">{segment.size}</p>
              <p className="mt-2 text-sm text-emerald-700">{segment.action}</p>
            </div>
          ))}
        </div>
        <aside className="space-y-5">
          <CrmAction icon={MessageSquare} title="Create CS ticket" text="Live chat, WhatsApp, FAQ bot, ticketing." />
          <CrmAction icon={HeartHandshake} title="Assign loyalty tier" text="Point, voucher, member benefit." />
        </aside>
      </section>
    </PrototypeShell>
  );
}

function CrmAction({ icon: Icon, title, text }: { icon: typeof Users; title: string; text: string }) {
  return (
    <button type="button" className="w-full rounded-[28px] border border-slate-200 bg-white p-5 text-left shadow-sm">
      <Icon className="h-6 w-6 text-emerald-700" />
      <p className="mt-4 font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </button>
  );
}
