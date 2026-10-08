import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../env";
import { ApiError } from "./http";
import { db } from "./supabase";

/** Requires `Authorization: Bearer <supabase access token>` from a user listed in `admins`. */
export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new ApiError(401, "unauthorized", "Sign in required");

  const supabase = db(c.env);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new ApiError(401, "unauthorized", "Your session has expired. Please sign in again.");

  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) throw new ApiError(403, "forbidden", "This account is not an administrator");

  c.set("adminUserId", data.user.id);
  await next();
});

/** Per-IP limit on public form submissions (Workers rate-limit binding; skipped if not bound). */
export const formRateLimit = createMiddleware<AppEnv>(async (c, next) => {
  const limiter = c.env.FORM_LIMITER;
  if (limiter) {
    const ip = c.req.header("CF-Connecting-IP") ?? "unknown";
    const { success } = await limiter.limit({ key: ip });
    if (!success) throw new ApiError(429, "rate_limited", "Too many submissions. Please wait a minute and try again.");
  }
  await next();
});

/** Short public caching for catalogue reads. */
export const publicCache = createMiddleware<AppEnv>(async (c, next) => {
  await next();
  if (c.res.ok) c.header("Cache-Control", "public, max-age=60");
});
