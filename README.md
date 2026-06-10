# BrilliaMind LMS

Web-based LMS / E-Learning Platform. Indonesia-first, global capable.

**Stack:** React 19 · Vite · TypeScript · Tailwind CSS · Supabase · Cloudflare R2 + Pages · Stripe · Resend

---

## Quick Start

```bash
npm install
cp .env.example .env.local   # fill in Supabase URL + anon key
npm run dev
```

App runs at http://localhost:5173.

---

## Env Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `VITE_R2_PUBLIC_URL` | Cloudflare R2 CDN base URL |
| `VITE_APP_URL` | App base URL (localhost in dev) |

Edge Function secrets (Resend, Stripe secret, R2 credentials) — set via `supabase secrets set` or Supabase dashboard. Never in `.env.local`.

---

## Commands

```bash
npm run dev          # dev server
npm run build        # production build
npm run type-check   # tsc only
npm run lint         # eslint

supabase db push     # apply migrations
supabase functions deploy   # deploy all edge functions
supabase gen types typescript --linked > src/types/database.ts  # regen DB types
```

---

## Project Structure

```
src/
  components/   # UI primitives, layout, feature components
  pages/        # public/, auth/, learner/, instructor/, admin/
  hooks/        # data-fetching + realtime hooks
  stores/       # Zustand (auth, ui)
  lib/          # supabase client, stripe, r2 helpers, utils
  types/        # database.ts — generated Supabase types
supabase/
  functions/    # Edge Functions (Deno): r2-presign, stripe-*, quiz-verify, send-email
  migrations/   # SQL migration files
docs/
  PRD.md            # Product Requirements Document v1.2
  ARCHITECTURE.md   # System topology, folder structure, data flow
  DATABASE.md       # Full schema SQL + RLS policies + views
  EDGE_FUNCTIONS.md # Edge Function specs + env vars
  FEATURES.md       # Feature breakdown, build order, gotchas
  DEVELOPMENT.md    # Setup guide, deployment, code conventions
```

---

## User Roles

| Role | Access |
|------|--------|
| Admin | Full platform, user management, settings |
| Instructor | Create/manage own courses, view learner progress |
| Learner | Enroll, take courses, earn certificates |
| Guest | Browse public course catalog only |

Role enforced by Postgres RLS (`profiles.role` column).

---

## Docs

- [PRD v1.2](docs/PRD.md) — full product requirements
- [Architecture](docs/ARCHITECTURE.md) — system design and data flows
- [Database](docs/DATABASE.md) — schema, RLS, views, triggers
- [Edge Functions](docs/EDGE_FUNCTIONS.md) — serverless function specs
- [Features](docs/FEATURES.md) — implementation order and gotchas
- [Development](docs/DEVELOPMENT.md) — local setup and deployment
