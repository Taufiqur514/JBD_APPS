"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";

type StorefrontSlide = {
  eyebrow: string;
  title: string;
  cta: string;
  href: string;
  tone?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  caption?: string;
};

const slides: StorefrontSlide[] = [
  {
    eyebrow: "Better ingredients, better drink",
    title: "Powder minuman premium untuk cafe, booth, reseller, dan distributor.",
    cta: "Belanja sekarang",
    href: "/storefront/products/chocolate-premium-500g",
    tone: "from-emerald-950 via-emerald-800 to-amber-500",
  },
  {
    eyebrow: "Live demo hari ini",
    title: "Lihat resep iced chocolate, matcha latte, dan bundle stok cafe.",
    cta: "Masuk live",
    href: "/storefront/live",
    tone: "from-slate-950 via-emerald-900 to-sky-500",
  },
  {
    eyebrow: "Promo repeat order",
    title: "Voucher JBD25 dan gratis recipe card untuk pembelian bundle.",
    cta: "Pakai voucher",
    href: "/storefront/profile/vouchers",
    tone: "from-emerald-900 via-teal-700 to-lime-500",
  },
];

export function StorefrontCarousel({ banners = [] }: { banners?: StorefrontSlide[] }) {
  const displaySlides = banners.length ? banners : slides;
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % displaySlides.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [displaySlides.length]);

  const slide = displaySlides[active] ?? displaySlides[0];

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-sm">
      <div className={`relative grid min-h-[380px] content-end overflow-hidden ${slide.tone ? `bg-gradient-to-br ${slide.tone}` : "bg-slate-950"} p-6 text-white transition md:min-h-[420px] md:p-8`}>
        {slide.mediaUrl && slide.mediaType === "video" ? (
          <>
            <video src={slide.mediaUrl} muted playsInline autoPlay loop preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-slate-950/10" />
          </>
        ) : slide.mediaUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.mediaUrl} alt={slide.title} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/35 to-transparent" />
          </>
        ) : null}
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100 md:text-sm">
            {slide.eyebrow}
          </p>
          <h3 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            {slide.title}
          </h3>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={slide.href} className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-emerald-950">
              {slide.cta}
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link href="/storefront/cart" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 px-5 text-sm font-semibold text-white">
              <ShoppingCart className="h-4 w-4" />
              Keranjang
            </Link>
          </div>
        </div>
      </div>

      {displaySlides.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => setActive((value) => (value - 1 + displaySlides.length) % displaySlides.length)}
            className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-slate-900 shadow-sm"
            aria-label="Banner sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setActive((value) => (value + 1) % displaySlides.length)}
            className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-slate-900 shadow-sm"
            aria-label="Banner berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-4 right-4 flex gap-2">
            {displaySlides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setActive(index)}
                className={`h-2.5 rounded-full transition ${active === index ? "w-8 bg-white" : "w-2.5 bg-white/60"}`}
                aria-label={`Tampilkan banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
