"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, MAX_CART_QTY } from "@ofp/shared";
import { ArrowRight } from "@/components/icons";
import { Notice } from "@/components/ui";
import { cartEstimate, useCart } from "@/lib/cart";
import { useHydrated } from "@/lib/use-hydrated";

export function CartView() {
  const hydrated = useHydrated();
  const { lines, setQty, remove } = useCart();

  if (!hydrated) return <div className="mt-10 h-40 animate-pulse rounded-[var(--radius-card)] bg-white" />;

  if (!lines.length) {
    return (
      <div className="card mt-10 p-10 text-center">
        <p className="text-lg text-ink-soft">Your cart is empty.</p>
        <Link href="/products" className="btn-primary mt-6">
          Browse products <ArrowRight />
        </Link>
      </div>
    );
  }

  const { total, hasUnpriced } = cartEstimate(lines);

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
      <ul className="card divide-y divide-line">
        {lines.map((l) => (
          <li key={l.variantId} className="flex gap-4 p-4 sm:p-5">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sprout-light">
              {l.image && <Image src={l.image} alt="" fill sizes="80px" className="object-cover" />}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link href={`/products/${l.productSlug}`} className="font-semibold text-ink hover:text-leaf">
                  {l.productName}
                </Link>
                <p className="text-sm text-muted">{l.variantLabel}</p>
                <p className="mt-1 text-sm font-medium text-ink-soft">{formatPrice(l.priceLsl)}</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="sr-only" htmlFor={`qty-${l.variantId}`}>Quantity for {l.productName}</label>
                <input
                  id={`qty-${l.variantId}`}
                  type="number"
                  min={1}
                  max={MAX_CART_QTY}
                  value={l.qty}
                  onChange={(e) => setQty(l.variantId, Number(e.target.value))}
                  className="field-input w-20 text-center"
                />
                <button type="button" onClick={() => remove(l.variantId)} className="text-sm font-medium text-muted hover:text-danger">
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="card h-fit space-y-4 p-6">
        <h2 className="text-xl font-semibold">Summary</h2>
        <div className="flex items-baseline justify-between">
          <span className="text-ink-soft">Estimated total</span>
          <span className="font-display text-2xl font-bold">{total != null ? formatPrice(total) : "—"}</span>
        </div>
        {hasUnpriced && <Notice>Some items are priced on request — we&apos;ll confirm the final total with you.</Notice>}
        <p className="text-sm text-muted">No payment is taken online. We&apos;ll contact you to confirm your order, payment and delivery or pickup.</p>
        <Link href="/checkout" className="btn-primary w-full">
          Continue to order details <ArrowRight />
        </Link>
        <Link href="/products" className="block text-center text-sm font-medium text-leaf">
          Keep shopping
        </Link>
      </aside>
    </div>
  );
}
