"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "@/components/brand";
import { Notice } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError(error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message);
      return;
    }
    router.replace("/admin");
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-sprout to-mist px-4">
      <form onSubmit={onSubmit} className="card w-full max-w-sm space-y-5 bg-white p-8">
        <Wordmark />
        <div>
          <h1 className="text-2xl font-bold">Admin sign in</h1>
          <p className="text-sm text-muted">Manage orders, products and news.</p>
        </div>
        <label className="block">
          <span className="field-label">Email</span>
          <input className="field-input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="block">
          <span className="field-label">Password</span>
          <input
            className="field-input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <Notice tone="error">{error}</Notice>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
