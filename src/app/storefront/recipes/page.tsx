import Link from "next/link";
import { BookOpen, Clock3, Search, Sparkles, Star } from "lucide-react";
import { CompactFilterBar } from "@/components/compact-filter-bar";
import { PrototypeShell } from "@/components/prototype-shell";
import { productCategories } from "@/lib/prototype-data";
import { getRecipes } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export default async function StorefrontRecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const query = String(params.q ?? "").toLowerCase();
  const recipes = (await getRecipes()).filter((recipe) =>
    query ? [recipe.title, recipe.keyword, recipe.product].join(" ").toLowerCase().includes(query) : true,
  );

  return (
    <PrototypeShell compact eyebrow="Resep" title="Ide Menu Minuman" description="">
      <section className="grid min-w-0 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <CompactFilterBar
            categories={["Semua resep", ...productCategories]}
            sorts={["Paling populer", "Terbaru", "Paling cepat"]}
            currentParams={params}
          />

          <div className="mt-5 grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recipes.map((recipe) => (
              <Link
                key={`${recipe.title}-${recipe.productSlug}`}
                href={`/storefront/products/${recipe.productSlug}`}
                className="grid min-w-0 grid-cols-[96px_1fr] gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-300 hover:bg-white sm:grid-cols-1 md:p-4"
              >
                <div className={`grid aspect-square place-items-center rounded-2xl sm:aspect-[4/3] ${recipe.tone ?? "bg-amber-200"}`}>
                  <BookOpen className="h-7 w-7 text-slate-700" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950 md:text-base">{recipe.title}</p>
                  <p className="mt-1 truncate text-xs text-slate-500 md:text-sm">{recipe.product ?? recipe.keyword}</p>
                  <div className="mt-3 flex min-w-0 flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs text-slate-600">
                      <Clock3 className="h-3 w-3" />
                      {recipe.time ?? "3 menit"}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700">{recipe.margin ?? "Cafe-ready"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-emerald-700" />
              <p className="font-semibold text-slate-950">Pencarian populer</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["iced chocolate", "matcha latte", "menu booth", "frappe", "menu ekonomis"].map((item) => (
                <Link key={item} href={`/storefront/recipes?q=${encodeURIComponent(item)}`} className="rounded-full bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                  {item}
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <Sparkles className="h-5 w-5 text-emerald-300" />
            <p className="mt-4 font-semibold">AI recipe assistant</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Draft resep bisa dipublish dari Admin Assets dan langsung muncul di Resep serta Live/Reel.
            </p>
            <Link href="/admin/assets" className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-slate-950">
              <Star className="h-4 w-4 text-amber-500" />
              Publish dari Admin
            </Link>
          </div>
        </aside>
      </section>
    </PrototypeShell>
  );
}
