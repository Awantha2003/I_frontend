import { clearSession, getToken } from "./auth";
import type { Product, ProductInput, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers: { ...headers, ...options.headers } });
  } catch {
    throw new ApiError("Cannot reach the server. Is the backend running?", 0);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Expired or missing token on a protected route: send the user back to login
    if (res.status === 401 && token && !path.startsWith("/api/auth")) {
      clearSession();
      window.location.replace("/login");
    }
    throw new ApiError(data.message || `Request failed (${res.status})`, res.status);
  }
  return data as T;
}

export const api = {
  signup: (body: { name: string; email: string; password: string }) =>
    request<User>("/api/auth/signup", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User }>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),

  getProducts: (search = "") =>
    request<Product[]>(`/api/products${search ? `?search=${encodeURIComponent(search)}` : ""}`),

  createProduct: (body: ProductInput) =>
    request<Product>("/api/products", { method: "POST", body: JSON.stringify(body) }),

  updateProduct: (id: number, body: ProductInput) =>
    request<Product>(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
};
