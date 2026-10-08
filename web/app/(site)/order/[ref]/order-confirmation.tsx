"use client";

import Link from "next/link";
import { formatPrice, whatsappLink, type OrderCreated } from "@ofp/shared";
import { useEffect, useState } from "react";
import { CheckIcon, WhatsAppIcon } from "@/components/icons";

export function OrderConfirmation({ orderRef, whatsapp }: { orderRef: string; whatsapp: string }) {
  const [order, setOrder] = useState<OrderCreated | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`ofp-order-${orderRef}`);
      if (raw) setOrder(JSON.parse(raw) as OrderCreated);
    } catch {
      /* no stored details — show the generic confirmation */
    }
  }, [orderRef]);

  const waUrl = order?.whatsappUrl ?? whatsappLink(whatsapp, `Hello Organic Farm Products, I've placed order ${orderRef} on your website.`);

  return (
    <div className="mx-auto max-w-xl text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sprout text-leaf-dark">
        <CheckIcon className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-4xl font-bold">Thank you — order received</h1>
      <p className="mt-3 text-lg text-ink-soft">
        Your order reference is <strong className="font-display text-ink">{orderRef}</strong>.
      </p>
      {order && (
        <p className="mt-2 text-ink-soft">
          Estimated total: <strong>{order.estimatedTotal != null ? formatPrice(order.estimatedTotal) : "to be confirmed"}</strong>
          {order.hasUnpricedItems && order.estimatedTotal != null ? " (plus items priced on request)" : ""}
        </p>
      )}
      <p className="mt-5 text-ink-soft">
        We&apos;ll contact you shortly to confirm availability, the final total, payment and delivery or pickup. For a faster
        response, send us your order on WhatsApp.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <a href={waUrl} className="btn-whatsapp" target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon /> Send order on WhatsApp
        </a>
        <Link href="/products" className="btn-secondary">
          Continue browsing
        </Link>
      </div>
    </div>
  );
}
