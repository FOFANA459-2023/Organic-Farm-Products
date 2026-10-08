import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-bits";
import { PageHeader } from "@/components/ui";
import { getCategories, getProducts } from "@/lib/api";

export const metadata: Metadata = {
  title: "Products",
  description: "Sorghum, maize, sugar beans, rainbow trout (sourced from SanLi Lesotho) and packaged chicken coming soon.",
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [categories, products] = await Promise.all([getCategories(), getProducts({ category })]);

  const chip = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      active ? "bg-ink text-white" : "border border-line bg-white text-ink-soft hover:border-leaf hover:text-leaf"
    }`;

  return (
    <>
      <PageHeader
        eyebrow="Our products"
        title="Shop our products"
        intro={<p>Add products to your cart and send us your order. We&apos;ll confirm prices, payment and delivery with you personally.</p>}
      />
      <section className="container-page py-12">
        <nav aria-label="Product categories" className="flex flex-wrap gap-2">
          <Link href="/products" className={chip(!category)} aria-current={!category ? "page" : undefined}>
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className={chip(category === c.slug)}
              aria-current={category === c.slug ? "page" : undefined}
            >
              {c.name}
            </Link>
          ))}
        </nav>
        {products.length ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-ink-soft">No products in this category yet.</p>
        )}
      </section>
    </>
  );
}
