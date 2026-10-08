import type { ApiError, Category, Post, Product, Settings } from "@ofp/shared";
import { unstable_rethrow } from "next/navigation";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public issues?: unknown,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, headers, ...rest } = init;
  const isForm = typeof FormData !== "undefined" && rest.body instanceof FormData;
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...rest,
    headers: {
      ...(rest.body && !isForm ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (body as ApiError | null)?.error;
    throw new ApiRequestError(res.status, err?.code ?? "http_error", err?.message ?? `Request failed (${res.status})`, err?.issues);
  }
  return body as T;
}

// ---------- public reads (server components) ----------

export const getProducts = (opts: { category?: string; featured?: boolean } = {}) => {
  const qs = new URLSearchParams();
  if (opts.category) qs.set("category", opts.category);
  if (opts.featured) qs.set("featured", "true");
  return apiFetch<Product[]>(`/products${qs.size ? `?${qs}` : ""}`);
};

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/products/${encodeURIComponent(slug)}`);
  } catch (e) {
    if (e instanceof ApiRequestError && e.status === 404) return null;
    throw e;
  }
}

export const getCategories = () => apiFetch<Category[]>("/categories");

export const getPosts = (limit?: number) => apiFetch<Post[]>(`/posts${limit ? `?limit=${limit}` : ""}`);

export async function getPost(slug: string): Promise<Post | null> {
  try {
    return await apiFetch<Post>(`/posts/${encodeURIComponent(slug)}`);
  } catch (e) {
    if (e instanceof ApiRequestError && e.status === 404) return null;
    throw e;
  }
}

/** Contact details from the brief, used if the API can't be reached so the header/footer still render. */
export const FALLBACK_SETTINGS: Settings = {
  phones: { agricultural: "+266 5896 9889", fish: "+266 5965 0416", poultry: "To be announced" },
  whatsapp: "+266 5896 9889",
  email: "organicfarmproducts04@gmail.com",
  instagram: "https://www.instagram.com/organic.farm.productsls",
  facebook: "",
  location: "Mohale's Hoek, Lesotho",
  delivery: {
    areas: "TBD — please contact us",
    fees: "TBD — please contact us",
    minimumOrder: "TBD — please contact us",
    pickup: "TBD — please contact us",
    days: "TBD — please contact us",
    coldChain: "TBD — please contact us",
  },
  registration: { show: false, companyName: "Organic Farm Products Pty", number: "" },
};

export async function getSettings(): Promise<Settings> {
  try {
    return await apiFetch<Settings>("/settings");
  } catch (e) {
    unstable_rethrow(e); // let Next.js internal signals through
    console.error("Settings fetch failed, using fallback", e);
    return FALLBACK_SETTINGS;
  }
}
