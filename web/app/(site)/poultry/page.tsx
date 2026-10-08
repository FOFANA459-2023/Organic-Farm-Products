import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry-form";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Poultry — coming soon",
  description: "Fresh, chilled and frozen packaged chicken from Organic Farm Products is coming soon. Register your interest.",
};

const DETAILS = [
  ["Products", "Fresh, chilled and frozen packaged chicken"],
  ["Cuts & pack sizes", "To be announced"],
  ["Launch date", "To be announced"],
  ["Bulk & business orders", "Restaurants, hotels and retailers welcome to register interest"],
  ["Delivery areas", "To be announced"],
];

export default function PoultryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Coming soon"
        title="Packaged chicken is on its way"
        intro={<p>We&apos;re expanding into poultry. Register your interest and we&apos;ll contact you as soon as our chicken is available.</p>}
      />
      <section className="container-page grid gap-10 py-16 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold">What to expect</h2>
          <dl className="mt-6 divide-y divide-line rounded-[var(--radius-card)] border border-line bg-cream">
            {DETAILS.map(([k, v]) => (
              <div key={k} className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr]">
                <dt className="text-sm font-semibold text-ink">{k}</dt>
                <dd className="text-sm text-ink-soft">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="mb-6 text-2xl font-semibold">Get notified</h2>
          <EnquiryForm type="notify" />
        </div>
      </section>
    </>
  );
}
