"use client";

import Link from "next/link";
import { formatPrice, type Order } from "@ofp/shared";
import { AdminTitle, formatDateTime, Loading, StatusPill } from "@/components/admin/admin-ui";
import { Notice } from "@/components/ui";
import { useAdminData } from "@/lib/admin-api";

export default function AdminDashboard() {
  const summary = useAdminData<{ newOrders: number; confirmedOrders: number; newEnquiries: number }>("/summary");
  const recent = useAdminData<{ orders: Order[] }>("/orders?page=1");

  const cards = [
    { label: "New orders", value: summary.data?.newOrders, href: "/admin/orders?status=new" },
    { label: "Confirmed, not yet ready", value: summary.data?.confirmedOrders, href: "/admin/orders?status=confirmed" },
    { label: "New enquiries", value: summary.data?.newEnquiries, href: "/admin/enquiries" },
  ];

  return (
    <>
      <AdminTitle title="Dashboard" />
      {summary.error && <Notice tone="error">{summary.error}</Notice>}
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card bg-white p-5 hover:border-leaf">
            <p className="text-sm text-muted">{c.label}</p>
            <p className="mt-1 font-display text-4xl font-bold">{c.value ?? "–"}</p>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 mt-10 text-lg font-semibold">Recent orders</h2>
      {recent.loading ? (
        <Loading />
      ) : recent.data?.orders.length ? (
        <ul className="card divide-y divide-line bg-white">
          {recent.data.orders.slice(0, 8).map((o) => (
            <li key={o.id}>
              <Link href={`/admin/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 hover:bg-mist">
                <span>
                  <span className="font-semibold">{o.ref}</span> · {o.customerName}
                  <span className="block text-xs text-muted">{formatDateTime(o.createdAt)} · {o.district}</span>
                </span>
                <span className="flex items-center gap-3 text-sm">
                  {o.estimatedTotal != null ? formatPrice(o.estimatedTotal) : "On request"}
                  <StatusPill status={o.status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-soft">No orders yet.</p>
      )}
    </>
  );
}
