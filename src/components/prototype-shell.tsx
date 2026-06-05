"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { topStatus, navItems, appSidebarMenus } from "@/lib/prototype-data";

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const activeApp = useMemo(() => {
    if (pathname.startsWith("/storefront")) return "storefront";
    if (pathname.startsWith("/admin")) return "admin";
    if (pathname.startsWith("/operations")) return "operations";
    if (pathname.startsWith("/insights")) return "insights";
    return "overview";
  }, [pathname]);
  const sidebarItems = useMemo(() => {
    return activeApp === "overview" ? [] : appSidebarMenus[activeApp] ?? [];
  }, [activeApp]);
  const hasSidebar = sidebarItems.length > 0;
  const activeSidebarItem = useMemo(() => {
    const matches = sidebarItems.filter((item) => {
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    });
    return matches.sort((a, b) => b.href.length - a.href.length)[0];
  }, [pathname, sidebarItems]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbf8_0%,#ffffff_28%,#f6faf7_100%)] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-emerald-100 bg-white/92 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-700 text-lg font-semibold text-white">
                J
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                  JBD Digital Commerce
                </p>
                <h1 className="text-lg font-semibold text-slate-900">
                  Prototype Management Preview
                </h1>
              </div>
            </Link>
            <div className="hidden items-center gap-3 xl:flex">
              {topStatus.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium text-slate-700">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.shortLabel}
                  </Link>
                );
              })}
            </nav>
            {hasSidebar ? (
              <button
                type="button"
                onClick={() => setSidebarOpen((value) => !value)}
                className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm"
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeftOpen className="h-4 w-4" />
                )}
                {sidebarOpen ? "Hide menu" : "Show menu"}
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <div
        className={`mx-auto grid w-full max-w-7xl gap-6 px-6 py-8 lg:px-8 ${
          hasSidebar && sidebarOpen ? "xl:grid-cols-[280px_1fr]" : "grid-cols-1"
        }`}
      >
        {hasSidebar && sidebarOpen ? (
          <aside className="xl:sticky xl:top-[172px] xl:h-[calc(100vh-200px)]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3 px-2 py-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Feature Menu
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {activeApp === "storefront"
                      ? "Customer app"
                      : activeApp === "admin"
                        ? "Back office"
                        : activeApp === "operations"
                          ? "Warehouse ops"
                          : "Intelligence"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </div>
              <nav className="mt-3 grid gap-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeSidebarItem?.href === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-start gap-3 rounded-2xl px-3 py-3 transition ${
                        active
                          ? "bg-slate-950 text-white"
                          : "bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          active ? "bg-white/10 text-white" : "bg-white text-emerald-700"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{item.label}</span>
                        <span className={`mt-1 block text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>
                          {item.description}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>
        ) : null}

        <section className="flex min-w-0 flex-col gap-8">
          {hasSidebar && !sidebarOpen ? (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm"
            >
              <PanelLeftOpen className="h-4 w-4" />
              Show feature menu
            </button>
          ) : null}
          <div className={compact ? "space-y-2" : "space-y-4"}>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              {eyebrow}
            </div>
            {activeSidebarItem ? (
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span>Current feature</span>
                <span className="rounded-full bg-slate-950 px-3 py-1 font-medium text-white">
                  {activeSidebarItem.label}
                </span>
              </div>
            ) : null}
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
    </main>
  );
}
