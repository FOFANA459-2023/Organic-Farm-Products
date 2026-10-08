import type { Metadata } from "next";
import { CartView } from "./cart-view";

export const metadata: Metadata = { title: "Your cart", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <h1 className="text-4xl font-bold">Your cart</h1>
      <CartView />
    </div>
  );
}
