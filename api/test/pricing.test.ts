import { describe, expect, it } from "vitest";
import { priceOrder, type VariantRecord } from "../src/lib/pricing";
import { ApiError } from "../src/lib/http";

const product = (over: Partial<VariantRecord["product"]> = {}) => ({
  id: "p1",
  name: "Sorghum",
  published: true,
  orderable: true,
  availability: "available",
  ...over,
});

const variants: VariantRecord[] = [
  { id: "v1", label: "5 kg", priceLsl: 100, product: product() },
  { id: "v2", label: "10 kg", priceLsl: 180.5, product: product() },
  { id: "v3", label: "Pack", priceLsl: null, product: product({ id: "p2", name: "Trout" }) },
  { id: "v4", label: "Pack", priceLsl: 50, product: product({ id: "p3", name: "Chicken", availability: "coming_soon" }) },
  { id: "v5", label: "Pack", priceLsl: 50, product: product({ id: "p4", name: "Hidden", published: false }) },
];

const code = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    return (e as ApiError).code;
  }
  return null;
};

describe("priceOrder", () => {
  it("uses database prices and computes the total", () => {
    const r = priceOrder([{ variantId: "v1", qty: 2 }, { variantId: "v2", qty: 1 }], variants);
    expect(r.estimatedTotal).toBe(380.5);
    expect(r.hasUnpricedItems).toBe(false);
    expect(r.lines.map((l) => l.unitPrice)).toEqual([100, 180.5]);
  });

  it("ignores any extra price fields sent by the browser", () => {
    const tampered = [{ variantId: "v1", qty: 1, unitPrice: 0.01 } as { variantId: string; qty: number }];
    expect(priceOrder(tampered, variants).estimatedTotal).toBe(100);
  });

  it("merges duplicate cart lines", () => {
    const r = priceOrder([{ variantId: "v1", qty: 1 }, { variantId: "v1", qty: 3 }], variants);
    expect(r.lines).toHaveLength(1);
    expect(r.lines[0]!.qty).toBe(4);
  });

  it("flags price-on-request items", () => {
    const r = priceOrder([{ variantId: "v1", qty: 1 }, { variantId: "v3", qty: 1 }], variants);
    expect(r.hasUnpricedItems).toBe(true);
    expect(r.estimatedTotal).toBe(100);
    expect(priceOrder([{ variantId: "v3", qty: 1 }], variants).estimatedTotal).toBeNull();
  });

  it("rejects unknown, unavailable and unpublished items", () => {
    expect(code(() => priceOrder([{ variantId: "nope", qty: 1 }], variants))).toBe("unknown_item");
    expect(code(() => priceOrder([{ variantId: "v4", qty: 1 }], variants))).toBe("item_unavailable");
    expect(code(() => priceOrder([{ variantId: "v5", qty: 1 }], variants))).toBe("item_unavailable");
  });
});
