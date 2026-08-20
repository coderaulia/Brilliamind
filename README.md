# BrilliaMind LMS

Web-based LMS / E-Learning Platform. Indonesia-first, global capable.

**Stack:** React 19 · Vite · TypeScript · Tailwind CSS · Cloudflare Workers (Hono) · Cloudflare D1 (SQLite) · Cloudflare R2 + Pages · Drizzle ORM · Stripe · Resend

---

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment variables
cp .env.example .env.local       # Frontend env (Vite)
cp .dev.vars.example .dev.vars   # Worker secrets (Wrangler)

# 3. Apply local D1 database migrations
pnpm run db:migrate:local

# 4. Start frontend and worker dev servers
pnpm run dev              # Vite SPA on http://localhost:5173
pnpm run dev:worker       # Cloudflare Worker API on http://localhost:8787
```

---

## Env Variables

### Frontend (`.env.local`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (`http://localhost:8787` in dev or `/api` via proxy) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `VITE_R2_PUBLIC_URL` | Cloudflare R2 CDN public base URL |
| `VITE_APP_URL` | App base URL (`http://localhost:5173` in dev) |

### Worker Secrets (`.dev.vars` / `wrangler secret put`)
Set via `.dev.vars` for local dev or `wrangler secret put <KEY>` for production:
`JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.

---

## Commands

```bash
pnpm run dev                 # Start Vite frontend dev server
pnpm run dev:worker          # Start local Cloudflare Worker (Wrangler)
pnpm run build               # Production build (tsc -b && vite build)
pnpm run preview             # Preview production build
pnpm run type-check          # tsc --noEmit
pnpm run lint                # ESLint

# Database & Migrations (D1 + Drizzle)
pnpm run db:generate         # Generate SQL migrations from Drizzle schema
pnpm run db:migrate:local    # Apply migrations to local D1 database
pnpm run db:migrate:remote   # Apply migrations to production Cloudflare D1

# Cloudflare Deployment
pnpm run deploy:worker       # Deploy Cloudflare Worker API (wrangler deploy)
```

---

## Project Structure

```
src/
  components/       # UI primitives, layout, feature components
  pages/            # public/, auth/, learner/, instructor/, admin/
  hooks/            # data-fetching and mutation hooks
  stores/           # Zustand (auth, ui)
  lib/              # api client, stripe, r2 helpers, utils
  types/            # shared TypeScript types & D1 schema models
worker/
  index.ts          # Hono app entry point
  wrangler.jsonc    # Cloudflare Wrangler config (D1, R2, KV bindings)
  routes/           # auth, courses, r2, stripe, quiz, progress, certificates, discussions, email
  middleware/       # JWT auth, role validation, error handling
  db/               # Drizzle ORM client, schema, migrations
  lib/              # S3 presigner, Stripe helper, Resend HTTP client
  types.ts          # Env bindings & Hono context types
docs/
  PRD.md            # Product Requirements Document v1.3
  ARCHITECTURE.md   # System topology, folder structure, data flow
  DATABASE.md       # Cloudflare D1 schema (SQLite) + Drizzle ORM
  WORKERS.md        # Cloudflare Workers API specs & Hono routes
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

Role enforced by Cloudflare Worker JWT authentication middleware and `profiles.role`.

---

## Docs

- [PRD v1.3](docs/PRD.md) — full product requirements
- [Architecture](docs/ARCHITECTURE.md) — system design and data flows
- [Database](docs/DATABASE.md) — Cloudflare D1 schema, Drizzle ORM, FTS5
- [Workers API](docs/WORKERS.md) — Cloudflare Workers & Hono API specs
- [Features](docs/FEATURES.md) — implementation order and gotchas
- [Development](docs/DEVELOPMENT.md) — local setup and deployment
