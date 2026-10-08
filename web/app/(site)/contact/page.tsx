import type { Metadata } from "next";
import { whatsappLink } from "@ofp/shared";
import { EnquiryForm } from "@/components/enquiry-form";
import { InstagramIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/icons";
import { PageHeader } from "@/components/ui";
import { getSettings } from "@/lib/api";
import { isPhoneNumber as isNumber, telHref as tel } from "@/lib/format";

export const metadata: Metadata = {
  title: "Contact & order",
  description: "Call, WhatsApp or email Organic Farm Products in Mohale's Hoek, Lesotho.",
};

export default async function ContactPage() {
  const s = await getSettings();
  const lines = [
    ["Agricultural products", s.phones.agricultural],
    ["Fish (rainbow trout)", s.phones.fish],
    ["Poultry", s.phones.poultry],
  ] as const;

  return (
    <>
      <PageHeader
        eyebrow="Contact / order"
        title="Get in touch"
        intro={<p>Order by WhatsApp or phone, or send us a message and we&apos;ll get back to you.</p>}
      />
      <section className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-5">
          <a
            href={whatsappLink(s.whatsapp, "Hello Organic Farm Products, I'd like to place an order.")}
            target="_blank"
            rel="noopener noreferrer"
            className="card flex items-center gap-4 p-6 hover:border-leaf"
          >
            <span className="rounded-full bg-[#1f8a4c] p-3 text-white"><WhatsAppIcon className="h-6 w-6" /></span>
            <span>
              <span className="block font-semibold">Order via WhatsApp</span>
              <span className="text-sm text-ink-soft">{s.whatsapp}</span>
            </span>
          </a>

          <div className="card divide-y divide-line">
            {lines.map(([label, number]) => (
              <div key={label} className="flex items-center gap-4 p-5">
                <PhoneIcon className="h-5 w-5 shrink-0 text-leaf" />
                <div>
                  <p className="text-sm text-muted">{label}</p>
                  {isNumber(number) ? (
                    <a href={tel(number)} className="font-semibold hover:text-leaf">{number}</a>
                  ) : (
                    <p className="font-semibold text-ink-soft">{number}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4 p-5">
              <MailIcon className="h-5 w-5 shrink-0 text-leaf" />
              <a href={`mailto:${s.email}`} className="break-all font-semibold hover:text-leaf">{s.email}</a>
            </div>
            <div className="flex items-center gap-4 p-5">
              <PinIcon className="h-5 w-5 shrink-0 text-leaf" />
              <p className="font-semibold">{s.location}</p>
            </div>
            {s.instagram && (
              <div className="flex items-center gap-4 p-5">
                <InstagramIcon className="h-5 w-5 shrink-0 text-leaf" />
                <a href={s.instagram} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-leaf">
                  Follow us on Instagram
                </a>
              </div>
            )}
          </div>
        </div>
        <div>
          <h2 className="mb-6 text-2xl font-semibold">Send us a message</h2>
          <EnquiryForm type="contact" />
        </div>
      </section>
    </>
  );
}
