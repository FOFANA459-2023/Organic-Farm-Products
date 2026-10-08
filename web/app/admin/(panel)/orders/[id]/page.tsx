"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CUSTOMER_TYPE_LABELS, formatPrice, ORDER_STATUSES, whatsappLink, type Order, type OrderStatus } from "@ofp/shared";
import { useEffect, useState } from "react";
import { AdminTitle, formatDateTime, Loading, StatusPill } from "@/components/admin/admin-ui";
import { WhatsAppIcon } from "@/components/icons";
import { Notice } from "@/components/ui";
import { adminFetch, useAdminData } from "@/lib/admin-api";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, setData, error, loading } = useAdminData<Order>(`/orders/${id}`);
  const [status, setStatus] = useState<OrderStatus>("new");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setNotes(order.adminNotes ?? "");
    }
  }, [order]);

  if (loading) return <Loading />;
  if (error || !order) return <Notice tone="error">{error || "Order not found"}</Notice>;

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const updated = await adminFetch<Order>(`/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status, adminNotes: notes }) });
      setData(updated);
      setMsg({ tone: "success", text: "Order updated." });
    } catch (e) {
      setMsg({ tone: "error", text: e instanceof Error ? e.message : "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  const wa = whatsappLink(order.phone, `Hello ${order.customerName}, this is Organic Farm Products about your order ${order.ref}.`);

  return (
    <>
      <Link href="/admin/orders" className="text-sm text-leaf">← All orders</Link>
      <AdminTitle title={`Order ${order.ref}`}>
        <StatusPill status={order.status} />
      </AdminTitle>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="card bg-white p-6">
            <h2 className="mb-4 font-semibold">Items</h2>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-line">
                {order.items.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2.5">
                      <span className="font-medium">{i.qty} × {i.productName}</span>
                      <span className="block text-xs text-muted">{i.variantLabel}</span>
                    </td>
                    <td className="py-2.5 text-right text-ink-soft">{formatPrice(i.unitPrice)}</td>
                    <td className="py-2.5 text-right font-medium">{i.unitPrice != null ? formatPrice(i.unitPrice * i.qty) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 flex justify-between border-t border-line pt-4 font-semibold">
              <span>Estimated total</span>
              <span>{order.estimatedTotal != null ? formatPrice(order.estimatedTotal) : "On request"}</span>
            </p>
            {order.hasUnpricedItems && <p className="mt-1 text-xs text-muted">Includes items priced on request.</p>}
          </section>

          <section className="card bg-white p-6">
            <h2 className="mb-4 font-semibold">Customer</h2>
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <div><dt className="text-muted">Name</dt><dd>{order.customerName}</dd></div>
              <div><dt className="text-muted">Phone</dt><dd><a href={`tel:${order.phone}`} className="text-leaf">{order.phone}</a></dd></div>
              <div><dt className="text-muted">Email</dt><dd>{order.email ? <a href={`mailto:${order.email}`} className="text-leaf">{order.email}</a> : "—"}</dd></div>
              <div><dt className="text-muted">Type</dt><dd>{CUSTOMER_TYPE_LABELS[order.customerType]}{order.businessName ? ` — ${order.businessName}` : ""}</dd></div>
              <div><dt className="text-muted">Fulfilment</dt><dd className="capitalize">{order.fulfilment}</dd></div>
              <div><dt className="text-muted">District</dt><dd>{order.district}</dd></div>
              {order.address && <div className="sm:col-span-2"><dt className="text-muted">Address</dt><dd>{order.address}</dd></div>}
              {order.notes && <div className="sm:col-span-2"><dt className="text-muted">Customer notes</dt><dd className="whitespace-pre-line">{order.notes}</dd></div>}
              <div><dt className="text-muted">Placed</dt><dd>{formatDateTime(order.createdAt)}</dd></div>
            </dl>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-5 !py-2">
              <WhatsAppIcon className="h-4 w-4" /> Message customer
            </a>
          </section>
        </div>

        <aside className="card h-fit space-y-4 bg-white p-6">
          <h2 className="font-semibold">Update order</h2>
          <label className="block">
            <span className="field-label">Status</span>
            <select className="field-input capitalize" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Internal notes</span>
            <textarea className="field-input min-h-28" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Agreed price, delivery day, payment…" />
          </label>
          {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
          <button className="btn-primary w-full" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </aside>
      </div>
    </>
  );
}
