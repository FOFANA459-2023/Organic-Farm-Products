"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MarkOutline } from "@/components/brand";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { supabaseBrowser } from "@/lib/supabase-browser";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/news", label: "News" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/admin/login");
      else {
        setEmail(data.session.user.email ?? null);
        setChecked(true);
      }
    });
    const { data: sub } = sb.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.replace("/admin/login");
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  useEffect(() => setOpen(false), [pathname]);

  if (!checked) return <div className="min-h-dvh bg-mist" />;

  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          className={`rounded-xl px-3 py-2.5 text-sm font-medium ${
            active(n.href, n.exact) ? "bg-sprout text-ink" : "text-ink-soft hover:bg-white hover:text-ink"
          }`}
        >
          {n.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-mist lg:grid lg:grid-cols-[230px_1fr]">
      <aside className="hidden border-r border-line bg-sprout-light/50 p-5 lg:flex lg:flex-col">
        <Link href="/admin" className="mb-6 flex items-center gap-2">
          <MarkOutline className="h-7 w-auto" />
          <span className="font-display font-bold">OFP Admin</span>
        </Link>
        {nav}
        <div className="mt-auto space-y-2 border-t border-line pt-4 text-sm">
          <p className="truncate text-muted" title={email ?? ""}>{email}</p>
          <Link href="/" className="block text-leaf" target="_blank">View website ↗</Link>
          <button type="button" className="text-ink-soft hover:text-danger" onClick={() => supabaseBrowser().auth.signOut()}>
            Sign out
          </button>
        </div>
      </aside>

      <header className="flex items-center justify-between border-b border-line bg-sprout-light/50 px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <MarkOutline className="h-6 w-auto" />
          <span className="font-display font-bold">OFP Admin</span>
        </Link>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>
      {open && (
        <div className="border-b border-line bg-mist p-4 lg:hidden">
          {nav}
          <button type="button" className="mt-3 px-3 text-sm text-ink-soft" onClick={() => supabaseBrowser().auth.signOut()}>
            Sign out
          </button>
        </div>
      )}

      <main className="min-w-0 p-4 sm:p-8">{children}</main>
    </div>
  );
}
