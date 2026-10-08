"use client";

import { whatsappLink, type Enquiry } from "@ofp/shared";
import { useState } from "react";
import { AdminTitle, formatDateTime, Loading, StatusPill } from "@/components/admin/admin-ui";
import { Notice } from "@/components/ui";
import { adminFetch, useAdminData } from "@/lib/admin-api";

const TYPE_LABEL = { wholesale: "Wholesale", notify: "Chicken launch", contact: "Message" } as const;

export default function EnquiriesPage() {
  const [filter, setFilter] = useState<"new" | "handled" | "">("new");
  const { data, setData, error, loading } = useAdminData<Enquiry[]>(`/enquiries${filter ? `?status=${filter}` : ""}`);
  const [actionError, setActionError] = useState("");

  const toggle = async (e: Enquiry) => {
    setActionError("");
    try {
      const updated = await adminFetch<Enquiry>(`/enquiries/${e.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: e.status === "new" ? "handled" : "new" }),
      });
      setData((list) => (list ?? []).map((x) => (x.id === updated.id ? updated : x)).filter((x) => !filter || x.status === filter));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <>
      <AdminTitle title="Enquiries" />
      <div className="mb-5 flex gap-2">
        {(["new", "handled", ""] as const).map((s) => (
          <button
            key={s || "all"}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize ${filter === s ? "bg-ink text-white" : "border border-line bg-white text-ink-soft"}`}
          >
            {s || "All"}
          </button>
        ))}
      </div>
      {(error || actionError) && <Notice tone="error">{error || actionError}</Notice>}
      {loading ? (
        <Loading />
      ) : !data?.length ? (
        <p className="text-ink-soft">No enquiries.</p>
      ) : (
        <ul className="space-y-3">
          {data.map((e) => (
            <li key={e.id} className="card bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-grain-dark">{TYPE_LABEL[e.type]}</p>
                  <p className="mt-1 font-semibold">
                    {e.name}
                    {e.business ? <span className="font-normal text-muted"> · {e.business}</span> : null}
                  </p>
                  <p className="text-sm text-ink-soft">
                    <a href={`tel:${e.phone}`} className="text-leaf">{e.phone}</a>
                    {e.email && <> · <a href={`mailto:${e.email}`} className="text-leaf">{e.email}</a></>}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">{formatDateTime(e.createdAt)}</span>
                  <StatusPill status={e.status} />
                </div>
              </div>
              {e.message && <p className="mt-3 whitespace-pre-line rounded-xl bg-mist p-3 text-sm">{e.message}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  className="btn-secondary !py-1.5"
                  href={whatsappLink(e.phone, `Hello ${e.name}, this is Organic Farm Products replying to your enquiry.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Reply on WhatsApp
                </a>
                <button className="btn-secondary !py-1.5" onClick={() => toggle(e)}>
                  Mark as {e.status === "new" ? "handled" : "new"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
