import Link from "next/link";
import { Edit3, FileSpreadsheet, PackagePlus, Tags } from "lucide-react";
import { CompactFilterBar } from "@/components/compact-filter-bar";
import { ProductMediaTile } from "@/components/product-media-tile";
import { PrototypeShell } from "@/components/prototype-shell";
import { getInventory, getProductCategories, getProducts } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const category = params.category;
  const sort = params.sort;
  const filter = params.filter;
  let products = await getProducts();
  const inventory = await getInventory();
  const categoryNames = await getProductCategories();
  if (category && category !== "Semua kategori") {
    products = products.filter((product) => product.category === category);
  }
  if (filter === "Ready stock") products = products.filter((product) => product.stock > 0);
  if (filter === "Low stock") products = products.filter((product) => product.stock < 50);
  if (filter === "Published") products = products.filter((product) => product.active !== false);
  if (sort === "Harga termurah") products = products.sort((a, b) => a.numericPrice - b.numericPrice);
  if (sort === "Stok terendah") products = products.sort((a, b) => a.stock - b.stock);
  if (sort === "Best seller") products = products.sort((a, b) => Number(b.sold) - Number(a.sold));
  if (sort === "Terbaru") products = products.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));

  return (
    <PrototypeShell compact eyebrow="Admin Commerce" title="Product Catalog" description="">
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <CompactFilterBar
          categories={["Semua kategori", ...categoryNames]}
          sorts={["Terbaru", "Best seller", "Stok terendah", "Harga termurah"]}
          filters={["Published", "Ready stock", "Low stock"]}
          currentParams={{ category, sort, filter }}
          targetId="admin-product-list"
        />
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/products/categories"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm"
          >
            <Tags className="h-4 w-4" />
            Kategori
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm"
          >
            <PackagePlus className="h-4 w-4" />
            Tambah produk
          </Link>
          <Link
            href="/admin/products/bulk-upload"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Bulk upload
          </Link>
        </div>
      </div>

      <section id="admin-product-list" className="scroll-mt-36">
        <div className="mb-3 flex flex-wrap gap-2 text-xs text-slate-500">
          {category && category !== "Semua kategori" ? <span className="rounded-full bg-white px-3 py-1 shadow-sm">Kategori: {category}</span> : null}
          {sort ? <span className="rounded-full bg-white px-3 py-1 shadow-sm">Sort: {sort}</span> : null}
          {filter ? <span className="rounded-full bg-white px-3 py-1 shadow-sm">Filter: {filter}</span> : null}
        </div>
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.8fr_auto] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-500 md:grid">
            <p>Produk</p>
            <p>Kategori</p>
            <p>Harga</p>
            <p>Stok</p>
            <p>Status</p>
            <p />
          </div>
          {products.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-lg font-semibold text-slate-950">Tidak ada produk sesuai filter</p>
              <p className="mt-2 text-sm text-slate-500">Ubah kategori, sort, atau filter untuk melihat SKU lain.</p>
            </div>
          ) : null}
          {products.map((product) => {
            const stock = Number(inventory.find((item) => item.productSlug === product.slug)?.stock ?? product.stock);
            return (
            <Link
              key={product.slug}
              href={`/admin/products/${product.slug}`}
              className="grid gap-3 border-b border-slate-100 px-4 py-4 text-sm last:border-b-0 hover:bg-slate-50 md:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.8fr_auto] md:items-center md:gap-4 md:px-5"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-xl">
                  <ProductMediaTile coverUrl={product.coverUrl} tone={product.imageTone} name={product.name} compact />
                </div>
                <div>
                  <p className="font-semibold text-slate-950">{product.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{product.taste}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs md:contents md:text-sm">
                <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-600 md:bg-transparent md:p-0">{product.category}</p>
                <p className="rounded-xl bg-slate-50 px-3 py-2 font-medium text-slate-950 md:bg-transparent md:p-0">{product.price}</p>
                <p className={`rounded-xl bg-slate-50 px-3 py-2 md:bg-transparent md:p-0 ${stock < 50 ? "font-medium text-rose-600" : "text-slate-600"}`}>
                  Stok {stock}
                </p>
                <p>
                  <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    Published
                  </span>
                </p>
              </div>
              <Edit3 className="hidden h-4 w-4 text-slate-400 md:block" />
            </Link>
          )})}
        </div>
      </section>
    </PrototypeShell>
  );
}
