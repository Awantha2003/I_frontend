"use client";

import { useCallback, useEffect, useState } from "react";
import OverallInventory from "@/components/OverallInventory";
import ProductModal from "@/components/ProductModal";
import Topbar from "@/components/Topbar";
import { FilterIcon } from "@/components/icons";
import { api } from "@/lib/api";
import { type Availability, type Product, getAvailability } from "@/lib/types";

const PAGE_SIZE = 10;

const AVAILABILITY_COLOR: Record<Availability, string> = {
  "In- stock": "text-[#10A760]",
  "Low stock": "text-[#E19133]",
  "Out of stock": "text-[#DA3E33]",
};

// "2026-12-11" -> "11/12/26", the format used in the design
function formatDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return y && m && d ? `${Number(d)}/${Number(m)}/${y.slice(2)}` : iso;
}

function downloadCsv(rows: Product[]) {
  const header = ["Product ID", "Name", "Category", "Buying Price", "Quantity", "Unit", "Threshold", "Expiry Date", "Availability"];
  const lines = rows.map((p) =>
    [p.productId, p.name, p.category, p.price, p.quantity, p.unit, p.threshold, p.expiryDate, getAvailability(p)]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "products.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function InventoryView() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState<Availability | "">("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<{ product: Product | null } | null>(null);
  const [toast, setToast] = useState("");

  const load = useCallback(async (query: string) => {
    setLoading(true);
    setError("");
    try {
      // The summary card always uses the full list; the table uses the search result.
      const [all, filtered] = await Promise.all([api.getProducts(), query ? api.getProducts(query) : null]);
      setAllProducts(all);
      setProducts(filtered ?? all);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search so we don't call the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      load(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search, load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const visible = availability ? products.filter((p) => getAvailability(p) === availability) : products;
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSaved(saved: Product) {
    const wasEdit = Boolean(modal?.product);
    setModal(null);
    setToast(wasEdit ? `"${saved.name}" updated` : `"${saved.name}" added`);
    load(search.trim());
  }

  return (
    <>
      <Topbar search={search} onSearch={setSearch} />

      <main className="flex flex-col gap-6 px-4 py-6 sm:px-8">
        <OverallInventory products={allProducts} />

        <section className="rounded-lg bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-5 pb-4">
            <h2 className="text-xl font-medium text-[#383E49]">Products</h2>
            <div className="relative flex flex-wrap gap-3">
              <button
                onClick={() => setModal({ product: null })}
                className="rounded bg-[#1366D9] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0F56B8]"
              >
                Add Product
              </button>
              <button
                onClick={() => setShowFilters((s) => !s)}
                className="flex items-center gap-2 rounded border border-[#D0D3D9] px-4 py-2.5 text-sm font-medium text-[#5D6679] hover:bg-[#F0F1F3]"
              >
                <FilterIcon className="h-5 w-5" />
                Filters{availability && " (1)"}
              </button>
              <button
                onClick={() => downloadCsv(visible)}
                className="rounded border border-[#D0D3D9] px-4 py-2.5 text-sm font-medium text-[#5D6679] hover:bg-[#F0F1F3]"
              >
                Download all
              </button>

              {showFilters && (
                <div className="absolute top-12 right-0 z-10 w-56 rounded-lg border border-[#F0F1F3] bg-white p-3 shadow-lg">
                  <p className="mb-2 text-sm font-medium text-[#383E49]">Availability</p>
                  {(["", "In- stock", "Low stock", "Out of stock"] as const).map((opt) => (
                    <label key={opt || "all"} className="flex items-center gap-2 py-1 text-sm text-[#5D6679]">
                      <input
                        type="radio"
                        name="availability"
                        checked={availability === opt}
                        onChange={() => {
                          setAvailability(opt);
                          setPage(1);
                          setShowFilters(false);
                        }}
                      />
                      {opt || "All"}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div role="alert" className="mx-4 mb-4 rounded-lg border border-[#FDA29B] bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]">
              {error}{" "}
              <button onClick={() => load(search.trim())} className="font-medium underline">
                Retry
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#F0F1F3] text-[#667085]">
                  <th className="px-4 py-3 font-medium">Products</th>
                  <th className="px-4 py-3 font-medium">Buying Price</th>
                  <th className="px-4 py-3 font-medium">Quantity</th>
                  <th className="px-4 py-3 font-medium">Threshold Value</th>
                  <th className="px-4 py-3 font-medium">Expiry Date</th>
                  <th className="px-4 py-3 font-medium">Availability</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="text-[#48505E]">
                {loading && products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-[#858D9D]">
                      Loading products...
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-[#858D9D]">
                      {search ? `No products match "${search}"` : "No products found"}
                    </td>
                  </tr>
                ) : (
                  pageRows.map((p) => {
                    const status = getAvailability(p);
                    return (
                      <tr
                        key={p.id}
                        onClick={() => setModal({ product: p })}
                        className="cursor-pointer border-b border-[#F0F1F3] hover:bg-[#F9FAFB]"
                      >
                        <td className="px-4 py-4 font-medium">{p.name}</td>
                        <td className="px-4 py-4">₹{p.price.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-4">
                          {p.quantity} {p.unit}
                        </td>
                        <td className="px-4 py-4">
                          {p.threshold} {p.unit}
                        </td>
                        <td className="px-4 py-4">{formatDate(p.expiryDate)}</td>
                        <td className={`px-4 py-4 ${AVAILABILITY_COLOR[status]}`}>{status}</td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setModal({ product: p });
                            }}
                            className="rounded px-2 py-1 text-[#1366D9] hover:bg-[#EBF2FF]"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded border border-[#D0D3D9] px-4 py-2 text-sm font-medium text-[#48505E] disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-[#667085]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded border border-[#D0D3D9] px-4 py-2 text-sm font-medium text-[#48505E] disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>
      </main>

      {modal && <ProductModal product={modal.product} onClose={() => setModal(null)} onSaved={handleSaved} />}

      {toast && (
        <div role="status" className="fixed right-6 bottom-6 z-50 rounded-lg bg-[#10A760] px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}
