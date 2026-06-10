"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, Play } from "lucide-react";

type GalleryImage = {
  url: string;
  alt?: string;
  mediaType?: "image" | "video";
};

export function ProductImageCarousel({
  images,
  fallbackTone,
  productName,
  initialIndex = 0,
}: {
  images?: GalleryImage[];
  fallbackTone: string;
  productName: string;
  initialIndex?: number;
}) {
  const validImages = images?.filter((image) => image.url) ?? [];
  const safeInitialIndex = validImages.length ? Math.min(Math.max(initialIndex, 0), validImages.length - 1) : 0;
  const [activeIndex, setActiveIndex] = useState(safeInitialIndex);
  const [failedUrls, setFailedUrls] = useState<string[]>([]);

  const displayImages = validImages.filter((image) => !failedUrls.includes(image.url));
  const active = displayImages[activeIndex] ?? displayImages[0];

  function markFailed(url: string) {
    setFailedUrls((current) => (current.includes(url) ? current : [...current, url]));
    setActiveIndex(0);
  }

  if (!displayImages.length) {
    return (
      <div className={`grid aspect-square place-items-center rounded-[24px] ${fallbackTone}`}>
        <ImageIcon className="h-10 w-10 text-slate-500/70" />
      </div>
    );
  }

  return (
    <div className="space-y-3" data-product-carousel-root>
      <div id="product-media" className="relative overflow-hidden rounded-[24px] border border-slate-100 bg-slate-50 scroll-mt-32" data-product-media-stage>
        {active.mediaType === "video" ? (
          <video src={active.url} controls playsInline preload="metadata" className="aspect-square w-full bg-black object-contain" data-product-media-video />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={active.url}
            alt={active.alt ?? productName}
            className="aspect-square w-full object-cover"
            data-product-media-image
            decoding="async"
            fetchPriority="high"
            onError={() => markFailed(active.url)}
          />
        )}
        {displayImages.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Gambar sebelumnya"
              onClick={() => setActiveIndex((index) => (index === 0 ? displayImages.length - 1 : index - 1))}
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-800 shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Gambar berikutnya"
              onClick={() => setActiveIndex((index) => (index + 1) % displayImages.length)}
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-800 shadow-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-slate-950/55 px-3 py-2">
              {displayImages.map((image, index) => (
                <button
                  key={`${image.url}-${index}`}
                  type="button"
                  aria-label={`Lihat gambar ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition-all ${activeIndex === index ? "w-5 bg-white" : "w-2 bg-white/55"}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {displayImages.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {displayImages.map((image, index) => (
            <a
              key={`${image.url}-thumb-${index}`}
              href={`?media=${index}#product-media`}
              onClick={(event) => {
                event.preventDefault();
                setActiveIndex(index);
              }}
              data-product-media-thumb={index}
              data-product-media-kind={image.mediaType === "video" ? "video" : "image"}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl border bg-slate-50 ${
                activeIndex === index ? "border-emerald-500" : "border-slate-200"
              }`}
            >
              {image.mediaType === "video" ? (
                <span className="grid h-full w-full place-items-center bg-slate-950 text-white">
                  <Play className="h-5 w-5 fill-white" />
                </span>
              ) : (
                <span className="grid h-full w-full place-items-center bg-slate-100 text-[11px] font-semibold text-slate-600">
                  <ImageIcon className="mb-0.5 h-4 w-4 text-emerald-700" />
                  {index + 1}
                </span>
              )}
              <span className="sr-only">{image.mediaType === "video" ? "Video" : "Gambar"} {index + 1}</span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
