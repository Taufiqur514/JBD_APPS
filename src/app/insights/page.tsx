import Link from "next/link";
import {
  BadgeDollarSign,
  BrainCircuit,
  MessageSquareMore,
  Users,
} from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { SectionCard } from "@/components/prototype-ui";
import {
  aiAgents,
  analyticCards,
  automationCards,
  crmSegments,
  financeMetrics,
} from "@/lib/prototype-data";

export default function InsightsPage() {
  return (
    <PrototypeShell
      compact
      eyebrow="AI & Insights"
      title="Growth Intelligence"
      description=""
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title="CRM and automation"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Segments
              </p>
              <div className="mt-4 space-y-3">
                {crmSegments.map((segment) => (
                  <Link href={segment.href} key={segment.name} className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-emerald-300 hover:bg-emerald-50">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium text-slate-900">{segment.name}</p>
                      <span className="text-sm text-slate-500">{segment.size}</span>
                    </div>
                    <p className="mt-1 text-sm text-emerald-700">{segment.action}</p>
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Automation
              </p>
              <div className="mt-4 space-y-3">
                {automationCards.map((item) => (
                  <Link href="/insights/automation" key={item.title} className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10">
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-emerald-200">{item.metric}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Finance visibility"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {financeMetrics.map((metric) => (
              <Link href="/insights/finance" key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-emerald-300 hover:bg-white">
                <p className="text-sm text-slate-500">{metric.label}</p>
                <p className={`mt-2 text-3xl font-semibold ${metric.tone}`}>{metric.value}</p>
              </Link>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm leading-7 text-slate-600">
              Order paid terhubung ke revenue, HPP, gross profit, dan cash flow.
            </p>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title="Analytics"
        >
          <div className="grid gap-4">
            {analyticCards.map((item) => {
              const Icon = item.icon;
              return (
                <Link href="/insights/reports" key={item.title} className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="AI agents"
        >
          <div className="grid gap-4">
            {aiAgents.map((agent) => {
              const Icon = agent.icon;
              return (
                <Link href="/insights/ai" key={agent.title} className="block rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950">{agent.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{agent.text}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <AiSignal icon={MessageSquareMore} label="CRM touchpoints" value="12 trigger" />
            <AiSignal icon={BadgeDollarSign} label="Margin watch" value="5 SKU" />
            <AiSignal icon={BrainCircuit} label="Forecast confidence" value="93%" />
          </div>
        </SectionCard>
      </div>
    </PrototypeShell>
  );
}

function AiSignal({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
