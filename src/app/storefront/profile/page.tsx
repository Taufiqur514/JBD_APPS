import Link from "next/link";
import { ChevronRight, Gift, MapPin, Package, Settings, Star, Ticket, Truck, Wallet } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { getCustomerProfile, getOrders, getVouchers } from "@/lib/mvp-store";

const profileMenus = [
  { label: "Setting akun", detail: "Nama, kontak, keamanan", href: "/storefront/profile/settings", icon: Settings },
  { label: "Voucher promo", detail: "Diskon, gratis ongkir, cashback", href: "/storefront/profile/vouchers", icon: Ticket },
  { label: "Alamat kirim", detail: "Alamat cafe, rumah, gudang", href: "/storefront/profile/addresses", icon: MapPin },
  { label: "Loyalty JBD", detail: "Point, reward, level member", href: "/storefront/loyalty", icon: Gift },
];

export const dynamic = "force-dynamic";

export default async function StorefrontProfilePage() {
  const [profile, orders, vouchers] = await Promise.all([getCustomerProfile(), getOrders(), getVouchers()]);
  const customerOrders = orders.filter((order) => order.userId === "demo-customer");
  const counts = {
    unpaid: customerOrders.filter((order) => order.status === "unpaid").length,
    packed: customerOrders.filter((order) => order.status === "packing" || order.status === "qc" || order.status === "paid" || order.status === "picking").length,
    shipped: customerOrders.filter((order) => order.status === "shipped").length,
  };
  const dynamicOrderActions = [
    { label: "Belum dibayar", value: String(counts.unpaid), href: "/storefront/profile/orders?status=unpaid", icon: Wallet },
    { label: "Dikemas", value: String(counts.packed), href: "/storefront/profile/orders?status=packed", icon: Package },
    { label: "Dikirim", value: String(counts.shipped), href: "/storefront/profile/orders?status=shipped", icon: Truck },
  ];
  return (
    <PrototypeShell compact eyebrow="Profile" title="Profil Pengguna" description="">
      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="rounded-[28px] bg-[linear-gradient(135deg,#0f3b2e,#1d7d53)] p-6 text-white shadow-sm">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 text-2xl font-semibold">K</div>
              <div>
                <p className="text-xl font-semibold">{String(profile?.name ?? "Kedai Teman Kopi")}</p>
                <p className="mt-1 text-sm text-emerald-100">Member {String(profile?.tier ?? "Gold")} | {Number(profile?.points ?? 0).toLocaleString("id-ID")} poin</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Stat label="Repeat order" value={`${String(profile?.repeatWindow ?? 21)} hari`} />
              <Stat label="Total order" value={String(customerOrders.length)} />
              <Stat label="Voucher aktif" value={String(vouchers.length)} />
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-950">Pesanan saya</p>
              <Link href="/storefront/profile/orders" className="text-sm font-semibold text-emerald-700">Lihat semua</Link>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
              {dynamicOrderActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href} className="rounded-2xl bg-slate-50 p-3 text-center sm:p-4">
                    <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-white text-emerald-700 sm:h-11 sm:w-11">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="mt-2 block text-xl font-semibold text-slate-950 sm:mt-3 sm:text-2xl">{action.value}</span>
                    <span className="mt-1 block text-xs text-slate-500 sm:text-sm">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-semibold text-slate-950">Menu akun</p>
            <div className="mt-4 grid gap-3">
              {profileMenus.map((menu) => {
                const Icon = menu.icon;
                return (
                  <Link key={menu.href} href={menu.href} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-emerald-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-slate-950">{menu.label}</span>
                      <span className="mt-1 block text-sm text-slate-500">{menu.detail}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-semibold text-slate-950">Produk sering dibeli</p>
            {((profile?.wishlist as string[] | undefined) ?? ["chocolate-premium-500g", "matcha-latte-1kg"]).map((slug) => (
              <Link key={slug} href={`/storefront/products/${slug}`} className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-sm font-medium text-slate-700">
                {slug.replaceAll("-", " ")}
                <Star className="h-4 w-4 text-amber-500" />
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </PrototypeShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-sm text-emerald-100">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
