"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CUSTOMER_TYPE_LABELS,
  CUSTOMER_TYPES,
  DISTRICTS,
  formatPrice,
  orderInputSchema,
  type OrderCreated,
  type OrderInput,
} from "@ofp/shared";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Turnstile, useTurnstile } from "@/components/turnstile";
import { Field, Notice } from "@/components/ui";
import { apiFetch, ApiRequestError } from "@/lib/api";
import { cartEstimate, useCart } from "@/lib/cart";
import { useHydrated } from "@/lib/use-hydrated";

export function CheckoutForm() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { lines, clear } = useCart();
  const turnstile = useTurnstile();
  const [serverError, setServerError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrderInput>({
    resolver: zodResolver(orderInputSchema),
    defaultValues: { customerType: "individual", fulfilment: "delivery", district: "Mohale's Hoek", items: [], turnstileToken: "" },
  });

  useEffect(() => {
    setValue(
      "items",
      lines.map((l) => ({ variantId: l.variantId, qty: l.qty })),
    );
  }, [lines, setValue]);

  const customerType = watch("customerType");
  const fulfilment = watch("fulfilment");

  const onSubmit = handleSubmit(async (values) => {
    setServerError("");
    try {
      const order = await apiFetch<OrderCreated>("/orders", { method: "POST", body: JSON.stringify(values) });
      try {
        sessionStorage.setItem(`ofp-order-${order.ref}`, JSON.stringify(order));
      } catch {
        /* storage unavailable: confirmation page falls back to a generic message */
      }
      setSubmitted(true);
      clear();
      router.push(`/order/${encodeURIComponent(order.ref)}`);
    } catch (e) {
      setServerError(e instanceof ApiRequestError ? e.message : "Could not send your order. Please check your connection and try again.");
      turnstile.reset();
      setValue("turnstileToken", "");
    }
  });

  if (!hydrated || submitted) return <div className="mt-10 h-64 animate-pulse rounded-[var(--radius-card)] bg-white" />;

  if (!lines.length) {
    return (
      <div className="card mt-10 p-10 text-center">
        <p className="text-ink-soft">Your cart is empty.</p>
        <Link href="/products" className="btn-primary mt-6">Browse products</Link>
      </div>
    );
  }

  const { total, hasUnpriced } = cartEstimate(lines);

  return (
    <form onSubmit={onSubmit} noValidate className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="card space-y-6 p-6 sm:p-8">
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-4 text-lg font-semibold">Contact</legend>
          <Field label="Full name" error={errors.customerName?.message}>
            <input className="field-input" autoComplete="name" {...register("customerName")} />
          </Field>
          <Field label="Phone / WhatsApp" error={errors.phone?.message} hint="We'll use this to confirm your order.">
            <input className="field-input" type="tel" autoComplete="tel" placeholder="+266 …" {...register("phone")} />
          </Field>
          <Field label="Email (optional)" error={errors.email?.message} hint="For an emailed copy of your order.">
            <input className="field-input" type="email" autoComplete="email" {...register("email")} />
          </Field>
          <Field label="I'm ordering as" error={errors.customerType?.message}>
            <select className="field-input" {...register("customerType")}>
              {CUSTOMER_TYPES.map((t) => (
                <option key={t} value={t}>{CUSTOMER_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </Field>
          {customerType !== "individual" && (
            <Field label="Business name" error={errors.businessName?.message}>
              <input className="field-input" autoComplete="organization" {...register("businessName")} />
            </Field>
          )}
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-4 text-lg font-semibold">Delivery or pickup</legend>
          <div className="sm:col-span-2 flex flex-wrap gap-3">
            {(["delivery", "pickup"] as const).map((f) => (
              <label
                key={f}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
                  fulfilment === f ? "border-leaf bg-sprout-light text-ink" : "border-line bg-white text-ink-soft"
                }`}
              >
                <input type="radio" value={f} {...register("fulfilment")} className="accent-[var(--color-leaf)]" />
                {f === "delivery" ? "Delivery" : "I'll collect (pickup)"}
              </label>
            ))}
          </div>
          <Field label="District" error={errors.district?.message}>
            <select className="field-input" {...register("district")}>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Field>
          {fulfilment === "delivery" && (
            <Field label="Delivery address" error={errors.address?.message}>
              <input className="field-input" autoComplete="street-address" placeholder="Village / town, landmarks" {...register("address")} />
            </Field>
          )}
          <div className="sm:col-span-2">
            <Notice>
              Delivery areas, fees and pickup points are still being finalised — we&apos;ll confirm them with you.{" "}
              <Link href="/delivery" className="font-semibold underline underline-offset-2">Delivery info</Link>
            </Notice>
          </div>
        </fieldset>

        <Field label="Notes (optional)" error={errors.notes?.message}>
          <textarea className="field-input min-h-24" placeholder="Preferred day, special requests…" {...register("notes")} />
        </Field>

        <div>
          <Turnstile widgetId={turnstile.widgetId} onToken={(t) => setValue("turnstileToken", t, { shouldValidate: !!t })} />
          {errors.turnstileToken && <p className="field-error">{errors.turnstileToken.message}</p>}
        </div>
        {errors.items && <Notice tone="error">{errors.items.message ?? "Please check your cart."}</Notice>}
        {serverError && <Notice tone="error">{serverError}</Notice>}
      </div>

      <aside className="card h-fit space-y-4 p-6 lg:sticky lg:top-24">
        <h2 className="text-xl font-semibold">Your order</h2>
        <ul className="divide-y divide-line text-sm">
          {lines.map((l) => (
            <li key={l.variantId} className="flex justify-between gap-3 py-2.5">
              <span>
                <span className="font-medium">{l.qty} × {l.productName}</span>
                <span className="block text-muted">{l.variantLabel}</span>
              </span>
              <span className="shrink-0 text-ink-soft">{l.priceLsl != null ? formatPrice(l.priceLsl * l.qty) : "On request"}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between border-t border-line pt-4">
          <span className="text-ink-soft">Estimated total</span>
          <span className="font-display text-2xl font-bold">{total != null ? formatPrice(total) : "—"}</span>
        </div>
        {hasUnpriced && <p className="text-xs text-muted">Some items are priced on request.</p>}
        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending order…" : "Send order request"}
        </button>
        <Link href="/cart" className="block text-center text-sm font-medium text-leaf">Edit cart</Link>
      </aside>
    </form>
  );
}
