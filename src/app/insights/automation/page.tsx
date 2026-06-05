import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, Send } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { automationCards } from "@/lib/prototype-data";

export default function AutomationPage() {
  return (
    <PrototypeShell compact eyebrow="Marketing Automation" title="Automation Builder" description="">
      <Link href="/insights" className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Insights
      </Link>
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            {automationCards.map((flow) => (
              <div key={flow.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-lg font-semibold text-slate-950">{flow.title}</p>
                <p className="mt-2 text-sm text-slate-500">Trigger: {flow.trigger}</p>
                <p className="mt-1 text-sm text-slate-500">Channel: {flow.channel}</p>
                <p className="mt-3 text-sm font-medium text-emerald-700">{flow.metric}</p>
              </div>
            ))}
          </div>
        </div>
        <aside className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
          <Send className="h-8 w-8 text-emerald-300" />
          <p className="mt-4 text-xl font-semibold">New flow</p>
          <div className="mt-4 space-y-3">
            <button type="button" className="flex w-full items-center gap-3 rounded-2xl bg-white/5 p-4 text-sm text-slate-200">
              <MessageSquare className="h-4 w-4 text-emerald-300" /> WhatsApp blast
            </button>
            <button type="button" className="flex w-full items-center gap-3 rounded-2xl bg-white/5 p-4 text-sm text-slate-200">
              <Mail className="h-4 w-4 text-emerald-300" /> Email campaign
            </button>
          </div>
        </aside>
      </section>
    </PrototypeShell>
  );
}
