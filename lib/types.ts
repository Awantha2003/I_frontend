export type Product = {
  id: number;
  productId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  threshold: number;
  expiryDate: string;
};

export type ProductInput = Omit<Product, "id">;

export type User = { id: number; name: string; email: string };

export type Availability = "In- stock" | "Low stock" | "Out of stock";

export function getAvailability(p: Product): Availability {
  if (p.quantity === 0) return "Out of stock";
  if (p.quantity <= p.threshold) return "Low stock";
  return "In- stock";
}
