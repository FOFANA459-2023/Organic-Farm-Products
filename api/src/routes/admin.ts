import { Hono } from "hono";
import {
  categoryInputSchema,
  ENQUIRY_STATUSES,
  enquiryStatusUpdateSchema,
  ORDER_STATUSES,
  orderStatusUpdateSchema,
  postInputSchema,
  productInputSchema,
  settingsSchema,
} from "@ofp/shared";
import type { z } from "zod";
import type { AppEnv } from "../env";
import { ApiError, check, maybe, must, notFound, parseBody } from "../lib/http";
import { PRODUCT_SELECT, toCategory, toEnquiry, toOrder, toPost, toProduct } from "../lib/mappers";
import { requireAdmin } from "../lib/middleware";
import { loadSettings } from "../lib/settings";
import { db } from "../lib/supabase";

export const adminRoutes = new Hono<AppEnv>();
adminRoutes.use("*", requireAdmin);

adminRoutes.get("/me", (c) => c.json({ userId: c.get("adminUserId") }));

// ---------- dashboard ----------

adminRoutes.get("/summary", async (c) => {
  const supabase = db(c.env);
  const count = async (table: string, status: string) => {
    const { count } = await supabase.from(table).select("id", { count: "exact", head: true }).eq("status", status);
    return count ?? 0;
  };
  const [newOrders, confirmedOrders, newEnquiries] = await Promise.all([
    count("orders", "new"),
    count("orders", "confirmed"),
    count("enquiries", "new"),
  ]);
  return c.json({ newOrders, confirmedOrders, newEnquiries });
});

// ---------- categories ----------

adminRoutes.get("/categories", async (c) => {
  const rows = must(await db(c.env).from("categories").select("*").order("sort"));
  return c.json(rows.map(toCategory));
});

adminRoutes.post("/categories", async (c) => {
  const input = await parseBody(c, categoryInputSchema);
  const row = must(await db(c.env).from("categories").insert(input).select().single());
  return c.json(toCategory(row), 201);
});

adminRoutes.put("/categories/:id", async (c) => {
  const input = await parseBody(c, categoryInputSchema);
  const row = maybe(await db(c.env).from("categories").update(input).eq("id", c.req.param("id")).select().maybeSingle());
  if (!row) throw notFound("Category");
  return c.json(toCategory(row));
});

adminRoutes.delete("/categories/:id", async (c) => {
  const res = await db(c.env).from("categories").delete().eq("id", c.req.param("id"));
  if (res.error?.code === "23503") {
    throw new ApiError(409, "in_use", "Move or delete the products in this category first");
  }
  check(res);
  return c.body(null, 204);
});

// ---------- products ----------

type ProductInput = z.infer<typeof productInputSchema>;

const productRow = (p: ProductInput) => ({
  category_id: p.categoryId,
  name: p.name,
  slug: p.slug,
  short_description: p.shortDescription,
  description: p.description,
  images: p.images,
  availability: p.availability,
  orderable: p.orderable,
  bulk_available: p.bulkAvailable,
  sourcing_note: p.sourcingNote || null,
  published: p.published,
  featured: p.featured,
  sort: p.sort,
});

async function getProduct(c: { env: AppEnv["Bindings"] }, id: string) {
  const row = maybe(await db(c.env).from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle());
  if (!row) throw notFound("Product");
  return toProduct(row);
}

/** Replace a product's variants with the submitted list: update existing ids, insert new, delete the rest. */
async function syncVariants(env: AppEnv["Bindings"], productId: string, variants: ProductInput["variants"]) {
  const supabase = db(env);
  const existing = must(await supabase.from("product_variants").select("id").eq("product_id", productId)) as {
    id: string;
  }[];
  const keep = new Set(variants.filter((v) => v.id).map((v) => v.id));
  const toDelete = existing.map((r) => r.id).filter((id) => !keep.has(id));
  if (toDelete.length) check(await supabase.from("product_variants").delete().in("id", toDelete));

  const rows = variants.map((v, i) => ({
    ...(v.id ? { id: v.id } : {}),
    product_id: productId,
    label: v.label,
    price_lsl: v.priceLsl,
    sort: i,
  }));
  const updates = rows.filter((r) => "id" in r);
  const inserts = rows.filter((r) => !("id" in r));
  if (updates.length) check(await supabase.from("product_variants").upsert(updates));
  if (inserts.length) check(await supabase.from("product_variants").insert(inserts));
}

adminRoutes.get("/products", async (c) => {
  const rows = must(await db(c.env).from("products").select(PRODUCT_SELECT).order("sort"));
  return c.json(rows.map(toProduct));
});

adminRoutes.get("/products/:id", async (c) => c.json(await getProduct(c, c.req.param("id"))));

adminRoutes.post("/products", async (c) => {
  const input = await parseBody(c, productInputSchema);
  const row = must(await db(c.env).from("products").insert(productRow(input)).select("id").single());
  await syncVariants(c.env, row.id, input.variants);
  return c.json(await getProduct(c, row.id), 201);
});

adminRoutes.put("/products/:id", async (c) => {
  const id = c.req.param("id");
  const input = await parseBody(c, productInputSchema);
  const row = maybe(await db(c.env).from("products").update(productRow(input)).eq("id", id).select("id").maybeSingle());
  if (!row) throw notFound("Product");
  await syncVariants(c.env, id, input.variants);
  return c.json(await getProduct(c, id));
});

adminRoutes.delete("/products/:id", async (c) => {
  check(await db(c.env).from("products").delete().eq("id", c.req.param("id")));
  return c.body(null, 204);
});

// ---------- posts ----------

const postRow = (p: z.infer<typeof postInputSchema>) => ({
  title: p.title,
  slug: p.slug,
  excerpt: p.excerpt,
  cover: p.cover,
  body: p.body,
  published_at: p.publishedAt,
});

adminRoutes.get("/posts", async (c) => {
  const rows = must(
    await db(c.env).from("posts").select("*").order("published_at", { ascending: false, nullsFirst: true }),
  );
  return c.json(rows.map(toPost));
});

adminRoutes.get("/posts/:id", async (c) => {
  const row = maybe(await db(c.env).from("posts").select("*").eq("id", c.req.param("id")).maybeSingle());
  if (!row) throw notFound("Post");
  return c.json(toPost(row));
});

adminRoutes.post("/posts", async (c) => {
  const input = await parseBody(c, postInputSchema);
  const row = must(await db(c.env).from("posts").insert(postRow(input)).select().single());
  return c.json(toPost(row), 201);
});

adminRoutes.put("/posts/:id", async (c) => {
  const input = await parseBody(c, postInputSchema);
  const row = maybe(
    await db(c.env).from("posts").update(postRow(input)).eq("id", c.req.param("id")).select().maybeSingle(),
  );
  if (!row) throw notFound("Post");
  return c.json(toPost(row));
});

adminRoutes.delete("/posts/:id", async (c) => {
  check(await db(c.env).from("posts").delete().eq("id", c.req.param("id")));
  return c.body(null, 204);
});

// ---------- settings ----------

adminRoutes.get("/settings", async (c) => c.json(await loadSettings(db(c.env))));

adminRoutes.put("/settings", async (c) => {
  const input = await parseBody(c, settingsSchema);
  check(await db(c.env).from("settings").upsert({ id: 1, data: input }));
  return c.json(input);
});

// ---------- uploads ----------

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

adminRoutes.post("/uploads", async (c) => {
  const form = await c.req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw new ApiError(400, "no_file", "Attach an image file");
  const ext = IMAGE_TYPES[file.type];
  if (!ext) throw new ApiError(400, "bad_type", "Use a JPG, PNG, WebP or AVIF image");
  if (file.size > 5 * 1024 * 1024) throw new ApiError(400, "too_large", "Images must be 5 MB or smaller");

  const supabase = db(c.env);
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  must(
    await supabase.storage
      .from("product-images")
      .upload(path, await file.arrayBuffer(), { contentType: file.type, cacheControl: "31536000" }),
  );
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return c.json({ url: data.publicUrl }, 201);
});

// ---------- orders ----------

adminRoutes.get("/orders", async (c) => {
  const status = c.req.query("status");
  const page = Math.max(Number(c.req.query("page")) || 1, 1);
  const pageSize = 25;
  let query = db(c.env)
    .from("orders")
    .select("*, items:order_items(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (status && (ORDER_STATUSES as readonly string[]).includes(status)) query = query.eq("status", status);
  const search = c.req.query("q")?.trim();
  if (search) {
    const term = search.replace(/[%,()]/g, "");
    query = query.or(`ref.ilike.%${term}%,customer_name.ilike.%${term}%,phone.ilike.%${term}%`);
  }
  const { data, count, error } = await query;
  check({ data, error });
  return c.json({ orders: (data ?? []).map(toOrder), total: count ?? 0, page, pageSize });
});

adminRoutes.get("/orders/:id", async (c) => {
  const row = maybe(
    await db(c.env).from("orders").select("*, items:order_items(*)").eq("id", c.req.param("id")).maybeSingle(),
  );
  if (!row) throw notFound("Order");
  return c.json(toOrder(row));
});

adminRoutes.patch("/orders/:id", async (c) => {
  const input = await parseBody(c, orderStatusUpdateSchema);
  const patch: Record<string, unknown> = { status: input.status };
  if (input.adminNotes !== undefined) patch.admin_notes = input.adminNotes;
  const row = maybe(
    await db(c.env)
      .from("orders")
      .update(patch)
      .eq("id", c.req.param("id"))
      .select("*, items:order_items(*)")
      .maybeSingle(),
  );
  if (!row) throw notFound("Order");
  return c.json(toOrder(row));
});

// ---------- enquiries ----------

adminRoutes.get("/enquiries", async (c) => {
  const status = c.req.query("status");
  let query = db(c.env).from("enquiries").select("*").order("created_at", { ascending: false }).limit(200);
  if (status && (ENQUIRY_STATUSES as readonly string[]).includes(status)) query = query.eq("status", status);
  const rows = must(await query);
  return c.json(rows.map(toEnquiry));
});

adminRoutes.patch("/enquiries/:id", async (c) => {
  const input = await parseBody(c, enquiryStatusUpdateSchema);
  const row = maybe(
    await db(c.env).from("enquiries").update(input).eq("id", c.req.param("id")).select().maybeSingle(),
  );
  if (!row) throw notFound("Enquiry");
  return c.json(toEnquiry(row));
});
