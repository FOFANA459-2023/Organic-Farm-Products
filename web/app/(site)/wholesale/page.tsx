import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry-form";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Wholesale & business orders",
  description: "Bulk and regular supply for restaurants, hotels, supermarkets, wholesalers and institutions in Lesotho.",
};

const WHO = [
  ["Restaurants & hotels", "Regular supply for your kitchen."],
  ["Supermarkets & retailers", "Stock our products on your shelves."],
  ["Wholesalers", "Bulk quantities of grains and legumes."],
  ["Schools & institutions", "Reliable supply for larger programmes."],
  ["Export enquiries", "International buyers are welcome to get in touch."],
];

export default function WholesalePage() {
  return (
    <>
      <PageHeader
        eyebrow="Wholesale / business"
        title="Supplying businesses and institutions"
        intro={
          <p>
            We have supplied agricultural products at institutional level before, including to the Government of Lesotho
            on a small scale. Tell us what you need and we&apos;ll come back to you with availability and pricing.
          </p>
        }
      />
      <section className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="text-2xl font-semibold">Who we work with</h2>
          <ul className="mt-6 space-y-3">
            {WHO.map(([t, d]) => (
              <li key={t} className="card p-5">
                <p className="font-semibold">{t}</p>
                <p className="text-sm text-ink-soft">{d}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">
            Bulk pricing, minimum quantities and delivery terms are agreed per order.
          </p>
        </div>
        <div>
          <h2 className="mb-6 text-2xl font-semibold">Send a business enquiry</h2>
          <EnquiryForm type="wholesale" />
        </div>
      </section>
    </>
  );
}
