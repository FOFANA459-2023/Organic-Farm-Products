"use client";

import { MAX_CART_QTY } from "@ofp/shared";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartLine {
  variantId: string;
  productSlug: string;
  productName: string;
  variantLabel: string;
  /** Display only — the API re-prices every order from the database. */
  priceLsl: number | null;
  image: string | null;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
}

const clamp = (n: number) => Math.max(1, Math.min(MAX_CART_QTY, Math.floor(n) || 1));

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line, qty = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.variantId === line.variantId);
          if (existing) {
            return {
              lines: s.lines.map((l) => (l.variantId === line.variantId ? { ...l, ...line, qty: clamp(l.qty + qty) } : l)),
            };
          }
          return { lines: [...s.lines, { ...line, qty: clamp(qty) }] };
        }),
      setQty: (variantId, qty) =>
        set((s) => ({ lines: s.lines.map((l) => (l.variantId === variantId ? { ...l, qty: clamp(qty) } : l)) })),
      remove: (variantId) => set((s) => ({ lines: s.lines.filter((l) => l.variantId !== variantId) })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "ofp-cart",
      version: 1,
      storage: createJSONStorage(() => {
        try {
          return localStorage;
        } catch {
          // Private mode / blocked storage: keep the cart in memory only.
          const mem = new Map<string, string>();
          return {
            getItem: (k) => mem.get(k) ?? null,
            setItem: (k, v) => void mem.set(k, v),
            removeItem: (k) => void mem.delete(k),
          };
        }
      }),
    },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);

export function cartEstimate(lines: CartLine[]) {
  const priced = lines.filter((l) => l.priceLsl != null);
  return {
    total: priced.length ? priced.reduce((sum, l) => sum + (l.priceLsl ?? 0) * l.qty, 0) : null,
    hasUnpriced: lines.some((l) => l.priceLsl == null),
  };
}
