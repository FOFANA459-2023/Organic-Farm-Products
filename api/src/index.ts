import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import type { AppEnv } from "./env";
import { errorResponse } from "./lib/http";
import { adminRoutes } from "./routes/admin";
import { publicRoutes } from "./routes/public";

const app = new Hono<AppEnv>();

app.use("*", secureHeaders());
app.use("*", (c, next) =>
  cors({
    origin: c.env.WEB_ORIGIN.split(",").map((o) => o.trim()),
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })(c, next),
);

app.get("/health", (c) => c.json({ ok: true }));
app.route("/", publicRoutes);
app.route("/admin", adminRoutes);

app.notFound((c) => c.json({ error: { code: "not_found", message: "Route not found" } }, 404));
app.onError(errorResponse);

export default app;
