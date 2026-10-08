import type { MetadataRoute } from "next";
import { getPosts, getProducts } from "@/lib/api";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics = ["", "/products", "/about", "/farm", "/poultry", "/wholesale", "/news", "/contact", "/delivery"].map(
    (path) => ({ url: `${SITE_URL}${path}` }),
  );
  const [products, posts] = await Promise.all([getProducts().catch(() => []), getPosts(50).catch(() => [])]);
  return [
    ...statics,
    ...products.map((p) => ({ url: `${SITE_URL}/products/${p.slug}` })),
    ...posts.map((p) => ({ url: `${SITE_URL}/news/${p.slug}`, lastModified: p.publishedAt ?? undefined })),
  ];
}
