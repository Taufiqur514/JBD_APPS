import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRightLeft,
  BadgeDollarSign,
  Bell,
  Bot,
  BrainCircuit,
  ChartColumn,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileSpreadsheet,
  Gift,
  Home,
  Mail,
  Monitor,
  LayoutDashboard,
  MessageSquareMore,
  Package,
  PackageCheck,
  PackagePlus,
  Percent,
  Printer,
  ScanLine,
  Search,
  ShieldCheck,
  ShoppingCart,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";

export type JourneyStep = {
  id: string;
  label: string;
  title: string;
  accent: string;
  bullets: string[];
  metric: string;
  detail: string;
  cta: string;
};

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
};

export type SidebarMenuItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  {
    href: "/",
    label: "Overview",
    shortLabel: "Overview",
    description: "Executive summary dan blueprint coverage",
    icon: Sparkles,
  },
  {
    href: "/storefront",
    label: "Storefront",
    shortLabel: "Storefront",
    description: "Journey customer dari discovery sampai loyalty",
    icon: Store,
  },
  {
    href: "/admin",
    label: "Admin Commerce",
    shortLabel: "Admin",
    description: "Control tower untuk katalog, stok, dan order",
    icon: LayoutDashboard,
  },
  {
    href: "/operations",
    label: "Operations",
    shortLabel: "Operations",
    description: "Fulfillment, WMS, return, dan QC",
    icon: Warehouse,
  },
  {
    href: "/insights",
    label: "AI & Insights",
    shortLabel: "Insights",
    description: "CRM, finance, analytics, dan AI layer",
    icon: BrainCircuit,
  },
];

export const topStatus = [
  { icon: Bell, label: "Prototype mode", value: "Ready" },
  { icon: ShieldCheck, label: "Blueprint coverage", value: "End-to-end" },
  { icon: Sparkles, label: "Presentation focus", value: "UI/UX" },
];

export const appSidebarMenus: Record<string, SidebarMenuItem[]> = {
  storefront: [
    {
      href: "/storefront",
      label: "Home & Catalog",
      description: "Browse produk",
      icon: Home,
    },
    {
      href: "/storefront/products/chocolate-premium-500g",
      label: "Product Detail",
      description: "PDP, variant, review",
      icon: Search,
    },
    {
      href: "/storefront/cart",
      label: "Cart",
      description: "Qty, voucher, note",
      icon: ShoppingCart,
    },
    {
      href: "/storefront/checkout",
      label: "Checkout",
      description: "Alamat, kurir, point",
      icon: ShoppingBag,
    },
    {
      href: "/storefront/payment",
      label: "Payment",
      description: "QRIS, VA, e-wallet",
      icon: CreditCard,
    },
    {
      href: "/storefront/orders/JBD-240605-0127",
      label: "Tracking",
      description: "Status & resi",
      icon: Truck,
    },
    {
      href: "/storefront/review",
      label: "Review",
      description: "Rating & upload foto",
      icon: Star,
    },
    {
      href: "/storefront/loyalty",
      label: "Loyalty",
      description: "Point & reward",
      icon: Gift,
    },
  ],
  admin: [
    {
      href: "/admin",
      label: "Dashboard",
      description: "GMV, order, alerts",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/products",
      label: "Product Catalog",
      description: "Kelola SKU",
      icon: Package,
    },
    {
      href: "/admin/products/new",
      label: "Add Product",
      description: "Form + AI copy",
      icon: PackagePlus,
    },
    {
      href: "/admin/products/chocolate-premium-500g",
      label: "Edit Product",
      description: "Media, price, stock",
      icon: ClipboardList,
    },
    {
      href: "/admin/orders/JBD-240605-0123",
      label: "Order Detail",
      description: "Fulfillment action",
      icon: CheckCircle2,
    },
    {
      href: "/admin/reports",
      label: "Reports",
      description: "Sales & product data",
      icon: ChartColumn,
    },
  ],
  operations: [
    {
      href: "/operations",
      label: "Ops Dashboard",
      description: "Queue & SLA",
      icon: Warehouse,
    },
    {
      href: "/operations/picking",
      label: "WMS Picking",
      description: "Picklist & bin",
      icon: ScanLine,
    },
    {
      href: "/operations/qc",
      label: "QC Check",
      description: "Seal, batch, expiry",
      icon: ClipboardCheck,
    },
    {
      href: "/operations/packing",
      label: "Packing & AWB",
      description: "Label & pickup",
      icon: Printer,
    },
    {
      href: "/operations/returns",
      label: "Return & Refund",
      description: "Retur, refund, tukar",
      icon: ArrowRightLeft,
    },
    {
      href: "/operations/procurement",
      label: "Procurement",
      description: "Supplier & PO",
      icon: PackageCheck,
    },
  ],
  insights: [
    {
      href: "/insights",
      label: "Insight Home",
      description: "Overview intelligence",
      icon: BrainCircuit,
    },
    {
      href: "/insights/crm",
      label: "CRM",
      description: "Segment & ticket",
      icon: Users,
    },
    {
      href: "/insights/automation",
      label: "Automation",
      description: "WA, email, campaign",
      icon: Mail,
    },
    {
      href: "/insights/finance",
      label: "Finance",
      description: "Revenue, HPP, profit",
      icon: FileSpreadsheet,
    },
    {
      href: "/insights/reports",
      label: "Reports",
      description: "Dashboard real-time",
      icon: Monitor,
    },
    {
      href: "/insights/ai",
      label: "AI Agents",
      description: "Agent workspace",
      icon: Bot,
    },
  ],
};

export const overviewKpis = [
  {
    icon: ShoppingCart,
    label: "Customer journey",
    value: "11 tahap",
    note: "Visitor sampai loyalty",
  },
  {
    icon: Package,
    label: "Commerce modules",
    value: "10 core domains",
    note: "Catalog, order, payment, shipping, notification",
  },
  {
    icon: ChartColumn,
    label: "Business layers",
    value: "4 control surfaces",
    note: "Storefront, admin, ops, AI & insights",
  },
];

export const journeySteps: JourneyStep[] = [
  {
    id: "01",
    label: "Visitor",
    title: "Landing page produk powder drink dengan promo, kategori, dan CTA katalog cepat",
    accent: "from-emerald-600 to-green-700",
    bullets: ["Banner campaign", "Kategori rasa", "Benefit & testimoni"],
    metric: "CTR hero 6.8%",
    detail: "Campaign Ramadan Mix, bundling Horeca, dan sampling kit tampil di atas fold.",
    cta: "Jelajahi katalog",
  },
  {
    id: "02",
    label: "Browse & Search",
    title: "Pencarian SKU berbasis rasa, aplikasi minuman, ukuran kemasan, dan level harga",
    accent: "from-emerald-500 to-lime-600",
    bullets: ["Search", "Filter kemasan", "Sort harga & popularitas"],
    metric: "128 SKU aktif",
    detail: "Buyer dapat menyaring bubuk minuman untuk cafe, booth, atau reseller.",
    cta: "Terapkan filter",
  },
  {
    id: "03",
    label: "Product Detail",
    title: "PDP menampilkan komposisi, cara saji, info gizi, dan peluang upsell bundle",
    accent: "from-teal-500 to-emerald-600",
    bullets: ["Foto produk", "Komposisi", "Cara penyajian"],
    metric: "Margin 38%",
    detail: "Fokus pada kepercayaan produk: bahan premium, konsistensi rasa, dan higienitas.",
    cta: "Pilih varian",
  },
  {
    id: "04",
    label: "Add to Cart",
    title: "Keranjang menyimpan qty, note custom, bonus promo, dan rekomendasi repeat order",
    accent: "from-amber-500 to-orange-500",
    bullets: ["Qty", "Catatan", "Wishlist & bundle"],
    metric: "AOV Rp 186k",
    detail: "Upsell otomatis muncul untuk topping, base powder, dan kemasan pelengkap.",
    cta: "Tambah ke keranjang",
  },
  {
    id: "05",
    label: "Checkout",
    title: "Checkout memadukan alamat, kurir, voucher, poin, dan ringkasan order bersih",
    accent: "from-sky-500 to-blue-600",
    bullets: ["Alamat", "Kurir", "Voucher & point"],
    metric: "Drop-off 11%",
    detail: "UI sengaja ringkas supaya tim management bisa lihat flow purchase yang realistis.",
    cta: "Lanjut bayar",
  },
  {
    id: "06",
    label: "Payment",
    title: "Pilihan pembayaran lengkap untuk QRIS, VA, e-wallet, retail, dan COD",
    accent: "from-indigo-500 to-blue-700",
    bullets: ["QRIS", "VA", "E-wallet & COD"],
    metric: "Paid < 3 min",
    detail: "Struktur ini siap dihubungkan ke Midtrans atau Xendit saat prototype naik kelas.",
    cta: "Bayar sekarang",
  },
  {
    id: "07",
    label: "Payment Success",
    title: "Halaman sukses membangun rasa aman lewat invoice, order ID, dan next action",
    accent: "from-green-500 to-emerald-700",
    bullets: ["Invoice", "Rincian order", "Share invoice"],
    metric: "Success 92%",
    detail: "Customer langsung diarahkan ke tracking, bukan berhenti di layar ucapan terima kasih.",
    cta: "Lihat pesanan",
  },
  {
    id: "08",
    label: "Order Tracking",
    title: "Timeline status sinkron dari paid sampai packed dan shipped",
    accent: "from-cyan-500 to-sky-600",
    bullets: ["Status order", "Tracking log", "Detail resi"],
    metric: "SLA 24 jam",
    detail: "Tracking menjadi jembatan paling penting antara storefront dan operations.",
    cta: "Lacak kiriman",
  },
  {
    id: "09",
    label: "Delivered",
    title: "Konfirmasi barang diterima membuka jalur komplain, retur, dan loyalty",
    accent: "from-violet-500 to-purple-600",
    bullets: ["Konfirmasi", "Ajukan komplain", "Retur"],
    metric: "OTD 96%",
    detail: "Fase ini penting untuk menjaga trust pada pembelian bahan baku berulang.",
    cta: "Konfirmasi diterima",
  },
  {
    id: "10",
    label: "Review",
    title: "Review produk dan upload foto memperkuat social proof katalog JBD",
    accent: "from-fuchsia-500 to-pink-600",
    bullets: ["Rating", "Review", "Upload foto"],
    metric: "4.8/5 avg",
    detail: "Review bisa menjadi input untuk content agent dan rekomendasi produk.",
    cta: "Kirim review",
  },
  {
    id: "11",
    label: "Loyalty",
    title: "Poin, voucher, member level, dan repeat incentive menjaga retensi pembelian",
    accent: "from-orange-500 to-rose-500",
    bullets: ["Point", "Voucher", "Member level"],
    metric: "Repeat 42%",
    detail: "Cocok untuk model pembelian cafe, reseller, dan distributor kecil yang berulang.",
    cta: "Gunakan poin",
  },
];

export const executivePanels = [
  {
    title: "Commerce viability",
    text: "Flow belanja hingga order tracking sudah terbaca jelas dan meyakinkan.",
  },
  {
    title: "Operational discipline",
    text: "Setelah order paid, sistem masuk ke reserve, picking, QC, packing, lalu shipping.",
  },
  {
    title: "Growth storyline",
    text: "CRM, marketing automation, finance, analytics, dan AI ditampilkan sebagai layer lanjutan yang realistis.",
  },
];

export const workspaceCards = [
  {
    id: "storefront",
    label: "Storefront",
    title: "Customer app yang diturunkan langsung dari blueprint front-end journey",
    icon: Store,
    summary:
      "Fokus pada discovery sampai repeat order dengan pengalaman belanja yang cepat, jelas, dan kredibel untuk brand bahan baku minuman.",
    chips: ["Catalog", "Search", "Cart", "Checkout", "Tracking", "Loyalty"],
    metrics: [
      { label: "Conversion target", value: "3.2%" },
      { label: "Checkout completion", value: "89%" },
      { label: "Repeat purchase", value: "42%" },
    ],
    panels: [
      {
        title: "Landing & browse",
        text: "Promo, kategori rasa, benefit produk, dan rekomendasi SKU unggulan menjadi entry point utama.",
      },
      {
        title: "Product trust",
        text: "PDP menekankan komposisi, info gizi, cara penyajian, review, dan FAQ.",
      },
      {
        title: "Payment confidence",
        text: "QRIS, VA, dan e-wallet tampil jelas dengan order summary yang tidak bertele-tele.",
      },
    ],
  },
  {
    id: "admin",
    label: "Admin Commerce",
    title: "Back office untuk kontrol katalog, order, promo, customer, dan laporan",
    icon: LayoutDashboard,
    summary:
      "Area ini disusun seperti control tower: tim internal bisa memonitor jualan harian, stok, fulfillment, dan efektivitas campaign.",
    chips: ["Dashboard", "Product", "Inventory", "Order", "Promotion", "Reports"],
    metrics: [
      { label: "Orders today", value: "286" },
      { label: "Low stock alerts", value: "12" },
      { label: "GMV this month", value: "Rp 482jt" },
    ],
    panels: [
      {
        title: "Product & pricing",
        text: "Kelola varian rasa, bundle, tier pricing, dan promo campaign per channel.",
      },
      {
        title: "Order orchestration",
        text: "Pantau status paid, processing, packed, shipped, delivered dalam satu timeline.",
      },
      {
        title: "Business reporting",
        text: "Management melihat revenue, margin kasar, top product, dan campaign movement dengan cepat.",
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    title: "Fulfillment flow untuk gudang, QC, packing, dan shipping handoff",
    icon: Warehouse,
    summary:
      "Prototype ini menegaskan bahwa setelah customer bayar, sistem langsung masuk ke flow operasional yang tertib dan bisa dilacak.",
    chips: ["Reservation", "Picking", "QC", "Packing", "AWB", "Courier"],
    metrics: [
      { label: "Ready to ship", value: "74 order" },
      { label: "Avg pick time", value: "18 min" },
      { label: "Return rate", value: "1.4%" },
    ],
    panels: [
      {
        title: "Warehouse queue",
        text: "Order paid otomatis masuk reserve stock, lalu diteruskan ke picking list per gudang.",
      },
      {
        title: "Quality control",
        text: "QC check menjaga konsistensi rasa, kemasan, dan kondisi paket sebelum AWB dicetak.",
      },
      {
        title: "Shipping sync",
        text: "Resi, pickup, dan update transit siap dipantau dari storefront maupun admin.",
      },
    ],
  },
  {
    id: "intelligence",
    label: "AI & Insights",
    title: "Lapisan AI, analytics, dan finance untuk keputusan yang lebih cepat",
    icon: BrainCircuit,
    summary:
      "Bagian ini menyiapkan cerita besar JBD: bukan hanya jualan online, tapi platform commerce yang belajar dari data.",
    chips: ["CRM", "Automation", "Finance", "Analytics", "Forecast", "Decision"],
    metrics: [
      { label: "Segments active", value: "8" },
      { label: "Forecast variance", value: "6.1%" },
      { label: "Margin watchlist", value: "5 SKU" },
    ],
    panels: [
      {
        title: "CRM automation",
        text: "Welcome, abandoned cart, upsell, dan reactivation berjalan dari event transaksi yang sama.",
      },
      {
        title: "Finance visibility",
        text: "Revenue, HPP, gross profit, cash flow, dan expense summary menjadi bahan kontrol manajemen.",
      },
      {
        title: "Decision support",
        text: "AI agent membantu rekomendasi produk, follow-up order, dan alert stok atau margin.",
      },
    ],
  },
];

export const operationalTimeline = [
  {
    title: "Order paid",
    text: "Triggered by payment confirmation and pushed into order service.",
  },
  {
    title: "Stock reserved",
    text: "Inventory is reserved to prevent overselling on high-demand SKUs.",
  },
  {
    title: "Picking",
    text: "Picker receives actionable list by warehouse and batch priority.",
  },
  {
    title: "QC check",
    text: "QC confirms product, variant, and pack condition before boxing.",
  },
  {
    title: "Packing",
    text: "Packing completes bundle assembly, inserts, and sealing workflow.",
  },
  {
    title: "Print AWB",
    text: "AWB or label is issued for the selected courier integration.",
  },
  {
    title: "Courier pickup",
    text: "Courier pickup status updates both admin and customer tracking.",
  },
  {
    title: "In transit",
    text: "Transit milestones can feed notification and customer service.",
  },
  {
    title: "Delivered",
    text: "Delivery event unlocks review, loyalty, and post-purchase retention.",
  },
];

export const systemModules = [
  {
    icon: Package,
    title: "Commerce Core Engine",
    items: [
      "Product catalog, variant, nutrition, recipes",
      "Inventory, pricing, promotion, cart, checkout",
      "Order, payment, shipping, notification",
    ],
  },
  {
    icon: Warehouse,
    title: "Operations & Fulfillment",
    items: [
      "Stock reservation, picking, packing, QC",
      "Print AWB, courier pickup, return handling",
      "Warehouse and supplier readiness",
    ],
  },
  {
    icon: Users,
    title: "CRM & Automation",
    items: [
      "Segmentation, loyalty, wishlist, CS ticket",
      "Welcome flow, abandoned cart, upsell, reactivation",
      "WhatsApp, email, and campaign orchestration",
    ],
  },
  {
    icon: BrainCircuit,
    title: "AI Multi-Agent Layer",
    items: [
      "Content, sales, CS, finance, decision, forecast",
      "Reads commerce, customer, stock, and finance data",
      "Designed as leverage layer above core operations",
    ],
  },
];

export const storefrontMetrics = [
  { label: "Search to PDP", value: "36%", note: "Buyer cepat sampai produk relevan" },
  { label: "AOV target", value: "Rp 186k", note: "Terdorong bundle dan cross-sell" },
  { label: "Repeat window", value: "21 hari", note: "Cocok untuk pembelian stok ulang" },
];

export const productCategories = [
  "Chocolate",
  "Thai Tea",
  "Matcha",
  "Taro",
  "Red Velvet",
  "Coffee Base",
];

export const featuredProducts = [
  {
    slug: "chocolate-premium-500g",
    name: "JBD Chocolate Premium 500g",
    taste: "Dark chocolate, creamy finish",
    price: "Rp 89.000",
    numericPrice: 89000,
    imageTone: "bg-amber-200",
    tag: "Best seller",
    info: ["Hot & iced", "Margin tinggi", "Cafe-ready"],
    category: "Chocolate",
    rating: "4.9",
    sold: "2.8k",
    stock: 224,
    description:
      "Powder chocolate premium untuk minuman panas dan dingin dengan rasa cokelat pekat, body creamy, dan hasil konsisten untuk cafe.",
    composition: ["Cocoa blend", "Creamer", "Natural flavor", "Low moisture powder"],
    serving: "30g powder + 150ml milk/water. Shake or blend with ice.",
    variants: ["500g", "1kg", "Bundle 3 pcs"],
  },
  {
    slug: "matcha-latte-1kg",
    name: "JBD Matcha Latte 1kg",
    taste: "Fresh green tea profile",
    price: "Rp 156.000",
    numericPrice: 156000,
    imageTone: "bg-green-200",
    tag: "High repeat",
    info: ["Ceremonial blend", "Foam stable", "Premium menu"],
    category: "Matcha",
    rating: "4.8",
    sold: "1.4k",
    stock: 48,
    description:
      "Matcha latte powder untuk menu premium dengan warna hijau stabil, aroma teh segar, dan mouthfeel halus.",
    composition: ["Green tea powder", "Milk solid", "Creamer", "Fine sugar"],
    serving: "35g powder + 160ml milk. Stir hot or blend cold.",
    variants: ["500g", "1kg", "Horeca pack"],
  },
  {
    slug: "taro-signature-500g",
    name: "JBD Taro Signature 500g",
    taste: "Sweet taro aroma, purple tone",
    price: "Rp 94.000",
    numericPrice: 94000,
    imageTone: "bg-violet-200",
    tag: "New trend",
    info: ["Visual strong", "Kids favorite", "Impulse buy"],
    category: "Taro",
    rating: "4.7",
    sold: "930",
    stock: 29,
    description:
      "Taro powder signature dengan aroma manis, warna ungu menarik, dan cocok untuk menu booth atau drink bar.",
    composition: ["Taro flavor", "Creamer", "Milk solid", "Natural color"],
    serving: "30g powder + 150ml milk. Add ice for cold menu.",
    variants: ["500g", "1kg", "Starter bundle"],
  },
];

export const cartItems = [
  {
    productSlug: "chocolate-premium-500g",
    qty: 2,
    variant: "500g",
    note: "Untuk stok cafe weekend",
  },
  {
    productSlug: "matcha-latte-1kg",
    qty: 1,
    variant: "1kg",
    note: "Prioritaskan batch terbaru",
  },
];

export const orderSummary = {
  subtotal: 334000,
  discount: 25000,
  shipping: 18000,
  insurance: 3000,
  pointsUsed: 10000,
  total: 320000,
};

export const paymentOptions = [
  { name: "QRIS", share: "41%", icon: CreditCard },
  { name: "Virtual Account", share: "28%", icon: BadgeDollarSign },
  { name: "E-Wallet", share: "19%", icon: Activity },
  { name: "COD / Retail", share: "12%", icon: Truck },
];

export const trackingStatuses = [
  { status: "Paid", time: "09:42", state: "done" },
  { status: "Processing", time: "09:50", state: "done" },
  { status: "Packed", time: "11:10", state: "done" },
  { status: "Shipped", time: "14:20", state: "active" },
  { status: "Delivered", time: "ETA tomorrow", state: "upcoming" },
];

export const adminMetrics = [
  { label: "GMV bulan ini", value: "Rp 482jt", delta: "+14.2%" },
  { label: "Order paid hari ini", value: "286", delta: "+22 order" },
  { label: "Margin rata-rata", value: "37.8%", delta: "+1.4pt" },
  { label: "Low stock alert", value: "12 SKU", delta: "Perlu restock" },
];

export const adminOrders = [
  {
    id: "JBD-240605-0123",
    customer: "Kedai Teman Kopi",
    channel: "Storefront",
    total: "Rp 1.280.000",
    status: "Packed",
  },
  {
    id: "JBD-240605-0124",
    customer: "Booth Segar Malam",
    channel: "Distributor",
    total: "Rp 3.460.000",
    status: "Processing",
  },
  {
    id: "JBD-240605-0125",
    customer: "Reseller Nusa Rasa",
    channel: "WhatsApp assist",
    total: "Rp 860.000",
    status: "Paid",
  },
  {
    id: "JBD-240605-0126",
    customer: "Cafe Ruang Teduh",
    channel: "Storefront",
    total: "Rp 2.140.000",
    status: "Shipped",
  },
];

export const adminProductTabs = ["Basic Info", "Media", "Pricing", "Inventory", "SEO & AI"];

export const adminGeneratedDescription = {
  title: "JBD Chocolate Premium 500g",
  short:
    "Powder chocolate premium dengan rasa cokelat pekat, body creamy, dan hasil konsisten untuk menu hot, iced, maupun blended.",
  long:
    "JBD Chocolate Premium 500g dirancang untuk cafe, booth minuman, dan reseller yang membutuhkan powder chocolate stabil untuk operasional harian. Profil rasa dark chocolate memberi kesan premium, sementara tekstur creamy membantu menu terasa penuh tanpa proses penyajian yang rumit.",
  bullets: [
    "Cocok untuk hot chocolate, iced chocolate, frappe, dan menu signature cafe",
    "Rasa stabil untuk repeat order dan training barista baru",
    "Margin-friendly untuk cafe, booth, dan reseller",
    "Dapat dikombinasikan dengan topping, coffee base, atau milk tea",
  ],
};

export const adminProductActivities = [
  {
    time: "14:22",
    actor: "Catalog Admin",
    action: "Updated Chocolate Premium stock from 190 to 224",
  },
  {
    time: "13:40",
    actor: "AI Content Agent",
    action: "Generated PDP description for Matcha Latte 1kg",
  },
  {
    time: "11:18",
    actor: "Pricing Admin",
    action: "Applied Horeca tier pricing to 3 SKUs",
  },
  {
    time: "09:02",
    actor: "Inventory",
    action: "Marked Taro Signature as high risk stock",
  },
];

export const productHealth = [
  { sku: "Chocolate 500g", stock: "224", velocity: "Fast", price: "Rp 89k" },
  { sku: "Thai Tea 1kg", stock: "118", velocity: "Medium", price: "Rp 148k" },
  { sku: "Matcha 500g", stock: "48", velocity: "Fast", price: "Rp 96k" },
  { sku: "Taro 500g", stock: "29", velocity: "High risk", price: "Rp 94k" },
];

export const campaigns = [
  { name: "Bundling Horeca Starter", revenue: "Rp 62jt", roas: "4.1x" },
  { name: "Chocolate Best Seller Push", revenue: "Rp 48jt", roas: "5.3x" },
  { name: "Loyalty Repeat Week", revenue: "Rp 29jt", roas: "3.6x" },
];

export const operationsMetrics = [
  { label: "Orders ready to ship", value: "74", note: "Tersebar di 2 gudang" },
  { label: "Average pick time", value: "18 min", note: "Sesuai SLA internal" },
  { label: "Return requests", value: "4", note: "2 quality, 2 transit issue" },
];

export const warehouseQueue = [
  { stage: "Stock reservation", count: 24, tone: "bg-amber-100 text-amber-700", href: "/operations/picking" },
  { stage: "Picking", count: 18, tone: "bg-sky-100 text-sky-700", href: "/operations/picking" },
  { stage: "QC check", count: 11, tone: "bg-violet-100 text-violet-700", href: "/operations/qc" },
  { stage: "Packing", count: 21, tone: "bg-emerald-100 text-emerald-700", href: "/operations/packing" },
];

export const warehouseTasks = [
  {
    title: "Gudang Bekasi",
    lines: ["42 order aktif", "Fast-moving SKU: Chocolate, Thai Tea", "Printer AWB online"],
  },
  {
    title: "Gudang Surabaya",
    lines: ["32 order aktif", "Low stock Matcha 500g", "1 retur menunggu verifikasi"],
  },
  {
    title: "Procurement",
    lines: ["3 PO bahan baku open", "Lead time susu bubuk 5 hari", "Safety stock review Jumat"],
  },
];

export const returnsBoard = [
  { ref: "RET-0102", item: "Taro 500g", issue: "Seal rusak", status: "Verifikasi" },
  { ref: "RET-0103", item: "Chocolate 1kg", issue: "Salah varian", status: "Approved" },
  { ref: "RET-0104", item: "Thai Tea 500g", issue: "Transit damage", status: "Replacement" },
];

export const pickingTasks = [
  { id: "PK-8821", order: "JBD-240605-0123", sku: "Chocolate Premium 500g", qty: 12, bin: "BKS-A1-04", status: "Ready" },
  { id: "PK-8822", order: "JBD-240605-0124", sku: "Matcha Latte 1kg", qty: 8, bin: "BKS-B2-02", status: "Picking" },
  { id: "PK-8823", order: "JBD-240605-0125", sku: "Taro Signature 500g", qty: 6, bin: "SBY-C1-09", status: "Queued" },
];

export const qcChecklist = [
  "Produk dan varian sesuai order",
  "Seal kemasan aman",
  "Batch dan expiry terbaca",
  "Jumlah item sesuai picklist",
  "Kardus dan bubble wrap layak kirim",
];

export const packingJobs = [
  { order: "JBD-240605-0123", box: "BOX-M", weight: "3.4 kg", awb: "Ready" },
  { order: "JBD-240605-0124", box: "BOX-L", weight: "8.2 kg", awb: "Waiting" },
  { order: "JBD-240605-0126", box: "BOX-S", weight: "1.6 kg", awb: "Printed" },
];

export const procurementItems = [
  { item: "Cocoa powder base", supplier: "PT Bahan Rasa Prima", eta: "3 hari", status: "PO sent" },
  { item: "Milk solid", supplier: "CV Dairy Nusantara", eta: "5 hari", status: "Waiting invoice" },
  { item: "Standing pouch 500g", supplier: "Kemasan Jaya", eta: "2 hari", status: "In transit" },
];

export const crmSegments = [
  { name: "New customer", size: "1,248", action: "Welcome flow", href: "/insights/crm" },
  { name: "Active cafe", size: "312", action: "Repeat replenishment", href: "/insights/crm" },
  { name: "VIP reseller", size: "86", action: "Member pricing", href: "/insights/crm" },
  { name: "At risk", size: "174", action: "Reactivation promo", href: "/insights/crm" },
];

export const automationCards = [
  { title: "Welcome message", metric: "Open rate 68%", trigger: "Customer registered", channel: "WhatsApp" },
  { title: "Abandoned cart", metric: "Recovered Rp 14jt", trigger: "Cart idle 2h", channel: "Email + WA" },
  { title: "Upsell / Cross-sell", metric: "AOV +11%", trigger: "Order delivered", channel: "In-app" },
  { title: "Birthday / Flash promo", metric: "CTR 8.2%", trigger: "Date based", channel: "WA blast" },
];

export const financeMetrics = [
  { label: "Revenue", value: "Rp 482jt", tone: "text-emerald-700" },
  { label: "HPP", value: "Rp 286jt", tone: "text-slate-700" },
  { label: "Gross profit", value: "Rp 196jt", tone: "text-blue-700" },
  { label: "Cash flow", value: "Healthy", tone: "text-violet-700" },
];

export const financeRows = [
  { label: "Order paid", value: "Rp 482.000.000", type: "AR" },
  { label: "Settlement gateway", value: "Rp 469.400.000", type: "Cash in" },
  { label: "HPP bahan baku", value: "Rp 286.000.000", type: "COGS" },
  { label: "Marketing cost", value: "Rp 38.500.000", type: "Opex" },
  { label: "Net profit estimate", value: "Rp 121.700.000", type: "Profit" },
];

export const agentWorkflows = [
  { agent: "Content Agent", input: "Product catalog + trend", output: "PDP copy, banner, recipe content" },
  { agent: "Sales Agent", input: "Cart + order history", output: "Follow-up WA, repeat order suggestion" },
  { agent: "CS Agent", input: "Ticket + tracking", output: "Auto reply, refund instruction" },
  { agent: "Finance Agent", input: "Order paid + HPP", output: "Margin alert, cashflow summary" },
  { agent: "Forecast Agent", input: "Sales velocity + stock", output: "Demand forecast, reorder suggestion" },
];

export const analyticCards = [
  {
    title: "Top product contribution",
    text: "Chocolate Premium menyumbang 24% revenue bulanan dan menjadi anchor untuk bundling.",
    icon: ChartColumn,
  },
  {
    title: "Customer retention signal",
    text: "Reseller dan cafe kecil menunjukkan window repeat tercepat pada hari ke-21 sampai ke-28.",
    icon: Users,
  },
  {
    title: "Margin watch",
    text: "Matcha 500g dan Red Velvet 1kg perlu penyesuaian harga atau efisiensi promo.",
    icon: Percent,
  },
];

export const aiAgents = [
  {
    title: "Content Agent",
    text: "Menyusun deskripsi produk, banner copy, recipe content, dan materi promo.",
    icon: MessageSquareMore,
  },
  {
    title: "Sales Agent",
    text: "Mendorong follow-up order, abandoned cart recovery, dan rekomendasi repeat order.",
    icon: BadgeDollarSign,
  },
  {
    title: "Decision Agent",
    text: "Memberi alert SKU cepat habis, promo underperform, dan peluang upsell lintas kategori.",
    icon: BrainCircuit,
  },
];

export const presentationChecklist = [
  "Customer journey end-to-end terlihat jelas",
  "Storefront, admin, operations, dan insights punya route terpisah",
  "Blueprint source tertanam di prototype",
  "UI cukup polished untuk dibuka langsung saat meeting",
  "App lolos lint dan production build",
];
