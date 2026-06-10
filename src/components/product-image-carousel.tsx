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
}: {
  images?: GalleryImage[];
  fallbackTone: string;
  productName: string;
}) {
  const validImages = images?.filter((image) => image.url) ?? [];
  const [activeIndex, setActiveIndex] = useState(0);

  if (!validImages.length) {
    return (
      <div className={`grid aspect-square place-items-center rounded-[24px] ${fallbackTone}`}>
        <ImageIcon className="h-10 w-10 text-slate-500/70" />
      </div>
    );
  }

  const active = validImages[activeIndex] ?? validImages[0];

  const mediaScriptData = JSON.stringify(validImages).replace(/</g, "\\u003c");

  return (
    <div className="space-y-3" data-product-carousel-root>
      <div className="relative overflow-hidden rounded-[24px] border border-slate-100 bg-slate-50" data-product-media-stage>
        {active.mediaType === "video" ? (
          <video src={active.url} controls playsInline preload="metadata" className="aspect-square w-full bg-black object-contain" data-product-media-video />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={active.url} alt={active.alt ?? productName} className="aspect-square w-full object-cover" data-product-media-image />
        )}
        {validImages.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Gambar sebelumnya"
              onClick={() => setActiveIndex((index) => (index === 0 ? validImages.length - 1 : index - 1))}
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-800 shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Gambar berikutnya"
              onClick={() => setActiveIndex((index) => (index + 1) % validImages.length)}
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-800 shadow-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-slate-950/55 px-3 py-2">
              {validImages.map((image, index) => (
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

      {validImages.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {validImages.map((image, index) => (
            <button
              key={`${image.url}-thumb-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
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
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image.url} alt={image.alt ?? productName} className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      ) : null}
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function () {
  var root = document.currentScript && document.currentScript.closest('[data-product-carousel-root]');
  if (!root || root.dataset.nativeCarousel === 'ready') return;
  root.dataset.nativeCarousel = 'ready';
  var media = ${mediaScriptData};
  var stage = root.querySelector('[data-product-media-stage]');
  function render(index) {
    if (!stage || !media[index]) return;
    var item = media[index];
    Array.prototype.slice.call(stage.children).forEach(function (child) {
      if (child.tagName !== 'BUTTON' && !child.querySelector('[aria-label^="Lihat gambar"]')) child.remove();
    });
    var element;
    if (item.mediaType === 'video') {
      element = document.createElement('video');
      element.src = item.url;
      element.controls = true;
      element.playsInline = true;
      element.preload = 'metadata';
      element.className = 'aspect-square w-full bg-black object-contain';
      element.setAttribute('data-product-media-video', '');
    } else {
      element = document.createElement('img');
      element.src = item.url;
      element.alt = item.alt || '${productName.replace(/'/g, "\\'")}';
      element.className = 'aspect-square w-full object-cover';
      element.setAttribute('data-product-media-image', '');
    }
    stage.insertBefore(element, stage.firstChild);
  }
  root.querySelectorAll('[data-product-media-thumb]').forEach(function (button) {
    button.addEventListener('click', function () {
      render(Number(button.getAttribute('data-product-media-thumb')) || 0);
    });
  });
})();`,
        }}
      />
    </div>
  );
}
