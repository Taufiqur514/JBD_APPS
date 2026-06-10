"use client";

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export function CategoryForm({
  category,
}: {
  category?: { id: string; name: string; slug: string; productCount: number };
}) {
  const editing = Boolean(category);
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/admin/products/categories" className="inline-flex h-10 w-fit items-center gap-2 rounded-full bg-slate-100 px-4 text-sm font-semibold text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Daftar kategori
        </Link>
        {editing ? (
          <span className="rounded-full bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-600">
            {category?.productCount ?? 0} produk memakai kategori ini
          </span>
        ) : null}
      </div>

      <form action="/api/admin/categories" method="post" className="mt-6 grid gap-5">
        <input type="hidden" name="action" value="save" />
        <input type="hidden" name="categoryId" value={category?.id ?? ""} />
        <input type="hidden" name="back" value="/admin/products/categories" />
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Nama kategori</span>
          <input
            name="name"
            defaultValue={category?.name ?? ""}
            placeholder="Contoh: Chocolate Premium"
            required
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none focus:border-emerald-300"
          />
        </label>
        {editing ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Slug saat ini: <span className="font-semibold text-slate-900">{category?.slug}</span>. Slug akan disesuaikan otomatis ketika nama kategori disimpan.
          </div>
        ) : (
          <div className="rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
            Kategori baru akan langsung tersedia di dropdown produk, filter storefront, dan halaman resep.
          </div>
        )}
        <button type="submit" className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white">
          <Save className="h-4 w-4" />
          Simpan kategori
        </button>
      </form>
    </section>
  );
}
