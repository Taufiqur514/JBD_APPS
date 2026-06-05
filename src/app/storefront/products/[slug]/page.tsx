import Link from "next/link";
import { ArrowLeft, Check, Heart, Minus, Plus, ShieldCheck, ShoppingCart, Star } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { featuredProducts } from "@/lib/prototype-data";
import { formatRupiah, getProduct } from "@/lib/commerce";

export function generateStaticParams() {
  return featuredProducts.map((product) => ({ slug: product.slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);

  return (
    <PrototypeShell compact eyebrow="Product Detail" title={product.name} description="">
      <Link
        href="/storefront"
        className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke katalog
      </Link>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className={`aspect-square rounded-[24px] ${product.imageTone}`} />
          <div className="mt-4 grid grid-cols-4 gap-3">
            {product.variants.map((variant) => (
              <div key={variant} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-600">
                {variant}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              {product.tag}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
              <Star className="h-4 w-4 fill-amber-500" />
              {product.rating} | Terjual {product.sold}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
              Stock {product.stock}
            </span>
          </div>

          <h3 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
            {product.name}
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">{product.description}</p>
          <p className="mt-5 text-3xl font-semibold text-slate-950">{product.price}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Varian</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.variants.map((variant, index) => (
                  <button
                    key={variant}
                    type="button"
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      index === 0
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Jumlah</p>
              <div className="mt-3 flex h-11 w-fit items-center rounded-full border border-slate-200 bg-slate-50">
                <button type="button" className="flex h-11 w-11 items-center justify-center">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold">2</span>
                <button type="button" className="flex h-11 w-11 items-center justify-center">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/storefront/cart"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white"
            >
              <ShoppingCart className="h-4 w-4" />
              Tambah ke keranjang
            </Link>
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700"
            >
              <Heart className="h-4 w-4" />
              Wishlist
            </button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <InfoTile title="Estimasi HPP" value={formatRupiah(Math.round(product.numericPrice * 0.62))} />
            <InfoTile title="Margin" value="38%" />
            <InfoTile title="Repeat" value="21 hari" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <ProductPanel title="Komposisi" items={product.composition} />
        <ProductPanel title="Cara penyajian" items={[product.serving, "Cocok untuk menu hot, iced, blended."]} />
        <ProductPanel title="Kepercayaan" items={["Bahan higienis", "QC batch", "Aman untuk pengiriman"]} />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        <Link
          href="/storefront/cart"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-700 text-sm font-semibold text-white"
        >
          <ShoppingCart className="h-4 w-4" />
          Tambah ke keranjang
        </Link>
      </div>
    </PrototypeShell>
  );
}

function InfoTile({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function ProductPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-emerald-700" />
        <p className="font-semibold text-slate-950">{title}</p>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <div key={item} className="flex gap-3">
            <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
