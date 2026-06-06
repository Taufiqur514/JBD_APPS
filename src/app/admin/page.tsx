import Link from "next/link";
import {
  Boxes,
  Bell,
  BrainCircuit,
  ChartNoAxesColumn,
  ClipboardList,
  Edit3,
  Megaphone,
  PackagePlus,
  PackageSearch,
  Image as ImageIcon,
  ShoppingCart,
  Users,
  Warehouse,
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
  const visibleMetrics = adminMetrics.filter((metric) => !metric.label.toLowerCase().includes("margin"));
  const metricLinks: Record<string, string> = {
    "GMV bulan ini": "/admin/analytics",
    "Order paid hari ini": "/admin/orders",
    "Low stock alert": "/admin/inventory",
  };
  const unifiedModules = [
    {
      group: "Commerce admin",
      items: [
        { title: "Product catalog", href: "/admin/products", text: "SKU, varian, harga, media, dan status produk.", icon: PackageSearch },
        { title: "Order management", href: "/admin/orders", text: "Pesanan paid, proses fulfillment, invoice, dan status.", icon: ShoppingCart },
        { title: "Asset storefront", href: "/admin/assets", text: "Banner, video, live/reel, image, dan resep.", icon: ImageIcon },
      ],
    },
    {
      group: "Operations",
      items: [
        { title: "WMS dashboard", href: "/operations", text: "Queue gudang, SLA, return, dan shipping visibility.", icon: Warehouse },
        { title: "Picking & QC", href: "/operations/picking", text: "Picklist, scan SKU, QC batch, packing, print AWB.", icon: ClipboardList },
        { title: "Inventory advanced", href: "/admin/inventory", text: "Multi warehouse, FIFO, batch, expiry, dan mutasi.", icon: Boxes },
      ],
    },
    {
      group: "Growth & insight",
      items: [
        { title: "CRM & loyalty", href: "/admin/crm", text: "Segmentasi, wishlist, ticket, point, dan customer 360.", icon: Users },
        { title: "Promotion engine", href: "/admin/promotions", text: "Voucher, flash sale, tier pricing, bundle, referral.", icon: Megaphone },
        { title: "Analytics realtime", href: "/admin/analytics", text: "Event stream, conversion, ROAS, cohort, forecast.", icon: BrainCircuit },
        { title: "Notification service", href: "/admin/notifications", text: "Email, WhatsApp, push, SMS, in-app queue.", icon: Bell },
      ],
    },
  ];

  return (
    <PrototypeShell
      compact
      eyebrow="Admin Commerce"
      title="Back Office Dashboard"
      description=""
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visibleMetrics.map((metric) => (
          <Link key={metric.label} href={metricLinks[metric.label] ?? "/admin/analytics"} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{metric.value}</p>
            <p className="mt-2 text-sm text-emerald-700">{metric.delta}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Unified Admin Console</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Satu web operasional untuk admin, operations, dan insights</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Finance berada pada workspace dan akun terpisah. Admin Commerce berfokus pada katalog, order, logistics, promotion, analytics, CRM, dan notification.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/operations" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Ops board</Link>
            <Link href="/insights" className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Insights</Link>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          {unifiedModules.map((section) => (
            <div key={section.group} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">{section.group}</p>
              <div className="mt-4 grid gap-3">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.title} href={item.href} className="flex items-start gap-3 rounded-2xl bg-white p-3 transition hover:border-emerald-300 hover:shadow-sm">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block font-semibold text-slate-950">{item.title}</span>
                        <span className="mt-1 block text-sm leading-5 text-slate-500">{item.text}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

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
        <Link
          href="/admin/assets"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-3"
        >
          <ImageIcon className="h-6 w-6 text-emerald-700" />
          <p className="mt-4 text-lg font-semibold text-slate-950">Kelola asset storefront</p>
          <p className="mt-1 text-sm text-slate-500">Upload dan edit banner carousel, image produk, voucher visual, live video, dan short product video.</p>
        </Link>
        <Link
          href="/admin/crm"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <Users className="h-6 w-6 text-emerald-700" />
          <p className="mt-4 text-lg font-semibold text-slate-950">CRM customer 360</p>
          <p className="mt-1 text-sm text-slate-500">Segmentasi, wishlist, ticket, point, dan loyalty.</p>
        </Link>
        <Link
          href="/admin/promotions"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <Megaphone className="h-6 w-6 text-emerald-700" />
          <p className="mt-4 text-lg font-semibold text-slate-950">Promotion engine</p>
          <p className="mt-1 text-sm text-slate-500">Voucher, flash sale, tier pricing, bundle, cashback, referral.</p>
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
              href="/admin/inventory"
              icon={Boxes}
              title="Inventory visibility"
              text="Stok real-time, low-stock alert, dan mutasi stok menjadi pengaman utama untuk order growth."
            />
            <FocusRow
              href="/admin/products"
              icon={PackageSearch}
              title="Catalog governance"
              text="Tim dapat mengatur varian, bundle, atribut, komposisi, dan media tanpa mengganggu flow transaksi."
            />
            <FocusRow
              href="/admin/promotions"
              icon={Megaphone}
              title="Promotion control"
              text="Voucher, tier pricing, dan campaign bisa dihidupkan tanpa membuat checkout rumit."
            />
            <FocusRow
              href="/admin/crm"
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
              <MiniTile href="/admin/analytics" icon={ShoppingCart} label="Checkout conversion" value="89%" />
              <MiniTile href="/admin/promotions" icon={ChartNoAxesColumn} label="Promo-assisted sales" value="31%" />
              <MiniTile href="/admin/crm" icon={Users} label="Repeat orders" value="42%" />
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Recent activity">
        <div className="grid gap-3">
          {adminProductActivities.map((item) => (
            <Link key={`${item.time}-${item.action}`} href={item.actor.includes("Content") ? "/admin/assets" : item.actor.includes("Pricing") ? "/admin/products" : "/admin/products/chocolate-premium-500g"} className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm transition hover:border-emerald-300 hover:bg-white md:grid-cols-[80px_160px_1fr]">
              <p className="font-medium text-slate-500">{item.time}</p>
              <p className="font-semibold text-slate-950">{item.actor}</p>
              <p className="text-slate-600">{item.action}</p>
            </Link>
          ))}
        </div>
      </SectionCard>
    </PrototypeShell>
  );
}

function FocusRow({
  href,
  icon: Icon,
  title,
  text,
}: {
  href: string;
  icon: typeof Boxes;
  title: string;
  text: string;
}) {
  return (
    <Link href={href} className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-slate-950">{title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
        </div>
      </div>
    </Link>
  );
}

function MiniTile({
  href,
  icon: Icon,
  label,
  value,
}: {
  href: string;
  icon: typeof ShoppingCart;
  label: string;
  value: string;
}) {
  return (
    <Link href={href} className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
    </Link>
  );
}
