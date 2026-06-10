import Link from "next/link";
import { ArrowLeft, Check, ShieldCheck, Star } from "lucide-react";
import { ProductImageCarousel } from "@/components/product-image-carousel";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { PrototypeShell } from "@/components/prototype-shell";
import { featuredProducts } from "@/lib/prototype-data";
import { getProduct } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return featuredProducts.map((product) => ({ slug: product.slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  const variantDetails: Array<{ name: string; price: number; weightGrams?: number; stock?: number }> = product.variantDetails?.length
    ? product.variantDetails
    : product.variants.map((variantName) => ({ name: variantName, price: product.numericPrice, stock: product.stock }));

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
          <ProductImageCarousel images={product.images} fallbackTone={product.imageTone} productName={product.name} />
          <div className="mt-4 grid grid-cols-4 gap-3">
            {variantDetails.map((variant) => (
              <div key={variant.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-600">
                <p className="font-semibold text-slate-800">{variant.name}</p>
                {variant.weightGrams ? <p className="mt-1">{variant.weightGrams}g</p> : null}
                <p className="mt-1 text-emerald-700">Stok {variant.stock ?? 0}</p>
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
          <ProductPurchasePanel productSlug={product.slug} variants={variantDetails} />

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <InfoTile title="Estimasi hasil" value="12-16 gelas" />
            <InfoTile title="Penyajian" value="Hot & iced" />
            <InfoTile title="Cocok untuk" value="Cafe & reseller" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <ProductPanel title="Komposisi" items={product.composition} />
        <ProductPanel title="Cara penyajian" items={[product.serving, "Cocok untuk menu hot, iced, blended."]} />
        <ProductPanel title="Kepercayaan" items={["Bahan higienis", "QC batch", "Aman untuk pengiriman"]} />
      </section>

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
