import Link from "next/link";
import { Star, Ticket, Users } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { getCrmProfiles } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export default async function AdminCrmPage() {
  const profiles = await getCrmProfiles();
  const segments = profiles.reduce<Record<string, number>>((acc, item) => {
    const segment = String(item.segment ?? "Unsegmented");
    acc[segment] = (acc[segment] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <PrototypeShell compact eyebrow="Admin CRM" title="Customer 360 & Segmentasi" description="">
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(segments).map(([segment, count]) => (
          <Link key={segment} href={`/admin/crm?segment=${encodeURIComponent(segment)}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{segment}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{count}</p>
            <p className="mt-2 text-sm text-emerald-700">segment aktif</p>
          </Link>
        ))}
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[1fr_0.8fr_0.6fr_0.8fr_0.8fr] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-500">
            <p>Customer</p><p>Segment</p><p>Point</p><p>Spend</p><p>Action</p>
          </div>
          {profiles.map((profile) => (
            <div key={String(profile.userId)} className="grid grid-cols-[1fr_0.8fr_0.6fr_0.8fr_0.8fr] items-center gap-4 border-b border-slate-100 px-5 py-4 text-sm last:border-b-0">
              <div>
                <p className="font-semibold text-slate-950">{String(profile.name)}</p>
                <p className="mt-1 text-xs text-slate-500">Repeat {String(profile.repeatWindow)} hari | {String(profile.tier)}</p>
              </div>
              <p className="text-slate-700">{String(profile.segment)}</p>
              <p className="font-medium text-emerald-700">{String(profile.points)}</p>
              <p className="text-slate-700">Rp {Number(profile.totalSpend ?? 0).toLocaleString("id-ID")}</p>
              <Link href="/storefront/chat" className="w-fit rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white">Follow up</Link>
            </div>
          ))}
        </div>
        <aside className="space-y-4">
          <CrmBox icon={Users} title="Segment logic" text="New, active cafe, VIP reseller, at risk dihitung dari repeat window, spend, point, dan histori order." />
          <CrmBox icon={Ticket} title="Customer ticket" text="Ticket CS tersambung ke chat, tracking, retur, dan refund." />
          <CrmBox icon={Star} title="Loyalty rule" text="Point bertambah dari order paid dan bisa dipakai saat checkout berikutnya." />
        </aside>
      </section>
    </PrototypeShell>
  );
}

function CrmBox({ icon: Icon, title, text }: { icon: typeof Users; title: string; text: string }) {
  return (
    <Link href="/admin/notifications" className="block rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-6 w-6 text-emerald-700" />
      <p className="mt-4 font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </Link>
  );
}
