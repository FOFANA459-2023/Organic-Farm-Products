import type { Metadata } from "next";
import Link from "next/link";
import { LeafLine } from "@/components/brand";
import { ArrowRight } from "@/components/icons";
import { PageHeader, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "About us",
  description: "The story of Organic Farm Products, a family-owned agricultural business in Mohale's Hoek, Lesotho, founded in 2016.",
};

const TEAM = [
  { name: "Athens Daphney Koali", role: "Leads the business (since January 2026)" },
  { name: "Seyaloyalo Koali", role: "Co-founder" },
  { name: "Africa Koali", role: "Family team" },
  { name: "Phindiwe Koali", role: "Family team" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="A family legacy, growing for the next generation"
        intro={
          <p>
            Organic Farm Products is a family-owned agricultural business rooted in Lesotho, built on a simple belief:
            quality food should be accessible, reliable and produced with the needs of communities in mind.
          </p>
        }
      />

      <section className="container-page grid gap-12 py-16 lg:grid-cols-[1.3fr_1fr]">
        <div className="prose-farm max-w-none text-[17px]">
          <h2 className="mb-5 text-3xl font-bold text-ink">Our story</h2>
          <p>
            Organic Farm Products was established in 2016 by Noleaveit Koali and Seyaloyalo Koali as a family-owned
            agricultural business in Lesotho. What began as a small family agricultural venture has grown into a business
            with a vision to become part of a stronger and more sustainable food supply chain in Lesotho and beyond.
          </p>
          <p>
            Our journey began with the production of sorghum, before expanding into sugar beans and maize, establishing a
            foundation in crop production and commercial agriculture. Along the way, we took part in programmes and
            commercial opportunities that saw us supply agricultural products to the Government of Lesotho on a small
            scale — an important part of our early development.
          </p>
          <p>
            Our farms are located in Phamong, Lekhalong, Ha Makhofola, where we currently farm approximately 21 hectares
            of agricultural land. Over the years, we have created part-time employment for more than 100 different
            families in our local community.
          </p>
          <p>
            In January 2026, leadership and ownership passed to the founders&apos; eldest daughter, Athens Daphney Koali,
            who works closely with Seyaloyalo Koali and her siblings, Africa Koali and Phindiwe Koali. The new leadership
            is building on our agricultural foundation and developing opportunities in food processing, value-added
            products, poultry, fish, packaging and distribution.
          </p>
          <p className="font-display text-xl font-semibold text-ink">
            We are not only growing food. We are growing a business, creating livelihoods and building a future for the
            next generation.
          </p>
        </div>

        <aside className="space-y-6">
          <div className="card relative overflow-hidden p-7">
            <LeafLine className="absolute -right-4 -top-4 h-28 w-28 text-leaf/10" />
            <p className="eyebrow">Our mission</p>
            <p className="mt-3 text-lg text-ink">
              To bring convenience to everyday life by providing quality, reliable, and accessible food products that
              nourish families and communities every day.
            </p>
          </div>
          <div className="card relative overflow-hidden bg-ink p-7 text-white">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-sprout">Our vision</p>
            <p className="mt-3 text-lg">
              To build a trusted African food company that produces, processes, and distributes quality food across
              Lesotho and Southern Africa within the next five years, and connects African products with global markets
              within the next ten years.
            </p>
          </div>
        </aside>
      </section>

      <section className="border-t border-line bg-white">
        <div className="container-page py-16">
          <SectionHeading eyebrow="The family" title="The people behind the business" />
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((m) => (
              <li key={m.name} className="rounded-[var(--radius-card)] bg-mist p-6">
                <div className="bg-seeds mb-4 flex aspect-square items-center justify-center rounded-xl bg-sprout-light text-[11px] font-medium uppercase tracking-[0.25em] text-leaf/70">
                  Photo coming soon
                </div>
                <p className="font-display text-lg font-semibold">{m.name}</p>
                <p className="text-sm text-ink-soft">{m.role}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">Founded by Noleaveit Koali and Seyaloyalo Koali in 2016.</p>
          <Link href="/farm" className="btn-secondary mt-8">
            See our farm <ArrowRight />
          </Link>
        </div>
      </section>
    </>
  );
}
