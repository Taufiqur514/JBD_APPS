"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Banknote,
  Boxes,
  BookOpen,
  BrainCircuit,
  ChartColumn,
  ClipboardCheck,
  Home,
  FileSpreadsheet,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquareMore,
  PackagePlus,
  PanelLeftClose,
  PanelLeftOpen,
  ScanLine,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  Tags,
  Truck,
  User,
  Video,
  Warehouse,
} from "lucide-react";
import { navItems, topStatus } from "@/lib/prototype-data";

type TopActionItem = {
  href: string;
  label: string;
  icon: typeof Store;
  dark?: boolean;
};

const bottomNav = {
  storefront: [
    { href: "/storefront", label: "Beranda", icon: Home },
    { href: "/storefront/live", label: "Live", icon: Video },
    { href: "/storefront/recipes", label: "Resep", icon: BookOpen },
    { href: "/storefront/notifications", label: "Notif", icon: Bell },
    { href: "/storefront/profile", label: "Profil", icon: User },
  ],
  admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Produk", icon: Boxes },
    { href: "/admin/orders", label: "Order", icon: ShoppingCart },
    { href: "/operations", label: "Ops", icon: Warehouse },
    { href: "/admin/analytics", label: "Data", icon: ChartColumn },
  ],
  operations: [
    { href: "/operations", label: "Ops", icon: Warehouse },
    { href: "/operations/picking", label: "Picking", icon: ScanLine },
    { href: "/operations/packing", label: "Packing", icon: Boxes },
    { href: "/operations/returns", label: "Retur", icon: Truck },
  ],
  insights: [
    { href: "/insights", label: "Insight", icon: BrainCircuit },
    { href: "/insights/crm", label: "CRM", icon: User },
    { href: "/insights/automation", label: "Auto", icon: Bell },
    { href: "/insights/reports", label: "Report", icon: ChartColumn },
  ],
  finance: [
    { href: "/finance", label: "Finance", icon: LayoutDashboard },
    { href: "/finance?view=receivables", label: "AR", icon: Banknote },
    { href: "/finance?view=payables", label: "AP", icon: FileSpreadsheet },
    { href: "/finance?view=cashflow", label: "Cashflow", icon: ChartColumn },
  ],
} as const;

function getCachedHeaderCounts() {
  if (typeof window === "undefined") return { cart: 0, notifications: 0 };
  const cachedHeader = window.sessionStorage.getItem("jbd-header-counts");
  if (!cachedHeader) return { cart: 0, notifications: 0 };
  try {
    const parsed = JSON.parse(cachedHeader) as { cart?: number; notifications?: number; cachedAt?: number };
    if (parsed.cachedAt && Date.now() - parsed.cachedAt < 4_000) {
      return { cart: Number(parsed.cart ?? 0), notifications: Number(parsed.notifications ?? 0) };
    }
  } catch {
    window.sessionStorage.removeItem("jbd-header-counts");
  }
  return { cart: 0, notifications: 0 };
}

function getCachedSessionRole() {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem("jbd-session-role") ?? "";
}

export function PrototypeShell({
  eyebrow,
  title,
  description,
  children,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [suiteNavOpen, setSuiteNavOpen] = useState(false);
  const [headerCounts, setHeaderCounts] = useState({ cart: 0, notifications: 0 });
  const [sessionRole, setSessionRole] = useState("");
  const activeApp = useMemo(() => {
    if (pathname.startsWith("/storefront")) return "storefront";
    if (pathname.startsWith("/finance")) return "finance";
    if (pathname.startsWith("/operations")) return "operations";
    if (pathname.startsWith("/insights")) return "insights";
    if (pathname.startsWith("/admin")) return "admin";
    return "overview";
  }, [pathname]);
  const appNavItems = useMemo(() => (activeApp === "overview" ? [] : bottomNav[activeApp] ?? []), [activeApp]);
  const appName =
    activeApp === "storefront"
      ? "Frontstore Web"
      : activeApp === "admin"
        ? "Admin Console"
        : activeApp === "finance"
          ? "Finance Workspace"
        : "Overview";
  const isStorefrontHome = activeApp === "storefront" && pathname === "/storefront";
  const desktopConsoleApp = activeApp === "admin" || activeApp === "operations" || activeApp === "insights" || activeApp === "finance"
    ? activeApp
    : null;

  useEffect(() => {
    let active = true;
    const cachedRole = getCachedSessionRole();
    if (cachedRole) {
      queueMicrotask(() => {
        if (active) setSessionRole(cachedRole);
      });
    }
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((session) => {
        const role = String(session.role ?? "");
        window.sessionStorage.setItem("jbd-session-role", role);
        if (active) setSessionRole(role);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (activeApp !== "storefront") return;
    let active = true;
    const cachedCounts = getCachedHeaderCounts();
    if (cachedCounts.cart || cachedCounts.notifications) {
      queueMicrotask(() => {
        if (active) setHeaderCounts(cachedCounts);
      });
    }
    const cachedHeader = window.sessionStorage.getItem("jbd-header-counts");
    if (cachedHeader) {
      try {
        const parsed = JSON.parse(cachedHeader) as { cart?: number; notifications?: number; cachedAt?: number };
        if (parsed.cachedAt && Date.now() - parsed.cachedAt < 4_000) {
          return () => {
            active = false;
          };
        }
      } catch {
        window.sessionStorage.removeItem("jbd-header-counts");
      }
    }
    fetch("/api/header-status")
      .then((response) => response.json())
      .then((data) => {
        const nextCounts = { cart: Number(data.cart ?? 0), notifications: Number(data.notifications ?? 0) };
        window.sessionStorage.setItem("jbd-header-counts", JSON.stringify({ ...nextCounts, cachedAt: Date.now() }));
        if (active) setHeaderCounts(nextCounts);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [activeApp]);

  useEffect(() => {
    const hrefs = new Set<string>();
    appNavItems.forEach((item) => hrefs.add(item.href));
    navItems.forEach((item) => {
      if (item.href !== "/finance" || sessionRole === "finance") hrefs.add(item.href);
    });
    hrefs.forEach((href) => router.prefetch(href));
  }, [appNavItems, router, sessionRole]);

  return (
    <main
      className={`min-h-screen bg-[linear-gradient(180deg,#f7fbf8_0%,#ffffff_28%,#f6faf7_100%)] text-slate-900 ${
        activeApp === "overview" ? "" : "pb-24 lg:pb-0"
      }`}
    >
      <header className="sticky top-0 z-30 border-b border-emerald-100 bg-white/94 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-3 py-2 lg:px-8 lg:py-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-sm font-semibold text-white lg:h-11 lg:w-11">
                J
              </div>
              <div className="min-w-0">
                <p className="truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-700 lg:text-xs">
                  JBD Digital Commerce
                </p>
                <h1 className="truncate text-xs font-semibold text-slate-900 lg:text-base">
                  {appName}
                </h1>
              </div>
            </Link>

            <div className="hidden items-center gap-2 xl:flex">
              {topStatus.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm"
                  >
                    <Icon className="h-4 w-4 text-emerald-700" />
                    <p className="text-xs font-medium text-slate-600">{item.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link href="/login" className="inline-flex h-9 items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 shadow-sm">
                <User className="h-4 w-4" />
                Login
              </Link>
              <button
                type="button"
                onClick={() => setSuiteNavOpen((value) => !value)}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm"
              >
                {suiteNavOpen ? "Hide" : "Apps"}
                {suiteNavOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {suiteNavOpen ? (
            <nav className="grid grid-cols-2 gap-2 rounded-[18px] border border-slate-200 bg-white p-2 shadow-sm sm:grid-cols-5">
              {navItems.map((item) => {
                if (item.href === "/finance" && sessionRole !== "finance") return null;
                const Icon = item.icon;
                const active =
                  item.href === "/admin"
                    ? pathname.startsWith("/admin") || pathname.startsWith("/operations") || pathname.startsWith("/insights")
                    : item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  className={`flex h-9 items-center justify-center gap-2 rounded-full px-3 text-xs font-semibold ${
                      active ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.shortLabel}
                  </Link>
                );
              })}
            </nav>
          ) : null}

          {activeApp !== "overview" ? <AppTopBar activeApp={activeApp} pathname={pathname} headerCounts={headerCounts} /> : null}
        </div>
      </header>

      <div className={`mx-auto w-full px-4 py-5 lg:px-8 lg:py-7 ${
        activeApp === "storefront" ? "max-w-[1500px]" : "max-w-7xl"
      }`}>
        <div className={desktopConsoleApp ? "lg:grid lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-6" : ""}>
          {desktopConsoleApp ? <DesktopConsoleRail activeApp={desktopConsoleApp} pathname={pathname} sessionRole={sessionRole} /> : null}
          <section className="flex min-w-0 flex-col gap-6">
          <div className={`${compact ? "space-y-2" : "space-y-4"} ${isStorefrontHome ? "lg:hidden" : ""}`}>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              {eyebrow}
            </div>
            <h2
              className={
                compact
                  ? "text-2xl font-semibold tracking-tight text-slate-950 lg:text-3xl"
                  : "text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl"
              }
            >
              {title}
            </h2>
            {description ? (
              <p
                className={
                  compact
                    ? "max-w-3xl text-sm leading-6 text-slate-600"
                    : "max-w-3xl text-base leading-7 text-slate-600 lg:text-lg"
                }
              >
                {description}
              </p>
            ) : null}
          </div>
          {children}
        </section>
        </div>
      </div>

      {appNavItems.length ? (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/96 px-2 py-2 shadow-[0_-12px_30px_rgba(15,23,42,0.10)] backdrop-blur lg:hidden">
          <div className={`mx-auto grid max-w-lg gap-1 ${appNavItems.length === 5 ? "grid-cols-5" : "grid-cols-4"}`}>
            {appNavItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === `/${activeApp}`
                  ? pathname === item.href ||
                    (activeApp === "storefront" &&
                      (pathname.startsWith("/storefront/products") ||
                        pathname.startsWith("/storefront/search") ||
                        pathname.startsWith("/storefront/cart") ||
                        pathname.startsWith("/storefront/checkout") ||
                        pathname.startsWith("/storefront/payment") ||
                        pathname.startsWith("/storefront/orders") ||
                        pathname.startsWith("/storefront/review") ||
                        pathname.startsWith("/storefront/loyalty")))
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold ${
                    active ? "bg-emerald-50 text-emerald-800" : "text-slate-500"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </main>
  );
}

function DesktopConsoleRail({
  activeApp,
  pathname,
  sessionRole,
}: {
  activeApp: "storefront" | "admin" | "operations" | "insights" | "finance";
  pathname: string;
  sessionRole: string;
}) {
  const groups = [
    {
      label: "Commerce",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/products", label: "Product catalog", icon: Boxes },
        { href: "/admin/orders", label: "Order center", icon: ShoppingCart },
        { href: "/admin/assets", label: "Media library", icon: ImageIcon },
      ],
    },
    {
      label: "Operations",
      items: [
        { href: "/operations", label: "Fulfillment queue", icon: Warehouse },
        { href: "/operations/picking", label: "Picking", icon: ScanLine },
        { href: "/operations/packing", label: "Packing & AWB", icon: ClipboardCheck },
        { href: "/admin/inventory", label: "Inventory/WMS", icon: Boxes },
      ],
    },
    {
      label: "Growth",
      items: [
        { href: "/admin/crm", label: "CRM", icon: User },
        { href: "/admin/promotions", label: "Promotions", icon: Tags },
        { href: "/admin/analytics", label: "Analytics", icon: ChartColumn },
        { href: "/admin/notifications", label: "Notifications", icon: Bell },
      ],
    },
    {
      label: "Finance",
      items: sessionRole === "finance"
        ? [{ href: "/finance", label: "Finance workspace", icon: Banknote }]
        : [],
    },
  ];

  return (
    <aside className="sticky top-[132px] hidden h-[calc(100vh-156px)] overflow-y-auto rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm lg:block">
      <div className="rounded-2xl bg-slate-950 p-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Web Console</p>
        <p className="mt-2 text-sm leading-5 text-slate-300">Admin, operations, insight, dan kontrol bisnis dalam layout desktop.</p>
      </div>
      <nav className="mt-4 space-y-5">
        {groups.map((group) => group.items.length ? (
          <div key={group.label}>
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{group.label}</p>
            <div className="mt-2 grid gap-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = item.href === "/admin"
                  ? pathname === "/admin"
                  : item.href === "/operations"
                    ? activeApp === "operations" && pathname === "/operations"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                      active ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null)}
      </nav>
    </aside>
  );
}

function AppTopBar({
  activeApp,
  pathname,
  headerCounts,
}: {
  activeApp: "storefront" | "admin" | "operations" | "insights" | "finance";
  pathname: string;
  headerCounts: { cart: number; notifications: number };
}) {
  if (activeApp === "storefront") {
    return (
      <div className="grid gap-2 rounded-[18px] border border-emerald-100 bg-emerald-50/70 p-1.5 md:grid-cols-[1fr_auto] md:items-center md:p-3">
        <form
          action="/storefront/search"
          className="flex min-h-9 items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 text-xs text-slate-500 shadow-sm md:min-h-11 md:text-sm"
        >
          <Search className="h-4 w-4 text-emerald-700" />
          <input
            name="q"
            aria-label="Cari produk"
            placeholder="Cari powder, rasa, bundle, kemasan, atau resep minuman"
            className="min-w-0 flex-1 bg-transparent text-slate-700 outline-none placeholder:text-slate-500"
          />
          <button type="submit" className="rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white">
            Cari
          </button>
        </form>
        <div className="flex min-w-0 gap-1.5 md:gap-2">
          <Link href="/storefront/cart" className="relative flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-slate-950 px-2 text-xs font-semibold text-white md:h-11 md:flex-none md:gap-2 md:px-3 md:text-sm">
            <ShoppingCart className="h-4 w-4" />
            Keranjang
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-amber-400 px-1 text-[11px] text-slate-950">{headerCounts.cart}</span>
          </Link>
          <Link href="/storefront/chat" className="relative flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-white px-2 text-xs font-semibold text-emerald-800 md:h-11 md:flex-none md:gap-2 md:px-3 md:text-sm">
            <MessageSquareMore className="h-4 w-4" />
            Chat
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-emerald-600 px-1 text-[11px] text-white">{headerCounts.notifications}</span>
          </Link>
        </div>
      </div>
    );
  }

  if (activeApp === "admin") {
    return <ContextualTopActions items={adminTopActions(pathname)} />;
  }

  if (activeApp === "operations") {
    return <ContextualTopActions items={operationsTopActions(pathname)} />;
  }

  if (activeApp === "finance") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-[18px] border border-indigo-200 bg-indigo-50 p-2 text-indigo-950">
        <span className="inline-flex items-center gap-2 text-xs font-semibold md:text-sm">
          <ShieldCheck className="h-4 w-4" />
          Confidential Finance Access
        </span>
        <Link href="/login" className="rounded-full bg-white px-3 py-2 text-xs font-semibold shadow-sm">
          Ganti akun
        </Link>
      </div>
    );
  }

  return <ContextualTopActions items={insightsTopActions(pathname)} />;
}

function adminTopActions(pathname: string): TopActionItem[] {
  if (pathname.startsWith("/admin/products")) {
    return [
      { href: "/admin/products", icon: Search, label: "Cari SKU" },
      { href: "/admin/products/categories", icon: Tags, label: "Kategori" },
      { href: "/admin/products/new", icon: PackagePlus, label: "Tambah produk", dark: true },
      { href: "/admin/products/bulk-upload", icon: FileSpreadsheet, label: "Bulk upload" },
      { href: "/admin/assets", icon: ImageIcon, label: "Media produk" },
      { href: "/admin/inventory", icon: Boxes, label: "Stok SKU" },
    ];
  }
  if (pathname.startsWith("/admin/orders")) {
    return [
      { href: "/admin/orders", icon: ShoppingCart, label: "Daftar order", dark: true },
      { href: "/operations/picking", icon: ScanLine, label: "Picking" },
      { href: "/operations/packing", icon: Boxes, label: "Packing" },
      { href: "/operations/returns", icon: Truck, label: "Retur" },
      { href: "/admin/notifications", icon: MessageSquareMore, label: "Notif order" },
    ];
  }
  if (pathname.startsWith("/admin/analytics")) {
    return [
      { href: "/admin/analytics", icon: ChartColumn, label: "Dashboard data", dark: true },
      { href: "/insights/reports", icon: FileSpreadsheet, label: "Reports" },
      { href: "/insights/ai", icon: BrainCircuit, label: "AI forecast" },
      { href: "/admin/promotions", icon: Bell, label: "ROAS promo" },
    ];
  }
  if (pathname.startsWith("/admin/crm")) {
    return [
      { href: "/admin/crm", icon: User, label: "Customer" , dark: true },
      { href: "/admin/notifications", icon: MessageSquareMore, label: "Ticket CS" },
      { href: "/admin/promotions", icon: Bell, label: "Voucher" },
      { href: "/insights/crm", icon: ChartColumn, label: "Segmentasi" },
    ];
  }
  if (pathname.startsWith("/admin/promotions")) {
    return [
      { href: "/admin/promotions", icon: Bell, label: "Promo engine", dark: true },
      { href: "/storefront/profile/vouchers", icon: Tags, label: "Voucher" },
      { href: "/insights/automation", icon: BrainCircuit, label: "Campaign" },
    ];
  }
  if (pathname.startsWith("/admin/assets")) {
    return [
      { href: "/admin/assets", icon: ImageIcon, label: "Asset library", dark: true },
      { href: "/admin/products/new?tab=media", icon: PackagePlus, label: "Media produk" },
      { href: "/storefront/live", icon: Video, label: "Preview reel" },
      { href: "/storefront/recipes", icon: BookOpen, label: "Preview resep" },
    ];
  }
  if (pathname.startsWith("/admin/inventory")) {
    return [
      { href: "/admin/inventory", icon: Boxes, label: "Inventory", dark: true },
      { href: "/operations", icon: Warehouse, label: "Warehouse" },
      { href: "/operations/procurement", icon: ClipboardCheck, label: "Procurement" },
      { href: "/operations/qc", icon: Settings, label: "QC" },
    ];
  }
  return [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard", dark: true },
    { href: "/admin/orders", icon: ShoppingCart, label: "Order hari ini" },
    { href: "/admin/products", icon: Boxes, label: "Produk" },
    { href: "/admin/crm", icon: User, label: "CRM" },
    { href: "/admin/analytics", icon: ChartColumn, label: "Analytics" },
  ];
}

function operationsTopActions(pathname: string): TopActionItem[] {
  if (pathname.startsWith("/operations/picking")) {
    return [
      { href: "/operations/picking", icon: ScanLine, label: "Picklist", dark: true },
      { href: "/admin/orders", icon: ShoppingCart, label: "Order paid" },
      { href: "/admin/inventory", icon: Boxes, label: "Stok reserved" },
    ];
  }
  if (pathname.startsWith("/operations/packing")) {
    return [
      { href: "/operations/packing", icon: Boxes, label: "Packing", dark: true },
      { href: "/operations/qc", icon: Settings, label: "QC" },
      { href: "/admin/orders", icon: ShoppingCart, label: "Print AWB" },
      { href: "/storefront/orders/JBD-260609-9007", icon: Truck, label: "Tracking" },
    ];
  }
  if (pathname.startsWith("/operations/returns")) {
    return [
      { href: "/operations/returns", icon: Truck, label: "Retur", dark: true },
      { href: "/admin/orders", icon: ShoppingCart, label: "Order detail" },
      { href: "/admin/notifications", icon: MessageSquareMore, label: "Ticket CS" },
    ];
  }
  return [
    { href: "/operations", icon: Warehouse, label: "Queue", dark: true },
    { href: "/operations/picking", icon: ScanLine, label: "Picking" },
    { href: "/operations/packing", icon: Boxes, label: "Packing" },
    { href: "/operations/returns", icon: Truck, label: "Retur" },
    { href: "/admin/inventory", icon: Warehouse, label: "WMS stock" },
  ];
}

function insightsTopActions(pathname: string): TopActionItem[] {
  if (pathname.startsWith("/insights/crm")) {
    return [
      { href: "/insights/crm", icon: User, label: "CRM insight", dark: true },
      { href: "/admin/crm", icon: MessageSquareMore, label: "Customer data" },
      { href: "/insights/reports", icon: ChartColumn, label: "Cohort" },
    ];
  }
  if (pathname.startsWith("/insights/automation")) {
    return [
      { href: "/insights/automation", icon: Bell, label: "Campaign", dark: true },
      { href: "/admin/promotions", icon: Tags, label: "Promo rules" },
      { href: "/admin/notifications", icon: MessageSquareMore, label: "Notif" },
    ];
  }
  if (pathname.startsWith("/insights/reports")) {
    return [
      { href: "/insights/reports", icon: ChartColumn, label: "Reports", dark: true },
      { href: "/admin/analytics", icon: FileSpreadsheet, label: "Analytics" },
      { href: "/finance", icon: Banknote, label: "Finance" },
    ];
  }
  return [
    { href: "/insights", icon: BrainCircuit, label: "Insight", dark: true },
    { href: "/insights/crm", icon: User, label: "CRM" },
    { href: "/insights/automation", icon: Bell, label: "Campaign" },
    { href: "/insights/reports", icon: ChartColumn, label: "Dashboard" },
  ];
}

function ContextualTopActions({ items }: { items: TopActionItem[] }) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-[18px] border border-slate-200 bg-white p-1.5 shadow-sm">
      {items.map((item) => (
        <TopAction key={`${item.href}-${item.label}`} {...item} />
      ))}
    </div>
  );
}

function TopAction({
  href,
  icon: Icon,
  label,
  dark = false,
}: {
  href: string;
  icon: typeof Store;
  label: string;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch
      className={`flex h-9 shrink-0 items-center justify-center gap-2 rounded-full px-3 text-xs font-semibold md:h-10 md:text-sm ${
        dark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
