"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Post } from "@ofp/shared";
import { useEffect, useState } from "react";
import { AdminTitle, Loading } from "@/components/admin/admin-ui";
import { SingleImageInput } from "@/components/admin/image-upload";
import { Notice } from "@/components/ui";
import { adminFetch, slugify, useAdminData } from "@/lib/admin-api";

interface Draft {
  title: string;
  slug: string;
  excerpt: string;
  cover: string | null;
  body: string;
  published: boolean;
  /** datetime-local value (local time) */
  publishedAt: string;
}

const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const EMPTY: Draft = { title: "", slug: "", excerpt: "", cover: null, body: "", published: false, publishedAt: "" };

export default function PostEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const router = useRouter();
  const post = useAdminData<Post>(isNew ? null : `/posts/${id}`);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const p = post.data;
    if (p)
      setDraft({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        cover: p.cover,
        body: p.body,
        published: !!p.publishedAt,
        publishedAt: p.publishedAt ? toLocalInput(p.publishedAt) : "",
      });
  }, [post.data]);

  if (!isNew && post.loading) return <Loading />;
  if (!isNew && (post.error || !post.data)) return <Notice tone="error">{post.error || "Post not found"}</Notice>;

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    const publishedAt = draft.published ? (draft.publishedAt ? new Date(draft.publishedAt) : new Date()).toISOString() : null;
    try {
      const saved = await adminFetch<Post>(isNew ? "/posts" : `/posts/${id}`, {
        method: isNew ? "POST" : "PUT",
        body: JSON.stringify({ title: draft.title, slug: draft.slug, excerpt: draft.excerpt, cover: draft.cover, body: draft.body, publishedAt }),
      });
      if (isNew) router.replace(`/admin/news/${saved.id}`);
      else {
        post.setData(saved);
        setMsg({ tone: "success", text: "Saved." });
      }
    } catch (err) {
      setMsg({ tone: "error", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete "${draft.title}"? This cannot be undone.`)) return;
    try {
      await adminFetch(`/posts/${id}`, { method: "DELETE" });
      router.replace("/admin/news");
    } catch (err) {
      setMsg({ tone: "error", text: err instanceof Error ? err.message : "Delete failed" });
    }
  };

  return (
    <form onSubmit={save}>
      <Link href="/admin/news" className="text-sm text-leaf">← All news</Link>
      <AdminTitle title={isNew ? "New post" : "Edit post"}>
        <button className="btn-primary !py-2" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
      </AdminTitle>
      {msg && <div className="mb-5"><Notice tone={msg.tone}>{msg.text}</Notice></div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="card space-y-4 bg-white p-6">
          <label className="block">
            <span className="field-label">Title</span>
            <input
              className="field-input"
              required
              value={draft.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
            />
          </label>
          <label className="block">
            <span className="field-label">Web address</span>
            <div className="flex items-center gap-1 text-sm text-muted">
              /news/
              <input className="field-input" required value={draft.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} />
            </div>
          </label>
          <label className="block">
            <span className="field-label">Summary</span>
            <input className="field-input" maxLength={300} value={draft.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
          </label>
          <label className="block">
            <span className="field-label">Body</span>
            <textarea className="field-input min-h-72" value={draft.body} onChange={(e) => set("body", e.target.value)} />
            <span className="mt-1 block text-xs text-muted">Leave a blank line between paragraphs.</span>
          </label>
        </section>

        <aside className="space-y-6">
          <section className="card space-y-4 bg-white p-6">
            <label className="flex items-center gap-2.5 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-[var(--color-leaf)]" checked={draft.published} onChange={(e) => set("published", e.target.checked)} />
              Published
            </label>
            {draft.published && (
              <label className="block">
                <span className="field-label">Publish date</span>
                <input type="datetime-local" className="field-input" value={draft.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} />
                <span className="mt-1 block text-xs text-muted">Empty = now. A future date schedules the post.</span>
              </label>
            )}
          </section>
          <section className="card bg-white p-6">
            <h2 className="mb-3 font-semibold">Cover photo</h2>
            <SingleImageInput value={draft.cover} onChange={(url) => set("cover", url)} />
          </section>
          {!isNew && (
            <button type="button" onClick={remove} className="text-sm font-medium text-danger">Delete post</button>
          )}
        </aside>
      </div>
    </form>
  );
}
