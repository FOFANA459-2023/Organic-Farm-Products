import type { Metadata } from "next";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Order details", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <p className="eyebrow">Almost done</p>
      <h1 className="mt-2 text-4xl font-bold">Your order details</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Send us your order request. We&apos;ll contact you to confirm availability, the final total, payment and delivery
        or pickup. No payment is taken on this website.
      </p>
      <CheckoutForm />
    </div>
  );
}
