"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cartCount, useCart } from "@/lib/cart";
import { Wordmark } from "./brand";
import { CartIcon, CloseIcon, MenuIcon } from "./icons";

const NAV = [
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/farm", label: "Our Farm" },
  { href: "/wholesale", label: "Wholesale" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
];

function CartLink() {
  const lines = useCart((s) => s.lines);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? cartCount(lines) : 0;
  return (
    <Link
      href="/cart"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-white text-ink hover:border-leaf hover:text-leaf"
      aria-label={`Cart${count ? `, ${count} items` : ""}`}
    >
      <CartIcon />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-leaf px-1.5 text-center text-[11px] font-bold leading-5 text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-mist/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4 sm:h-[72px]">
        <Wordmark />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive(item.href) ? "bg-sprout text-ink" : "text-ink-soft hover:text-leaf"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/products" className="btn-primary hidden !py-2.5 sm:inline-flex">
            Order now
          </Link>
          <CartLink />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" className="border-t border-line bg-mist lg:hidden" aria-label="Mobile">
          <ul className="container-page flex flex-col py-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded-xl px-3 py-3 text-base font-medium ${
                    isActive(item.href) ? "bg-sprout text-ink" : "text-ink-soft"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link href="/products" className="btn-primary w-full">
                Order now
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
