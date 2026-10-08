import { ApiError } from "./http";

/** A variant as loaded from the database, joined to its product. */
export interface VariantRecord {
  id: string;
  label: string;
  priceLsl: number | null;
  product: { id: string; name: string; published: boolean; orderable: boolean; availability: string };
}

export interface PricedLine {
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  qty: number;
  unitPrice: number | null;
}

export interface PricedOrder {
  lines: PricedLine[];
  estimatedTotal: number | null;
  hasUnpricedItems: boolean;
}

/**
 * Prices a cart using ONLY database values — any price the browser might send is ignored.
 * Rejects variants that don't exist or belong to products that can't currently be ordered.
 * Duplicate variants in the cart are merged.
 */
export function priceOrder(items: { variantId: string; qty: number }[], variants: VariantRecord[]): PricedOrder {
  const byId = new Map(variants.map((v) => [v.id, v]));
  const merged = new Map<string, number>();
  for (const item of items) merged.set(item.variantId, (merged.get(item.variantId) ?? 0) + item.qty);

  const lines: PricedLine[] = [];
  for (const [variantId, qty] of merged) {
    const v = byId.get(variantId);
    if (!v) throw new ApiError(400, "unknown_item", "One of the items in your cart no longer exists. Please refresh your cart.");
    const p = v.product;
    if (!p.published || !p.orderable || p.availability !== "available") {
      throw new ApiError(400, "item_unavailable", `${p.name} is not available to order right now.`);
    }
    lines.push({
      productId: p.id,
      variantId: v.id,
      productName: p.name,
      variantLabel: v.label,
      qty,
      unitPrice: v.priceLsl,
    });
  }

  const hasUnpricedItems = lines.some((l) => l.unitPrice == null);
  const pricedTotal = lines.reduce((sum, l) => sum + (l.unitPrice ?? 0) * l.qty, 0);
  const anyPriced = lines.some((l) => l.unitPrice != null);
  return {
    lines,
    estimatedTotal: anyPriced ? Math.round(pricedTotal * 100) / 100 : null,
    hasUnpricedItems,
  };
}
