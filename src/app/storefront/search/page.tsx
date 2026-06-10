import Link from "next/link";
import { Star } from "lucide-react";
import { CompactFilterBar } from "@/components/compact-filter-bar";
import { PrototypeShell } from "@/components/prototype-shell";
import { getProducts } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export default async function StorefrontSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const query = String(params.q ?? "").toLowerCase();
  const category = params.category;
  const sort = params.sort;
  const filter = params.filter;
  let products = await getProducts();
  const productCategories = Array.from(new Set(products.map((product) => product.category).filter(Boolean)));
  if (query) {
    products = products.filter((product) =>
      [product.name, product.taste, product.category, product.description].join(" ").toLowerCase().includes(query),
    );
  }
  if (category && !["Semua kategori", "Semua resep"].includes(category)) {
    products = products.filter((product) => product.category === category);
  }
  if (filter === "Ready stock") products = products.filter((product) => product.stock > 0);
  if (filter === "Rating 4.8+") products = products.filter((product) => Number(product.rating) >= 4.8);
  if (sort === "Termurah") products = products.sort((a, b) => a.numericPrice - b.numericPrice);
  if (sort === "Terbaru") products = products.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));

  return (
    <PrototypeShell compact eyebrow="Search Product" title="Cari Produk JBD" description="">
      <section id="product-list" className="scroll-mt-40">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <CompactFilterBar
            categories={["Semua kategori", ...productCategories]}
            currentParams={{
              q: params.q,
              category,
              sort,
              filter,
            }}
            targetId="product-list"
          />
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            {query ? <span className="rounded-full bg-slate-50 px-3 py-1">Keyword: {params.q}</span> : null}
            {category ? <span className="rounded-full bg-slate-50 px-3 py-1">Kategori: {category}</span> : null}
            {sort ? <span className="rounded-full bg-slate-50 px-3 py-1">Sort: {sort}</span> : null}
            {filter ? <span className="rounded-full bg-slate-50 px-3 py-1">Filter: {filter}</span> : null}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
            {products.map((product) => (
              <Link
                key={product.slug}
                href={`/storefront/products/${product.slug}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-300 hover:bg-white md:p-4"
              >
                {product.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.coverUrl} alt={product.name} className="aspect-[4/3] w-full rounded-2xl object-cover" />
                ) : (
                  <div className={`aspect-[4/3] rounded-2xl ${product.imageTone}`} />
                )}
                <p className="mt-3 text-sm font-semibold text-slate-950 md:mt-4 md:text-base">{product.name}</p>
                <p className="mt-1 text-sm text-slate-500">{product.taste}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-semibold text-slate-950">{product.price}</span>
                  <span className="flex items-center gap-1 text-sm text-amber-600">
                    <Star className="h-4 w-4 fill-amber-500" />
                    {product.rating}
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
