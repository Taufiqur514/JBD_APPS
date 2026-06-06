import Link from "next/link";
import { Bell, Lock, Settings, UserRound } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";

const settings = [
  { icon: UserRound, title: "Informasi akun", detail: "Nama bisnis, email, nomor HP" },
  { icon: Bell, title: "Notifikasi", detail: "Order, chat, promo, loyalty" },
  { icon: Lock, title: "Keamanan", detail: "Password dan verifikasi akun" },
];

export default function StorefrontSettingsPage() {
  return (
    <PrototypeShell compact eyebrow="Settings" title="Setting Akun" description="">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
            <Settings className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-slate-950">Preferensi customer</p>
            <p className="text-sm text-slate-500">Prototype form untuk akun pelanggan JBD.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4">
          {settings.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                  </div>
                </div>
                <Link href="/storefront/profile" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700">Edit</Link>
              </div>
            );
          })}
        </div>
      </section>
    </PrototypeShell>
  );
}
