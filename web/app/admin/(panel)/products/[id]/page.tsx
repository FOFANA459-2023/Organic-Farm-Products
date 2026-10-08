"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AVAILABILITY, AVAILABILITY_LABELS, type Availability, type Category, type Product } from "@ofp/shared";
import { useEffect, useState } from "react";
import { AdminTitle, Loading } from "@/components/admin/admin-ui";
import { ImageListInput } from "@/components/admin/image-upload";
import { Notice } from "@/components/ui";
import { adminFetch, slugify, useAdminData } from "@/lib/admin-api";

interface VariantDraft {
  id?: string;
  label: string;
  price: string; // text input; "" = price on request
}

interface Draft {
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  images: string[];
  availability: Availability;
  orderable: boolean;
  bulkAvailable: boolean;
  sourcingNote: string;
  published: boolean;
  featured: boolean;
  sort: number;
  variants: VariantDraft[];
}

const EMPTY: Draft = {
  categoryId: "",
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  images: [],
  availability: "available",
  orderable: true,
  bulkAvailable: false,
  sourcingNote: "",
  published: false,
  featured: false,
  sort: 0,
  variants: [{ label: "", price: "" }],
};

const fromProduct = (p: Product): Draft => ({
  categoryId: p.categoryId,
  name: p.name,
  slug: p.slug,
  shortDescription: p.shortDescription,
  description: p.description,
  images: p.images,
  availability: p.availability,
  orderable: p.orderable,
  bulkAvailable: p.bulkAvailable,
  sourcingNote: p.sourcingNote ?? "",
  published: p.published,
  featured: p.featured,
  sort: p.sort,
  variants: p.variants.map((v) => ({ id: v.id, label: v.label, price: v.priceLsl == null ? "" : String(v.priceLsl) })),
});

export default function ProductEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const router = useRouter();
  const categories = useAdminData<Category[]>("/categories");
  const product = useAdminData<Product>(isNew ? null : `/products/${id}`);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (product.data) setDraft(fromProduct(product.data));
  }, [product.data]);
  useEffect(() => {
    if (isNew && !draft.categoryId && categories.data?.[0]) setDraft((d) => ({ ...d, categoryId: categories.data![0]!.id }));
  }, [isNew, categories.data, draft.categoryId]);

  if (!isNew && product.loading) return <Loading />;
  if (!isNew && (product.error || !product.data)) return <Notice tone="error">{product.error || "Product not found"}</Notice>;

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const setVariant = (i: number, patch: Partial<VariantDraft>) =>
    setDraft((d) => ({ ...d, variants: d.variants.map((v, j) => (j === i ? { ...v, ...patch } : v)) }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const badPrice = draft.variants.find((v) => v.price.trim() && !(Number(v.price) >= 0));
    if (badPrice) return setMsg({ tone: "error", text: `Price for "${badPrice.label}" must be a number (or empty for "Price on request").` });

    const body = {
      ...draft,
      sourcingNote: draft.sourcingNote.trim() || null,
      variants: draft.variants
        .filter((v) => v.label.trim())
        .map((v) => ({ id: v.id, label: v.label.trim(), priceLsl: v.price.trim() ? Number(v.price) : null })),
    };
    setSaving(true);
    try {
      const saved = await adminFetch<Product>(isNew ? "/products" : `/products/${id}`, {
        method: isNew ? "POST" : "PUT",
        body: JSON.stringify(body),
      });
      if (isNew) router.replace(`/admin/products/${saved.id}`);
      else {
        product.setData(saved);
        setMsg({ tone: "success", text: "Saved. Changes appear on the website within about a minute." });
      }
    } catch (err) {
      setMsg({ tone: "error", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete "${draft.name}"? This cannot be undone. Past orders keep their item details.`)) return;
    try {
      await adminFetch(`/products/${id}`, { method: "DELETE" });
      router.replace("/admin/products");
    } catch (err) {
      setMsg({ tone: "error", text: err instanceof Error ? err.message : "Delete failed" });
    }
  };

  return (
    <form onSubmit={save}>
      <Link href="/admin/products" className="text-sm text-leaf">← All products</Link>
      <AdminTitle title={isNew ? "New product" : draft.name || "Edit product"}>
        {!isNew && draft.published && (
          <Link href={`/products/${draft.slug}`} target="_blank" className="btn-secondary !py-2">View on site ↗</Link>
        )}
        <button className="btn-primary !py-2" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
      </AdminTitle>
      {msg && <div className="mb-5"><Notice tone={msg.tone}>{msg.text}</Notice></div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="card space-y-4 bg-white p-6">
            <label className="block">
              <span className="field-label">Name</span>
              <input
                className="field-input"
                required
                value={draft.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
              />
            </label>
            <label className="block">
              <span className="field-label">Web address</span>
              <div className="flex items-center gap-1 text-sm text-muted">
                /products/
                <input
                  className="field-input"
                  required
                  value={draft.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", slugify(e.target.value));
                  }}
                />
              </div>
            </label>
            <label className="block">
              <span className="field-label">Short description</span>
              <input className="field-input" maxLength={300} value={draft.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
            </label>
            <label className="block">
              <span className="field-label">Full description</span>
              <textarea className="field-input min-h-36" value={draft.description} onChange={(e) => set("description", e.target.value)} />
              <span className="mt-1 block text-xs text-muted">Leave a blank line between paragraphs. Only state facts you can support — no unverified claims like “100% organic”.</span>
            </label>
            <label className="block">
              <span className="field-label">Sourcing note (optional)</span>
              <input
                className="field-input"
                placeholder="e.g. Sourced from SanLi, Lesotho."
                value={draft.sourcingNote}
                onChange={(e) => set("sourcingNote", e.target.value)}
              />
            </label>
          </section>

          <section className="card bg-white p-6">
            <h2 className="mb-4 font-semibold">Photos</h2>
            <ImageListInput value={draft.images} onChange={(urls) => set("images", urls)} />
          </section>

          <section className="card bg-white p-6">
            <h2 className="font-semibold">Sizes & prices</h2>
            <p className="mb-4 text-sm text-muted">Leave the price empty to show “Price on request”. Prices are in Maloti (M).</p>
            <div className="space-y-3">
              {draft.variants.map((v, i) => (
                <div key={v.id ?? `new-${i}`} className="flex flex-wrap items-center gap-2">
                  <input
                    className="field-input min-w-0 flex-[2_1_200px]"
                    placeholder="e.g. 5 kg bag"
                    value={v.label}
                    onChange={(e) => setVariant(i, { label: e.target.value })}
                    aria-label="Size / packaging"
                  />
                  <input
                    className="field-input flex-[1_1_110px]"
                    inputMode="decimal"
                    placeholder="Price (M)"
                    value={v.price}
                    onChange={(e) => setVariant(i, { price: e.target.value })}
                    aria-label="Price in Maloti"
                  />
                  <button
                    type="button"
                    className="px-2 text-sm text-muted hover:text-danger"
                    onClick={() => set("variants", draft.variants.filter((_, j) => j !== i))}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="btn-secondary mt-4 !py-1.5" onClick={() => set("variants", [...draft.variants, { label: "", price: "" }])}>
              + Add size
            </button>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card space-y-4 bg-white p-6">
            <label className="block">
              <span className="field-label">Category</span>
              <select className="field-input" value={draft.categoryId} onChange={(e) => set("categoryId", e.target.value)} required>
                {categories.data?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="field-label">Availability</span>
              <select className="field-input" value={draft.availability} onChange={(e) => set("availability", e.target.value as Availability)}>
                {AVAILABILITY.map((a) => (
                  <option key={a} value={a}>{AVAILABILITY_LABELS[a]}</option>
                ))}
              </select>
            </label>
            {[
              ["published", "Show on website"],
              ["orderable", "Can be added to cart (when available)"],
              ["featured", "Feature on home page"],
              ["bulkAvailable", "Offer bulk / business orders"],
            ].map(([k, label]) => (
              <label key={k} className="flex items-center gap-2.5 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--color-leaf)]"
                  checked={draft[k as "published"]}
                  onChange={(e) => set(k as "published", e.target.checked)}
                />
                {label}
              </label>
            ))}
            <label className="block">
              <span className="field-label">Sort order</span>
              <input className="field-input" type="number" value={draft.sort} onChange={(e) => set("sort", Number(e.target.value) || 0)} />
            </label>
          </section>
          {!isNew && (
            <button type="button" onClick={remove} className="text-sm font-medium text-danger">
              Delete product
            </button>
          )}
        </aside>
      </div>
    </form>
  );
}
