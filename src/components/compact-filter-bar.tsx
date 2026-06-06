import Link from "next/link";
import { ArrowDownUp, Check, Filter, Tags } from "lucide-react";

export function CompactFilterBar({
  categories,
  sorts = ["Best seller", "Terbaru", "Termurah"],
  filters = ["Ready stock", "Promo aktif", "Rating 4.8+", "Kemasan ekonomis"],
  currentParams = {},
}: {
  categories: string[];
  sorts?: string[];
  filters?: string[];
  currentParams?: Record<string, string | undefined>;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-[22px] border border-slate-200 bg-white p-2 shadow-sm">
      <DropdownButton param="category" icon="category" label="Kategori" items={categories} align="left" currentParams={currentParams} />
      <DropdownButton param="sort" icon="sort" label="Sort" items={sorts} align="center" currentParams={currentParams} />
      <DropdownButton param="filter" icon="filter" label="Filter" items={filters} align="right" currentParams={currentParams} />
    </div>
  );
}

function DropdownButton({
  icon,
  param,
  label,
  items,
  align,
  currentParams,
}: {
  icon: "category" | "sort" | "filter";
  param: string;
  label: string;
  items: string[];
  align: "left" | "center" | "right";
  currentParams: Record<string, string | undefined>;
}) {
  const Icon = icon === "category" ? Tags : icon === "sort" ? ArrowDownUp : Filter;
  return (
    <details className="group relative min-w-0">
      <summary className="flex h-11 min-w-0 cursor-pointer list-none items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 sm:gap-2 sm:px-4 sm:text-sm">
        <Icon className="h-4 w-4 text-emerald-700" />
        <span className="truncate">{label}</span>
      </summary>
      <div
        className={`absolute z-40 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ${
          align === "left" ? "left-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "right-0"
        }`}
      >
        {items.map((item) => {
          const query = new URLSearchParams();
          Object.entries(currentParams).forEach(([key, value]) => {
            if (value) query.set(key, value);
          });
          query.set(param, item);
          const active = currentParams[param] === item;
          return (
            <Link
              key={item}
              href={`?${query.toString()}`}
              className={`flex h-10 w-full items-center justify-between rounded-xl px-3 text-left text-sm ${
                active ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {item}
              {active ? <Check className="h-3.5 w-3.5 opacity-70" /> : null}
            </Link>
          );
        })}
      </div>
    </details>
  );
}
