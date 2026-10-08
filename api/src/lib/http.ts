import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { z } from "zod";

export class ApiError extends Error {
  constructor(
    public status: ContentfulStatusCode,
    public code: string,
    message: string,
    public issues?: unknown,
  ) {
    super(message);
  }
}

export const notFound = (what = "Resource") => new ApiError(404, "not_found", `${what} not found`);

/** Parse a JSON body with a zod schema, turning failures into a 400 with field issues. */
export async function parseBody<S extends z.ZodType>(c: Context, schema: S): Promise<z.infer<S>> {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    throw new ApiError(400, "invalid_json", "Request body must be JSON");
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ApiError(400, "validation_failed", "Some fields are invalid", result.error.issues);
  }
  return result.data;
}

type DbResult<T> = { data: T | null; error: { message: string; code?: string } | null };

/** Throw on a Supabase error (for writes that return no rows). */
export function check(res: DbResult<unknown>): void {
  if (res.error) {
    if (res.error.code === "23505") throw new ApiError(409, "conflict", "That slug is already in use");
    throw new ApiError(500, "db_error", res.error.message);
  }
}

/** Throw on a Supabase error; return the (possibly null) data — for `.maybeSingle()`. */
export function maybe<R extends DbResult<unknown>>(res: R): R["data"] | null {
  check(res);
  return res.data;
}

/** Throw on a Supabase error or missing data — for lists and `.single()`. */
export function must<R extends DbResult<unknown>>(res: R): NonNullable<R["data"]> {
  check(res);
  if (res.data == null) throw new ApiError(500, "db_error", "No data returned");
  return res.data as NonNullable<R["data"]>;
}

export function errorResponse(err: Error, c: Context) {
  if (err instanceof ApiError) {
    return c.json({ error: { code: err.code, message: err.message, issues: err.issues } }, err.status);
  }
  if (err instanceof HTTPException) {
    return c.json({ error: { code: "http_error", message: err.message } }, err.status);
  }
  console.error(err);
  return c.json({ error: { code: "internal", message: "Something went wrong" } }, 500);
}
