import Link from "next/link";
import { Boxes, ClipboardList, PackageSearch, Warehouse } from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { getProducts, getWarehouseStocks } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const [stocks, products] = await Promise.all([getWarehouseStocks(), getProducts()]);
  const productMap = new Map(products.map((product) => [product.slug, product.name]));
  const totalStock = stocks.reduce((sum, item) => sum + item.stock, 0);
  const reserved = stocks.reduce((sum, item) => sum + item.reserved, 0);
  const expiring = stocks.filter((item) => item.expiry <= "2027-05-30").length;

  return (
    <PrototypeShell compact eyebrow="Inventory WMS Advanced" title="Multi Warehouse, FIFO, Opname, Mutasi" description="">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={Warehouse} label="Warehouse" value={String(new Set(stocks.map((item) => item.warehouseId)).size)} />
        <Metric icon={Boxes} label="Total stock" value={String(totalStock)} />
        <Metric icon={PackageSearch} label="Reserved" value={String(reserved)} />
        <Metric icon={ClipboardList} label="Expiry watch" value={`${expiring} batch`} />
      </div>
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3">
          {stocks.map((item) => (
            <Link key={`${item.warehouseId}-${item.batch}`} href={`/admin/inventory?batch=${item.batch}`} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm transition hover:border-emerald-300 hover:bg-white md:grid-cols-[1fr_0.8fr_0.8fr_0.7fr_0.7fr_0.6fr] md:items-center">
              <div>
                <p className="font-semibold text-slate-950">{productMap.get(item.productSlug) ?? item.productSlug}</p>
                <p className="mt-1 text-xs text-slate-500">{item.batch}</p>
              </div>
              <p className="text-slate-700">{item.warehouse}</p>
              <p className="text-slate-600">Expiry {item.expiry}</p>
              <p className="font-semibold text-slate-950">{item.stock}</p>
              <p className="text-amber-700">{item.reserved} reserved</p>
              <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">FIFO {item.fifoRank}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Info title="Mutation history" text="Setiap paid, receiving, retur, opname, dan adjustment menjadi baris mutasi stok." />
        <Info title="Stock opname" text="Tim warehouse bisa membandingkan sistem vs fisik per batch dan gudang." />
        <Info title="Receiving supplier" text="PO diterima masuk batch baru, memperbarui expiry dan availability; data biaya diteruskan ke Finance." />
      </section>
    </PrototypeShell>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Warehouse; label: string; value: string }) {
  return (
    <Link href="/admin/inventory" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-emerald-700" />
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </Link>
  );
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <Link href="/operations/procurement" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </Link>
  );
}
