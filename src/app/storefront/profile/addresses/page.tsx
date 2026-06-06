import { MapPin, Plus, Star } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { getAddresses } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export default async function StorefrontAddressesPage() {
  const addresses = await getAddresses();
  return (
    <PrototypeShell compact eyebrow="Shipping Address" title="Daftar Alamat Kirim" description="">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {addresses.map((item) => (
            <div key={item.address} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-950">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.phone}</p>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{item.address}</p>
                  </div>
                </div>
                {item.primary ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Utama</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Plus className="h-5 w-5 text-emerald-700" />
            <p className="font-semibold text-slate-950">Tambah alamat baru</p>
          </div>
          <form action="/api/addresses" method="post" className="mt-5 space-y-3">
            <AddressInput name="name" placeholder="Nama penerima" />
            <AddressInput name="phone" placeholder="Nomor HP" />
            <AddressInput name="city" placeholder="Kota / Kecamatan" />
            <textarea
              name="address"
              required
              placeholder="Alamat lengkap"
              className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-300"
            />
            <AddressInput name="note" placeholder="Catatan kurir" />
            <button type="submit" className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-700 text-sm font-semibold text-white">
              <Star className="h-4 w-4" />
              Simpan alamat
            </button>
          </form>
        </aside>
      </section>
    </PrototypeShell>
  );
}

function AddressInput({ name, placeholder }: { name: string; placeholder: string }) {
  return (
    <input
      name={name}
      required={name !== "note" && name !== "city"}
      placeholder={placeholder}
      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-emerald-300"
    />
  );
}
