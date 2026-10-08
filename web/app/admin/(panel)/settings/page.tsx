"use client";

import type { Settings } from "@ofp/shared";
import { useEffect, useState } from "react";
import { AdminTitle, Loading } from "@/components/admin/admin-ui";
import { Notice } from "@/components/ui";
import { adminFetch, useAdminData } from "@/lib/admin-api";

const DELIVERY_FIELDS: [keyof Settings["delivery"], string][] = [
  ["areas", "Where you deliver"],
  ["fees", "Delivery fees"],
  ["minimumOrder", "Minimum order"],
  ["pickup", "Pickup options"],
  ["days", "Delivery days"],
  ["coldChain", "Chilled / frozen products"],
];

export default function SettingsPage() {
  const { data, error, loading, setData } = useAdminData<Settings>("/settings");
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (data) setS(data);
  }, [data]);

  if (loading || !s) return error ? <Notice tone="error">{error}</Notice> : <Loading />;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      setData(await adminFetch<Settings>("/settings", { method: "PUT", body: JSON.stringify(s) }));
      setMsg({ tone: "success", text: "Settings saved." });
    } catch (err) {
      setMsg({ tone: "error", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const text = (label: string, value: string, onChange: (v: string) => void, opts: { type?: string; hint?: string } = {}) => (
    <label className="block">
      <span className="field-label">{label}</span>
      <input className="field-input" type={opts.type ?? "text"} value={value} onChange={(e) => onChange(e.target.value)} />
      {opts.hint && <span className="mt-1 block text-xs text-muted">{opts.hint}</span>}
    </label>
  );

  return (
    <form onSubmit={save} className="max-w-3xl">
      <AdminTitle title="Settings">
        <button className="btn-primary !py-2" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
      </AdminTitle>
      {msg && <div className="mb-5"><Notice tone={msg.tone}>{msg.text}</Notice></div>}

      <section className="card mb-6 grid gap-4 bg-white p-6 sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">Contact details</h2>
        {text("WhatsApp number for orders", s.whatsapp, (v) => setS({ ...s, whatsapp: v }), { hint: "Orders and WhatsApp buttons use this number." })}
        {text("Email", s.email, (v) => setS({ ...s, email: v }), { type: "email" })}
        {text("Agricultural line", s.phones.agricultural, (v) => setS({ ...s, phones: { ...s.phones, agricultural: v } }))}
        {text("Fish line", s.phones.fish, (v) => setS({ ...s, phones: { ...s.phones, fish: v } }))}
        {text("Poultry line", s.phones.poultry, (v) => setS({ ...s, phones: { ...s.phones, poultry: v } }), { hint: "Text such as “To be announced” is fine." })}
        {text("Location", s.location, (v) => setS({ ...s, location: v }))}
        {text("Instagram link", s.instagram, (v) => setS({ ...s, instagram: v }))}
        {text("Facebook link", s.facebook, (v) => setS({ ...s, facebook: v }), { hint: "Leave empty until the page exists." })}
      </section>

      <section className="card mb-6 space-y-4 bg-white p-6">
        <div>
          <h2 className="font-semibold">Delivery information</h2>
          <p className="text-sm text-muted">Shown on the Delivery page. Keep “TBD” until a policy is decided.</p>
        </div>
        {DELIVERY_FIELDS.map(([k, label]) => (
          <label key={k} className="block">
            <span className="field-label">{label}</span>
            <textarea
              className="field-input min-h-16"
              value={s.delivery[k]}
              onChange={(e) => setS({ ...s, delivery: { ...s.delivery, [k]: e.target.value } })}
            />
          </label>
        ))}
      </section>

      <section className="card grid gap-4 bg-white p-6 sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">Company registration</h2>
        {text("Registered company name", s.registration.companyName, (v) => setS({ ...s, registration: { ...s.registration, companyName: v } }))}
        {text("Registration number", s.registration.number, (v) => setS({ ...s, registration: { ...s.registration, number: v } }))}
        <label className="flex items-center gap-2.5 text-sm sm:col-span-2">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--color-leaf)]"
            checked={s.registration.show}
            onChange={(e) => setS({ ...s, registration: { ...s.registration, show: e.target.checked } })}
          />
          Show the registration number in the website footer
        </label>
      </section>
    </form>
  );
}
