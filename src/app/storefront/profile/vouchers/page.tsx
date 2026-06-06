import Link from "next/link";
import { Gift, Ticket, Truck } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { getPromoRules, getVouchers } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export default async function StorefrontVouchersPage() {
  const [vouchers, promos] = await Promise.all([getVouchers(), getPromoRules()]);
  const cards = [
    ...vouchers.map((voucher) => ({
      code: String(voucher.code),
      title: voucher.type === "shipping" ? `Subsidi ongkir Rp ${Number(voucher.value).toLocaleString("id-ID")}` : `Diskon Rp ${Number(voucher.value).toLocaleString("id-ID")}`,
      detail: `Min. belanja Rp ${Number(voucher.minSpend ?? 0).toLocaleString("id-ID")}`,
      icon: voucher.type === "shipping" ? Truck : Ticket,
    })),
    ...promos.filter((promo) => promo.type === "bundle" || promo.type === "cashback").map((promo) => ({
      code: promo.id,
      title: promo.name,
      detail: `${promo.trigger} | ${promo.reward}`,
      icon: Gift,
    })),
  ];
  return (
    <PrototypeShell compact eyebrow="My Vouchers" title="Voucher Promo Saya" description="">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((voucher) => {
          const Icon = voucher.icon;
          return (
            <div key={voucher.code} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{voucher.code}</p>
                  <p className="font-semibold text-slate-950">{voucher.title}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">{voucher.detail}</p>
              <Link href="/storefront/checkout" className="mt-5 flex h-11 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                Pakai voucher
              </Link>
            </div>
          );
        })}
      </section>
    </PrototypeShell>
  );
}
