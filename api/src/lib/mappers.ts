import type { Category, Enquiry, Order, OrderItem, Post, Product, Variant } from "@ofp/shared";

// Supabase rows are snake_case and numeric columns come back as strings or numbers;
// these mappers produce the camelCase API shapes from @ofp/shared.

type Row = Record<string, any>;

const num = (v: unknown): number | null => (v == null ? null : Number(v));

export const PRODUCT_SELECT =
  "*, category:categories!inner(name, slug), variants:product_variants(id, label, price_lsl, sort)";

export function toCategory(r: Row): Category {
  return { id: r.id, name: r.name, slug: r.slug, sort: r.sort };
}

export function toVariant(r: Row): Variant {
  return { id: r.id, label: r.label, priceLsl: num(r.price_lsl) };
}

export function toProduct(r: Row): Product {
  const variants = [...((r.variants as Row[]) ?? [])].sort((a, b) => a.sort - b.sort).map(toVariant);
  return {
    id: r.id,
    categoryId: r.category_id,
    categorySlug: r.category?.slug ?? "",
    categoryName: r.category?.name ?? "",
    name: r.name,
    slug: r.slug,
    shortDescription: r.short_description,
    description: r.description,
    images: r.images ?? [],
    availability: r.availability,
    orderable: r.orderable,
    bulkAvailable: r.bulk_available,
    sourcingNote: r.sourcing_note,
    published: r.published,
    featured: r.featured,
    sort: r.sort,
    variants,
  };
}

export function toPost(r: Row): Post {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt,
    cover: r.cover,
    body: r.body,
    publishedAt: r.published_at,
  };
}

export function toOrderItem(r: Row): OrderItem {
  return {
    id: r.id,
    productId: r.product_id,
    variantId: r.variant_id,
    productName: r.product_name,
    variantLabel: r.variant_label,
    qty: r.qty,
    unitPrice: num(r.unit_price),
  };
}

export function toOrder(r: Row): Order {
  return {
    id: r.id,
    ref: r.ref,
    status: r.status,
    customerName: r.customer_name,
    phone: r.phone,
    email: r.email,
    customerType: r.customer_type,
    businessName: r.business_name,
    district: r.district,
    fulfilment: r.fulfilment,
    address: r.address,
    notes: r.notes,
    adminNotes: r.admin_notes,
    estimatedTotal: num(r.estimated_total),
    hasUnpricedItems: r.has_unpriced_items,
    createdAt: r.created_at,
    items: ((r.items as Row[]) ?? []).map(toOrderItem),
  };
}

export function toEnquiry(r: Row): Enquiry {
  return {
    id: r.id,
    type: r.type,
    name: r.name,
    phone: r.phone,
    email: r.email,
    business: r.business,
    message: r.message,
    status: r.status,
    createdAt: r.created_at,
  };
}
