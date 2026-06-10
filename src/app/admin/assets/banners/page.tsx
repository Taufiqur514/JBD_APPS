import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, LayoutPanelTop } from "lucide-react";
import { AdminContentPublisher } from "@/components/admin-content-publisher";
import { PrototypeShell } from "@/components/prototype-shell";
import { getAssets, getProducts } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export default async function AdminBannerAssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ asset?: string }>;
}) {
  const params = await searchParams;
  const [products, assets] = await Promise.all([getProducts(), getAssets()]);
  const selectedAsset = params.asset
    ? assets.find((asset) => asset.type === "banner" && (asset.slug === params.asset || asset.id === params.asset))
    : undefined;
  const initialAsset = selectedAsset
    ? {
        id: String(selectedAsset.id ?? ""),
        slug: String(selectedAsset.slug ?? ""),
        type: String(selectedAsset.type ?? "banner"),
        title: String(selectedAsset.title ?? ""),
        caption: String(selectedAsset.caption ?? ""),
        productSlug: String(selectedAsset.productSlug ?? ""),
        placement: String(selectedAsset.placement ?? "Homepage carousel"),
        status: String(selectedAsset.status ?? "published"),
        mediaUrl: typeof selectedAsset.mediaUrl === "string" ? selectedAsset.mediaUrl : undefined,
        mimeType: typeof selectedAsset.mimeType === "string" ? selectedAsset.mimeType : undefined,
      }
    : undefined;

  return (
    <PrototypeShell compact eyebrow="Admin Assets" title="Banner Carousel" description="">
      <Link href="/admin/assets" className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-100 px-4 text-sm font-semibold text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Asset library
      </Link>

      <section className="mt-5 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-w-0 rounded-[28px] border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-emerald-700">
            <LayoutPanelTop className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-slate-950">{selectedAsset ? "Edit banner homepage" : "Upload banner khusus homepage"}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Banner yang dipublish dari halaman ini hanya masuk carousel beranda/frontstore. Banner tidak akan tampil di Live/Reel sehingga feed video tetap berisi konten promosi manual, resep, dan video produk dari Media Produk.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {["Carousel beranda", "Promo strip", "CTA ke produk"].map((item) => (
              <div key={item} className="rounded-2xl bg-white p-4 text-sm font-semibold text-slate-800">
                <ImageIcon className="mb-3 h-5 w-5 text-emerald-700" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <AdminContentPublisher
          mode="banner"
          initialAsset={initialAsset}
          products={products.map((product) => ({ slug: product.slug, name: product.name }))}
        />
      </section>
    </PrototypeShell>
  );
}
