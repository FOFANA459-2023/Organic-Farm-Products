import type { Metadata } from "next";
import Link from "next/link";
import { LeafLine } from "@/components/brand";
import { ArrowRight } from "@/components/icons";
import { PageHeader, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Our farm",
  description: "About 21 hectares farmed in Phamong, Lekhalong, Ha Makhofola — sorghum, sugar beans and maize.",
};

const CROPS = [
  { name: "Sorghum", body: "Where it all began in 2016 — the first crop of our family farm.", href: "/products/sorghum" },
  { name: "Sugar beans", body: "Added as the farm grew, broadening our crop production.", href: "/products/sugar-beans" },
  { name: "Maize", body: "Part of our commercial crop production alongside beans.", href: "/products/maize" },
];

const NEXT = [
  "Food processing and value-added products",
  "Packaged chicken (fresh, chilled and frozen)",
  "Fish — rainbow trout sourced from SanLi Lesotho",
  "Packaging and distribution",
];

export default function FarmPage() {
  return (
    <>
      <PageHeader
        eyebrow="Farm & agriculture"
        title="Rooted in Phamong, Mohale's Hoek"
        intro={<p>Our farms are in Phamong, Lekhalong, Ha Makhofola, where we farm approximately 21 hectares of agricultural land.</p>}
      />

      <section className="container-page py-16">
        <dl className="grid gap-5 sm:grid-cols-3">
          {[
            ["~21 ha", "of agricultural land farmed"],
            ["100+", "local families given part-time work over the years"],
            ["3 crops", "sorghum, sugar beans and maize"],
          ].map(([v, l]) => (
            <div key={l} className="card p-7">
              <dt className="sr-only">{l}</dt>
              <dd className="font-display text-4xl font-bold text-leaf-dark">{v}</dd>
              <dd className="mt-1 text-ink-soft">{l}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-page pb-16">
        <SectionHeading eyebrow="What we grow" title="Our crops" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {CROPS.map((c) => (
            <Link key={c.name} href={c.href} className="card group relative overflow-hidden p-7 hover:border-leaf">
              <LeafLine className="h-10 w-10 text-leaf" />
              <h3 className="mt-4 text-xl font-semibold">{c.name}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{c.body}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-leaf">
                View product <ArrowRight />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Our community"
            title="More than growing crops"
            intro={
              <p>
                Agriculture has always been about more than crops for our family. Over the years we have created
                part-time employment opportunities for more than 100 different families in our local community — a
                connection that remains an important part of who we are.
              </p>
            }
          />
          <div>
            <p className="eyebrow">What&apos;s next</p>
            <ul className="mt-4 space-y-3">
              {NEXT.map((n) => (
                <li key={n} className="flex gap-3 rounded-xl bg-mist px-4 py-3 text-ink-soft">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-grain" aria-hidden />
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container-page pt-16">
        <div className="bg-seeds flex aspect-[21/9] items-center justify-center rounded-[2rem] border border-dashed border-leaf/30 bg-sprout-light text-center text-sm font-medium uppercase tracking-[0.25em] text-leaf/70">
          Farm photo gallery coming soon
        </div>
      </section>
    </>
  );
}
