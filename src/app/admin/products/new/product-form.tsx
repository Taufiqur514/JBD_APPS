"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Bot,
  Check,
  ImagePlus,
  PackagePlus,
  Save,
  Sparkles,
} from "lucide-react";
import { PrototypeShell } from "@/components/prototype-shell";
import {
  adminGeneratedDescription,
  adminProductTabs,
  featuredProducts,
  productCategories,
} from "@/lib/prototype-data";

export function AdminProductForm({
  mode,
  slug,
  initialProduct,
}: {
  mode: "create" | "edit";
  slug?: string;
  initialProduct?: (typeof featuredProducts)[number];
}) {
  const product = initialProduct ?? featuredProducts.find((item) => item.slug === slug) ?? featuredProducts[0];
  const [generated, setGenerated] = useState(mode === "edit");
  const [activeTab, setActiveTab] = useState("Basic Info");
  const [productName, setProductName] = useState(
    mode === "edit" ? product.name : "JBD Chocolate Premium 500g",
  );
  const [description, setDescription] = useState(
    mode === "edit" ? product.description : "",
  );

  function generateDescription() {
    setProductName(adminGeneratedDescription.title);
    setDescription(adminGeneratedDescription.long);
    setGenerated(true);
    setActiveTab("SEO & AI");
  }

  return (
    <PrototypeShell
      compact
      eyebrow="Product Management"
      title={mode === "create" ? "Tambah Produk" : "Edit Produk"}
      description=""
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Link
          href="/admin/products"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Katalog
        </Link>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={generateDescription}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700"
          >
            <Sparkles className="h-4 w-4" />
            Generate deskripsi
          </button>
          <button
            type="submit"
            form="admin-product-form"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 text-sm font-semibold text-white"
          >
            <Save className="h-4 w-4" />
            Simpan produk
          </button>
        </div>
      </div>

      <form id="admin-product-form" action="/api/admin/products" method="post" className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <input type="hidden" name="mode" value={mode} />
        <input type="hidden" name="slug" value={slug ?? ""} />
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
            {adminProductTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  activeTab === tab
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-5">
            {activeTab === "Basic Info" ? (
              <>
                <Field name="name" label="Nama produk" value={productName} onChange={setProductName} />
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectField name="category" label="Kategori" value={mode === "edit" ? product.category : "Chocolate"} options={productCategories} />
                  <SelectField label="Status" value="Published" options={["Draft", "Published", "Archived"]} />
                </div>
                <TextArea
                  name="description"
                  label="Deskripsi produk"
                  value={description}
                  placeholder="Klik Generate deskripsi atau isi manual deskripsi produk."
                  onChange={setDescription}
                />
                <TextArea
                  name="serving"
                  label="Cara penyajian"
                  value={mode === "edit" ? product.serving : "30g powder + 150ml milk/water. Shake or blend with ice."}
                  onChange={() => null}
                />
              </>
            ) : null}

            {activeTab === "Media" ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="grid aspect-square place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
                    <div className="text-center">
                      <ImagePlus className="mx-auto h-8 w-8" />
                      <p className="mt-2 text-sm">Upload foto</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {activeTab === "Pricing" ? (
              <div className="grid gap-4 md:grid-cols-3">
                <Field name="price" label="Harga dasar" value={String(product.numericPrice ?? 89000)} onChange={() => null} />
                <Field label="Harga promo" value="79000" onChange={() => null} />
              </div>
            ) : null}

            {activeTab === "Inventory" ? (
              <div className="grid gap-4 md:grid-cols-3">
                <Field name="stock" label="Stock on hand" value={mode === "edit" ? String(product.stock) : "120"} onChange={() => null} />
                <Field label="Safety stock" value="40" onChange={() => null} />
                <SelectField label="Warehouse" value="Bekasi" options={["Bekasi", "Surabaya", "Multi warehouse"]} />
              </div>
            ) : null}

            {activeTab === "SEO & AI" ? (
              <div className="grid gap-5">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-start gap-3">
                    <Bot className="mt-1 h-5 w-5 text-emerald-700" />
                    <div>
                      <p className="font-semibold text-emerald-950">AI description draft</p>
                      <p className="mt-2 text-sm leading-6 text-emerald-800">
                        {generated ? adminGeneratedDescription.long : "Klik Generate deskripsi untuk membuat draft PDP."}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-3">
                  {adminGeneratedDescription.bullets.map((item) => (
                    <div key={item} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`aspect-square rounded-2xl ${mode === "edit" ? product.imageTone : "bg-amber-200"}`} />
            <p className="mt-4 text-lg font-semibold text-slate-950">{productName}</p>
            <p className="mt-1 text-sm text-slate-500">
              {description || adminGeneratedDescription.short}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <PackagePlus className="h-6 w-6 text-emerald-300" />
            <p className="mt-4 font-semibold">Publishing checklist</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {["Nama produk", "Harga", "Stock", "Deskripsi", "Media"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-emerald-300" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </form>
    </PrototypeShell>
  );
}

function Field({
  name,
  label,
  value,
  onChange,
}: {
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-emerald-300"
      />
    </label>
  );
}

function TextArea({
  name,
  label,
  value,
  placeholder,
  onChange,
}: {
  name?: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <textarea
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-emerald-300"
      />
    </label>
  );
}

function SelectField({
  name,
  label,
  value,
  options,
}: {
  name?: string;
  label: string;
  value: string;
  options: string[];
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        name={name}
        defaultValue={value}
        className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-emerald-300"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
