"use client";

import { useEffect, useState } from "react";
import { BookOpen, ImagePlus, Plus, Video } from "lucide-react";

type Preview = {
  name: string;
  url: string;
  mediaType: "image" | "video";
};

const contentTypes = [
  { value: "recipe", label: "Resep", helper: "Muncul di halaman Resep dan Live/Reel." },
  { value: "banner", label: "Banner carousel", helper: "Muncul di carousel beranda dan Live/Reel." },
  { value: "video", label: "Live video", helper: "Muncul full screen di Live/Reel." },
  { value: "product-video", label: "Video produk", helper: "Terhubung ke PDP dan Live/Reel." },
  { value: "image", label: "Gambar promosi", helper: "Konten visual untuk campaign." },
];

function mediaTypeFromFile(file: File): Preview["mediaType"] {
  return file.type.startsWith("video/") ? "video" : "image";
}

export function AdminContentPublisher({
  products,
}: {
  products: { slug: string; name: string }[];
}) {
  const [type, setType] = useState("recipe");
  const [preview, setPreview] = useState<Preview | null>(null);
  const activeType = contentTypes.find((item) => item.value === type) ?? contentTypes[0];

  useEffect(() => {
    return () => {
      if (preview?.url.startsWith("blob:")) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  function updatePreview(file?: File) {
    if (preview?.url.startsWith("blob:")) URL.revokeObjectURL(preview.url);
    if (!file) {
      setPreview(null);
      return;
    }
    setPreview({
      name: file.name,
      url: URL.createObjectURL(file),
      mediaType: mediaTypeFromFile(file),
    });
  }

  return (
    <form id="publish-content" action="/api/admin/assets" method="post" encType="multipart/form-data" className="min-w-0 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="font-semibold text-slate-950">Publish konten baru</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">Satu uploader untuk resep, banner, image, video produk, dan Live/Reel.</p>

      <div className="mt-4 grid gap-3">
        <div className="grid grid-cols-2 gap-2">
          {contentTypes.map((item) => (
            <label key={item.value} className="cursor-pointer">
              <input
                className="peer sr-only"
                type="radio"
                name="type"
                value={item.value}
                checked={type === item.value}
                onChange={() => setType(item.value)}
              />
              <span className="flex min-h-12 items-center justify-center rounded-2xl bg-slate-50 px-3 text-center text-xs font-semibold text-slate-700 peer-checked:bg-slate-950 peer-checked:text-white">
                {item.label}
              </span>
            </label>
          ))}
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
          <div className="flex items-start gap-3">
            {type === "recipe" ? <BookOpen className="mt-0.5 h-5 w-5 shrink-0" /> : <Video className="mt-0.5 h-5 w-5 shrink-0" />}
            <div>
              <p className="font-semibold">{activeType.label}</p>
              <p>{activeType.helper}</p>
            </div>
          </div>
        </div>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Judul
          <input name="title" defaultValue="Resep Chocolate Frappe Baru" className="h-11 min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Keyword
          <input name="keyword" defaultValue="chocolate frappe cafe" className="h-11 min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Caption / deskripsi
          <textarea name="caption" rows={4} defaultValue="Inspirasi menu minuman menggunakan powder JBD." className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Produk terkait
          <select name="productSlug" className="h-11 min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm">
            {products.map((product) => (
              <option key={product.slug} value={product.slug}>{product.name}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Placement
          <select name="placement" className="h-11 min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm">
            <option>Resep + Live/Reel</option>
            <option>Homepage carousel</option>
            <option>Product detail</option>
            <option>Voucher campaign</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Status publikasi
          <select name="status" defaultValue="published" className="h-11 min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </label>

        {type === "recipe" ? (
          <div className="grid gap-3 rounded-3xl border border-amber-100 bg-amber-50 p-4">
            <div className="grid gap-3 md:grid-cols-[120px_1fr]">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Durasi
                <input name="preparationMinutes" type="number" min={1} max={120} defaultValue={3} className="h-11 min-w-0 rounded-2xl border border-slate-200 bg-white px-4 text-sm" />
              </label>
              <p className="self-end text-sm leading-6 text-amber-800">
                Isi bahan dan langkah satu item per baris agar halaman Resep siap dipakai untuk demo maupun produksi awal.
              </p>
            </div>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Bahan resep
              <textarea name="ingredients" rows={4} defaultValue={"30g JBD Chocolate Premium\n150ml susu cair\nEs batu secukupnya\nWhipped cream optional"} className="min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Langkah pembuatan
              <textarea name="steps" rows={4} defaultValue={"Masukkan powder, susu, dan es ke blender\nBlend 20-30 detik sampai halus\nTuang ke cup dan tambahkan topping\nSajikan dingin"} className="min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6" />
            </label>
          </div>
        ) : null}

        <label className="grid cursor-pointer gap-3 rounded-3xl border border-dashed border-emerald-300 bg-emerald-50 p-5 text-center text-emerald-800 transition hover:bg-emerald-100">
          <ImagePlus className="mx-auto h-8 w-8" />
          <span className="font-semibold">Upload image / video</span>
          <span className="text-sm">JPG, PNG, WebP, AVIF, MP4, WebM, atau MOV. Maksimal 100 MB.</span>
          <span className="mx-auto inline-flex h-11 items-center justify-center rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white">
            Pilih media
          </span>
          <input
            name="media"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
            className="sr-only"
            data-content-media-input
            onChange={(event) => updatePreview(event.currentTarget.files?.[0])}
          />
        </label>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50" data-content-media-preview>
          <div className="grid aspect-video place-items-center bg-slate-950 text-white">
            {preview?.mediaType === "video" ? (
              <video src={preview.url} controls playsInline preload="metadata" className="h-full w-full object-contain" />
            ) : preview?.mediaType === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.url} alt={preview.name} className="h-full w-full object-cover" />
            ) : (
              <div className="text-center">
                <ImagePlus className="mx-auto h-9 w-9 text-white/55" />
                <p className="mt-3 text-sm text-white/70">Preview media tampil di sini</p>
              </div>
            )}
          </div>
          <div className="p-4 text-sm text-slate-600">
            {preview ? (
              <p className="font-medium text-slate-900">{preview.name}</p>
            ) : (
              <p>Konten yang dipublish akan langsung masuk library dan surface terkait.</p>
            )}
          </div>
        </div>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Atau URL media
          <input name="mediaUrl" type="url" placeholder="https://..." className="h-11 min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm" />
        </label>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(() => {
  if (window.__jbdContentMediaPreviewVersion === "v1") return;
  window.__jbdContentMediaPreviewVersion = "v1";
  document.addEventListener("change", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.matches("[data-content-media-input]")) return;
    const file = input.files && input.files[0];
    const preview = document.querySelector("[data-content-media-preview]");
    if (!file || !preview) return;
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith("video/");
    preview.innerHTML = '<div class="grid aspect-video place-items-center bg-slate-950 text-white"></div><div class="p-4 text-sm text-slate-600"><p class="font-medium text-slate-900"></p></div>';
    const stage = preview.querySelector("div");
    const name = preview.querySelector("p");
    if (name) name.textContent = file.name;
    if (!stage) return;
    if (isVideo) {
      const video = document.createElement("video");
      video.src = url;
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.className = "h-full w-full object-contain";
      stage.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = url;
      img.alt = file.name;
      img.className = "h-full w-full object-cover";
      stage.appendChild(img);
    }
  });
})();
            `,
          }}
        />
      </div>
      <button type="submit" className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-700 text-sm font-semibold text-white">
        <Plus className="h-4 w-4" />
        Publish
      </button>
    </form>
  );
}
