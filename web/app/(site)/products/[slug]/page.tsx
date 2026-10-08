import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { productEnquiryMessage, whatsappLink } from "@ofp/shared";
import { AddToCart } from "@/components/add-to-cart";
import { ArrowRight, WhatsAppIcon } from "@/components/icons";
import { AvailabilityBadge, ProductImage } from "@/components/product-bits";
import { Notice, Paragraphs } from "@/components/ui";
import { getProduct, getSettings } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: product.images[0] ? { images: [product.images[0]] } : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProduct(slug), getSettings()]);
  if (!product) notFound();

  const canOrder = product.orderable && product.availability === "available" && product.variants.length > 0;
  const wa = whatsappLink(settings.whatsapp, productEnquiryMessage(product.name));

  return (
    <div className="container-page py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/products" className="hover:text-leaf">Products</Link>
        <span className="mx-2">/</span>
        <Link href={`/products?category=${product.categorySlug}`} className="hover:text-leaf">{product.categoryName}</Link>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="space-y-3">
          <ProductImage product={product} className="aspect-square rounded-[var(--radius-card)]" sizes="(min-width: 1024px) 50vw, 100vw" priority />
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(1, 5).map((src, i) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-xl bg-sprout-light">
                  <Image src={src} alt={`${product.name} photo ${i + 2}`} fill sizes="25vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <AvailabilityBadge availability={product.availability} />
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{product.name}</h1>
          <p className="mt-3 text-lg text-ink-soft">{product.shortDescription}</p>

          {product.sourcingNote && (
            <div className="mt-5">
              <Notice tone="info">
                <strong className="font-semibold">Sourcing:</strong> {product.sourcingNote}
              </Notice>
            </div>
          )}

          <div className="mt-8 border-t border-line pt-8">
            {canOrder ? (
              <AddToCart product={product} />
            ) : product.availability === "coming_soon" ? (
              <div className="space-y-4">
                <p className="text-ink-soft">This product isn&apos;t available to order yet.</p>
                <Link href={product.categorySlug === "poultry" ? "/poultry" : "/contact"} className="btn-primary">
                  Get notified when it launches <ArrowRight />
                </Link>
              </div>
            ) : (
              <p className="text-ink-soft">This product is currently unavailable. Contact us to check when it will be back.</p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={wa} className="btn-whatsapp" target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> Ask on WhatsApp
            </a>
            {product.bulkAvailable && (
              <Link href="/wholesale" className="btn-secondary">
                Bulk / business order
              </Link>
            )}
          </div>

          {product.description && (
            <div className="mt-10 border-t border-line pt-8">
              <h2 className="text-xl font-semibold">About this product</h2>
              <Paragraphs text={product.description} className="prose-farm mt-3" />
            </div>
          )}

          <p className="mt-6 text-sm text-muted">
            Prices are confirmed when we contact you about your order. See{" "}
            <Link href="/delivery" className="underline underline-offset-2 hover:text-leaf">delivery information</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
