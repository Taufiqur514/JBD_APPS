import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";

export function MetricCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{note}</p>
    </div>
  );
}

export function DarkInfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start gap-3">
        <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
        <div>
          <p className="font-medium text-white">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-300">{text}</p>
        </div>
      </div>
    </div>
  );
}

export function SoftPanel({
  icon: Icon,
  title,
  text,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-base font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="max-w-3xl">
        <h3 className="text-2xl font-semibold text-slate-950">{title}</h3>
        {description ? (
          <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
        ) : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 text-sm leading-6 text-slate-600">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function FlowHandoff({
  steps,
}: {
  steps: Array<{ label: string; title: string; text: string; href: string; active?: boolean }>;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => (
          <Link
            key={step.title}
            href={step.href}
            className={`relative rounded-2xl border p-4 transition hover:border-emerald-300 hover:bg-white ${
              step.active ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold ${step.active ? "bg-emerald-700 text-white" : "bg-white text-slate-700"}`}>
                {index + 1}
              </span>
              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                {step.label}
              </span>
            </div>
            <p className="mt-4 font-semibold text-slate-950">{step.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
