import Link from "next/link";
import { Bot, Send, ShoppingCart, UserRound } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";

const messages = [
  { from: "JBD Sales", text: "Halo, stok Chocolate Premium 500g tersedia 224 pack. Mau dibantu buat bundle repeat order?" },
  { from: "Buyer", text: "Butuh rekomendasi untuk cafe kecil, target 80 cup per hari." },
  { from: "JBD Sales", text: "Ambil Chocolate 500g x2 dan Matcha 1kg x1. Estimasi cukup untuk 7-10 hari operasional." },
];

export default function StorefrontChatPage() {
  return (
    <PrototypeShell compact eyebrow="Chat" title="Chat Dengan JBD" description="">
      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-700 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-950">JBD Sales Assistant</p>
              <p className="text-sm text-emerald-700">Online, siap bantu produk dan order</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {messages.map((message) => {
              const buyer = message.from === "Buyer";
              return (
                <div key={message.text} className={`flex gap-3 ${buyer ? "justify-end" : ""}`}>
                  {!buyer ? <Bot className="mt-2 h-5 w-5 text-emerald-700" /> : null}
                  <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 ${buyer ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700"}`}>
                    {message.text}
                  </div>
                  {buyer ? <UserRound className="mt-2 h-5 w-5 text-slate-500" /> : null}
                </div>
              );
            })}
          </div>
          <form action="/storefront/chat" className="mt-6 flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 p-2">
            <input name="message" placeholder="Tulis pesan..." className="min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-700 outline-none placeholder:text-slate-500" />
            <button type="submit" className="grid h-10 w-10 place-items-center rounded-full bg-emerald-700 text-white">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-slate-950">Rekomendasi cepat</p>
          <div className="mt-4 space-y-3">
            {["Bundle Horeca 3 SKU", "Estimasi ongkir", "Repeat order terakhir"].map((item) => (
              <Link key={item} href={`/storefront/search?q=${encodeURIComponent(item)}`} className="block w-full rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700">
                {item}
              </Link>
            ))}
          </div>
          <Link href="/storefront/cart" className="mt-5 flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-700 text-sm font-semibold text-white">
            <ShoppingCart className="h-4 w-4" />
            Buat keranjang
          </Link>
        </aside>
      </section>
    </PrototypeShell>
  );
}
