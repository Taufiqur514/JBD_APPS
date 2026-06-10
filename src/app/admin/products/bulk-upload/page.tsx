import Link from "next/link";
import { Download, FileSpreadsheet, UploadCloud } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";

export const dynamic = "force-dynamic";

export default async function BulkUploadProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string; failed?: string }>;
}) {
  const params = await searchParams;
  const imported = Number(params.imported ?? 0);
  const failed = Number(params.failed ?? 0);
  const hasResult = Boolean(params.imported || params.failed);

  return (
    <PrototypeShell compact eyebrow="Admin Commerce" title="Bulk Upload Produk" description="">
      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-950">Unggah dan impor file</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Import produk akan membaca daftar SKU dari Excel lalu membuat produk, kategori, varian, stok awal,
                gambar URL, dan video URL secara massal.
              </p>
            </div>
          </div>

          {hasResult ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-semibold">Import selesai</p>
              <p className="mt-1">
                {imported} produk berhasil diproses{failed ? `, ${failed} baris perlu diperiksa ulang.` : "."}
              </p>
            </div>
          ) : null}

          <div className="mt-7 grid gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Persiapan file</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                <li>1. Gunakan file Microsoft Excel dengan format .xlsx atau .xls.</li>
                <li>2. Baris pertama adalah judul kolom dan tidak ikut diimpor.</li>
                <li>3. Kolom nama_produk, kategori, harga, dan stok_total wajib diisi.</li>
                <li>4. Kategori baru otomatis dibuat jika belum ada di katalog.</li>
                <li>5. Varian 500g, 1kg, bundle, dan stok tiap varian bisa diisi di kolom varian.</li>
                <li>6. Gambar/video massal memakai URL publik agar cocok untuk import cepat produksi.</li>
              </ul>
            </div>

            <Link
              href="/api/admin/products/bulk/template"
              className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm"
            >
              <Download className="h-4 w-4" />
              Download template Excel
            </Link>
          </div>
        </div>

        <form
          action="/api/admin/products/bulk"
          method="post"
          encType="multipart/form-data"
          className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-7"
        >
          <div className="grid gap-4">
            <div className="grid min-h-48 place-items-center rounded-[24px] border border-dashed border-emerald-300 bg-emerald-50 p-6 text-center">
              <div>
                <UploadCloud className="mx-auto h-10 w-10 text-emerald-700" />
                <p className="mt-3 text-lg font-semibold text-slate-950">Pilih file Excel produk</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Sistem akan memvalidasi kolom wajib, membuat kategori, lalu menyimpan produk ke database.
                </p>
                <input
                  required
                  name="file"
                  type="file"
                  accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="mt-5 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white shadow-sm"
            >
              <UploadCloud className="h-4 w-4" />
              Unggah & import produk
            </button>
            <Link
              href="/admin/products"
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
            >
              Kembali ke katalog
            </Link>
          </div>
        </form>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Kolom utama template</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Produk", "sku, nama_produk, kategori, deskripsi, status"],
            ["Harga & stok", "harga, stok_total, rating_opsional, terjual_opsional"],
            ["Varian", "variant_1_nama, variant_1_harga, variant_1_stok sampai variant_5"],
            ["Media", "image_1_url sampai image_10_url, video_1_url sampai video_3_url"],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">{title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </PrototypeShell>
  );
}
