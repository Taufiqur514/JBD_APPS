"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";

const slides = [
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

export function StorefrontCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % slides.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  const slide = slides[active];

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-sm">
      <div className={`grid min-h-[380px] content-end bg-gradient-to-br ${slide.tone} p-6 text-white transition md:min-h-[420px] md:p-8`}>
        <div className="max-w-2xl">
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

      <button
        type="button"
        onClick={() => setActive((value) => (value - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-slate-900 shadow-sm"
        aria-label="Banner sebelumnya"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setActive((value) => (value + 1) % slides.length)}
        className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-slate-900 shadow-sm"
        aria-label="Banner berikutnya"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <div className="absolute bottom-4 right-4 flex gap-2">
        {slides.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => setActive(index)}
            className={`h-2.5 rounded-full transition ${active === index ? "w-8 bg-white" : "w-2.5 bg-white/60"}`}
            aria-label={`Tampilkan banner ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
