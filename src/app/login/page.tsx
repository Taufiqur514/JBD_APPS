import { Banknote, LogIn, ShieldCheck, Store, Truck, UserRound } from "lucide-react";

const roles = [
  { role: "customer", userId: "demo-customer", title: "Customer", text: "Masuk ke storefront, cart, checkout, tracking, loyalty.", icon: UserRound, tone: "bg-emerald-700 text-white" },
  { role: "admin", userId: "admin-ops", title: "Admin Commerce", text: "Kelola produk, order, CRM, promo, operations, analytics, dan notifikasi tanpa akses data finance.", icon: ShieldCheck, tone: "bg-slate-950 text-white" },
  { role: "finance", userId: "finance-controller", title: "Finance Controller", text: "Akses khusus AR, AP, GL, HPP, profit, settlement, dan cashflow.", icon: Banknote, tone: "bg-indigo-700 text-white" },
  { role: "warehouse", userId: "wh-bekasi", title: "Warehouse", text: "Picking, QC, packing, stok, batch, dan fulfillment.", icon: Truck, tone: "bg-amber-500 text-slate-950" },
  { role: "seller", userId: "seller-nusa", title: "Seller", text: "Portal distributor untuk katalog, order, dan performa channel.", icon: Store, tone: "bg-sky-600 text-white" },
];

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbf8,#ffffff)] px-4 py-8 text-slate-950">
      <section className="mx-auto grid max-w-5xl gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">JBD Digital Commerce</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Login role untuk demo operasional</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Pilih role untuk menguji flow sesuai kewenangan. Finance menggunakan akun terpisah karena memuat data rahasia perusahaan.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {roles.map((item) => {
            const Icon = item.icon;
            return (
              <form key={item.role} action="/api/auth/login" method="post" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <input type="hidden" name="role" value={item.role} />
                <input type="hidden" name="userId" value={item.userId} />
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${item.tone}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-xl font-semibold">{item.title}</h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{item.text}</p>
                <button type="submit" className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-700 text-sm font-semibold text-white">
                  <LogIn className="h-4 w-4" />
                  Masuk sebagai {item.title}
                </button>
              </form>
            );
          })}
        </div>
      </section>
    </main>
  );
}
