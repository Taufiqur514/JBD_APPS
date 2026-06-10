"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";

export function ProductMediaTile({
  coverUrl,
  tone,
  name,
  compact = false,
}: {
  coverUrl?: string;
  tone: string;
  name: string;
  compact?: boolean;
}) {
  const [hasFailed, setHasFailed] = useState(false);

  if (coverUrl && !hasFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={coverUrl}
        alt={name}
        className="aspect-[4/3] w-full rounded-2xl object-cover"
        loading={compact ? "lazy" : "eager"}
        decoding="async"
        onError={() => setHasFailed(true)}
      />
    );
  }

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div
      data-jbd-product-media-tile="fallback"
      className={`relative grid aspect-[4/3] overflow-hidden rounded-2xl ${tone}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.72),transparent_34%),linear-gradient(135deg,rgba(16,185,129,.18),rgba(234,179,8,.22))]" />
      <div className="relative grid h-full place-items-center p-3 text-center">
        <div>
          <span className={`mx-auto grid place-items-center rounded-2xl bg-white/75 text-emerald-800 shadow-sm ${compact ? "h-8 w-8" : "h-12 w-12"}`}>
            <ImageIcon className={compact ? "h-4 w-4" : "h-5 w-5"} />
          </span>
          <p className={`${compact ? "mt-1 text-xs" : "mt-2 text-base"} font-black tracking-[0.08em] text-slate-800`}>{initials || "JBD"}</p>
          {!compact ? (
            <p className="mt-1 line-clamp-2 text-[10px] font-semibold uppercase leading-4 tracking-[0.08em] text-slate-600">
              {name}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
