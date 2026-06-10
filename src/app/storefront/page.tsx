import Link from "next/link";
import { BadgePercent, ChevronRight, Gift, MessageCircle, PackageCheck, Search, ShieldCheck, Star, Truck, Zap } from "lucide-react";
import { CompactFilterBar } from "@/components/compact-filter-bar";
import { ProductMediaTile } from "@/components/product-media-tile";
import { PrototypeShell } from "@/components/prototype-shell";
import { StorefrontCarousel } from "@/components/storefront-carousel";
import { getAssets, getProducts } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export default async function StorefrontPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const category = params.category;
  const sort = params.sort;
  const filter = params.filter;
  const [allProducts, assets] = await Promise.all([getProducts(), getAssets()]);
  let products = [...allProducts];
  const bannerSlides = assets
    .filter((asset) => asset.type === "banner" && asset.status === "published" && typeof asset.mediaUrl === "string" && asset.mediaUrl)
    .map((asset) => ({
      eyebrow: "Banner carousel JBD",
      title: String(asset.title),
      cta: asset.productSlug ? "Lihat produk" : "Lihat promo",
      href: asset.productSlug ? `/storefront/products/${asset.productSlug}` : "/storefront",
      tone: "from-emerald-950 via-emerald-800 to-amber-500",
      mediaUrl: typeof asset.mediaUrl === "string" ? asset.mediaUrl : undefined,
      mediaType: String(asset.mimeType ?? "").startsWith("video/") ? ("video" as const) : ("image" as const),
    }));
  const productCategories = Array.from(new Set(allProducts.map((product) => product.category).filter(Boolean)));
  const categoryTone = ["bg-emerald-50 text-emerald-700", "bg-amber-50 text-amber-700", "bg-sky-50 text-sky-700", "bg-violet-50 text-violet-700", "bg-rose-50 text-rose-700", "bg-lime-50 text-lime-700"];
  const quickServices = [
    { label: "Voucher JBD25", href: "/storefront/profile/vouchers", icon: BadgePercent },
    { label: "Gratis ongkir", href: "/storefront/checkout", icon: Truck },
    { label: "Chat sales", href: "/storefront/chat", icon: MessageCircle },
    { label: "QC terjamin", href: "/storefront/recipes", icon: ShieldCheck },
  ];
  if (category && category !== "Semua kategori") {
    products = products.filter((product) => product.category === category);
  }
  if (filter === "Ready stock") products = products.filter((product) => product.stock > 0);
  if (filter === "Rating 4.8+") products = products.filter((product) => Number(product.rating) >= 4.8);
  if (filter === "Promo aktif") products = products.filter((product) => product.tag.toLowerCase().includes("promo") || product.info.some((item) => item.toLowerCase().includes("promo")));
  if (filter === "Kemasan ekonomis") products = products.filter((product) => product.variants.some((variant) => variant.toLowerCase().includes("500") || variant.toLowerCase().includes("bundle")));
  if (sort === "Termurah") products = products.sort((a, b) => a.numericPrice - b.numericPrice);
  if (sort === "Terbaru") products = products.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  if (sort === "Best seller") products = products.sort((a, b) => Number(b.sold) - Number(a.sold));

  return (
    <PrototypeShell
      compact
      eyebrow="Frontstore Web"
      title="Marketplace bahan baku minuman JBD"
      description=""
    >
      <section className="hidden overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm lg:block">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Kategori
          </span>
          <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
            {productCategories.map((item) => (
              <Link
                key={item}
                href={`/storefront?category=${encodeURIComponent(item)}#product-list`}
                className="shrink-0 rounded-full bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-[1fr_280px] gap-4 p-5">
          <StorefrontCarousel banners={bannerSlides} />
          <div className="grid gap-3">
            <Link href="/storefront/profile/vouchers" className="rounded-2xl bg-slate-950 p-4 text-white">
              <Zap className="h-5 w-5 text-amber-300" />
              <p className="mt-3 text-lg font-semibold">Flash promo JBD</p>
              <p className="mt-1 text-sm leading-6 text-slate-300">Voucher, bundle, dan tier pricing untuk cafe/reseller.</p>
              <span className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950">Lihat promo</span>
            </Link>
            <Link href="/storefront/live" className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">Live & video produk</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">Lihat resep, demo minuman, dan materi jualan.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm xl:block">
          <p className="text-sm font-semibold text-slate-950">Kategori JBD</p>
          <div className="mt-4 grid gap-2">
            {productCategories.map((category, index) => (
              <Link key={category} href={`/storefront?category=${encodeURIComponent(category)}#product-list`} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800">
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
          <div className="lg:hidden">
            <StorefrontCarousel banners={bannerSlides} />
          </div>

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

          <section id="product-list" className="scroll-mt-40">
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
                <CompactFilterBar
                  categories={["Semua kategori", ...productCategories]}
                  currentParams={{ category, sort, filter }}
                  targetId="product-list"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                {category && category !== "Semua kategori" ? <span className="rounded-full bg-slate-50 px-3 py-1">Kategori: {category}</span> : null}
                {sort ? <span className="rounded-full bg-slate-50 px-3 py-1">Sort: {sort}</span> : null}
                {filter ? <span className="rounded-full bg-slate-50 px-3 py-1">Filter: {filter}</span> : null}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                {products.map((product) => (
                  <Link
                    key={product.slug}
                    href={`/storefront/products/${product.slug}`}
                    className="group rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-300 hover:bg-white hover:shadow-sm md:p-4"
                  >
                    <ProductMediaTile coverUrl={product.coverUrl} tone={product.imageTone} name={product.name} compact />
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
        </div>
      </section>
    </PrototypeShell>
  );
}
