"use client";

import Link from "next/link";
import type { Post } from "@ofp/shared";
import { AdminTitle, formatDateTime, Loading } from "@/components/admin/admin-ui";
import { Notice } from "@/components/ui";
import { useAdminData } from "@/lib/admin-api";

export default function AdminNewsPage() {
  const { data, error, loading } = useAdminData<Post[]>("/posts");
  return (
    <>
      <AdminTitle title="News">
        <Link href="/admin/news/new" className="btn-primary !py-2">+ New post</Link>
      </AdminTitle>
      {error && <Notice tone="error">{error}</Notice>}
      {loading ? (
        <Loading />
      ) : !data?.length ? (
        <p className="text-ink-soft">No posts yet.</p>
      ) : (
        <ul className="card divide-y divide-line bg-white">
          {data.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/news/${p.id}`} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 hover:bg-mist">
                <span className="font-semibold">{p.title}</span>
                <span className="text-sm text-muted">
                  {!p.publishedAt ? "Draft" : new Date(p.publishedAt) > new Date() ? `Scheduled ${formatDateTime(p.publishedAt)}` : formatDateTime(p.publishedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
