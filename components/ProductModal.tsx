"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { Product, ProductInput } from "@/lib/types";

const CATEGORIES = ["Food", "Beverages", "Household", "Personal Care", "Electronics", "Stationery", "Other"];

type FormState = Record<keyof ProductInput, string>;
type Errors = Partial<Record<keyof ProductInput, string>>;

const EMPTY: FormState = {
  name: "",
  productId: "",
  category: "",
  price: "",
  quantity: "",
  unit: "",
  expiryDate: "",
  threshold: "",
};

function toForm(p: Product): FormState {
  return {
    name: p.name,
    productId: p.productId,
    category: p.category,
    price: String(p.price),
    quantity: String(p.quantity),
    unit: p.unit,
    expiryDate: p.expiryDate.slice(0, 10),
    threshold: String(p.threshold),
  };
}

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Product name is required";
  if (!f.productId.trim()) e.productId = "Product ID is required";
  if (!f.category) e.category = "Select a category";
  if (!f.unit.trim()) e.unit = "Unit is required";
  if (!f.expiryDate) e.expiryDate = "Expiry date is required";
  for (const key of ["price", "quantity", "threshold"] as const) {
    const n = Number(f[key]);
    if (f[key].trim() === "" || Number.isNaN(n)) e[key] = "Enter a number";
    else if (n < 0) e[key] = "Must be 0 or more";
  }
  return e;
}

type Props = {
  product: Product | null; // null = add mode
  onClose: () => void;
  onSaved: (product: Product) => void;
};

export default function ProductModal({ product, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(product ? toForm(product) : EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(product);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value });

  function pickImage(file?: File) {
    if (file && file.type.startsWith("image/")) setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate(form);
    setErrors(next);
    setServerError("");
    if (Object.keys(next).length) return;

    const body: ProductInput = {
      name: form.name.trim(),
      productId: form.productId.trim(),
      category: form.category,
      price: Number(form.price),
      quantity: Number(form.quantity),
      unit: form.unit.trim(),
      expiryDate: form.expiryDate,
      threshold: Number(form.threshold),
    };

    setSaving(true);
    try {
      const saved = product ? await api.updateProduct(product.id, body) : await api.createProduct(body);
      onSaved(saved);
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const categories = form.category && !CATEGORIES.includes(form.category) ? [form.category, ...CATEGORIES] : CATEGORIES;

  const row = (label: string, key: keyof FormState, input: React.ReactNode) => (
    <div className="grid grid-cols-1 items-start gap-1 sm:grid-cols-[150px_1fr] sm:gap-4">
      <label htmlFor={key} className="pt-2.5 font-medium text-[#48505E]">
        {label}
      </label>
      <div>
        {input}
        {errors[key] && <p className="mt-1 text-sm text-[#F04438]">{errors[key]}</p>}
      </div>
    </div>
  );

  const inputClass = (key: keyof FormState) =>
    `w-full rounded-lg border px-4 py-2.5 text-[#383E49] outline-none placeholder:text-[#858D9D] focus:border-[#1366D9] ${
      errors[key] ? "border-[#F04438]" : "border-[#D0D3D9]"
    }`;

  const text = (key: keyof FormState, placeholder: string, type = "text", extra: object = {}) => (
    <input id={key} type={type} value={form[key]} onChange={set(key)} placeholder={placeholder} className={inputClass(key)} {...extra} />
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 px-4 py-8"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="w-full max-w-[500px] rounded-lg bg-white px-6 py-7 shadow-xl"
      >
        <h2 id="product-modal-title" className="mb-5 text-xl font-medium text-[#383E49]">
          {isEdit ? "Edit Product" : "New Product"}
        </h2>

        <div
          className="mb-6 flex items-center justify-center gap-6"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            pickImage(e.dataTransfer.files[0]);
          }}
        >
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-dashed border-[#9D9D9D]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {preview && <img src={preview} alt="Product preview" className="h-full w-full object-cover" />}
          </div>
          <div className="text-center text-sm leading-6 text-[#858D9D]">
            <p>Drag image here</p>
            <p>or</p>
            <button type="button" onClick={() => fileRef.current?.click()} className="text-[#448DF2] hover:underline">
              Browse image
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pickImage(e.target.files?.[0])} />
          </div>
        </div>

        {serverError && (
          <div role="alert" className="mb-4 rounded-lg border border-[#FDA29B] bg-[#FEF3F2] px-3.5 py-2.5 text-sm text-[#B42318]">
            {serverError}
          </div>
        )}

        <div className="space-y-4">
          {row("Product Name", "name", text("name", "Enter product name"))}
          {row("Product ID", "productId", text("productId", "Enter product ID"))}
          {row(
            "Category",
            "category",
            <select
              id="category"
              value={form.category}
              onChange={set("category")}
              className={`${inputClass("category")} bg-white ${form.category ? "" : "text-[#858D9D]"}`}
            >
              <option value="">Select product category</option>
              {categories.map((c) => (
                <option key={c} value={c} className="text-[#383E49]">
                  {c}
                </option>
              ))}
            </select>
          )}
          {row("Buying Price", "price", text("price", "Enter buying price", "number", { min: 0, step: "0.01" }))}
          {row("Quantity", "quantity", text("quantity", "Enter product quantity", "number", { min: 0, step: 1 }))}
          {row("Unit", "unit", text("unit", "Enter product unit"))}
          {row("Expiry Date", "expiryDate", text("expiryDate", "Enter expiry date", "date"))}
          {row("Threshold Value", "threshold", text("threshold", "Enter threshold value", "number", { min: 0, step: 1 }))}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-[#F0F1F3] px-6 py-2.5 text-[#5D6679] hover:bg-[#F0F1F3]"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-[#1366D9] px-6 py-2.5 font-medium text-white hover:bg-[#0F56B8] disabled:opacity-60"
          >
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
