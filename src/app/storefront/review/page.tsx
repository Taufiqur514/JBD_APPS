import Link from "next/link";
import { Camera, Star, Upload } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";

export default function ReviewPage() {
  return (
    <PrototypeShell compact eyebrow="Review" title="Beri Rating Produk" description="">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-slate-950">JBD Chocolate Premium 500g</p>
          <div className="mt-4 flex gap-2 text-amber-500">
            {[1, 2, 3, 4, 5].map((item) => (
              <Star key={item} className="h-8 w-8 fill-amber-500" />
            ))}
          </div>
          <textarea
            defaultValue="Rasa cokelatnya pekat, mudah larut, dan cocok untuk menu iced chocolate di cafe."
            rows={6}
            className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none"
          />
          <button type="button" className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700">
            <Upload className="h-4 w-4" />
            Upload foto
          </button>
          <Link href="/storefront/loyalty" className="ml-3 inline-flex h-11 items-center rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white">
            Kirim review
          </Link>
        </div>
        <aside className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
          <Camera className="h-8 w-8 text-emerald-300" />
          <p className="mt-4 text-xl font-semibold">Social proof</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">Review dan foto customer akan memperkuat PDP dan memberi input untuk Content Agent.</p>
        </aside>
      </section>
    </PrototypeShell>
  );
}
