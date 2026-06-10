import Link from "next/link";
import { ArrowLeft, BookOpen, Video } from "lucide-react";
import { AdminContentPublisher } from "@/components/admin-content-publisher";
import { PrototypeShell } from "@/components/prototype-shell";
import { getProducts } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export default async function AdminContentAssetsPage() {
  const products = await getProducts();

  return (
    <PrototypeShell compact eyebrow="Admin Assets" title="Konten Promosi, Resep, dan Reel" description="">
      <Link href="/admin/assets" className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-100 px-4 text-sm font-semibold text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Asset library
      </Link>

      <section className="mt-5 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-w-0 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white">
            <Video className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-slate-950">Publish konten umum</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Gunakan halaman ini untuk konten manual admin: resep, Live/Reel, dan gambar promosi. Video yang diupload dari detail produk tetap dikelola di Media produk dan otomatis masuk Reels jika formatnya valid.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {["Resep minuman", "Live/Reel manual", "Gambar promosi"].map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-800">
                <BookOpen className="mb-3 h-5 w-5 text-emerald-700" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <AdminContentPublisher
          mode="content"
          products={products.map((product) => ({ slug: product.slug, name: product.name }))}
        />
      </section>
    </PrototypeShell>
  );
}
