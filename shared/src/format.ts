import { CURRENCY } from "./constants";

export function formatPrice(value: number | null | undefined): string {
  if (value == null) return "Price on request";
  return `M${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const currencyCode = CURRENCY;

/** "+266 5896 9889" → "26658969889" for wa.me links. Bare 8-digit numbers get Lesotho's 266 prefix. */
export function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 8 ? `266${digits}` : digits;
}

export function whatsappLink(phone: string, message: string): string {
  return `https://wa.me/${toWhatsAppNumber(phone)}?text=${encodeURIComponent(message)}`;
}

export interface OrderMessageLine {
  productName: string;
  variantLabel: string;
  qty: number;
}

export function orderWhatsAppMessage(ref: string, customerName: string, lines: OrderMessageLine[]): string {
  const items = lines.map((l) => `• ${l.qty} × ${l.productName} (${l.variantLabel})`).join("\n");
  return `Hello Organic Farm Products, this is ${customerName}. I've placed order ${ref} on your website:\n${items}\nPlease confirm availability and total. Thank you!`;
}

export function productEnquiryMessage(productName: string): string {
  return `Hello Organic Farm Products, I'd like to order ${productName}. Please share sizes, prices and availability.`;
}
