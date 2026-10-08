import Image from "next/image";
import Link from "next/link";
import { AVAILABILITY_LABELS, formatPrice, type Availability, type Product } from "@ofp/shared";
import { LeafLine } from "./brand";
import { ArrowRight } from "./icons";

const BADGE: Record<Availability, string> = {
  available: "bg-sprout text-leaf-dark",
  coming_soon: "bg-grain-light text-grain-dark",
  seasonal: "bg-grain-light text-grain-dark",
  out_of_stock: "bg-ink/5 text-muted",
};

export function AvailabilityBadge({ availability }: { availability: Availability }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${BADGE[availability]}`}>
      {AVAILABILITY_LABELS[availability]}
    </span>
  );
}

/** Product photo, or a clearly-marked placeholder until the client supplies real photography. */
export function ProductImage({
  product,
  className = "",
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  priority = false,
}: {
  product: Pick<Product, "name" | "images">;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const src = product.images[0];
  return (
    <div className={`relative overflow-hidden bg-sprout-light ${className}`}>
      {src ? (
        <Image src={src} alt={product.name} fill sizes={sizes} className="object-cover" priority={priority} />
      ) : (
        <div className="bg-seeds absolute inset-0 flex flex-col items-center justify-center gap-2 text-leaf/70">
          <LeafLine className="h-14 w-14" />
          <span className="text-[11px] font-medium uppercase tracking-[0.25em]">Photo coming soon</span>
        </div>
      )}
    </div>
  );
}

export function priceSummary(product: Product): string {
  const prices = product.variants.map((v) => v.priceLsl).filter((p): p is number => p != null);
  if (!prices.length) return "Price on request";
  const min = Math.min(...prices);
  return prices.length > 1 && Math.max(...prices) !== min ? `From ${formatPrice(min)}` : formatPrice(min);
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-[0_12px_40px_-16px_rgb(20_20_20/0.25)]"
    >
      <ProductImage product={product} className="aspect-[4/3]" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-widest text-muted">{product.categoryName}</span>
          <AvailabilityBadge availability={product.availability} />
        </div>
        <h3 className="mt-3 text-xl font-semibold text-ink">{product.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">{product.shortDescription}</p>
        {product.sourcingNote && <p className="mt-2 text-xs font-medium text-grain-dark">Sourced from SanLi, Lesotho</p>}
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="text-sm font-semibold text-ink">{priceSummary(product)}</span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-leaf group-hover:gap-2 transition-all">
            {product.availability === "coming_soon" ? "Learn more" : "View"} <ArrowRight />
          </span>
        </div>
      </div>
    </Link>
  );
}
