"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Check,
  ImagePlus,
  PackagePlus,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { adminGeneratedDescription, featuredProducts } from "@/lib/prototype-data";

type ProductLike = (typeof featuredProducts)[number] & {
  images?: { url: string; alt?: string; mediaType?: "image" | "video"; isCover?: boolean; sortOrder?: number }[];
  coverUrl?: string;
  variantDetails?: Array<{ name: string; price: number; sku?: string; weightGrams?: number; stock?: number; active?: boolean }>;
};

type SelectedPreview = {
  id: string;
  name: string;
  url: string;
  kind: "existing" | "new";
  file?: File;
  existingUrl?: string;
  objectUrl?: boolean;
  size?: number;
  fingerprint?: string;
};

type VariantDraft = {
  id: string;
  name: string;
  price: string;
  weight: string;
  stock: string;
};

const productTabConfig = [
  { label: "Basic Info", key: "basic-info" },
  { label: "Media", key: "media" },
  { label: "Pricing", key: "pricing" },
  { label: "Inventory", key: "inventory" },
  { label: "SEO & AI", key: "seo-ai" },
] as const;

type ProductTabKey = (typeof productTabConfig)[number]["key"];

function normalizeTab(value?: string): ProductTabKey {
  return productTabConfig.some((tab) => tab.key === value) ? (value as ProductTabKey) : "basic-info";
}

export function AdminProductForm({
  mode,
  slug,
  activeTab,
  initialProduct,
  categoryOptions,
}: {
  mode: "create" | "edit";
  slug?: string;
  activeTab?: string;
  initialProduct?: ProductLike;
  categoryOptions?: string[];
}) {
  const product = (initialProduct ?? featuredProducts.find((item) => item.slug === slug) ?? featuredProducts[0]) as ProductLike;
  const router = useRouter();
  const currentTab = normalizeTab(activeTab);
  const categories = categoryOptions?.length ? categoryOptions : ["Chocolate", "Thai Tea", "Matcha", "Taro", "Red Velvet", "Coffee Base"];
  const baseHref = mode === "edit" && slug ? `/admin/products/${slug}` : "/admin/products/new";
  const [generated, setGenerated] = useState(mode === "edit");
  const [productName, setProductName] = useState(
    mode === "edit" ? product.name : "JBD Chocolate Premium 500g",
  );
  const [description, setDescription] = useState(
    mode === "edit" ? product.description : "",
  );
  const [serving, setServing] = useState(
    mode === "edit" ? product.serving : "30g powder + 150ml milk/water. Shake or blend with ice.",
  );
  const [price, setPrice] = useState(String(product.numericPrice ?? 89000));
  const [promoPrice, setPromoPrice] = useState("");
  const [stock, setStock] = useState(mode === "edit" ? String(product.stock) : "120");
  const [safetyStock, setSafetyStock] = useState("40");
  const [warehouse] = useState("Bekasi");
  const [seoKeywords, setSeoKeywords] = useState(`${product.category}, powder drink, bahan baku minuman`);
  const [variants, setVariants] = useState<VariantDraft[]>(() => {
    const variantDetails = product.variantDetails ?? product.variants.map((variantName) => ({
      name: variantName,
      price: product.numericPrice,
      weightGrams: Number(String(variantName).match(/\d+/)?.[0] ?? 0) * (String(variantName).toLowerCase().includes("kg") ? 1000 : 1),
    }));
    const draftVariants: Array<{ name: string; price: number; weightGrams?: number; stock?: number }> = variantDetails.length ? variantDetails : [
      { name: "500g", price: product.numericPrice ?? 89000, weightGrams: 500, stock: Math.ceil(Number(product.stock ?? 0) / 2) },
      { name: "1kg", price: (product.numericPrice ?? 89000) * 2, weightGrams: 1000, stock: Math.floor(Number(product.stock ?? 0) / 2) },
    ];
    const stockShare = Math.max(0, Math.floor(Number(product.stock ?? 0) / Math.max(1, draftVariants.length)));
    return draftVariants.map((variant, index) => ({
      id: `${variant.name}-${index}`,
      name: variant.name,
      price: String(variant.price ?? product.numericPrice ?? 89000),
      weight: variant.weightGrams ? String(variant.weightGrams) : "",
      stock: String(variant.stock ?? stockShare),
    }));
  });
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaObjectUrlsRef = useRef<string[]>([]);
  const videoObjectUrlsRef = useRef<string[]>([]);
  const mediaImagesRef = useRef<SelectedPreview[]>([]);
  const mediaFingerprintsRef = useRef<Set<string>>(new Set());
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [mediaStatus, setMediaStatus] = useState("");
  const mediaReady = currentTab === "media";
  const [mediaAutosaveRequest, setMediaAutosaveRequest] = useState(0);
  const [mediaSaving, setMediaSaving] = useState(false);
  const [selectedImageNames, setSelectedImageNames] = useState<string[]>([]);
  const [selectedVideoNames, setSelectedVideoNames] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<SelectedPreview[]>([]);
  const existingImages = product.images ?? (product.coverUrl ? [{ url: product.coverUrl, alt: product.name }] : []);
  const existingProductImages = existingImages.filter((item) => item.mediaType !== "video");
  const existingProductVideos = existingImages.filter((item) => item.mediaType === "video");
  const [mediaImages, setMediaImages] = useState<SelectedPreview[]>(() => (
    existingProductImages
      .slice()
      .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
      .slice(0, 10)
      .map((item, index) => ({
        id: `existing-${index}-${item.url}`,
        name: item.alt ?? product.name,
        url: item.url,
        kind: "existing",
        existingUrl: item.url,
      }))
  ));
  const coverPreview = mediaImages[0]?.url;
  const coverPreviewAlt = mediaImages[0]?.name ?? product.name;
  const imageManifest = useMemo(() => JSON.stringify(mediaImages.map((item, index) => ({
    kind: item.kind,
    url: item.existingUrl,
    fileName: item.file?.name,
    fileSize: item.file?.size,
    sortOrder: index,
    isCover: index === 0,
  }))), [mediaImages]);

  useEffect(() => {
    mediaImagesRef.current = mediaImages;
  }, [mediaImages]);

  const syncImageInputFiles = useCallback(() => {
    const dataTransfer = new DataTransfer();
    mediaImages.forEach((item) => {
      if (item.file) dataTransfer.items.add(item.file);
    });
    if (imageInputRef.current) {
      imageInputRef.current.files = dataTransfer.files;
    }
  }, [mediaImages]);

  const autosaveMedia = useCallback(async () => {
    const form = formRef.current;
    if (!form || currentTab !== "media") return false;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    syncImageInputFiles();
    setMediaSaving(true);
    setMediaStatus("Menyimpan media otomatis...");
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        redirect: "follow",
      });
      if (!response.ok) {
        const message = await response.text().catch(() => "");
        throw new Error(message || "Autosave media gagal.");
      }
      setMediaStatus("Media tersimpan otomatis. Aman pindah tab atau buka detail produk.");
      router.refresh();
      return true;
    } catch (error) {
      setMediaStatus(error instanceof Error ? error.message : "Autosave media gagal.");
      return false;
    } finally {
      setMediaSaving(false);
    }
  }, [currentTab, router, syncImageInputFiles]);

  useEffect(() => {
    if (!mediaAutosaveRequest || currentTab !== "media") return;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      void autosaveMedia();
    }, 300);
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [autosaveMedia, currentTab, mediaAutosaveRequest]);

  useEffect(() => {
    return () => {
      mediaObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      videoObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const getFileFingerprint = useCallback((file: File) => (
    `${file.name}:${file.size}:${file.lastModified}:${file.type}`
  ), []);

  const previewImages = useCallback((files: FileList | File[]) => {
    const incomingFiles = Array.from(files);
    if (!incomingFiles.length) {
      setMediaStatus("Belum ada file gambar yang dikirim browser. Klik field Choose File/Pilih File bawaan Windows.");
      return;
    }

    const currentImages = mediaImagesRef.current;
    const existingFingerprints = mediaFingerprintsRef.current;
    const openSlots = Math.max(0, 10 - currentImages.length);
    if (!openSlots) {
      setMediaStatus("Slot gambar sudah penuh. Hapus salah satu gambar jika ingin mengganti.");
      return;
    }

    const acceptedFiles = incomingFiles
      .filter((file) => file.type.startsWith("image/") || /\.(jpe?g|png|webp|avif)$/i.test(file.name))
      .filter((file) => !existingFingerprints.has(getFileFingerprint(file)))
      .slice(0, openSlots);

    if (!acceptedFiles.length) {
      const duplicateImages = incomingFiles.filter((file) => (
        (file.type.startsWith("image/") || /\.(jpe?g|png|webp|avif)$/i.test(file.name))
        && existingFingerprints.has(getFileFingerprint(file))
      ));
      if (duplicateImages.length === incomingFiles.length) return;
      setSelectedImageNames(incomingFiles.map((file) => file.name));
      setMediaStatus("File gambar sudah ada di preview atau formatnya belum didukung. Gunakan JPG, PNG, WebP, atau AVIF.");
      return;
    }
    acceptedFiles.forEach((file) => existingFingerprints.add(getFileFingerprint(file)));

    const previews = acceptedFiles.map((file) => {
      const fingerprint = getFileFingerprint(file);
      const objectUrl = URL.createObjectURL(file);
      mediaObjectUrlsRef.current.push(objectUrl);
      return {
        id: `new-${Date.now()}-${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        url: objectUrl,
        kind: "new" as const,
        file,
        objectUrl: true,
        size: file.size,
        fingerprint,
      };
    });
    const validPreviews = previews.filter((item) => item.url);
    setMediaImages((current) => [...current, ...validPreviews].slice(0, 10));
    setSelectedImageNames(acceptedFiles.map((file) => file.name));
    setMediaStatus(`${validPreviews.length} gambar terdeteksi dan siap dipreview. Geser untuk mengatur urutan cover dan carousel.`);
    setMediaAutosaveRequest((request) => request + 1);
  }, [getFileFingerprint]);

  const previewVideos = useCallback((files: File[]) => {
    const acceptedFiles = files
      .filter((file) => file.type.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(file.name))
      .slice(0, 3);
    if (!acceptedFiles.length) {
      setMediaStatus("Belum ada file video yang dikirim browser. Klik field Choose File/Pilih File bawaan Windows.");
      return;
    }
    videoObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    videoObjectUrlsRef.current = [];
    const previews = acceptedFiles.map((file) => {
      const objectUrl = URL.createObjectURL(file);
      videoObjectUrlsRef.current.push(objectUrl);
      return {
        id: `video-${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        url: objectUrl,
        kind: "new" as const,
        file,
        size: file.size,
        fingerprint: getFileFingerprint(file),
      };
    });
    setSelectedVideos(previews);
    setSelectedVideoNames(acceptedFiles.map((file) => file.name));
    setMediaStatus(`${acceptedFiles.length} video terdeteksi dan siap dipreview. Video akan tampil di Live/Reel setelah disimpan.`);
    setMediaAutosaveRequest((request) => request + 1);
  }, [getFileFingerprint]);

  useEffect(() => {
    const imageInput = imageInputRef.current;
    const videoInput = videoInputRef.current;
    const handleImageChange = () => {
      previewImages(imageInput?.files ?? []);
    };
    const handleVideoChange = () => {
      previewVideos(Array.from(videoInput?.files ?? []));
    };
    imageInput?.addEventListener("change", handleImageChange);
    videoInput?.addEventListener("change", handleVideoChange);
    return () => {
      imageInput?.removeEventListener("change", handleImageChange);
      videoInput?.removeEventListener("change", handleVideoChange);
    };
  }, [currentTab, previewImages, previewVideos]);

  function dropImages(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    previewImages(event.dataTransfer.files);
  }

  function dropVideos(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    previewVideos(Array.from(event.dataTransfer.files).slice(0, 3));
  }

  function removeImage(id: string) {
    setMediaImages((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed?.objectUrl) URL.revokeObjectURL(removed.url);
      if (removed?.fingerprint) mediaFingerprintsRef.current.delete(removed.fingerprint);
      mediaObjectUrlsRef.current = mediaObjectUrlsRef.current.filter((url) => url !== removed?.url);
      return current.filter((item) => item.id !== id);
    });
  }

  function moveImage(fromId: string, toId: string) {
    setMediaImages((current) => {
      const fromIndex = current.findIndex((item) => item.id === fromId);
      const toIndex = current.findIndex((item) => item.id === toId);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return current;
      const next = current.slice();
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  function generateDescription() {
    setProductName(adminGeneratedDescription.title);
    setDescription(adminGeneratedDescription.long);
    setGenerated(true);
  }

  function updateVariant(index: number, field: keyof Omit<VariantDraft, "id">, value: string) {
    setVariants((current) => current.map((variant, variantIndex) => (
      variantIndex === index ? { ...variant, [field]: value } : variant
    )));
  }

  function addVariant() {
    setVariants((current) => [
      ...current,
      {
        id: `variant-${Date.now()}`,
        name: current.length >= 2 ? `Bundle ${current.length + 1}` : "1kg",
        price,
        weight: "",
        stock: "0",
      },
    ]);
  }

  function removeVariant(index: number) {
    setVariants((current) => current.length <= 1 ? current : current.filter((_, variantIndex) => variantIndex !== index));
  }

  return (
    <PrototypeShell
      compact
      eyebrow="Product Management"
      title={mode === "create" ? "Tambah Produk" : "Edit Produk"}
      description=""
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Link
          href="/admin/products"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Katalog
        </Link>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={generateDescription}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700"
          >
            <Sparkles className="h-4 w-4" />
            Generate deskripsi
          </button>
          <button
            type="submit"
            form="admin-product-form"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 text-sm font-semibold text-white"
          >
            <Save className="h-4 w-4" />
            Simpan produk
          </button>
        </div>
      </div>

      <form ref={formRef} id="admin-product-form" action="/api/admin/products" method="post" encType="multipart/form-data" onSubmit={syncImageInputFiles} className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <input type="hidden" name="mode" value={mode} />
        <input type="hidden" name="slug" value={slug ?? ""} />
        <input type="hidden" name="imageManifest" value={imageManifest} />
        {currentTab !== "basic-info" ? (
          <>
            <input type="hidden" name="name" value={productName} />
            <input type="hidden" name="category" value={product.category ?? "Chocolate"} />
            <input type="hidden" name="description" value={description} />
            <input type="hidden" name="serving" value={serving} />
          </>
        ) : null}
        {currentTab !== "pricing" ? <input type="hidden" name="price" value={price} /> : null}
        {currentTab !== "inventory" ? <input type="hidden" name="stock" value={stock} /> : null}
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
            {productTabConfig.map((tab) => {
              const href = `${baseHref}?tab=${tab.key}`;
              const hasUnsavedMedia = mediaImages.some((image) => image.file) || selectedVideos.some((video) => video.file);
              return (
              <Link
                key={tab.key}
                href={href}
                prefetch
                onClick={async (event) => {
                  if (currentTab !== "media" || tab.key === "media" || !hasUnsavedMedia) return;
                  event.preventDefault();
                  const saved = await autosaveMedia();
                  if (saved) router.push(href);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  currentTab === tab.key
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </Link>
            )})}
          </div>

          <div className="mt-5 grid gap-5">
            {currentTab === "basic-info" ? (
              <AdminSection title="Basic Info" description="Identitas SKU utama yang akan muncul di katalog dan halaman produk.">
                <Field name="name" label="Nama produk" value={productName} onChange={setProductName} />
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectField name="category" label="Kategori" value={mode === "edit" ? product.category : categories[0]} options={categories} />
                  <SelectField label="Status" value="Published" options={["Draft", "Published", "Archived"]} />
                </div>
                <TextArea
                  name="description"
                  label="Deskripsi produk"
                  value={description}
                  placeholder="Klik Generate deskripsi atau isi manual deskripsi produk."
                  onChange={setDescription}
                />
                <TextArea
                  name="serving"
                  label="Cara penyajian"
                  value={serving}
                  onChange={setServing}
                />
              </AdminSection>
            ) : null}

            {currentTab === "media" ? (
              <AdminSection title="Media" description="Upload sampai 10 gambar. Gambar pertama menjadi cover, sisanya menjadi carousel di storefront.">
              <div className="grid gap-4" data-admin-media-root>
                <div className="grid gap-3 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600 md:grid-cols-3">
                  <div>
                    <p className="font-semibold text-slate-950">{mediaImages.length} gambar</p>
                    <p className="mt-1">Drag gambar untuk mengatur urutan. Slot 1 otomatis menjadi cover.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">{existingProductVideos.length + selectedVideos.length} video</p>
                    <p className="mt-1">Video tampil di PDP dan Live/Reel.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">Format aman</p>
                    <p className="mt-1">JPG/PNG/WebP/AVIF, MP4/WebM/MOV.</p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={dropImages}
                    className="grid gap-3 rounded-3xl border border-dashed border-emerald-300 bg-emerald-50 p-5 text-center text-emerald-800 transition hover:bg-emerald-100"
                  >
                    <ImagePlus className="mx-auto h-8 w-8" />
                    <span className="font-semibold">Upload gambar produk</span>
                    <span className="text-sm text-emerald-700">Pilih maksimal 10 gambar. Gambar pertama menjadi cover produk.</span>
                    <label htmlFor="jbd-product-image-input" className="text-xs font-semibold text-emerald-800">
                      Pilih file dari komputer
                    </label>
                    <span className="text-xs font-medium text-emerald-700">Atau drag file ke area ini</span>
                    <input
                      id="jbd-product-image-input"
                      name="images"
                      type="file"
                      accept="image/*,.jpg,.jpeg,.png,.webp,.avif"
                      multiple
                      ref={imageInputRef}
                      data-product-image-input
                      data-media-ready={mediaReady ? "true" : "false"}
                      className="w-full cursor-pointer rounded-2xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-900 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-emerald-700 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
                      onInput={(event) => previewImages(event.currentTarget.files ?? [])}
                      onChange={(event) => previewImages(event.currentTarget.files ?? [])}
                    />
                    {selectedImageNames.length ? (
                      <div className="rounded-2xl bg-white/80 px-3 py-2 text-left text-xs leading-5 text-emerald-900">
                        <span className="font-semibold">File terdeteksi:</span> {selectedImageNames.join(", ")}
                      </div>
                    ) : null}
                  </div>
                  <div
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={dropVideos}
                    className="grid gap-3 rounded-3xl border border-dashed border-slate-300 bg-slate-950 p-5 text-center text-white transition hover:bg-slate-900"
                  >
                    <ImagePlus className="mx-auto h-8 w-8 text-emerald-300" />
                    <span className="font-semibold">Upload video produk</span>
                    <span className="text-sm text-slate-300">Maksimal 3 video. Video masuk PDP dan otomatis tampil di Live/Reel.</span>
                    <label htmlFor="jbd-product-video-input" className="text-xs font-semibold text-slate-200">
                      Pilih file video dari komputer
                    </label>
                    <span className="text-xs font-medium text-slate-300">Atau drag video ke area ini</span>
                    <input
                      id="jbd-product-video-input"
                      name="videos"
                      type="file"
                      accept="video/*,.mp4,.webm,.mov"
                      multiple
                      ref={videoInputRef}
                      data-product-video-input
                      data-media-ready={mediaReady ? "true" : "false"}
                      className="w-full cursor-pointer rounded-2xl border border-white/20 bg-white px-3 py-2 text-xs font-semibold text-slate-950 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
                      onInput={(event) => previewVideos(Array.from(event.currentTarget.files ?? []))}
                      onChange={(event) => previewVideos(Array.from(event.currentTarget.files ?? []))}
                    />
                    {selectedVideoNames.length ? (
                      <div className="rounded-2xl bg-white/10 px-3 py-2 text-left text-xs leading-5 text-slate-100">
                        <span className="font-semibold">File terdeteksi:</span> {selectedVideoNames.join(", ")}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div
                  data-product-media-status
                  hidden={!mediaStatus}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
                >
                    {mediaSaving ? "Autosave berjalan... " : null}{mediaStatus}
                </div>
                <div className="grid grid-cols-5 gap-2 md:gap-3" data-product-image-slots>
                  {Array.from({ length: 10 }).map((_, index) => {
                    const image = mediaImages[index];
                    return (
                      <div
                        key={image?.id ?? index}
                        data-product-image-slot={index}
                        draggable={Boolean(image)}
                        onDragStart={() => image ? setDraggedImageId(image.id) : undefined}
                        onDragOver={(event) => image ? event.preventDefault() : undefined}
                        onDrop={(event) => {
                          event.preventDefault();
                          if (draggedImageId && image) moveImage(draggedImageId, image.id);
                          setDraggedImageId(null);
                        }}
                        className={`group relative grid aspect-square min-h-0 place-items-center overflow-hidden rounded-xl border bg-slate-50 text-slate-500 transition md:rounded-2xl ${
                          image ? "cursor-grab border-slate-200 hover:border-emerald-300 active:cursor-grabbing" : "border-slate-200"
                        }`}
                      >
                        {image ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={image.url} alt={image.name} className="h-full w-full object-cover" />
                            <span className="absolute left-1 top-1 rounded-full bg-slate-950/80 px-1.5 py-0.5 text-[9px] font-semibold text-white md:left-2 md:top-2 md:px-2 md:py-1 md:text-[11px]">{index === 0 ? "Cover" : `Gambar ${index + 1}`}</span>
                            <button
                              type="button"
                              aria-label={`Hapus gambar ${index + 1}`}
                              onClick={() => removeImage(image.id)}
                              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white text-slate-950 shadow-sm transition hover:bg-rose-600 hover:text-white md:right-2 md:top-2 md:h-8 md:w-8"
                            >
                              <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </button>
                            <span className="absolute inset-x-1 bottom-1 hidden rounded-full bg-white/90 px-1.5 py-0.5 text-center text-[9px] font-semibold text-slate-700 opacity-0 transition group-hover:opacity-100 md:inset-x-2 md:bottom-2 md:block md:px-2 md:py-1 md:text-[11px]">
                              Geser untuk ubah urutan
                            </span>
                          </>
                        ) : (
                          <div className="p-3 text-center">
                            <ImagePlus className="mx-auto h-4 w-4 md:h-6 md:w-6" />
                            <p className="mt-1 line-clamp-2 text-[10px] md:mt-2 md:text-xs">{`Slot ${index + 1}`}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="grid gap-2 rounded-2xl bg-slate-950 p-4 text-sm text-white" data-product-video-preview>
                  <p className="font-semibold">Video produk</p>
                  {selectedVideos.length ? (
                    selectedVideos.map((video) => (
                      <div key={video.url} className="grid gap-2 rounded-2xl bg-white/10 p-3">
                        <video src={video.url} controls playsInline preload="metadata" className="aspect-video w-full rounded-xl bg-black object-contain" />
                        <span className="line-clamp-1 text-slate-200">{video.name}</span>
                      </div>
                    ))
                  ) : existingProductVideos.length ? (
                    existingProductVideos.map((video) => (
                      <div key={video.url} className="grid gap-2 rounded-2xl bg-white/10 p-3">
                        <video src={video.url} controls playsInline preload="metadata" className="aspect-video w-full rounded-xl bg-black object-contain" />
                        <span className="line-clamp-1 text-slate-200">{video.alt ?? "Video produk"}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-300">Belum ada video baru dipilih. Gunakan MP4 H.264/AAC agar aman di HP.</p>
                  )}
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  Urutan gambar ini menjadi urutan carousel storefront. Gambar pertama otomatis cover katalog/PDP. Gambar yang dihapus akan dihapus dari galeri saat produk disimpan.
                </div>
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
(function () {
  var root = document.querySelector('[data-admin-media-root]');
  if (!root || root.dataset.nativeMediaFallback === 'ready') return;
  root.dataset.nativeMediaFallback = 'ready';
  var form = document.getElementById('admin-product-form');
  var imageInput = document.getElementById('jbd-product-image-input');
  var videoInput = document.getElementById('jbd-product-video-input');
  var status = root.querySelector('[data-product-media-status]');
  var slots = root.querySelector('[data-product-image-slots]');
  var videoPreview = root.querySelector('[data-product-video-preview]');
  var saveTimer = null;
  function setStatus(message) {
    if (!status) return;
    status.hidden = false;
    status.textContent = message;
  }
  function markReady() {
    if (imageInput) imageInput.setAttribute('data-media-ready', 'true');
    if (videoInput) videoInput.setAttribute('data-media-ready', 'true');
  }
  function autosave() {
    if (!form || !window.fetch) return;
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(function () {
      setStatus('Menyimpan media otomatis...');
      fetch(form.action, { method: 'POST', body: new FormData(form), redirect: 'follow' })
        .then(function (response) {
          if (!response.ok) throw new Error('Autosave media gagal.');
          setStatus('Media tersimpan otomatis. Aman pindah tab atau buka detail produk.');
        })
        .catch(function (error) {
          setStatus(error && error.message ? error.message : 'Autosave media gagal.');
        });
    }, 500);
  }
  function nextEmptySlot() {
    if (!slots) return null;
    var cards = Array.prototype.slice.call(slots.children);
    return cards.find(function (card) { return !card.querySelector('img'); }) || null;
  }
  function previewImages() {
    if (!imageInput || !imageInput.files || !imageInput.files.length) return;
    Array.prototype.slice.call(imageInput.files, 0, 10).forEach(function (file) {
      if (!/^image\\//.test(file.type || '') && !/\\.(jpe?g|png|webp|avif)$/i.test(file.name)) return;
      var slot = nextEmptySlot();
      if (!slot) return;
      var image = document.createElement('img');
      image.src = URL.createObjectURL(file);
      image.alt = file.name;
      image.className = 'h-full w-full object-cover';
      slot.textContent = '';
      slot.appendChild(image);
    });
    setStatus(imageInput.files.length + ' gambar terdeteksi dan siap dipreview. Autosave berjalan...');
    autosave();
  }
  function previewVideos() {
    if (!videoInput || !videoInput.files || !videoInput.files.length || !videoPreview) return;
    var file = videoInput.files[0];
    if (!/^video\\//.test(file.type || '') && !/\\.(mp4|webm|mov)$/i.test(file.name)) return;
    videoPreview.innerHTML = '<p class="font-semibold">Video produk</p>';
    var box = document.createElement('div');
    box.className = 'grid gap-2 rounded-2xl bg-white/10 p-3';
    var video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.className = 'aspect-video w-full rounded-xl bg-black object-contain';
    box.appendChild(video);
    var label = document.createElement('span');
    label.className = 'line-clamp-1 text-slate-200';
    label.textContent = file.name;
    box.appendChild(label);
    videoPreview.appendChild(box);
    setStatus('1 video terdeteksi dan siap dipreview. Autosave berjalan...');
    autosave();
  }
  markReady();
  imageInput && imageInput.addEventListener('change', previewImages);
  imageInput && imageInput.addEventListener('input', previewImages);
  videoInput && videoInput.addEventListener('change', previewVideos);
  videoInput && videoInput.addEventListener('input', previewVideos);
})();`,
                  }}
                />
              </div>
              </AdminSection>
            ) : null}

            {currentTab === "pricing" ? (
              <AdminSection title="Pricing" description="Harga retail, promo, dan tier pricing untuk buyer cafe/reseller.">
              <div className="grid gap-4 md:grid-cols-3">
                <Field name="price" label="Harga dasar" value={price} onChange={setPrice} />
                <Field name="promoPrice" label="Harga promo" value={promoPrice} onChange={setPromoPrice} />
                <SelectField label="Tier pricing" value="Retail + Horeca" options={["Retail + Horeca", "Retail only", "Distributor tier"]} />
              </div>
              </AdminSection>
            ) : null}

            {currentTab === "inventory" ? (
              <AdminSection title="Inventory" description="Stok awal masuk ke warehouse Bekasi dan siap dipakai flow WMS.">
              <div className="grid gap-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <Field name="stock" label="Stock on hand" value={stock} onChange={setStock} />
                  <Field name="safetyStock" label="Safety stock" value={safetyStock} onChange={setSafetyStock} />
                  <SelectField name="warehouse" label="Warehouse" value={warehouse} options={["Bekasi", "Surabaya", "Multi warehouse"]} />
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">Varian produk</p>
                      <p className="mt-1 text-sm text-slate-500">Contoh: 500g, 1kg, bundle cafe. Varian ini tampil di PDP dan dipilih saat add to cart.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah varian
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {variants.map((variant, index) => (
                      <div key={variant.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 md:grid-cols-[1.1fr_1fr_0.8fr_0.8fr_auto] md:items-end">
                        <label className="grid gap-2">
                          <span className="text-sm font-medium text-slate-700">Nama varian</span>
                          <input
                            name="variantName"
                            value={variant.name}
                            onChange={(event) => updateVariant(index, "name", event.target.value)}
                            placeholder="500g"
                            className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-emerald-300"
                          />
                        </label>
                        <label className="grid gap-2">
                          <span className="text-sm font-medium text-slate-700">Harga varian</span>
                          <input
                            name="variantPrice"
                            value={variant.price}
                            onChange={(event) => updateVariant(index, "price", event.target.value)}
                            inputMode="numeric"
                            placeholder="89000"
                            className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-emerald-300"
                          />
                        </label>
                        <label className="grid gap-2">
                          <span className="text-sm font-medium text-slate-700">Berat gram</span>
                          <input
                            name="variantWeight"
                            value={variant.weight}
                            onChange={(event) => updateVariant(index, "weight", event.target.value)}
                            inputMode="numeric"
                            placeholder="500"
                            className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-emerald-300"
                          />
                        </label>
                        <label className="grid gap-2">
                          <span className="text-sm font-medium text-slate-700">Stok varian</span>
                          <input
                            name="variantStock"
                            value={variant.stock}
                            onChange={(event) => updateVariant(index, "stock", event.target.value)}
                            inputMode="numeric"
                            placeholder="0"
                            className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-emerald-300"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          disabled={variants.length <= 1}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </AdminSection>
            ) : null}

            {currentTab === "seo-ai" ? (
              <AdminSection title="SEO & AI" description="Draft copy, keyword, dan angle benefit untuk PDP serta pencarian storefront.">
              <div className="grid gap-5">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-start gap-3">
                    <Bot className="mt-1 h-5 w-5 text-emerald-700" />
                    <div>
                      <p className="font-semibold text-emerald-950">AI description draft</p>
                      <p className="mt-2 text-sm leading-6 text-emerald-800">
                        {generated ? adminGeneratedDescription.long : "Klik Generate deskripsi untuk membuat draft PDP."}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-3">
                  <Field name="seoKeywords" label="Keyword SEO" value={seoKeywords} onChange={setSeoKeywords} />
                  {adminGeneratedDescription.bullets.map((item) => (
                    <div key={item} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              </AdminSection>
            ) : null}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            {coverPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverPreview} alt={coverPreviewAlt} className="aspect-square w-full rounded-2xl object-cover" />
            ) : (
              <div className={`aspect-square rounded-2xl ${mode === "edit" ? product.imageTone : "bg-amber-200"}`} />
            )}
            <p className="mt-4 text-lg font-semibold text-slate-950">{productName}</p>
            <p className="mt-1 text-sm text-slate-500">
              {description || adminGeneratedDescription.short}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <PackagePlus className="h-6 w-6 text-emerald-300" />
            <p className="mt-4 font-semibold">Publishing checklist</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {["Nama produk", "Harga", "Stock", "Deskripsi", "Media"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-emerald-300" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </form>
    </PrototypeShell>
  );
}

function AdminSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-[420px] rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-lg font-semibold text-slate-950">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({
  name,
  label,
  value,
  onChange,
}: {
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-emerald-300"
      />
    </label>
  );
}

function TextArea({
  name,
  label,
  value,
  placeholder,
  onChange,
}: {
  name?: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <textarea
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-emerald-300"
      />
    </label>
  );
}

function SelectField({
  name,
  label,
  value,
  options,
}: {
  name?: string;
  label: string;
  value: string;
  options: string[];
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        name={name}
        defaultValue={value}
        className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-emerald-300"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
