import Link from "next/link";
import {
  ArrowRightLeft,
  ClipboardCheck,
  PackagePlus,
  PackageCheck,
  Printer,
  ScanLine,
  Truck,
  Warehouse,
} from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { FlowHandoff, SectionCard } from "@/components/prototype-ui";
import {
  operationsMetrics,
  returnsBoard,
  warehouseTasks,
} from "@/lib/prototype-data";
import { getOrders } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const orders = await getOrders();
  const queue = [
    { stage: "Paid", count: orders.filter((order) => order.status === "paid").length, href: "/operations/picking", tone: "bg-emerald-50 text-emerald-700" },
    { stage: "Picking", count: orders.filter((order) => order.status === "picking").length, href: "/operations/picking", tone: "bg-sky-50 text-sky-700" },
    { stage: "Packing", count: orders.filter((order) => order.status === "packing" || order.status === "qc").length, href: "/operations/packing", tone: "bg-amber-50 text-amber-700" },
    { stage: "Shipped", count: orders.filter((order) => order.status === "shipped").length, href: "/storefront/orders/" + (orders[0]?.id ?? "JBD"), tone: "bg-slate-100 text-slate-700" },
  ];

  return (
    <PrototypeShell
      compact
      eyebrow="Operations"
      title="Warehouse Fulfillment"
      description=""
    >
      <FlowHandoff
        steps={[
          { label: "Order", title: "Paid queue", text: "Order paid dari checkout otomatis menjadi pekerjaan gudang.", href: "/admin/orders", active: true },
          { label: "WMS", title: "Picking & QC", text: "Tim mengambil stok sesuai varian, batch, dan kuantitas order.", href: "/operations/picking" },
          { label: "Shipping", title: "Packing & AWB", text: "Paket dipacking, AWB dibuat, dan pickup kurir dicatat.", href: "/operations/packing" },
          { label: "Customer", title: "Tracking", text: "Status dikirim ke storefront agar customer bisa memantau pesanan.", href: "/storefront/profile/orders" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {operationsMetrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{metric.value}</p>
            <p className="mt-2 text-sm text-slate-600">{metric.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          title="Warehouse queue"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {queue.map((stage) => (
              <Link key={stage.stage} href={stage.href} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white">
                <p className="text-sm text-slate-500">{stage.stage}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-3xl font-semibold text-slate-950">{stage.count}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${stage.tone}`}>
                    active
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StageCard
              icon={Warehouse}
              title="Reserve stock"
              text="Mengunci stok agar order berikutnya tidak mengganggu availability."
            />
            <StageCard
              icon={ScanLine}
              title="Picking"
              text="Picker menerima list berdasarkan gudang, batch, dan priority slot."
            />
            <StageCard
              icon={ClipboardCheck}
              title="QC check"
              text="QC memastikan varian, kondisi kemasan, dan kuantitas sebelum boxing."
            />
            <StageCard
              icon={Printer}
              title="AWB & ship"
              text="Resi dicetak, pickup dicatat, lalu status dikirim ke storefront dan admin."
              href="/operations/packing"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Control points"
        >
          <div className="grid gap-4">
            {warehouseTasks.map((task) => (
              <Link key={task.title} href={task.title === "Procurement" ? "/operations/procurement" : "/operations/picking"} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white">
                <p className="text-base font-semibold text-slate-950">{task.title}</p>
                <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  {task.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title="Return and refund"
        >
          <div className="grid gap-3">
            {returnsBoard.map((item) => (
              <Link href="/operations/returns" key={item.ref} className="grid grid-cols-[0.8fr_1fr_1fr_0.8fr] gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm transition hover:border-emerald-300 hover:bg-white">
                <p className="font-medium text-slate-900">{item.ref}</p>
                <p className="text-slate-700">{item.item}</p>
                <p className="text-slate-500">{item.issue}</p>
                <p className="text-right">
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                    {item.status}
                  </span>
                </p>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Shipping visibility"
        >
          <div className="grid gap-4">
            <FlowRow
              icon={PackageCheck}
              title="Ready to ship"
              text="Paket selesai dipacking dan siap diambil kurir."
            />
            <FlowRow
              icon={Truck}
              title="Courier pickup"
              text="Status pickup memicu notifikasi ke admin dan customer."
            />
            <FlowRow
              icon={ArrowRightLeft}
              title="In transit & return handling"
              text="Issue transit, retur, atau replacement bisa dicatat tanpa memecah alur order utama."
              href="/operations/returns"
            />
            <FlowRow
              icon={PackagePlus}
              title="Supplier & procurement"
              text="Purchase order, penerimaan barang, dan sinkronisasi dokumen biaya ke Finance."
              href="/operations/procurement"
            />
          </div>
        </SectionCard>
      </div>
    </PrototypeShell>
  );
}

function StageCard({
  icon: Icon,
  title,
  text,
  href = "/operations/picking",
}: {
  icon: typeof Warehouse;
  title: string;
  text: string;
  href?: string;
}) {
  return (
    <Link href={href} className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-base font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </Link>
  );
}

function FlowRow({
  icon: Icon,
  title,
  text,
  href = "/operations/packing",
}: {
  icon: typeof Truck;
  title: string;
  text: string;
  href?: string;
}) {
  return (
    <Link href={href} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white">
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
