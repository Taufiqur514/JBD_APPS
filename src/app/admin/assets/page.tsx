import Link from "next/link";
import { BookOpen, Image as ImageIcon, Pencil, Play, Plus, Upload, Video } from "lucide-react";
import { CompactFilterBar } from "@/components/compact-filter-bar";
import { PrototypeShell } from "@/components/prototype-shell";
import { getAssets, getRecipes } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

const typeIcon = {
  banner: ImageIcon,
  video: Video,
  "product-video": Video,
  recipe: BookOpen,
} as const;

export default async function AdminAssetsPage() {
  const [assets, recipes] = await Promise.all([getAssets(), getRecipes()]);
  const library = [
    ...assets.map((asset) => ({
      name: String(asset.title),
      type: String(asset.type),
      placement: String(asset.placement ?? "Live/Reel"),
      status: String(asset.status ?? "published"),
      tone: asset.type === "video" ? "bg-slate-900" : "bg-emerald-100",
      mediaUrl: typeof asset.mediaUrl === "string" ? asset.mediaUrl : "",
    })),
    ...recipes.map((recipe) => ({
      name: recipe.title,
      type: "recipe",
      placement: "Resep + Live/Reel",
      status: recipe.status ?? "published",
      tone: recipe.tone ?? "bg-amber-100",
      mediaUrl: "",
    })),
  ];

  return (
    <PrototypeShell compact eyebrow="Admin Assets" title="Asset, Banner, Video, dan Resep" description="">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-slate-950">Library konten commerce</p>
              <p className="mt-1 text-sm text-slate-500">Banner carousel, gambar produk, live video, short promo, voucher visual, dan resep.</p>
            </div>
            <a href="#publish-content" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white">
              <Upload className="h-4 w-4" />
              Publish konten
            </a>
          </div>

          <div className="mt-5">
            <CompactFilterBar
              categories={["Semua asset", "Banner", "Product Image", "Video", "Resep"]}
              sorts={["Terbaru", "Published", "Draft", "Scheduled"]}
            />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {library.map((asset, index) => {
              const Icon = typeIcon[asset.type as keyof typeof typeIcon] ?? ImageIcon;
              return (
                <div key={`${asset.name}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className={`grid aspect-video place-items-center overflow-hidden rounded-2xl ${asset.tone}`}>
                    {asset.mediaUrl && (asset.type === "video" || asset.type === "product-video") ? (
                      <video src={asset.mediaUrl} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                    ) : asset.mediaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={asset.mediaUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Icon className={`h-9 w-9 ${asset.type === "video" || asset.type === "product-video" ? "text-white" : "text-emerald-700"}`} />
                    )}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{asset.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{asset.type} | {asset.placement}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">{asset.status}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <a href="#publish-content" className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-slate-700">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </a>
                    <Link href={asset.type === "recipe" ? "/storefront/recipes" : "/storefront/live"} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-slate-950 text-sm font-semibold text-white">
                      <Play className="h-4 w-4" />
                      Preview
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-5">
          <form id="publish-content" action="/api/admin/assets" method="post" encType="multipart/form-data" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-semibold text-slate-950">Publish konten baru</p>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Tipe konten
                <select name="type" className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm">
                  <option value="recipe">Resep</option>
                  <option value="banner">Banner carousel</option>
                  <option value="video">Live video</option>
                  <option value="product-video">Video produk</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Judul
                <input name="title" defaultValue="Resep Chocolate Frappe Baru" className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Keyword
                <input name="keyword" defaultValue="chocolate frappe cafe" className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Produk terkait
                <select name="productSlug" className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm">
                  <option value="chocolate-premium-500g">JBD Chocolate Premium 500g</option>
                  <option value="matcha-latte-1kg">JBD Matcha Latte 1kg</option>
                  <option value="taro-signature-500g">JBD Taro Signature 500g</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Placement
                <select name="placement" className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm">
                  <option>Resep + Live/Reel</option>
                  <option>Homepage carousel</option>
                  <option>Product detail</option>
                  <option>Voucher campaign</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Upload gambar atau video
                <input name="media" type="file" accept="image/*,video/*" className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Atau URL media
                <input name="mediaUrl" type="url" placeholder="https://..." className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm" />
              </label>
            </div>
            <button type="submit" className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-700 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" />
              Publish
            </button>
          </form>

          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <p className="font-semibold">Asset rule</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>Resep yang dipublish muncul di halaman Resep dan ikut masuk feed Live/Reel.</p>
              <p>Banner, live video, dan video produk juga masuk feed Live/Reel untuk promosi dinamis.</p>
              <p>Konten bisa dihubungkan ke produk agar CTA langsung menuju PDP atau cart.</p>
            </div>
          </div>
        </aside>
      </section>
    </PrototypeShell>
  );
}
