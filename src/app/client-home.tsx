"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  ChevronRight,
  MessageSquareMore,
  Percent,
  Truck,
} from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import { DarkInfoBlock, MetricCard, SectionCard, SoftPanel } from "@/components/prototype-ui";
import {
  executivePanels,
  journeySteps,
  operationalTimeline,
  overviewKpis,
  presentationChecklist,
  systemModules,
  workspaceCards,
} from "@/lib/prototype-data";

export function ClientHome() {
  const [activeStep, setActiveStep] = useState("05");
  const [activeWorkspace, setActiveWorkspace] = useState("storefront");

  const selectedStep =
    journeySteps.find((step) => step.id === activeStep) ?? journeySteps[4];
  const selectedWorkspace =
    workspaceCards.find((workspace) => workspace.id === activeWorkspace) ??
    workspaceCards[0];

  const progressWidth = useMemo(() => {
    const stepIndex = journeySteps.findIndex((step) => step.id === activeStep);
    return `${Math.round(((stepIndex + 1) / journeySteps.length) * 100)}%`;
  }, [activeStep]);

  return (
    <PrototypeShell
      eyebrow="Platform commerce untuk bahan baku minuman, bukan sekadar toko online"
      title="Prototype JBD yang memperlihatkan alur customer, kontrol operasional, dan pengambilan keputusan dalam satu pengalaman."
      description="Kita posisikan versi ini sebagai executive prototype: cukup cepat untuk dipresentasikan, tetapi flow order, fulfillment, CRM, dan finance tetap mengikuti blueprint yang kamu siapkan."
    >
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {overviewKpis.map((kpi) => (
              <MetricCard key={kpi.label} {...kpi} />
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_24px_80px_rgba(2,6,23,0.14)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-emerald-300">Executive snapshot</p>
              <h3 className="mt-1 text-2xl font-semibold">What management will see</h3>
            </div>
            <BadgeDollarSign className="h-6 w-6 text-emerald-300" />
          </div>
          <div className="mt-6 space-y-4">
            {executivePanels.map((panel) => (
              <DarkInfoBlock key={panel.title} {...panel} />
            ))}
          </div>
        </aside>
      </div>

      <SectionCard
        title="Semua tahap utama storefront mengikuti blueprint dan flowchart JBD"
        description="Klik tiap tahap untuk melihat fokus UI, data utama, dan konteks bisnisnya."
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div />
          <div className="min-w-[240px]">
            <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
              <span>Journey completion</span>
              <span>{progressWidth}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-emerald-600 transition-all duration-300"
                style={{ width: progressWidth }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-11">
          {journeySteps.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
              className={`flex min-h-24 flex-col items-start rounded-2xl border px-3 py-3 text-left transition ${
                step.id === activeStep
                  ? "border-emerald-400 bg-emerald-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="text-xs font-semibold tracking-[0.18em] text-slate-400">
                {step.id}
              </span>
              <span className="mt-2 text-sm font-semibold text-slate-900">
                {step.label}
              </span>
              <span className="mt-auto pt-3 text-xs text-slate-500">Open detail</span>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
          <div
            className={`rounded-[26px] bg-gradient-to-br ${selectedStep.accent} p-5 text-white shadow-[0_20px_70px_rgba(16,24,40,0.18)]`}
          >
            <div className="mx-auto flex max-w-[280px] flex-col rounded-[28px] border border-white/20 bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center justify-between text-xs font-medium text-white/80">
                <span>JBD Powder Drink</span>
                <span>{selectedStep.label}</span>
              </div>
              <div className="mt-4 rounded-2xl bg-white/95 p-4 text-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    {selectedStep.id}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
                    {selectedStep.metric}
                  </span>
                </div>
                <h4 className="mt-3 text-lg font-semibold leading-6">{selectedStep.label}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">{selectedStep.detail}</p>
                <div className="mt-4 space-y-2">
                  {selectedStep.bullets.map((bullet) => (
                    <div
                      key={bullet}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    >
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      {bullet}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white"
                >
                  {selectedStep.cta}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Step Detail
                </p>
                <h4 className="mt-2 text-2xl font-semibold text-slate-950">
                  {selectedStep.title}
                </h4>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm">
                Stage {selectedStep.id}
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              Prototype ini menampilkan konteks produk, action utama, dan kejelasan status
              pada setiap titik perjalanan customer. Tujuannya bukan hanya bagus dilihat,
              tapi mudah dicerna saat dipresentasikan ke management.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <SoftPanel
                icon={MessageSquareMore}
                title="UI intention"
                text="Copy ringkas, CTA jelas, dan struktur informasi yang mudah dipindai."
              />
              <SoftPanel
                icon={Percent}
                title="Business intent"
                text="Promo, bundle, dan loyalty disisipkan pada titik yang paling relevan."
              />
              <SoftPanel
                icon={Truck}
                title="Operational link"
                text="Setiap step customer siap tersambung ke order, payment, dan tracking."
              />
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title={selectedWorkspace.title}
          description={selectedWorkspace.summary}
        >
          <div className="flex flex-wrap items-center gap-3">
            {workspaceCards.map((workspace) => {
              const Icon = workspace.icon;
              const active = workspace.id === activeWorkspace;
              return (
                <button
                  key={workspace.id}
                  type="button"
                  onClick={() => setActiveWorkspace(workspace.id)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {workspace.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {selectedWorkspace.chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {selectedWorkspace.metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{metric.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {selectedWorkspace.panels.map((panel) => (
              <div key={panel.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-base font-semibold text-slate-950">{panel.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{panel.text}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Order orchestration yang nyambung dari pembayaran sampai delivered"
          description="Flow ini penting untuk menegaskan bahwa prototype JBD memikirkan transaksi dan fulfillment sebagai satu sistem."
        >
          <div className="space-y-4">
            {operationalTimeline.map((item, index) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  {index < operationalTimeline.length - 1 ? (
                    <div className="mt-2 h-10 w-px bg-emerald-200" />
                  ) : null}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Modul inti yang membentuk cerita end-to-end JBD"
        description="Prototype diprioritaskan untuk presentasi, tetapi struktur modulnya tetap mengikuti cara sistem commerce modern dibangun."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {systemModules.map((module) => {
            const Icon = module.icon;
            return (
              <div key={module.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="mt-4 text-lg font-semibold text-slate-950">{module.title}</h4>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  {module.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Visual source yang menjadi acuan prototype"
          description="Blueprint asli tetap tertanam di prototype agar narasi presentasi tetap punya jejak visual yang kuat."
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <Image
              src="/blueprints/jbd-blueprint-1.png"
              alt="JBD digital commerce blueprint"
              width={1600}
              height={1200}
              className="h-auto w-full"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Gambaran fitur lengkap yang diturunkan ke experience prototype"
          description="Panel ini membantu management menghubungkan blueprint awal dengan tampilan aplikasi yang sedang dibuka."
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <Image
              src="/blueprints/jbd-blueprint-2.png"
              alt="JBD feature design direction"
              width={1600}
              height={1200}
              className="h-auto w-full"
            />
          </div>
        </SectionCard>
      </div>

      <section className="mb-8 rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(2,6,23,0.18)]">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Presentation Readiness
            </p>
            <h3 className="mt-2 text-3xl font-semibold">
              Prototype ini sekarang bukan hanya overview, tapi sudah menjadi paket demo yang bisa dipresentasikan langsung.
            </h3>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              Buka halaman overview untuk cerita besar, lalu pindah ke storefront, admin,
              operations, dan insights untuk menunjukkan detail per domain tanpa perlu
              menjelaskan semuanya dari nol.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/storefront"
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950"
              >
                Open storefront
              </Link>
              <Link
                href="/admin"
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white"
              >
                Open admin commerce
              </Link>
            </div>
          </div>
          <div className="grid gap-3">
            {presentationChecklist.map((item) => (
              <DarkInfoBlock key={item} title="Checklist" text={item} />
            ))}
          </div>
        </div>
      </section>
    </PrototypeShell>
  );
}
