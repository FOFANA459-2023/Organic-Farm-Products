import Link from "next/link";
import type { Settings } from "@ofp/shared";
import { whatsappLink } from "@ofp/shared";
import { MarkOutline } from "./brand";
import { InstagramIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "./icons";
import { isPhoneNumber as isNumber, telHref as tel } from "@/lib/format";


export function SiteFooter({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 bg-ink text-white/80">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <MarkOutline className="h-10 w-auto invert" />
            <p className="font-display text-xl font-bold text-white">Organic Farm Products</p>
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-[0.32em] text-sprout">Where nature nurtures every seed</p>
          <p className="mt-5 max-w-sm text-sm leading-relaxed">
            A family-owned agricultural business from Mohale&apos;s Hoek, Lesotho — growing, sourcing and supplying quality
            food since 2016.
          </p>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-white">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2.5">
              <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-sprout" />
              <span>
                Agriculture: <a className="hover:text-white" href={tel(settings.phones.agricultural)}>{settings.phones.agricultural}</a>
              </span>
            </li>
            <li className="flex gap-2.5">
              <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-sprout" />
              <span>
                Fish: <a className="hover:text-white" href={tel(settings.phones.fish)}>{settings.phones.fish}</a>
              </span>
            </li>
            <li className="flex gap-2.5">
              <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-sprout" />
              <span>
                Poultry:{" "}
                {isNumber(settings.phones.poultry) ? (
                  <a className="hover:text-white" href={tel(settings.phones.poultry)}>{settings.phones.poultry}</a>
                ) : (
                  settings.phones.poultry
                )}
              </span>
            </li>
            <li className="flex gap-2.5">
              <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-sprout" />
              <a className="hover:text-white" href={whatsappLink(settings.whatsapp, "Hello Organic Farm Products!")}>
                WhatsApp {settings.whatsapp}
              </a>
            </li>
            <li className="flex gap-2.5">
              <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-sprout" />
              <a className="break-all hover:text-white" href={`mailto:${settings.email}`}>{settings.email}</a>
            </li>
            <li className="flex gap-2.5">
              <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-sprout" />
              <span>{settings.location}</span>
            </li>
            {settings.instagram && (
              <li className="flex gap-2.5">
                <InstagramIcon className="mt-0.5 h-4 w-4 shrink-0 text-sprout" />
                <a className="hover:text-white" href={settings.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-white">Explore</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm md:grid-cols-1">
            {[
              ["/products", "Products"],
              ["/poultry", "Poultry"],
              ["/wholesale", "Wholesale orders"],
              ["/about", "About us"],
              ["/farm", "Our farm"],
              ["/news", "News"],
              ["/delivery", "Delivery"],
              ["/contact", "Contact"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link className="hover:text-white" href={href!}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.registration.companyName}
            {settings.registration.show && settings.registration.number ? ` · Reg. no. ${settings.registration.number}` : ""}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li><Link className="hover:text-white" href="/terms">Terms</Link></li>
            <li><Link className="hover:text-white" href="/privacy">Privacy</Link></li>
            <li><Link className="hover:text-white" href="/refunds">Refunds &amp; returns</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
