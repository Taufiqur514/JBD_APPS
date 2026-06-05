import Link from "next/link";
import {
  ChevronRight,
  Filter,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { featuredProducts, productCategories } from "@/lib/prototype-data";

export default function StorefrontPage() {
  return (
    <PrototypeShell
      compact
      eyebrow="Customer App"
      title="JBD Powder Drink Store"
      description=""
    >
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] bg-[linear-gradient(135deg,#0f3b2e_0%,#16603f_58%,#d8a640_100%)] p-6 text-white shadow-sm">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-100">
              Better ingredients, better drink
            </p>
            <h3 className="mt-3 text-4xl font-semibold tracking-tight">
              Powder minuman premium untuk cafe, booth, reseller, dan distributor.
            </h3>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/storefront/products/chocolate-premium-500g"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-900"
              >
                Belanja sekarang
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/storefront/cart"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white"
              >
                <ShoppingCart className="h-4 w-4" />
                Lihat keranjang
              </Link>
            </div>
          </div>
        </div>

        <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Promo aktif</p>
          <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
            <p className="text-lg font-semibold text-emerald-900">Voucher JBD25</p>
            <p className="mt-1 text-sm text-emerald-700">Diskon Rp 25.000 untuk order pertama.</p>
          </div>
          <div className="mt-4 rounded-2xl bg-amber-50 p-4">
            <p className="text-lg font-semibold text-amber-900">Bundle Horeca</p>
            <p className="mt-1 text-sm text-amber-700">Beli 3 SKU, gratis recipe card.</p>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-950">Filter</p>
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-5 space-y-2">
            {productCategories.map((category, index) => (
              <button
                key={category}
                type="button"
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm ${
                  index === 0
                    ? "bg-slate-950 text-white"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {category}
                <span className="text-xs opacity-70">{index + 6}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex min-h-11 flex-1 items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">
              <Search className="h-4 w-4" />
              Cari powder, rasa, kemasan, atau menu minuman
            </div>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700"
            >
              <Filter className="h-4 w-4" />
              Sort
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredProducts.map((product) => (
              <Link
                key={product.slug}
                href={`/storefront/products/${product.slug}`}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white hover:shadow-sm"
              >
                <div className={`aspect-[4/3] rounded-2xl ${product.imageTone}`} />
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-slate-950">{product.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{product.taste}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                    {product.tag}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-lg font-semibold text-slate-950">{product.price}</p>
                  <div className="flex items-center gap-1 text-sm text-amber-600">
                    <Star className="h-4 w-4 fill-amber-500" />
                    {product.rating}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.info.map((item) => (
                    <span key={item} className="rounded-full bg-white px-2 py-1 text-xs text-slate-600">
                      {item}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PrototypeShell>
  );
}
