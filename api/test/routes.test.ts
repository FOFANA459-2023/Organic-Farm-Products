import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("routes", () => {
  it("health check", async () => {
    const res = await SELF.fetch("http://api/health");
    expect(await res.json()).toEqual({ ok: true });
  });

  it("admin routes require a token", async () => {
    for (const path of ["/admin/orders", "/admin/products", "/admin/settings"]) {
      const res = await SELF.fetch(`http://api${path}`);
      expect(res.status).toBe(401);
    }
  });

  it("rejects invalid orders before touching the database", async () => {
    const res = await SELF.fetch("http://api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName: "A", items: [] }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("validation_failed");
  });

  it("only allows CORS from the website origin", async () => {
    const ok = await SELF.fetch("http://api/health", { headers: { Origin: "http://localhost:3000" } });
    expect(ok.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
    const bad = await SELF.fetch("http://api/health", { headers: { Origin: "https://evil.example" } });
    expect(bad.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("returns JSON 404 for unknown routes", async () => {
    const res = await SELF.fetch("http://api/nope");
    expect(res.status).toBe(404);
  });
});
