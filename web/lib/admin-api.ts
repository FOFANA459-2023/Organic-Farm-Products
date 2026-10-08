"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiRequestError } from "./api";
import { supabaseBrowser } from "./supabase-browser";

/** Calls the API's /admin routes with the signed-in user's access token. */
export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await supabaseBrowser().auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    window.location.href = "/admin/login";
    throw new ApiRequestError(401, "unauthorized", "Please sign in");
  }
  try {
    return await apiFetch<T>(`/admin${path}`, { ...init, token });
  } catch (e) {
    if (e instanceof ApiRequestError && e.status === 401) window.location.href = "/admin/login";
    throw e;
  }
}

export function useAdminData<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError("");
    try {
      setData(await adminFetch<T>(path));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, setData, error, loading, reload };
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
