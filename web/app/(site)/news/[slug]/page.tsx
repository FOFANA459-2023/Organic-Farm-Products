import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Paragraphs } from "@/components/ui";
import { getPost } from "@/lib/api";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return { title: "Post not found" };
  return { title: post.title, description: post.excerpt, openGraph: post.cover ? { images: [post.cover] } : undefined };
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  return (
    <article className="container-page max-w-3xl py-14">
      <Link href="/news" className="text-sm font-medium text-leaf">← All news</Link>
      {post.publishedAt && (
        <time className="mt-6 block text-xs font-medium uppercase tracking-widest text-muted" dateTime={post.publishedAt}>
          {formatDate(post.publishedAt)}
        </time>
      )}
      <h1 className="mt-2 text-4xl font-bold sm:text-5xl">{post.title}</h1>
      {post.excerpt && <p className="mt-4 text-lg text-ink-soft">{post.excerpt}</p>}
      {post.cover && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[var(--radius-card)] bg-sprout-light">
          <Image src={post.cover} alt="" fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" priority />
        </div>
      )}
      <Paragraphs text={post.body} className="prose-farm mt-8 text-[17px]" />
    </article>
  );
}
