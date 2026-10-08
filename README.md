# Organic Farm Products — website

[![CI/CD](https://github.com/FOFANA459-2023/Organic-Farm-Products/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/FOFANA459-2023/Organic-Farm-Products/actions/workflows/ci-cd.yml)

Online catalogue and order-request site for **Organic Farm Products Pty** (Mohale's Hoek, Lesotho).
Customers build a cart and send an **order request** (no online payment); the business confirms by phone/WhatsApp
and manages everything in `/admin`.

| Folder | What | Runs on |
|---|---|---|
| `web/` | Next.js 15 (App Router, TypeScript, Tailwind v4) — public site + `/admin` | Cloudflare Workers via OpenNext |
| `api/` | Hono REST API — catalogue, orders, enquiries, admin | Cloudflare Workers |
| `shared/` | zod schemas, types and helpers used by both | — |
| `supabase/` | Postgres migrations + seed, local Supabase config | Supabase |

Data lives in **Supabase Postgres** (RLS on, only the API's service-role key can read/write), images in **Supabase
Storage** (`product-images` bucket), admin login via **Supabase Auth** (sign-ups disabled; admins listed in the `admins` table).

## Local development

Requirements: Node 22+, pnpm 10, Docker.

```bash
pnpm install
pnpm db:start          # local Supabase in Docker (applies migrations + seed)
cp web/.env.example web/.env.local      # fill NEXT_PUBLIC_SUPABASE_ANON_KEY from `npx supabase status`
cp api/.dev.vars.example api/.dev.vars  # fill SUPABASE_SERVICE_ROLE_KEY from `npx supabase status`
pnpm dev               # web → http://localhost:3000, api → http://localhost:8787
```

- Local admin: `http://localhost:3000/admin` — `admin@ofp.test` / `ofp-admin-dev` (created by `supabase/seed-dev-admin.sql`, local only — never run that file in production).
- Emails are printed in the API console locally (no `RESEND_API_KEY`).
- Turnstile uses Cloudflare's public always-pass test keys locally.
- Supabase Studio (browse the database): http://127.0.0.1:54323
- `pnpm db:reset` wipes local data back to the seed.

Checks: `pnpm typecheck`, `pnpm test` (API tests), `pnpm --filter web lint`.

## CI/CD (GitHub Actions)

`.github/workflows/ci-cd.yml` runs on every push and pull request:

| Job | What it does |
|---|---|
| **check** | install → typecheck → lint → API tests → Cloudflare (OpenNext) build of the website |
| **database** | starts a fresh Postgres, applies every migration + `seed.sql`, fails if any table has RLS off |
| **deploy** | `main` only, after both jobs pass: `supabase db push` → deploy API Worker (+ its secrets) → build & deploy website Worker → smoke test |

Deploy stays **skipped** (with a notice in the run) until everything below is configured, so CI is green from day one.

### One-time setup

1. **Supabase** — create a project. In *Authentication → Providers → Email*, keep email enabled; in *Authentication →
   Settings* turn **off** "Allow new users to sign up" and set the Site URL to the live site.
   After the first deploy (which creates the tables), load starter content by running `supabase/seed.sql`
   in the SQL editor (**not** `seed-dev-admin.sql`). Create the client's login under *Authentication → Users → Add user*,
   then run `insert into admins (user_id) values ('<their user id>');`
2. **Cloudflare** — create an API token with the *Edit Cloudflare Workers* template; create a Turnstile widget for the
   site's domain (gives a site key + secret key); optionally enable Web Analytics.
3. **Resend** (optional, for order emails) — create an API key; verify the sending domain to use your own `EMAIL_FROM`.
4. **GitHub → Settings → Secrets and variables → Actions**:

   | Secrets | |
   |---|---|
   | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard |
   | `SUPABASE_ACCESS_TOKEN` | supabase.com → Account → Access tokens |
   | `SUPABASE_PROJECT_ID`, `SUPABASE_DB_PASSWORD` | project ref + database password |
   | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Project settings → API |
   | `TURNSTILE_SECRET_KEY` | Turnstile widget |
   | `RESEND_API_KEY` *(optional)* | Resend |

   | Variables | Example |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL`, `WEB_ORIGIN` | `https://ofp-web.<you>.workers.dev` (later your domain) |
   | `NEXT_PUBLIC_API_URL` | `https://ofp-api.<you>.workers.dev` |
   | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project settings → API |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile widget |
   | `EMAIL_FROM` *(optional)* | `Organic Farm Products <orders@yourdomain>` |
   | `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` *(optional)* | Cloudflare Web Analytics |

   Then re-run the workflow (*Actions → CI/CD → Run workflow*) or push to `main`.
5. **Domain** (later) — add custom domains to the `ofp-web` and `ofp-api` Workers in Cloudflare and update the URL variables.

> Deploying from a Windows machine directly fails at the OpenNext step (`EPERM … symlink`) unless Developer Mode is on —
> another reason to let the pipeline (Linux) deploy.

## Content rules (from the client brief)

- Never claim "100% organic", "chemical-free", "sustainably farmed" or any certification without documentation.
- Rainbow trout is **sourced from SanLi, Lesotho** — the site must not imply Organic Farm Products farms it.
- Undecided policies (delivery, fees, legal pages) stay as "TBD — please contact us"; never invent them.
- Prefer real farm/product photos over stock imagery.

## Still needed from the client

Product photos (farm, products, packaging, family) · pack sizes and prices · confirmed WhatsApp order number ·
poultry launch details (cuts, sizes, date) · trout packaging/availability · delivery terms · terms, privacy and
refund policies · registration number (if to be shown) · domain name.
