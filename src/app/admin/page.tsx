import Link from "next/link";
import {
  Boxes,
  ChartNoAxesColumn,
  ClipboardList,
  Edit3,
  Megaphone,
  PackagePlus,
  PackageSearch,
  ShoppingCart,
  Users,
} from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { SectionCard } from "@/components/prototype-ui";
import {
  adminMetrics,
  adminOrders,
  adminProductActivities,
  campaigns,
  productHealth,
} from "@/lib/prototype-data";

export default function AdminPage() {
  return (
    <PrototypeShell
      compact
      eyebrow="Admin Commerce"
      title="Back Office Dashboard"
      description=""
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminMetrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{metric.value}</p>
            <p className="mt-2 text-sm text-emerald-700">{metric.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/products/new"
          className="rounded-2xl border border-emerald-200 bg-emerald-700 p-5 text-white shadow-sm"
        >
          <PackagePlus className="h-6 w-6" />
          <p className="mt-4 text-lg font-semibold">Tambah produk</p>
          <p className="mt-1 text-sm text-emerald-50">Buat SKU, harga, stok, media, dan deskripsi.</p>
        </Link>
        <Link
          href="/admin/products"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <PackageSearch className="h-6 w-6 text-emerald-700" />
          <p className="mt-4 text-lg font-semibold text-slate-950">Kelola katalog</p>
          <p className="mt-1 text-sm text-slate-500">Edit produk, varian, status, dan inventory.</p>
        </Link>
        <Link
          href="/admin/orders/JBD-240605-0123"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <ClipboardList className="h-6 w-6 text-emerald-700" />
          <p className="mt-4 text-lg font-semibold text-slate-950">Proses order</p>
          <p className="mt-1 text-sm text-slate-500">Lihat detail order dan update fulfillment.</p>
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Order command center"
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[1.35fr_1fr_0.9fr_0.8fr] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
              <p>Order</p>
              <p>Customer</p>
              <p>Channel</p>
              <p>Status</p>
            </div>
            {adminOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="grid grid-cols-[1.35fr_1fr_0.9fr_0.8fr] gap-4 border-b border-slate-100 px-4 py-4 text-sm last:border-b-0"
              >
                <div>
                  <p className="font-medium text-slate-950">{order.id}</p>
                  <p className="mt-1 text-slate-500">{order.total}</p>
                </div>
                <p className="text-slate-700">{order.customer}</p>
                <p className="text-slate-500">{order.channel}</p>
                <p>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    {order.status}
                  </span>
                </p>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Admin tools"
        >
          <div className="grid gap-4">
            <FocusRow
              icon={Boxes}
              title="Inventory visibility"
              text="Stok real-time, low-stock alert, dan mutasi stok menjadi pengaman utama untuk order growth."
            />
            <FocusRow
              icon={PackageSearch}
              title="Catalog governance"
              text="Tim dapat mengatur varian, bundle, atribut, komposisi, dan media tanpa mengganggu flow transaksi."
            />
            <FocusRow
              icon={Megaphone}
              title="Promotion control"
              text="Voucher, tier pricing, dan campaign bisa dihidupkan tanpa membuat checkout rumit."
            />
            <FocusRow
              icon={Users}
              title="Customer visibility"
              text="Admin dapat melihat buyer aktif, histori pembelian, dan customer yang perlu follow-up."
            />
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title="Catalog and inventory"
        >
          <div className="grid gap-3">
            {productHealth.map((product) => (
              <Link key={product.sku} href="/admin/products/chocolate-premium-500g" className="grid grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr_auto] items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm">
                <p className="font-medium text-slate-900">{product.sku}</p>
                <p className="text-slate-500">Stock {product.stock}</p>
                <p className={`${product.velocity === "High risk" ? "text-rose-600" : "text-emerald-700"}`}>
                  {product.velocity}
                </p>
                <p className="text-right text-slate-700">{product.price}</p>
                <Edit3 className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Campaign response"
        >
          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <div key={campaign.name} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-slate-950">{campaign.name}</p>
                    <p className="mt-2 text-sm text-slate-500">Revenue {campaign.revenue}</p>
                  </div>
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
                    ROAS {campaign.roas}
                  </span>
                </div>
              </div>
            ))}

            <div className="grid gap-4 md:grid-cols-3">
              <MiniTile icon={ShoppingCart} label="Checkout conversion" value="89%" />
              <MiniTile icon={ChartNoAxesColumn} label="Promo-assisted sales" value="31%" />
              <MiniTile icon={Users} label="Repeat orders" value="42%" />
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Recent activity">
        <div className="grid gap-3">
          {adminProductActivities.map((item) => (
            <div key={`${item.time}-${item.action}`} className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm md:grid-cols-[80px_160px_1fr]">
              <p className="font-medium text-slate-500">{item.time}</p>
              <p className="font-semibold text-slate-950">{item.actor}</p>
              <p className="text-slate-600">{item.action}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </PrototypeShell>
  );
}

function FocusRow({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Boxes;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-slate-950">{title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
        </div>
      </div>
    </div>
  );
}

function MiniTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShoppingCart;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
