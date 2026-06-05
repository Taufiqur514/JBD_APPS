import Link from "next/link";
import { Gift, Medal, Ticket } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";

export default function LoyaltyPage() {
  return (
    <PrototypeShell compact eyebrow="Loyalty" title="JBD Rewards" description="">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="rounded-[24px] bg-emerald-700 p-6 text-white">
            <p className="text-sm text-emerald-100">Point Anda</p>
            <p className="mt-2 text-4xl font-semibold">1.250</p>
            <p className="mt-2 text-sm text-emerald-50">Member level: Green Partner</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Reward icon={Ticket} title="Voucher" text="Diskon 10% order berikutnya" />
            <Reward icon={Gift} title="Reward" text="Free sampling SKU baru" />
            <Reward icon={Medal} title="Member" text="Tier pricing reseller" />
          </div>
          <Link href="/storefront" className="mt-5 inline-flex h-11 items-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white">
            Gunakan reward
          </Link>
        </div>
        <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-slate-950">Riwayat point</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>+120 Order JBD-240605-0127</p>
            <p>+50 Review produk</p>
            <p>-100 Voucher JBD25</p>
          </div>
        </aside>
      </section>
    </PrototypeShell>
  );
}

function Reward({ icon: Icon, title, text }: { icon: typeof Gift; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <Icon className="h-5 w-5 text-emerald-700" />
      <p className="mt-3 font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{text}</p>
    </div>
  );
}
