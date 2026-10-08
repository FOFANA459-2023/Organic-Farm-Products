import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.jsonc" },
        miniflare: {
          bindings: {
            // Points nowhere: these tests never reach the database.
            SUPABASE_URL: "http://127.0.0.1:1",
            SUPABASE_SERVICE_ROLE_KEY: "test",
            TURNSTILE_SECRET_KEY: "test",
          },
        },
      },
    },
  },
});
