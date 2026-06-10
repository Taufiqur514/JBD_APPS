import Link from "next/link";
import { ArrowLeft, Edit3, PackagePlus, Plus, Trash2 } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { getProductCategoryRows } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export default async function AdminProductCategoriesPage() {
  const categories = await getProductCategoryRows();

  return (
    <PrototypeShell compact eyebrow="Admin Commerce" title="Kategori Produk" description="">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/admin/products" className="inline-flex h-10 w-fit items-center gap-2 rounded-full bg-slate-100 px-4 text-sm font-semibold text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Product Catalog
        </Link>
        <Link href="/admin/products/categories/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm">
          <Plus className="h-4 w-4" />
          Tambah kategori
        </Link>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Category Master</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">Daftar kategori storefront</h2>
          </div>
          <p className="text-sm text-slate-500">Edit kategori dibuka lewat halaman form agar tidak berubah tanpa sengaja.</p>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <div className="grid grid-cols-[1fr_120px_180px] gap-4 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
            <p>Kategori</p>
            <p>Produk</p>
            <p className="text-right">Aksi</p>
          </div>
          {categories.map((category) => (
            <div key={category.id} className="grid grid-cols-[1fr_120px_180px] items-center gap-4 border-t border-slate-100 px-4 py-4 text-sm">
              <div>
                <p className="font-semibold text-slate-950">{category.name}</p>
                <p className="mt-1 text-xs text-slate-500">Slug: {category.slug}</p>
              </div>
              <p className="text-slate-600">{category.productCount} produk</p>
              <div className="flex justify-end gap-2">
                <Link
                  href={`/admin/products/categories/${category.id}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Link>
                <form action="/api/admin/categories" method="post">
                  <input type="hidden" name="action" value="delete" />
                  <input type="hidden" name="categoryId" value={category.id} />
                  <input type="hidden" name="back" value="/admin/products/categories" />
                  <button
                    type="submit"
                    disabled={category.productCount > 0}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
                    title={category.productCount > 0 ? "Kategori masih digunakan produk" : "Hapus kategori"}
                  >
                    <Trash2 className="h-4 w-4" />
                    Hapus
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <CategoryNote title="Aman dari salah edit" text="Daftar kategori tidak punya input inline. Admin harus masuk form tambah/edit untuk mengubah data." />
        <CategoryNote title="Terhubung ke produk" text="Kategori yang masih dipakai produk tidak bisa dihapus agar katalog tidak kehilangan referensi." />
        <CategoryNote title="Live ke storefront" text="Nama kategori tersimpan langsung dipakai filter, beranda, resep, dan form produk." />
      </section>
    </PrototypeShell>
  );
}

function CategoryNote({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <PackagePlus className="h-5 w-5 text-emerald-700" />
      <p className="mt-3 font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
