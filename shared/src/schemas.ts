import { z } from "zod";
import {
  AVAILABILITY,
  CUSTOMER_TYPES,
  DISTRICTS,
  ENQUIRY_STATUSES,
  ENQUIRY_TYPES,
  FULFILMENT,
  MAX_CART_QTY,
  ORDER_STATUSES,
} from "./constants";

const trimmed = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) =>
  trimmed(max)
    .optional()
    .transform((v) => (v ? v : undefined));

// Lesotho numbers are 8 digits; also accept +266 / international formats for export buyers.
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()-]{8,20}$/, "Enter a valid phone number");

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes");

// ---------- Public: orders ----------

export const orderItemInputSchema = z.object({
  variantId: z.string().uuid(),
  qty: z.number().int().min(1).max(MAX_CART_QTY),
});

export const orderInputSchema = z
  .object({
    customerName: trimmed(120).min(2, "Enter your name"),
    phone: phoneSchema,
    email: z.union([z.literal(""), z.email("Enter a valid email")]).optional(),
    customerType: z.enum(CUSTOMER_TYPES),
    businessName: optionalText(160),
    district: z.enum(DISTRICTS),
    fulfilment: z.enum(FULFILMENT),
    address: optionalText(300),
    notes: optionalText(1000),
    items: z.array(orderItemInputSchema).min(1, "Your cart is empty").max(50),
    turnstileToken: z.string().min(1, "Please complete the check"),
  })
  .refine((o) => o.fulfilment !== "delivery" || !!o.address, {
    message: "Enter a delivery address",
    path: ["address"],
  })
  .refine((o) => o.customerType === "individual" || !!o.businessName, {
    message: "Enter your business name",
    path: ["businessName"],
  });
export type OrderInput = z.input<typeof orderInputSchema>;

// ---------- Public: enquiries ----------

export const enquiryInputSchema = z.object({
  type: z.enum(ENQUIRY_TYPES),
  name: trimmed(120).min(2, "Enter your name"),
  phone: phoneSchema,
  email: z.union([z.literal(""), z.email("Enter a valid email")]).optional(),
  business: optionalText(160),
  message: optionalText(2000),
  turnstileToken: z.string().min(1, "Please complete the check"),
});
export type EnquiryInput = z.input<typeof enquiryInputSchema>;

// ---------- Admin ----------

export const variantInputSchema = z.object({
  id: z.string().uuid().optional(),
  label: trimmed(80).min(1, "Label required"),
  priceLsl: z.number().nonnegative().max(1_000_000).nullable(),
});

export const productInputSchema = z.object({
  categoryId: z.string().uuid(),
  name: trimmed(120).min(1),
  slug: slugSchema,
  shortDescription: trimmed(300).default(""),
  description: trimmed(5000).default(""),
  images: z.array(z.url()).max(12).default([]),
  availability: z.enum(AVAILABILITY),
  orderable: z.boolean(),
  bulkAvailable: z.boolean(),
  sourcingNote: trimmed(300).nullable().default(null),
  published: z.boolean(),
  featured: z.boolean().default(false),
  sort: z.number().int().default(0),
  variants: z.array(variantInputSchema).max(20).default([]),
});
export type ProductInput = z.input<typeof productInputSchema>;

export const categoryInputSchema = z.object({
  name: trimmed(80).min(1),
  slug: slugSchema,
  sort: z.number().int().default(0),
});

export const postInputSchema = z.object({
  title: trimmed(160).min(1),
  slug: slugSchema,
  excerpt: trimmed(300).default(""),
  cover: z.url().nullable().default(null),
  body: trimmed(20000).default(""),
  publishedAt: z.iso.datetime({ offset: true }).nullable().default(null),
});
export type PostInput = z.input<typeof postInputSchema>;

const tbd = trimmed(500).default("TBD");

export const settingsSchema = z.object({
  phones: z.object({
    agricultural: trimmed(40),
    fish: trimmed(40),
    poultry: trimmed(40),
  }),
  whatsapp: trimmed(40),
  email: z.email(),
  instagram: trimmed(300),
  facebook: trimmed(300),
  location: trimmed(200),
  delivery: z.object({
    areas: tbd,
    fees: tbd,
    minimumOrder: tbd,
    pickup: tbd,
    days: tbd,
    coldChain: tbd,
  }),
  registration: z.object({
    show: z.boolean(),
    companyName: trimmed(160),
    number: trimmed(80),
  }),
});
export type Settings = z.infer<typeof settingsSchema>;

export const orderStatusUpdateSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  adminNotes: trimmed(2000).optional(),
});

export const enquiryStatusUpdateSchema = z.object({
  status: z.enum(ENQUIRY_STATUSES),
});
