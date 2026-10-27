import type { Product } from "@/lib/types";
import { getAvailability } from "@/lib/types";

const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function Stat({ value, label, align = "left" }: { value: string | number; label: string; align?: "left" | "right" }) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <p className="mb-2 font-semibold text-[#5D6679]">{value}</p>
      <p className="text-sm text-[#858D9D]">{label}</p>
    </div>
  );
}

// Summary figures are computed from the product list returned by the API.
export default function OverallInventory({ products }: { products: Product[] }) {
  const categories = new Set(products.map((p) => p.category)).size;
  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
  const stockValue = products.reduce((sum, p) => sum + p.quantity * p.price, 0);
  const topStocked = [...products].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  const topCost = topStocked.reduce((sum, p) => sum + p.price, 0);
  const low = products.filter((p) => getAvailability(p) === "Low stock").length;
  const out = products.filter((p) => getAvailability(p) === "Out of stock").length;

  const sections = [
    { title: "Categories", color: "text-[#1570EF]", stats: [{ value: categories, label: "Total" }] },
    {
      title: "Total Products",
      color: "text-[#E19133]",
      stats: [
        { value: totalUnits, label: "Units in stock" },
        { value: rupees(stockValue), label: "Stock value" },
      ],
    },
    {
      title: "Top Selling",
      color: "text-[#845EBC]",
      stats: [
        { value: topStocked.length, label: "Top products" },
        { value: rupees(topCost), label: "Cost" },
      ],
    },
    {
      title: "Low Stocks",
      color: "text-[#F36960]",
      stats: [
        { value: low, label: "Low stock" },
        { value: out, label: "Not in stock" },
      ],
    },
  ];

  return (
    <section className="rounded-lg bg-white px-4 py-5">
      <h2 className="mb-6 text-xl font-medium text-[#383E49]">Overall Inventory</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-0">
        {sections.map((s, i) => (
          <div key={s.title} className={`xl:px-8 ${i === 0 ? "xl:pl-0" : "xl:border-l xl:border-[#F0F1F3]"}`}>
            <h3 className={`mb-4 font-semibold ${s.color}`}>{s.title}</h3>
            <div className="flex justify-between gap-4">
              {s.stats.map((st, j) => (
                <Stat key={st.label} value={st.value} label={st.label} align={j === 1 ? "right" : "left"} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
