"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";

type VariantOption = {
  name: string;
  price: number;
  weightGrams?: number;
  stock?: number;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductPurchasePanel({
  productSlug,
  variants,
}: {
  productSlug: string;
  variants: VariantOption[];
}) {
  const normalizedVariants = useMemo(
    () => variants.length ? variants : [{ name: "500g", price: 0, weightGrams: 500 }],
    [variants],
  );
  const [selectedVariant, setSelectedVariant] = useState(normalizedVariants[0]?.name ?? "500g");
  const activeVariant = normalizedVariants.find((variant) => variant.name === selectedVariant) ?? normalizedVariants[0];
  const activeStock = Math.max(0, Number(activeVariant.stock ?? 0));

  return (
    <>
      <p className="mt-5 text-3xl font-semibold text-slate-950">{formatRupiah(activeVariant.price)}</p>

      <form action="/api/cart" method="post" className="mt-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-900">Varian</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {normalizedVariants.map((variant, index) => (
                <label key={variant.name} className="cursor-pointer">
                  <input
                    className="peer sr-only"
                    type="radio"
                    name="variant"
                    value={variant.name}
                    defaultChecked={index === 0}
                    onChange={() => setSelectedVariant(variant.name)}
                  />
                  <span className="inline-flex flex-col rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 peer-checked:bg-slate-950 peer-checked:text-white">
                    <span>{variant.name}</span>
                    <span className="text-xs opacity-70">{formatRupiah(variant.price)}</span>
                    <span className="text-xs opacity-70">Stok {variant.stock ?? 0}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="qty" className="text-sm font-semibold text-slate-900">
              Jumlah
            </label>
            <input
              id="qty"
              name="qty"
              type="number"
              min={1}
              max={Math.max(1, activeStock)}
              defaultValue={1}
              disabled={activeStock <= 0}
              className="mt-3 h-11 w-28 rounded-full border border-slate-200 bg-slate-50 px-4 text-center text-sm font-semibold outline-none focus:border-emerald-300"
            />
            <p className="mt-2 text-xs font-medium text-slate-500">
              {activeStock > 0 ? `${activeStock} tersedia untuk ${activeVariant.name}` : "Varian ini sedang kosong"}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="slug" value={productSlug} />
          <button
            type="submit"
            disabled={activeStock <= 0}
            className="hidden h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white lg:inline-flex"
          >
            <ShoppingCart className="h-4 w-4" />
            Tambah ke keranjang
          </button>
          <Link
            href="/storefront/profile"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700"
          >
            <Heart className="h-4 w-4" />
            Wishlist
          </Link>
        </div>
      </form>

      <div className="fixed inset-x-0 bottom-20 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        <form action="/api/cart" method="post">
          <input type="hidden" name="slug" value={productSlug} />
          <input type="hidden" name="variant" value={selectedVariant} />
          <input type="hidden" name="qty" value="1" />
          <button
            type="submit"
            disabled={activeStock <= 0}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-700 text-sm font-semibold text-white"
          >
            <ShoppingCart className="h-4 w-4" />
            {activeStock > 0 ? `Tambah ${selectedVariant} ke keranjang` : "Stok varian kosong"}
          </button>
        </form>
      </div>
    </>
  );
}
