import type { Metadata } from "next";
import { getSettings } from "@/lib/api";
import { OrderConfirmation } from "./order-confirmation";

export const metadata: Metadata = { title: "Order received", robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ ref: string }> }) {
  const [{ ref }, settings] = await Promise.all([params, getSettings()]);
  return (
    <div className="container-page py-14 sm:py-20">
      <OrderConfirmation orderRef={decodeURIComponent(ref)} whatsapp={settings.whatsapp} />
    </div>
  );
}
