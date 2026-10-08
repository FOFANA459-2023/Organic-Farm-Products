"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CUSTOMER_TYPE_LABELS, formatPrice, ORDER_STATUSES, type Order } from "@ofp/shared";
import { Suspense, useState } from "react";
import { AdminTitle, formatDateTime, Loading, StatusPill } from "@/components/admin/admin-ui";
import { Notice } from "@/components/ui";
import { useAdminData } from "@/lib/admin-api";

function OrdersList() {
  const router = useRouter();
  const params = useSearchParams();
  const status = params.get("status") ?? "";
  const q = params.get("q") ?? "";
  const page = Number(params.get("page") ?? 1);
  const [search, setSearch] = useState(q);

  const qs = new URLSearchParams({ page: String(page) });
  if (status) qs.set("status", status);
  if (q) qs.set("q", q);
  const { data, error, loading } = useAdminData<{ orders: Order[]; total: number; pageSize: number }>(`/orders?${qs}`);

  const go = (next: Record<string, string>) => {
    const p = new URLSearchParams({ ...(status && { status }), ...(q && { q }), ...next });
    for (const [k, v] of [...p]) if (!v) p.delete(k);
    router.push(`/admin/orders?${p}`);
  };

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <>
      <AdminTitle title="Orders" />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {["", ...ORDER_STATUSES].map((s) => (
          <button
            key={s || "all"}
            type="button"
            onClick={() => go({ status: s, page: "" })}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize ${
              status === s ? "bg-ink text-white" : "border border-line bg-white text-ink-soft"
            }`}
          >
            {s || "All"}
          </button>
        ))}
        <form
          className="ml-auto flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            go({ q: search, page: "" });
          }}
        >
          <input className="field-input !py-1.5" placeholder="Ref, name or phone" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn-secondary !py-1.5">Search</button>
        </form>
      </div>

      {error && <Notice tone="error">{error}</Notice>}
      {loading ? (
        <Loading />
      ) : !data?.orders.length ? (
        <p className="text-ink-soft">No orders found.</p>
      ) : (
        <div className="card overflow-x-auto bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Fulfilment</th>
                <th className="px-4 py-3">Est. total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.orders.map((o) => (
                <tr key={o.id} className="cursor-pointer hover:bg-mist" onClick={() => router.push(`/admin/orders/${o.id}`)}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-semibold text-leaf">{o.ref}</Link>
                    <span className="block text-xs text-muted">{formatDateTime(o.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {o.customerName}
                    <span className="block text-xs text-muted">
                      {o.phone} · {o.businessName ?? CUSTOMER_TYPE_LABELS[o.customerType]}
                    </span>
                  </td>
                  <td className="px-4 py-3">{o.items.reduce((n, i) => n + i.qty, 0)}</td>
                  <td className="px-4 py-3 capitalize">
                    {o.fulfilment}
                    <span className="block text-xs text-muted">{o.district}</span>
                  </td>
                  <td className="px-4 py-3">{o.estimatedTotal != null ? formatPrice(o.estimatedTotal) : "On request"}</td>
                  <td className="px-4 py-3"><StatusPill status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="mt-5 flex items-center gap-3 text-sm">
          <button className="btn-secondary !py-1.5" disabled={page <= 1} onClick={() => go({ page: String(page - 1) })}>Previous</button>
          <span>Page {page} of {pages}</span>
          <button className="btn-secondary !py-1.5" disabled={page >= pages} onClick={() => go({ page: String(page + 1) })}>Next</button>
        </div>
      )}
    </>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <OrdersList />
    </Suspense>
  );
}
