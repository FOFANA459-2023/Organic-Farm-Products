import Image from "next/image";
import Link from "next/link";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="Organic Farm Products — home">
      <Image src="/brand/mark.png" alt="" width={36} height={34} className="h-8 w-auto" priority />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl">Organic Farm Products</span>
        <span className="mt-1 hidden text-[9px] uppercase tracking-[0.32em] text-ink-soft sm:block">
          Where nature nurtures every seed
        </span>
      </span>
    </Link>
  );
}

/** Thin outline mark used as a decorative line-art detail. */
export function MarkOutline({ className = "" }: { className?: string }) {
  return <Image src="/brand/mark.png" alt="" width={210} height={196} className={className} aria-hidden />;
}

/** Simple seed/leaf line illustration. */
export function LeafLine({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={className} aria-hidden>
      <path d="M32 58V22" />
      <path d="M32 34c-9 0-15-6-16-15 9 0 15 6 16 15Z" />
      <path d="M32 26c8 0 13-5 14-13-8 0-13 5-14 13Z" />
      <path d="M32 44c7 0 12-4 13-11-7 0-12 4-13 11Z" />
    </svg>
  );
}
