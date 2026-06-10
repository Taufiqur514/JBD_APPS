"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  Pause,
  Play,
  Send,
  ShoppingCart,
  Volume2,
  VolumeX,
} from "lucide-react";

export type ReelItem = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  href: string;
  mediaUrl?: string;
  mediaType: "video" | "image" | "recipe";
};

export function ReelFeed({ items }: { items: ReelItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [liked, setLiked] = useState<string[]>([]);
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [sharedId, setSharedId] = useState("");
  const [videoErrorId, setVideoErrorId] = useState("");

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          const video = element.querySelector("video");
          if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
            setActiveId(element.dataset.reelId ?? "");
            if (video && playing) void video.play().catch(() => undefined);
          } else if (video) {
            video.pause();
          }
        });
      },
      { root, threshold: [0.25, 0.75] },
    );
    root.querySelectorAll<HTMLElement>("[data-reel-id]").forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [playing]);

  function togglePlayback() {
    const next = !playing;
    setPlaying(next);
    const active = containerRef.current?.querySelector<HTMLVideoElement>(`[data-reel-id="${activeId}"] video`);
    if (active) {
      if (next) void active.play().catch(() => undefined);
      else active.pause();
    }
  }

  async function share(item: ReelItem) {
    const url = new URL(item.href, window.location.origin).toString();
    if (navigator.share) {
      await navigator.share({ title: item.title, text: item.subtitle, url }).catch(() => undefined);
    } else {
      await navigator.clipboard?.writeText(url).catch(() => undefined);
    }
    setSharedId(item.id);
    window.setTimeout(() => setSharedId(""), 1800);
  }

  return (
    <section className="fixed inset-0 z-40 bg-black">
      <div
        ref={containerRef}
        className="h-[calc(100dvh-72px)] snap-y snap-mandatory overflow-y-auto overscroll-y-contain bg-black lg:mx-auto lg:max-w-[520px]"
      >
        {items.map((item, index) => {
          const isLiked = liked.includes(item.id);
          return (
            <article
              key={item.id}
              data-reel-id={item.id}
              className="relative h-[calc(100dvh-72px)] snap-start snap-always overflow-hidden bg-slate-950"
            >
              {item.mediaUrl && item.mediaType === "video" ? (
                <video
                  src={item.mediaUrl}
                  autoPlay={index === 0}
                  controls
                  muted={muted}
                  loop
                  playsInline
                  preload={index < 2 ? "auto" : "metadata"}
                  onPlay={() => {
                    setActiveId(item.id);
                    setPlaying(true);
                  }}
                  onPause={() => {
                    if (activeId === item.id) setPlaying(false);
                  }}
                  onError={() => setVideoErrorId(item.id)}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : item.mediaUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.mediaUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-[linear-gradient(145deg,#052e2b_0%,#047857_52%,#eab308_100%)]">
                  <div className="grid h-full place-items-center text-white/20">
                    {item.mediaType === "recipe" ? <BookOpen className="h-28 w-28" /> : <ImageIcon className="h-28 w-28" />}
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.2)_0%,transparent_35%,rgba(0,0,0,.82)_100%)]" />
              {videoErrorId === item.id ? (
                <div className="absolute inset-x-5 top-24 z-20 rounded-2xl bg-black/65 p-4 text-sm leading-6 text-white backdrop-blur">
                  Video belum bisa diputar oleh browser. Gunakan MP4 H.264/AAC atau WebM agar kompatibel di mobile.
                </div>
              ) : null}

              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 text-white">
                <span className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                  {index + 1}/{items.length} · {item.tag}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    aria-label={playing ? "Jeda" : "Putar"}
                    onClick={togglePlayback}
                    className="grid h-10 w-10 place-items-center rounded-full bg-black/35 backdrop-blur"
                  >
                    {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-white" />}
                  </button>
                  <button
                    type="button"
                    aria-label={muted ? "Aktifkan suara" : "Matikan suara"}
                    onClick={() => setMuted((value) => !value)}
                    className="grid h-10 w-10 place-items-center rounded-full bg-black/35 backdrop-blur"
                  >
                    {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="absolute bottom-5 right-4 z-10 grid gap-4 text-white">
                <button
                  type="button"
                  aria-label={isLiked ? "Hapus suka" : "Sukai"}
                  onClick={() =>
                    setLiked((current) =>
                      isLiked ? current.filter((id) => id !== item.id) : [...current, item.id],
                    )
                  }
                  className="grid h-12 w-12 place-items-center rounded-full bg-black/35 backdrop-blur"
                >
                  <Heart className={`h-6 w-6 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                </button>
                <Link
                  href="/storefront/chat"
                  aria-label="Komentar"
                  className="grid h-12 w-12 place-items-center rounded-full bg-black/35 backdrop-blur"
                >
                  <MessageCircle className="h-6 w-6" />
                </Link>
                <button
                  type="button"
                  aria-label="Bagikan"
                  onClick={() => void share(item)}
                  className="grid h-12 w-12 place-items-center rounded-full bg-black/35 backdrop-blur"
                >
                  <Send className="h-6 w-6" />
                </button>
                {sharedId === item.id ? (
                  <span className="absolute bottom-0 right-14 whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-950">
                    Link dibagikan
                  </span>
                ) : null}
              </div>

              <div className="absolute inset-x-0 bottom-0 z-10 p-5 pr-20 text-white">
                <h2 className="text-2xl font-semibold">{item.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/80">{item.subtitle}</p>
                <Link
                  href={item.href}
                  className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-950"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Lihat produk
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
