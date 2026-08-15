# Development Guide

## Prerequisites

- Node.js 22+
- Supabase CLI (`npm i -g supabase`)
- Deno 2+ (for Edge Function local dev)
- Git

---

## First-Time Setup

```bash
# 1. Clone and install
git clone <repo>
cd lms
npm install

# 2. Copy env and fill in values
cp .env.example .env.local
# edit .env.local with your Supabase project URL + anon key

# 3. Link to Supabase project
supabase login
supabase link --project-ref <your-project-ref>

# 4. Apply migrations
supabase db push

# 5. Start dev server
npm run dev
```

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `.env.local` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` | Supabase anon key (safe for browser) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `.env.local` | Stripe publishable key |
| `VITE_R2_PUBLIC_URL` | `.env.local` | R2 CDN base URL |
| `VITE_APP_URL` | `.env.local` | `http://localhost:5173` in dev |

Edge Function secrets (never in `.env.local`) — set in Supabase dashboard or `supabase secrets set`.

---

## Local Supabase (Optional)

Run full Supabase stack locally with Docker:

```bash
supabase start            # starts local Postgres, Auth, Storage, Edge Runtime
supabase status           # shows local URLs + anon key
supabase db reset         # wipe + re-apply all migrations + seed
supabase stop             # stop all containers
```

Local dashboard: http://localhost:54323  
Local API URL: http://localhost:54321

Update `.env.local` with local URLs when working offline.

---

## Edge Functions (Local Dev)

```bash
# Serve all functions locally
supabase functions serve --env-file supabase/.env.local

# Serve a specific function
supabase functions serve r2-presign --env-file supabase/.env.local
```

Create `supabase/.env.local` (gitignored) for Edge Function secrets in local dev.

---

## Database Migrations

```bash
# Create a new migration
supabase migration new <name>
# Edit the file in supabase/migrations/

# Apply to local DB
supabase db push

# Apply to remote (production)
supabase db push --linked
```

Migration files are numbered by timestamp. Always forward-only — never edit applied migrations.

---

## Useful Commands

```bash
npm run dev          # start Vite dev server
npm run build        # type-check + production build
npm run preview      # preview production build locally
npm run lint         # ESLint
npm run type-check   # tsc --noEmit only

# Generate Supabase types (after schema changes)
supabase gen types typescript --linked > src/types/database.ts
```

---

## Deployment

### Frontend → Cloudflare Pages

1. Connect GitHub repo to Cloudflare Pages
2. Build command: `npm run build`
3. Build output: `dist`
4. Set env vars in Pages dashboard (all `VITE_*` vars)

Cloudflare Pages auto-deploys on push to `main`.

### Edge Functions → Supabase

```bash
supabase functions deploy r2-presign
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
supabase functions deploy quiz-verify
supabase functions deploy send-email
```

Or deploy all at once: `supabase functions deploy`

### Database Migrations → Production

```bash
supabase db push --linked
```

---

## Branching Strategy

```
main          — production (Cloudflare Pages auto-deploys)
dev           — integration branch
feature/*     — feature branches (merge → dev → main)
fix/*         — hotfixes (merge directly → main + backport to dev)
```

---

## Code Style

- TypeScript strict mode — no `any`
- Tailwind only for styling — no inline styles, no CSS modules
- All Supabase queries typed via `Database` type in `src/types/database.ts`
- Regenerate `database.ts` after every schema change: `supabase gen types typescript --linked > src/types/database.ts`
- Edge Functions: pure Deno, no `npm:` imports unless necessary — use `esm.sh` or Deno stdlib
