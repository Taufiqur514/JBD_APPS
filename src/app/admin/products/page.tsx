import Link from "next/link";
import { Edit3, PackagePlus } from "lucide-react";
import { CompactFilterBar } from "@/components/compact-filter-bar";
import { PrototypeShell } from "@/components/prototype-shell";
import { productCategories } from "@/lib/prototype-data";
import { getInventory, getProducts } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getProducts();
  const inventory = await getInventory();

  return (
    <PrototypeShell compact eyebrow="Admin Commerce" title="Product Catalog" description="">
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <CompactFilterBar
          categories={productCategories}
          sorts={["Terbaru", "Best seller", "Stok terendah", "Harga termurah"]}
        />
        <Link
          href="/admin/products/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm"
        >
          <PackagePlus className="h-4 w-4" />
          Tambah produk
        </Link>
      </div>

      <section>
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.8fr_auto] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-500">
            <p>Produk</p>
            <p>Kategori</p>
            <p>Harga</p>
            <p>Stok</p>
            <p>Status</p>
            <p />
          </div>
          {products.map((product) => {
            const stock = Number(inventory.find((item) => item.productSlug === product.slug)?.stock ?? product.stock);
            return (
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
              <p className={stock < 50 ? "font-medium text-rose-600" : "text-slate-600"}>
                {stock}
              </p>
              <p>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  Published
                </span>
              </p>
              <Edit3 className="h-4 w-4 text-slate-400" />
            </Link>
          )})}
        </div>
      </section>
    </PrototypeShell>
  );
}
