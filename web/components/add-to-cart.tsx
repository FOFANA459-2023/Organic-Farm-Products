"use client";

import Link from "next/link";
import { formatPrice, MAX_CART_QTY, type Product } from "@ofp/shared";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { CheckIcon } from "./icons";

export function AddToCart({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const variant = product.variants.find((v) => v.id === variantId);

  if (!variant) return null;

  const onAdd = () => {
    add(
      {
        variantId: variant.id,
        productSlug: product.slug,
        productName: product.name,
        variantLabel: variant.label,
        priceLsl: variant.priceLsl,
        image: product.images[0] ?? null,
      },
      qty,
    );
    setAdded(true);
  };

  return (
    <div className="space-y-5">
      {product.variants.length > 1 && (
        <fieldset>
          <legend className="field-label">Size / packaging</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <label
                key={v.id}
                className={`cursor-pointer rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                  v.id === variantId ? "border-leaf bg-sprout-light font-semibold text-ink" : "border-line bg-white text-ink-soft hover:border-leaf"
                }`}
              >
                <input
                  type="radio"
                  name="variant"
                  value={v.id}
                  checked={v.id === variantId}
                  onChange={() => {
                    setVariantId(v.id);
                    setAdded(false);
                  }}
                  className="sr-only"
                />
                {v.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {product.variants.length === 1 && <p className="text-sm text-ink-soft">{variant.label}</p>}

      <p className="font-display text-3xl font-bold text-ink">{formatPrice(variant.priceLsl)}</p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center rounded-full border border-line bg-white">
          <button
            type="button"
            className="h-11 w-11 rounded-full text-lg text-ink hover:text-leaf disabled:opacity-40"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_CART_QTY}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(MAX_CART_QTY, Number(e.target.value) || 1)))}
            className="w-14 bg-transparent text-center font-semibold [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Quantity"
          />
          <button
            type="button"
            className="h-11 w-11 rounded-full text-lg text-ink hover:text-leaf"
            onClick={() => setQty((q) => Math.min(MAX_CART_QTY, q + 1))}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <button type="button" className="btn-primary" onClick={onAdd}>
          Add to cart
        </button>
      </div>

      {added && (
        <p className="flex flex-wrap items-center gap-2 text-sm text-leaf-dark" role="status">
          <CheckIcon className="h-4 w-4" /> Added to your cart.
          <Link href="/cart" className="font-semibold underline underline-offset-2">
            View cart
          </Link>
        </p>
      )}
    </div>
  );
}
