import { Camera, Star, Upload } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return (
    <PrototypeShell compact eyebrow="Review" title="Beri Rating Produk" description="">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <form action="/api/reviews" method="post" encType="multipart/form-data">
            <input type="hidden" name="orderId" value={order ?? "review-demo"} />
            <input type="hidden" name="productSlug" value="chocolate-premium-500g" />
            <p className="font-semibold text-slate-950">JBD Chocolate Premium 500g</p>
            <div className="mt-4 flex flex-wrap gap-2 text-amber-500">
              {[1, 2, 3, 4, 5].map((item) => (
                <label key={item} className="cursor-pointer">
                  <input className="peer sr-only" type="radio" name="rating" value={item} defaultChecked={item === 5} />
                  <Star className="h-8 w-8 fill-amber-500 peer-checked:scale-110" />
                </label>
              ))}
            </div>
            <textarea
              name="text"
              defaultValue="Rasa cokelatnya pekat, mudah larut, dan cocok untuk menu iced chocolate di cafe."
              rows={6}
              className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none"
            />
            <label className="mt-5 inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700">
              <input name="photo" type="file" accept="image/*" className="sr-only" />
              <Upload className="h-4 w-4" />
              Upload foto
            </label>
            <button type="submit" className="ml-3 inline-flex h-11 items-center rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white">
              Kirim review
            </button>
          </form>
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
