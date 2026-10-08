import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { getPosts } from "@/lib/api";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "News",
  description: "New products, harvests and announcements from Organic Farm Products.",
};

export default async function NewsPage() {
  const posts = await getPosts(50);
  return (
    <>
      <PageHeader eyebrow="News & updates" title="What's happening on the farm" />
      <section className="container-page py-14">
        {posts.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.id} href={`/news/${p.slug}`} className="card group overflow-hidden hover:border-leaf">
                {p.cover && (
                  <div className="relative aspect-[16/9] bg-sprout-light">
                    <Image src={p.cover} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
                  </div>
                )}
                <div className="p-6">
                  {p.publishedAt && (
                    <time className="text-xs font-medium uppercase tracking-widest text-muted" dateTime={p.publishedAt}>
                      {formatDate(p.publishedAt)}
                    </time>
                  )}
                  <h2 className="mt-2 text-xl font-semibold group-hover:text-leaf">{p.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{p.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-ink-soft">No news yet — check back soon.</p>
        )}
      </section>
    </>
  );
}
