import Link from "next/link";
import { BadgePercent, ChevronRight, Gift, MessageCircle, PackageCheck, Search, ShieldCheck, Star, Truck } from "lucide-react";
import { CompactFilterBar } from "@/components/compact-filter-bar";
import { PrototypeShell } from "@/components/prototype-shell";
import { StorefrontCarousel } from "@/components/storefront-carousel";
import { productCategories } from "@/lib/prototype-data";
import { getProducts } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export default async function StorefrontPage() {
  const products = await getProducts();
  const categoryTone = ["bg-emerald-50 text-emerald-700", "bg-amber-50 text-amber-700", "bg-sky-50 text-sky-700", "bg-violet-50 text-violet-700", "bg-rose-50 text-rose-700", "bg-lime-50 text-lime-700"];
  const quickServices = [
    { label: "Voucher JBD25", href: "/storefront/profile/vouchers", icon: BadgePercent },
    { label: "Gratis ongkir", href: "/storefront/checkout", icon: Truck },
    { label: "Chat sales", href: "/storefront/chat", icon: MessageCircle },
    { label: "QC terjamin", href: "/storefront/recipes", icon: ShieldCheck },
  ];

  return (
    <PrototypeShell
      compact
      eyebrow="Frontstore Web"
      title="Marketplace bahan baku minuman JBD"
      description=""
    >
      <section className="grid gap-4 xl:grid-cols-[260px_1fr]">
        <aside className="hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm xl:block">
          <p className="text-sm font-semibold text-slate-950">Kategori JBD</p>
          <div className="mt-4 grid gap-2">
            {productCategories.map((category, index) => (
              <Link key={category} href={`/storefront/search?category=${encodeURIComponent(category)}`} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800">
                <span>{category}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${categoryTone[index % categoryTone.length]}`}>{index + 3}</span>
              </Link>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white">
            <Gift className="h-5 w-5 text-emerald-300" />
            <p className="mt-3 font-semibold">Promo marketplace</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">Voucher, bundle, dan tier pricing langsung dihitung saat checkout.</p>
            <Link href="/storefront/profile/vouchers" className="mt-4 inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-slate-950">
              Lihat promo
            </Link>
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          <StorefrontCarousel />

          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {quickServices.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.label} href={item.href} className="flex min-h-16 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-emerald-300">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm xl:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {productCategories.map((category, index) => (
                <Link key={category} href={`/storefront/search?category=${encodeURIComponent(category)}`} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${categoryTone[index % categoryTone.length]}`}>
                  {category}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section>
        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-lg font-semibold text-slate-950">Rekomendasi produk JBD</p>
              <p className="mt-1 text-sm text-slate-500">Grid marketplace untuk desktop dan mobile, fokus ke rasa, harga, rating, stok, dan repeat order.</p>
            </div>
            <Link href="/storefront/search" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white">
              <Search className="h-4 w-4" />
              Cari produk
            </Link>
          </div>

          <div className="mt-5">
            <CompactFilterBar categories={productCategories} />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-5">
            {products.map((product) => (
              <Link
                key={product.slug}
                href={`/storefront/products/${product.slug}`}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-300 hover:bg-white hover:shadow-sm md:p-4"
              >
                <div className={`aspect-[4/3] rounded-2xl ${product.imageTone}`} />
                <div className="mt-3 flex items-start justify-between gap-2 md:mt-4 md:gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950 md:text-base">{product.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{product.taste}</p>
                  </div>
                  <span className="hidden rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 sm:inline-flex">
                    {product.tag}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between md:mt-4">
                  <p className="text-base font-semibold text-slate-950 md:text-lg">{product.price}</p>
                  <div className="flex items-center gap-1 text-sm text-amber-600">
                    <Star className="h-4 w-4 fill-amber-500" />
                    {product.rating}
                  </div>
                </div>
                <div className="mt-3 hidden flex-wrap gap-2 sm:flex md:mt-4">
                  {product.info.map((item) => (
                    <span key={item} className="rounded-full bg-white px-2 py-1 text-xs text-slate-600">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <PackageCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Stok {product.stock}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ChevronRight className="h-3.5 w-3.5" />
                    Detail
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PrototypeShell>
  );
}
