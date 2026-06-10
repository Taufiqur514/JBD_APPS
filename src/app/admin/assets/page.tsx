import Link from "next/link";
import { BookOpen, Image as ImageIcon, LayoutPanelTop, Pencil, Play, Upload, Video } from "lucide-react";
import { CompactFilterBar } from "@/components/compact-filter-bar";
import { PrototypeShell } from "@/components/prototype-shell";
import { getAssets, getRecipes } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

const typeIcon = {
  image: ImageIcon,
  banner: ImageIcon,
  video: Video,
  "product-video": Video,
  recipe: BookOpen,
} as const;

function isVideoMedia(value?: string, mimeType?: string) {
  const media = value?.toLowerCase() ?? "";
  return Boolean(
    mimeType?.startsWith("video/") ||
      media.includes(".mp4") ||
      media.includes(".webm") ||
      media.includes(".mov") ||
      media.includes("video"),
  );
}

export default async function AdminAssetsPage() {
  const [assets, recipes] = await Promise.all([getAssets(), getRecipes()]);
  const manualAssets = assets.filter((asset) => asset.type !== "product-video");
  const library = [
    ...manualAssets.map((asset) => ({
      name: String(asset.title),
      id: String(asset.id ?? ""),
      slug: String(asset.slug ?? ""),
      type: String(asset.type),
      placement: String(asset.placement ?? "Live/Reel"),
      status: String(asset.status ?? "published"),
      tone: asset.type === "video" ? "bg-slate-900" : "bg-emerald-100",
      mediaUrl: typeof asset.mediaUrl === "string" ? asset.mediaUrl : "",
      mimeType: typeof asset.mimeType === "string" ? asset.mimeType : "",
    })),
    ...recipes.map((recipe) => ({
      name: recipe.title,
      id: "",
      slug: String(recipe.productSlug ?? ""),
      type: "recipe",
      placement: "Resep + Live/Reel",
      status: recipe.status ?? "published",
      tone: recipe.tone ?? "bg-amber-100",
      mediaUrl: recipe.mediaUrl ?? "",
      mimeType: recipe.mimeType ?? "",
    })),
  ];

  return (
    <PrototypeShell compact eyebrow="Admin Assets" title="Asset, Banner, Video, dan Resep" description="">
      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-slate-950">Library konten commerce</p>
              <p className="mt-1 text-sm text-slate-500">Kelola asset yang sudah dipublish. Banner dan konten promosi dipisah agar placement tidak tertukar.</p>
              <p className="mt-1 text-xs text-slate-400">Video dari detail produk tidak ditampilkan di library konten ini. Video PDP dikelola lewat Media produk dan tetap bisa masuk Reels.</p>
            </div>
            <Link href="/admin/assets/content" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white">
              <Upload className="h-4 w-4" />
              Publish konten
            </Link>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Link href="/admin/assets/banners" className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-100">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-emerald-700">
                <LayoutPanelTop className="h-5 w-5" />
              </span>
              <p className="mt-4 font-semibold text-slate-950">Tambah banner carousel</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">Khusus carousel beranda/frontstore. Tidak masuk Live/Reel.</p>
            </Link>
            <Link href="/admin/assets/content" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-emerald-700">
                <Video className="h-5 w-5" />
              </span>
              <p className="mt-4 font-semibold text-slate-950">Tambah konten promosi</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">Resep, Live/Reel manual, dan gambar promosi.</p>
            </Link>
          </div>

          <div className="mt-5">
            <CompactFilterBar
              categories={["Semua asset", "Banner", "Product Image", "Video", "Resep"]}
              sorts={["Terbaru", "Published", "Draft", "Scheduled"]}
            />
          </div>

          <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2">
            {library.map((asset, index) => {
              const Icon = typeIcon[asset.type as keyof typeof typeIcon] ?? ImageIcon;
              return (
                <div key={`${asset.name}-${index}`} className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className={`grid aspect-video place-items-center overflow-hidden rounded-2xl ${asset.tone}`}>
                    {asset.mediaUrl && isVideoMedia(asset.mediaUrl, asset.mimeType) ? (
                      <video src={asset.mediaUrl} muted playsInline controls preload="metadata" className="h-full w-full object-cover" />
                    ) : asset.mediaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={asset.mediaUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Icon className={`h-9 w-9 ${asset.type === "video" || asset.type === "product-video" ? "text-white" : "text-emerald-700"}`} />
                    )}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-slate-950">{asset.name}</p>
                      <p className="mt-1 break-words text-sm text-slate-500">{asset.type} | {asset.placement}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">{asset.status}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href={asset.type === "banner" ? `/admin/assets/banners?asset=${encodeURIComponent(asset.slug || asset.id)}` : `/admin/assets/content?asset=${encodeURIComponent(asset.slug || asset.id)}`} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-slate-700">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Link>
                    <Link href={asset.type === "banner" ? "/storefront" : asset.type === "recipe" ? "/storefront/recipes" : "/storefront/live"} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-slate-950 text-sm font-semibold text-white">
                      <Play className="h-4 w-4" />
                      Preview
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="min-w-0 space-y-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Publishing menu</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">Pilih jenis asset</p>
            <div className="mt-4 grid gap-3">
              <Link href="/admin/assets/banners" className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-left transition hover:bg-emerald-100">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-emerald-700">
                  <LayoutPanelTop className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold text-slate-950">Banner carousel</span>
                  <span className="block text-sm text-slate-600">Homepage/frontstore saja</span>
                </span>
              </Link>
              <Link href="/admin/assets/content" className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-left transition hover:bg-white hover:shadow-sm">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-emerald-700">
                  <BookOpen className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold text-slate-950">Konten umum</span>
                  <span className="block text-sm text-slate-600">Resep, reel, gambar promosi</span>
                </span>
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <p className="font-semibold">Asset rule</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>Resep yang dipublish muncul di halaman Resep dan ikut masuk feed Live/Reel.</p>
              <p>Banner carousel hanya muncul di slot carousel beranda/frontstore.</p>
              <p>Library konten ini khusus konten manual admin: resep, live video, gambar promosi, dan banner.</p>
              <p>Video detail produk otomatis masuk Reels jika file/URL video valid, tetapi dikelola dari halaman Media produk.</p>
              <p>Konten bisa dihubungkan ke produk agar CTA langsung menuju PDP atau cart.</p>
            </div>
          </div>
        </aside>
      </section>
    </PrototypeShell>
  );
}
