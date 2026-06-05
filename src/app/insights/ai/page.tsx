import Link from "next/link";
import { ArrowLeft, Bot, Play, Workflow } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { agentWorkflows } from "@/lib/prototype-data";

export default function AiPage() {
  return (
    <PrototypeShell compact eyebrow="AI Multi-Agent Platform" title="Agent Workspace" description="">
      <Link href="/insights" className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Insights
      </Link>
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4">
            {agentWorkflows.map((flow) => (
              <div key={flow.agent} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[0.8fr_1fr_1fr_auto] md:items-center">
                <p className="font-semibold text-slate-950">{flow.agent}</p>
                <p className="text-sm text-slate-600">{flow.input}</p>
                <p className="text-sm text-slate-600">{flow.output}</p>
                <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white">
                  <Play className="h-4 w-4" /> Run
                </button>
              </div>
            ))}
          </div>
        </div>
        <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <Bot className="h-8 w-8 text-emerald-700" />
          <p className="mt-4 text-xl font-semibold text-slate-950">Decision Agent</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Reorder Matcha 500g, adjust Taro promo, and push Chocolate bundle to active cafe segment.</p>
          <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
            <Workflow className="mb-3 h-5 w-5" />
            Commerce events feed the agents.
          </div>
        </aside>
      </section>
    </PrototypeShell>
  );
}
