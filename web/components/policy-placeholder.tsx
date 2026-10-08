import Link from "next/link";
import { Notice, PageHeader } from "./ui";

/** Shown until the client supplies their own policy text — we never invent legal terms. */
export function PolicyPlaceholder({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <>
      <PageHeader eyebrow="Policies" title={title} />
      <section className="container-page max-w-3xl space-y-6 py-14">
        <Notice>
          This policy is being finalised by Organic Farm Products and will be published here soon.
        </Notice>
        {children}
        <p className="text-ink-soft">
          If you have a question in the meantime, please{" "}
          <Link href="/contact" className="font-semibold text-leaf underline underline-offset-2">contact us</Link>.
        </p>
      </section>
    </>
  );
}
