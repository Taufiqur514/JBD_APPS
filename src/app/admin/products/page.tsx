import Link from "next/link";
import { Edit3, PackagePlus, Search, SlidersHorizontal } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { featuredProducts, productCategories } from "@/lib/prototype-data";

export default function AdminProductsPage() {
  return (
    <PrototypeShell compact eyebrow="Admin Commerce" title="Product Catalog" description="">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-h-11 flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-500 shadow-sm">
          <Search className="h-4 w-4" />
          Cari SKU, nama produk, rasa, kategori
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
          <Link
            href="/admin/products/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm"
          >
            <PackagePlus className="h-4 w-4" />
            Tambah produk
          </Link>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-slate-950">Kategori</p>
          <div className="mt-4 space-y-2">
            {productCategories.map((category, index) => (
              <button
                key={category}
                type="button"
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm ${
                  index === 0 ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700"
                }`}
              >
                {category}
                <span className="text-xs opacity-70">{index + 3}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.8fr_auto] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-500">
            <p>Produk</p>
            <p>Kategori</p>
            <p>Harga</p>
            <p>Stok</p>
            <p>Status</p>
            <p />
          </div>
          {featuredProducts.map((product) => (
            <Link
              key={product.slug}
              href={`/admin/products/${product.slug}`}
              className="grid grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.8fr_auto] items-center gap-4 border-b border-slate-100 px-5 py-4 text-sm last:border-b-0 hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-xl ${product.imageTone}`} />
                <div>
                  <p className="font-semibold text-slate-950">{product.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{product.taste}</p>
                </div>
              </div>
              <p className="text-slate-600">{product.category}</p>
              <p className="font-medium text-slate-950">{product.price}</p>
              <p className={product.stock < 50 ? "font-medium text-rose-600" : "text-slate-600"}>
                {product.stock}
              </p>
              <p>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  Published
                </span>
              </p>
              <Edit3 className="h-4 w-4 text-slate-400" />
            </Link>
          ))}
        </div>
      </section>
    </PrototypeShell>
  );
}
