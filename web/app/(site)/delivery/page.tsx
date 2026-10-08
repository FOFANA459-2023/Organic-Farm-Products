import type { Metadata } from "next";
import { Notice, PageHeader } from "@/components/ui";
import { getSettings } from "@/lib/api";

export const metadata: Metadata = { title: "Delivery information" };

export default async function DeliveryPage() {
  const { delivery } = await getSettings();
  const rows = [
    ["Where we deliver", delivery.areas],
    ["Delivery fees", delivery.fees],
    ["Minimum order", delivery.minimumOrder],
    ["Pickup options", delivery.pickup],
    ["Delivery days", delivery.days],
    ["Chilled & frozen products", delivery.coldChain],
  ];
  return (
    <>
      <PageHeader eyebrow="Delivery" title="Delivery & pickup" intro={<p>How we get your order to you.</p>} />
      <section className="container-page max-w-3xl py-14">
        <dl className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-cream">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-1 px-5 py-4 sm:grid-cols-[220px_1fr]">
              <dt className="font-semibold">{k}</dt>
              <dd className="whitespace-pre-line text-ink-soft">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6">
          <Notice>Every order is confirmed personally — we&apos;ll agree delivery or pickup details with you before anything is dispatched.</Notice>
        </div>
      </section>
    </>
  );
}
