import InventoryView from "@/components/InventoryView";

// Rendered only after the client-side auth check, so it can't be validated for instant navigation.
export const instant = false;

export default function InventoryPage() {
  return <InventoryView />;
}
