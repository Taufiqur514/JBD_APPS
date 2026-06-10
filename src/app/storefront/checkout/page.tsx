import { MapPin, ShieldCheck, Ticket, Truck } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { formatRupiah } from "@/lib/commerce";
import { getAddresses, getCartLines, getOrderSummaryFromCart } from "@/lib/mvp-store";
import { quoteShipping } from "@/lib/shipping-provider";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const lines = await getCartLines();
  const summary = await getOrderSummaryFromCart();
  const addresses = await getAddresses();
  const address = addresses.find((item) => item.primary) ?? addresses[0];
  const totalWeight = Math.max(1000, lines.reduce((sum, line) => sum + line.qty * 1000, 0));
  const destinationCity = String(address?.address ?? "").toLowerCase().includes("bekasi") ? "Bekasi" : "Jakarta";
  const shippingQuotes = quoteShipping(destinationCity, totalWeight);
  const selectedShipping = shippingQuotes[0];
  const addressId = String(address?.id ?? "addr-main");
  const selectedCourier = selectedShipping ? `${selectedShipping.courier} ${selectedShipping.service}` : "JNE REG";

  return (
    <PrototypeShell compact eyebrow="Checkout" title="Alamat, Kurir, Voucher" description="">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <CheckoutBlock icon={MapPin} title="Alamat pengiriman">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-semibold text-emerald-950">{String(address?.name ?? "Kedai Teman Kopi")}</p>
              <p className="mt-1 text-sm leading-6 text-emerald-800">
                {String(address?.address ?? "Jl. Melati Raya No. 18, Bekasi Selatan, Jawa Barat")}
              </p>
            </div>
          </CheckoutBlock>

          <CheckoutBlock icon={Truck} title="Pilih kurir">
            <div className="grid gap-3 md:grid-cols-3">
              {shippingQuotes.map((quote, index) => (
                <label
                  key={`${quote.courier}-${quote.service}`}
                  className="cursor-pointer"
                >
                  <input
                    className="peer sr-only"
                    type="radio"
                    name="courier"
                    value={`${quote.courier} ${quote.service}`}
                    defaultChecked={index === 0}
                  />
                  <span className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left peer-checked:border-emerald-300 peer-checked:bg-emerald-50">
                  <p className="font-semibold text-slate-950">{quote.courier} {quote.service}</p>
                  <p className="mt-1 text-sm text-slate-500">{quote.etd}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {formatRupiah(quote.cost)}
                  </p>
                  </span>
                </label>
              ))}
            </div>
          </CheckoutBlock>

          <CheckoutBlock icon={Ticket} title="Voucher dan poin">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-semibold text-emerald-950">
                  {summary.voucherEligible ? "JBD25 terpakai" : "JBD25 belum memenuhi syarat"}
                </p>
                <p className="mt-1 text-sm text-emerald-700">
                  {summary.voucherEligible
                    ? `Diskon ${formatRupiah(summary.voucherDiscount)}`
                    : `Minimum belanja ${formatRupiah(summary.voucherMinSpend)}`}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">1.250 poin tersedia</p>
                <p className="mt-1 text-sm text-slate-500">Pakai Rp 10.000</p>
              </div>
            </div>
          </CheckoutBlock>
        </div>

        <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-slate-950">Order summary</p>
          <div className="mt-4 space-y-3">
            {lines.map((line) => (
              <div key={`${line.product.slug}-${line.variant}`} className="flex justify-between gap-4 text-sm">
                <span className="text-slate-600">{line.product.name} x{line.qty}</span>
                <span className="font-medium text-slate-900">{formatRupiah(line.lineTotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-slate-200 pt-5 text-sm">
            <SummaryRow label="Subtotal" value={formatRupiah(summary.subtotal)} />
            <SummaryRow label="Voucher & promo" value={`-${formatRupiah(summary.discount)}`} />
            <SummaryRow label="Poin digunakan" value={`-${formatRupiah(summary.pointsUsed)}`} />
            <SummaryRow label="Ongkir + asuransi" value={formatRupiah(summary.shipping + summary.insurance)} />
            <SummaryRow label="Total" value={formatRupiah(summary.total)} strong />
          </div>
          {summary.appliedPromos.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {summary.appliedPromos.map((promo) => (
                <span key={promo} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {promo}
                </span>
              ))}
            </div>
          ) : null}
          <form action="/api/checkout" method="post">
            <input type="hidden" name="addressId" value={addressId} />
            <input type="hidden" name="courier" value={selectedCourier} />
            <input type="hidden" name="paymentMethod" value="qris" />
            <button
              type="submit"
              className="mt-5 hidden h-12 w-full items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white lg:flex"
            >
              Buat order & lanjut bayar
            </button>
          </form>
        </aside>
      </section>

      <div className="fixed inset-x-0 bottom-20 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        <form action="/api/checkout" method="post">
          <input type="hidden" name="addressId" value={addressId} />
          <input type="hidden" name="courier" value={selectedCourier} />
          <input type="hidden" name="paymentMethod" value="qris" />
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white"
          >
            Buat order & lanjut bayar
          </button>
        </form>
      </div>
    </PrototypeShell>
  );
}

function CheckoutBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof ShieldCheck;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <Icon className="h-5 w-5" />
        </div>
        <p className="font-semibold text-slate-950">{title}</p>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <span className={strong ? "font-semibold text-slate-950" : "text-slate-500"}>{label}</span>
      <span className={strong ? "text-xl font-semibold text-slate-950" : "font-medium text-slate-900"}>{value}</span>
    </div>
  );
}
