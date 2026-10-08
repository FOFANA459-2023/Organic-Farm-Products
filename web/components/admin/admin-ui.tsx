import type { OrderStatus } from "@ofp/shared";

export function AdminTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  new: "bg-grain-light text-grain-dark",
  confirmed: "bg-sprout text-leaf-dark",
  ready: "bg-leaf text-white",
  delivered: "bg-ink/10 text-ink",
  cancelled: "bg-danger/10 text-danger",
  handled: "bg-ink/10 text-ink",
};

export function StatusPill({ status }: { status: OrderStatus | string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[status] ?? ""}`}>
      {status}
    </span>
  );
}

export function Loading() {
  return <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-white" />;
}

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
