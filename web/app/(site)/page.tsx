import Link from "next/link";
import { whatsappLink, type Post, type Product } from "@ofp/shared";
import { LeafLine, MarkOutline } from "@/components/brand";
import { ArrowRight, WhatsAppIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-bits";
import { SectionHeading } from "@/components/ui";
import { getPosts, getProducts, getSettings } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { SITE_URL } from "@/lib/site";

const STATS = [
  { value: "2016", label: "Family farm founded" },
  { value: "~21 ha", label: "Farmed in Phamong" },
  { value: "100+", label: "Local families given part-time work" },
];

const AUDIENCES = [
  "Families & households",
  "Restaurants",
  "Hotels & guesthouses",
  "Supermarkets & retailers",
  "Wholesalers",
  "Schools & institutions",
];

const STEPS = [
  { title: "Add to cart", body: "Choose products and quantities from our catalogue." },
  { title: "Send your order", body: "Submit your details — no online payment needed." },
  { title: "We confirm", body: "We call or WhatsApp you to confirm the total, payment and delivery or pickup." },
];

export default async function HomePage() {
  const [settings, products, posts] = await Promise.all([
    getSettings(),
    getProducts({ featured: true }).catch(() => [] as Product[]),
    getPosts(3).catch(() => [] as Post[]),
  ]);
  const wa = whatsappLink(settings.whatsapp, "Hello Organic Farm Products, I'd like to place an order.");

  // Only facts from the client brief — no ratings, certifications or invented details.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Organic Farm Products",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo-full.jpg`,
    description: "Family-owned agricultural business in Mohale's Hoek, Lesotho, founded in 2016.",
    foundingDate: "2016",
    email: settings.email,
    telephone: settings.phones.agricultural,
    address: { "@type": "PostalAddress", addressRegion: "Mohale's Hoek", addressCountry: "LS" },
    sameAs: [settings.instagram, settings.facebook].filter(Boolean),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sprout via-sprout-light to-mist">
        <div className="bg-seeds absolute inset-0 opacity-60" aria-hidden />
        <div className="container-page relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="eyebrow">Where nature nurtures every seed</p>
            <h1 className="mt-4 text-[2.6rem] font-bold leading-[1.05] text-ink sm:text-6xl">
              Quality food from our family farm in Lesotho
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-soft">
              Sorghum, maize and sugar beans grown in Mohale&apos;s Hoek, rainbow trout sourced from SanLi Lesotho, and
              packaged chicken coming soon — for families, kitchens and businesses.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">
                Order now <ArrowRight />
              </Link>
              <a href={wa} className="btn-whatsapp" target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon /> Order via WhatsApp
              </a>
            </div>
          </div>

          <div className="relative">
            <MarkOutline className="absolute -right-4 -top-10 h-auto w-64 opacity-15 sm:w-80" />
            <div className="card relative bg-white/80 p-6 backdrop-blur sm:p-8">
              <p className="font-display text-lg font-semibold text-ink">Proudly family-owned</p>
              <p className="mt-1 text-sm text-ink-soft">Rooted in Mohale&apos;s Hoek since 2016.</p>
              <dl className="mt-6 grid gap-4">
                {STATS.map((s) => (
                  <div key={s.label} className="flex items-baseline justify-between gap-4 border-t border-line pt-4">
                    <dt className="text-sm text-ink-soft">{s.label}</dt>
                    <dd className="font-display text-2xl font-bold text-leaf-dark">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="container-page py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Our products" title="From our fields and partners" />
          <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-leaf hover:gap-2.5 transition-all">
            View all products <ArrowRight />
          </Link>
        </div>
        {products.length ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-ink-soft">Our catalogue is being updated. Please contact us to order.</p>
        )}
      </section>

      {/* How ordering works */}
      <section className="border-y border-line bg-white">
        <div className="container-page py-16">
          <SectionHeading eyebrow="How to order" title="Simple ordering, confirmed personally" center />
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-[var(--radius-card)] bg-mist p-6">
                <span className="font-display text-3xl font-bold text-grain">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Story teaser */}
      <section className="container-page grid items-center gap-12 py-20 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Our story"
            title="From sorghum fields to a growing family food business"
            intro={
              <p>
                Founded in 2016 by Noleaveit and Seyaloyalo Koali, Organic Farm Products began with sorghum before
                expanding into sugar beans and maize. In January 2026 a new generation, led by Athens Daphney Koali,
                took the helm — building toward processing, poultry, fish, packaging and distribution.
              </p>
            }
          />
          <Link href="/about" className="btn-secondary mt-8">
            Read our story <ArrowRight />
          </Link>
        </div>
        <ol className="relative space-y-6 border-l-2 border-sprout pl-8">
          {[
            ["2016", "Founded as a family farm, starting with sorghum production."],
            ["Growth", "Expanded into sugar beans and maize; supplied the Government of Lesotho on a small scale."],
            ["2026", "New generation leadership under Athens Daphney Koali."],
            ["Next", "Value-added products, packaged chicken, rainbow trout supply and wider distribution."],
          ].map(([when, what]) => (
            <li key={when} className="relative">
              <span className="absolute -left-[41px] top-1 h-4 w-4 rounded-full border-4 border-mist bg-leaf" aria-hidden />
              <p className="font-display text-sm font-semibold uppercase tracking-widest text-leaf">{when}</p>
              <p className="mt-1 text-ink-soft">{what}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Chicken coming soon */}
      <section className="container-page">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-white sm:px-12">
          <LeafLine className="absolute -bottom-8 -right-6 h-60 w-60 text-sprout/15" />
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-grain">Coming soon</p>
          <h2 className="mt-3 max-w-xl text-3xl font-bold sm:text-4xl">Fresh, chilled and frozen packaged chicken</h2>
          <p className="mt-3 max-w-xl text-white/75">
            We&apos;re preparing to launch our poultry range. Register your interest — including bulk orders for
            restaurants and businesses — and we&apos;ll let you know first.
          </p>
          <Link href="/poultry" className="btn mt-7 bg-sprout text-ink hover:bg-white">
            Get notified <ArrowRight />
          </Link>
        </div>
      </section>

      {/* Who we serve */}
      <section className="container-page py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <SectionHeading
            eyebrow="Who we serve"
            title="For homes and businesses"
            intro={<p>Buying in larger quantities or on a regular schedule? Our wholesale team can help.</p>}
          />
          <div>
            <ul className="flex flex-wrap gap-2.5">
              {AUDIENCES.map((a) => (
                <li key={a} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink-soft">
                  {a}
                </li>
              ))}
            </ul>
            <Link href="/wholesale" className="btn-primary mt-6">
              Wholesale & business orders <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* News */}
      {posts.length > 0 && (
        <section className="border-t border-line bg-white">
          <div className="container-page py-16">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading eyebrow="News" title="Latest updates" />
              <Link href="/news" className="inline-flex items-center gap-1.5 text-sm font-semibold text-leaf">
                All news <ArrowRight />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {posts.map((p) => (
                <Link key={p.id} href={`/news/${p.slug}`} className="card p-6 hover:border-leaf">
                  {p.publishedAt && (
                    <time className="text-xs font-medium uppercase tracking-widest text-muted" dateTime={p.publishedAt}>
                      {formatDate(p.publishedAt)}
                    </time>
                  )}
                  <h3 className="mt-2 text-lg font-semibold">{p.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
