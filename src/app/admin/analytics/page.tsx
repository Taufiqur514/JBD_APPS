import Link from "next/link";
import { Activity, BarChart3, MousePointerClick, Target } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { getAnalyticsEvents } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const events = await getAnalyticsEvents();
  const revenue = events.reduce((sum, event) => sum + Number(event.value ?? 0), 0);
  const grouped = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.type] = (acc[event.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <PrototypeShell compact eyebrow="Analytics Real-time" title="Event Tracking, Conversion, ROAS, Cohort" description="">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={Activity} label="Events" value={String(events.length)} />
        <Metric icon={MousePointerClick} label="Conversion event" value={String(grouped.payment_success ?? 0)} />
        <Metric icon={BarChart3} label="Tracked value" value={`Rp ${revenue.toLocaleString("id-ID")}`} />
        <Metric icon={Target} label="Forecast confidence" value="93.9%" />
      </div>
      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-slate-950">Live event stream</p>
          <div className="mt-5 grid gap-3">
            {events.map((event) => (
              <Link key={event.id} href={`/admin/analytics?event=${event.type}`} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm md:grid-cols-[0.8fr_0.8fr_1fr_0.8fr]">
                <p className="font-semibold text-slate-950">{event.type}</p>
                <p className="text-slate-600">{event.channel}</p>
                <p className="text-slate-500">{event.createdAt.slice(0, 19).replace("T", " ")}</p>
                <p className="text-right text-emerald-700">{event.value ? `Rp ${event.value.toLocaleString("id-ID")}` : "signal"}</p>
              </Link>
            ))}
          </div>
        </div>
        <aside className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
          <p className="font-semibold">Conversion funnel</p>
          <div className="mt-4 grid gap-3 text-sm">
            {Object.entries(grouped).map(([type, count]) => (
              <div key={type} className="rounded-2xl bg-white/5 p-3">
                <div className="flex items-center justify-between">
                  <span>{type}</span>
                  <span className="font-semibold text-emerald-300">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </PrototypeShell>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return (
    <Link href="/admin/analytics" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-emerald-700" />
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </Link>
  );
}
