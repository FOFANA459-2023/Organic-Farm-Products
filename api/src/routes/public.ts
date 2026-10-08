import { Hono } from "hono";
import {
  CUSTOMER_TYPE_LABELS,
  enquiryInputSchema,
  formatPrice,
  orderInputSchema,
  orderWhatsAppMessage,
  whatsappLink,
  type OrderCreated,
} from "@ofp/shared";
import type { AppEnv } from "../env";
import { sendEmail } from "../lib/email";
import { ApiError, check, maybe, must, notFound, parseBody } from "../lib/http";
import { PRODUCT_SELECT, toCategory, toPost, toProduct } from "../lib/mappers";
import { formRateLimit, publicCache } from "../lib/middleware";
import { priceOrder, type VariantRecord } from "../lib/pricing";
import { loadSettings } from "../lib/settings";
import { db } from "../lib/supabase";
import { verifyTurnstile } from "../lib/turnstile";

export const publicRoutes = new Hono<AppEnv>();

// ---------- catalogue ----------

publicRoutes.get("/categories", publicCache, async (c) => {
  const rows = must(await db(c.env).from("categories").select("*").order("sort"));
  return c.json(rows.map(toCategory));
});

publicRoutes.get("/products", publicCache, async (c) => {
  let query = db(c.env).from("products").select(PRODUCT_SELECT).eq("published", true);
  const category = c.req.query("category");
  if (category) query = query.eq("category.slug", category);
  if (c.req.query("featured") === "true") query = query.eq("featured", true);
  const rows = must(await query.order("sort"));
  return c.json(rows.map(toProduct));
});

publicRoutes.get("/products/:slug", publicCache, async (c) => {
  const row = maybe(
    await db(c.env)
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", c.req.param("slug"))
      .eq("published", true)
      .maybeSingle(),
  );
  if (!row) throw notFound("Product");
  return c.json(toProduct(row));
});

// ---------- news ----------

publicRoutes.get("/posts", publicCache, async (c) => {
  const limit = Math.min(Number(c.req.query("limit")) || 20, 50);
  const rows = must(
    await db(c.env)
      .from("posts")
      .select("*")
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(limit),
  );
  return c.json(rows.map(toPost));
});

publicRoutes.get("/posts/:slug", publicCache, async (c) => {
  const row = maybe(
    await db(c.env)
      .from("posts")
      .select("*")
      .eq("slug", c.req.param("slug"))
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .maybeSingle(),
  );
  if (!row) throw notFound("Post");
  return c.json(toPost(row));
});

// ---------- settings ----------

publicRoutes.get("/settings", publicCache, async (c) => {
  const settings = await loadSettings(db(c.env));
  // Registration details are only public if the client chose to show them.
  const registration = settings.registration.show
    ? settings.registration
    : { show: false, companyName: settings.registration.companyName, number: "" };
  return c.json({ ...settings, registration });
});

// ---------- orders ----------

publicRoutes.post("/orders", formRateLimit, async (c) => {
  const input = await parseBody(c, orderInputSchema);
  await verifyTurnstile(c.env.TURNSTILE_SECRET_KEY, input.turnstileToken, c.req.header("CF-Connecting-IP"));

  const supabase = db(c.env);
  const variantIds = [...new Set(input.items.map((i) => i.variantId))];
  const variantRows = must(
    await supabase
      .from("product_variants")
      .select("id, label, price_lsl, product:products!inner(id, name, published, orderable, availability)")
      .in("id", variantIds),
  );
  const variants: VariantRecord[] = variantRows.map((r: any) => ({
    id: r.id,
    label: r.label,
    priceLsl: r.price_lsl == null ? null : Number(r.price_lsl),
    product: r.product,
  }));

  const priced = priceOrder(input.items, variants);

  const created = must(
    await supabase.rpc("create_order", {
      p_order: {
        customer_name: input.customerName,
        phone: input.phone,
        email: input.email || null,
        customer_type: input.customerType,
        business_name: input.businessName ?? null,
        district: input.district,
        fulfilment: input.fulfilment,
        address: input.fulfilment === "delivery" ? input.address : null,
        notes: input.notes ?? null,
        estimated_total: priced.estimatedTotal,
        has_unpriced_items: priced.hasUnpricedItems,
      },
      p_items: priced.lines.map((l) => ({
        product_id: l.productId,
        variant_id: l.variantId,
        product_name: l.productName,
        variant_label: l.variantLabel,
        qty: l.qty,
        unit_price: l.unitPrice,
      })),
    }),
  ) as { id: string; ref: string }[];
  const ref = created[0]?.ref;
  if (!ref) throw new ApiError(500, "order_failed", "Could not save your order");

  const settings = await loadSettings(supabase);
  const lineText = priced.lines
    .map((l) => `- ${l.qty} × ${l.productName} (${l.variantLabel}) @ ${formatPrice(l.unitPrice)}`)
    .join("\n");
  const totalText =
    (priced.estimatedTotal != null ? `Estimated total: ${formatPrice(priced.estimatedTotal)}` : "Estimated total: —") +
    (priced.hasUnpricedItems ? " (some items are priced on request)" : "");

  c.executionCtx.waitUntil(
    sendEmail(c.env, {
      to: c.env.ORDER_NOTIFY_EMAIL,
      subject: `New order ${ref} from ${input.customerName}`,
      replyTo: input.email || undefined,
      text: [
        `New order request ${ref}`,
        "",
        `Name: ${input.customerName}`,
        `Phone: ${input.phone}`,
        `Email: ${input.email || "—"}`,
        `Customer type: ${CUSTOMER_TYPE_LABELS[input.customerType]}${input.businessName ? ` — ${input.businessName}` : ""}`,
        `District: ${input.district}`,
        `Fulfilment: ${input.fulfilment}${input.fulfilment === "delivery" ? ` — ${input.address}` : ""}`,
        `Notes: ${input.notes ?? "—"}`,
        "",
        lineText,
        totalText,
        "",
        "Manage this order in the website admin.",
      ].join("\n"),
    }),
  );
  if (input.email) {
    c.executionCtx.waitUntil(
      sendEmail(c.env, {
        to: input.email,
        subject: `We received your order ${ref} — Organic Farm Products`,
        replyTo: settings.email,
        text: [
          `Hello ${input.customerName},`,
          "",
          `Thank you for your order request (${ref}). We will contact you on ${input.phone} to confirm availability, the final total and ${input.fulfilment === "delivery" ? "delivery" : "pickup"} details. No payment has been taken.`,
          "",
          lineText,
          totalText,
          "",
          `Questions? WhatsApp or call us on ${settings.whatsapp}, or reply to this email.`,
          "",
          "Organic Farm Products",
        ].join("\n"),
      }),
    );
  }

  const response: OrderCreated = {
    ref,
    estimatedTotal: priced.estimatedTotal,
    hasUnpricedItems: priced.hasUnpricedItems,
    whatsappUrl: whatsappLink(settings.whatsapp, orderWhatsAppMessage(ref, input.customerName, priced.lines)),
  };
  return c.json(response, 201);
});

// ---------- enquiries ----------

publicRoutes.post("/enquiries", formRateLimit, async (c) => {
  const input = await parseBody(c, enquiryInputSchema);
  await verifyTurnstile(c.env.TURNSTILE_SECRET_KEY, input.turnstileToken, c.req.header("CF-Connecting-IP"));

  check(
    await db(c.env).from("enquiries").insert({
      type: input.type,
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      business: input.business ?? null,
      message: input.message ?? null,
    }),
  );

  const label = { wholesale: "Wholesale / business enquiry", notify: "Chicken launch notification request", contact: "Website message" }[
    input.type
  ];
  c.executionCtx.waitUntil(
    sendEmail(c.env, {
      to: c.env.ORDER_NOTIFY_EMAIL,
      subject: `${label} from ${input.name}`,
      replyTo: input.email || undefined,
      text: [
        label,
        "",
        `Name: ${input.name}`,
        `Phone: ${input.phone}`,
        `Email: ${input.email || "—"}`,
        `Business: ${input.business ?? "—"}`,
        "",
        input.message ?? "",
      ].join("\n"),
    }),
  );

  return c.json({ ok: true }, 201);
});
