import type { ReactNode } from "react";
import { LeafLine } from "./brand";

export function PageHeader({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-gradient-to-br from-sprout via-sprout-light to-mist">
      <LeafLine className="pointer-events-none absolute -right-6 -top-4 h-56 w-56 text-leaf/10" />
      <div className="container-page relative py-14 sm:py-20">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 max-w-3xl text-4xl font-bold text-ink sm:text-5xl">{title}</h1>
        {intro && <div className="mt-4 max-w-2xl text-lg text-ink-soft">{intro}</div>}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, intro, center = false }: { eyebrow?: string; title: string; intro?: ReactNode; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">{title}</h2>
      {intro && <div className="mt-3 text-ink-soft">{intro}</div>}
    </div>
  );
}

/** Plain-text paragraphs from a body with blank-line separators (no HTML rendering = no injection risk). */
export function Paragraphs({ text, className = "prose-farm" }: { text: string; className?: string }) {
  return (
    <div className={className}>
      {text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
    </div>
  );
}

export function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="field-error" role="alert">{error}</span>}
    </label>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "success"; children: ReactNode }) {
  const styles = {
    info: "border-grain/40 bg-grain-light/60 text-grain-dark",
    error: "border-danger/30 bg-danger/5 text-danger",
    success: "border-leaf/30 bg-sprout-light text-leaf-dark",
  }[tone];
  return <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`} role={tone === "error" ? "alert" : "status"}>{children}</div>;
}
