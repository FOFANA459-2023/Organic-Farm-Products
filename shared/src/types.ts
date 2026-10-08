import type {
  Availability,
  CustomerType,
  District,
  EnquiryStatus,
  EnquiryType,
  Fulfilment,
  OrderStatus,
} from "./constants";

// API response shapes (camelCase). The API maps DB rows to these.

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort: number;
}

export interface Variant {
  id: string;
  label: string;
  /** null = "Price on request" */
  priceLsl: number | null;
}

export interface Product {
  id: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  images: string[];
  availability: Availability;
  orderable: boolean;
  bulkAvailable: boolean;
  sourcingNote: string | null;
  published: boolean;
  featured: boolean;
  sort: number;
  variants: Variant[];
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover: string | null;
  body: string;
  publishedAt: string | null;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  variantId: string | null;
  productName: string;
  variantLabel: string;
  qty: number;
  unitPrice: number | null;
}

export interface Order {
  id: string;
  ref: string;
  status: OrderStatus;
  customerName: string;
  phone: string;
  email: string | null;
  customerType: CustomerType;
  businessName: string | null;
  district: District;
  fulfilment: Fulfilment;
  address: string | null;
  notes: string | null;
  adminNotes: string | null;
  estimatedTotal: number | null;
  hasUnpricedItems: boolean;
  createdAt: string;
  items: OrderItem[];
}

export interface Enquiry {
  id: string;
  type: EnquiryType;
  name: string;
  phone: string;
  email: string | null;
  business: string | null;
  message: string | null;
  status: EnquiryStatus;
  createdAt: string;
}

export interface OrderCreated {
  ref: string;
  estimatedTotal: number | null;
  hasUnpricedItems: boolean;
  whatsappUrl: string;
}

export interface ApiError {
  error: { code: string; message: string; issues?: unknown };
}
