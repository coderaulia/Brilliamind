# Development Guide

## Prerequisites

- Node.js 22+
- pnpm (`npm i -g pnpm` or `corepack enable`)
- Wrangler CLI (`pnpm dlx wrangler` or `npm i -g wrangler`)
- Git

---

## First-Time Setup

```bash
# 1. Clone and install dependencies
git clone <repo>
cd lms
pnpm install

# 2. Copy env configs and fill in values
cp .env.example .env.local
cp .dev.vars.example .dev.vars

# 3. Apply migrations to local D1 database
pnpm run db:migrate:local

# 4. Seed initial Superadmin account (admin@brilliamind.id)
pnpm run db:seed

# 5. Start frontend and worker dev servers
pnpm run dev              # Vite SPA on http://localhost:5173
pnpm run dev:worker       # Cloudflare Worker API on http://localhost:8787
```

---

## Environment Variables

### Frontend (`.env.local`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Cloudflare Worker API base URL (`http://localhost:8787` in dev or `/api`) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `VITE_R2_PUBLIC_URL` | Cloudflare R2 CDN public base URL |
| `VITE_APP_URL` | App base URL (`http://localhost:5173` in dev) |

### Worker Secrets (`.dev.vars` / `wrangler secret put`)
Set via `.dev.vars` for local dev or `wrangler secret put <KEY>` for production:
- `JWT_SECRET`: Secret key used to sign and verify user JWTs
- `STRIPE_SECRET_KEY`: Stripe secret API key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret
- `RESEND_API_KEY`: Resend API key for transactional emails
- `EMAIL_FROM`: Sender email (`noreply@brilliamind.id`)
- `R2_ACCOUNT_ID`: Cloudflare Account ID for presigned uploads
- `R2_ACCESS_KEY_ID`: S3-compatible R2 Access Key ID
- `R2_SECRET_ACCESS_KEY`: S3-compatible R2 Secret Access Key

---

## MVP Feature Architecture

### 1. Instructor Registration & Superadmin Approval
- Instructors register at `/register/instructor`. Their account is assigned `role: 'instructor'` and `status: 'pending'`.
- Logging in while pending shows a "Pending Superadmin Approval" notice and blocks studio access.
- Superadmin visits `/admin/instructors` to review and approve (`status = 'active'`) or reject applications.

### 2. Course Creation & YouTube Video Embeds
- Approved instructors create courses at `/instructor/courses/new`.
- Instructors can add sections and video lessons (`type: 'youtube' | 'video'`) with third-party embed links (YouTube, Vimeo, MP4).
- Instructors can toggle courses between `draft` and `published`.

### 3. Invitation-Only Learner Onboarding & Password Management
- Public learner registration is disabled.
- Superadmin or Course Instructors invite learners via email (`POST /api/admin/invite-user` or `POST /api/instructor/invite-learner`).
- The worker generates a cryptographic token, creates an `invitations` record with target `course_ids`, and sends an invite link `/invite/accept?token=...`.
- Participant visits the link, sets their name and password, which automatically activates their account, enrolls them in designated courses, and logs them in.
- **Password Reset**: Self-service via `/forgot-password` (token emailed), or Superadmin override via `/admin/users`.

### 4. Learner Course Playback & Video Progression
- Enrolled learners access the course player at `/learn/:courseId`.
- The player embeds the YouTube video using Plyr / iframe and provides a curriculum checklist.
- Finishing a video or clicking complete sends `POST /api/progress/lesson`, automatically recalculating overall course progress.

### 5. Dashboards & Progress Analytics
- **Learner Dashboard (`/dashboard`)**: Displays active enrolled courses, overall completion percentage rings, and quick-resume buttons.
- **Instructor Analytics (`/instructor/courses/:id/learners`)**: Real-time roster table of enrolled learners, completed lesson counts, progress percentage bars, and last active timestamps.

### 6. Backend Authentication & Security Hardening
- Edge-compatible Web Crypto PBKDF2 password hashing (100k iterations SHA-256 + salt).
- Signed JWT tokens with role claims and expiration.
- KV-backed rate limiting on auth endpoints.
- Strict RBAC middleware (`requireRole('admin')`, `requireRole('instructor')`, `requireRole('learner')`).
- Zod schema validation on all incoming request bodies.

---

## Local Development & Emulation

Wrangler uses **Miniflare** under the hood to simulate the full Cloudflare edge environment locally, including SQLite D1 databases, R2 object storage buckets, and KV namespaces.

```bash
# Run Worker API with local D1 & R2 emulation
pnpm run dev:worker

# Run Vite dev server (with /api proxy to worker)
pnpm run dev
```

Local API URL: `http://localhost:8787`  
Vite Dev App: `http://localhost:5173`

---

## Database Migrations (D1 + Drizzle)

```bash
# 1. Generate new migration SQL files when schema.ts changes
pnpm run db:generate

# 2. Apply migrations to local D1 database
pnpm run db:migrate:local

# 3. Apply migrations to remote production Cloudflare D1
pnpm run db:migrate:remote
```

Migration files are stored in `worker/db/migrations/` and track versioned database state.

---

## Useful Commands

```bash
pnpm run dev                 # Start Vite frontend dev server
pnpm run dev:worker          # Start local Cloudflare Worker
pnpm run build               # Type-check + production build
pnpm run preview             # Preview production frontend build
pnpm run lint                # ESLint
pnpm run type-check          # tsc --noEmit
pnpm run db:generate         # Generate D1 SQL migrations from Drizzle schema
pnpm run db:migrate:local    # Apply migrations locally
pnpm run db:seed             # Seed superadmin and initial mock course data
```

---

## Deployment

### 1. Frontend → Cloudflare Pages
1. Connect GitHub repository to Cloudflare Pages.
2. Build command: `pnpm run build`
3. Build output directory: `dist`
4. Set environment variables in Cloudflare Pages dashboard (`VITE_*`).

### 2. Backend API → Cloudflare Workers
```bash
# Deploy worker to Cloudflare network
pnpm run deploy:worker
```

### 3. Production D1 Database
```bash
# Apply schema migrations to remote D1 instance
pnpm run db:migrate:remote
```

---

## Branching Strategy

```
main          — production (Cloudflare Pages & Workers auto-deploy)
dev           — integration branch
feature/*     — feature branches (merge → dev → main)
fix/*         — hotfixes (merge directly → main + backport to dev)
```

---

## Code Style & Standards

- **TypeScript Strict Mode**: Zero `any` policy.
- **Tailwind CSS**: Strict utility styling, no inline CSS or conflicting modules.
- **Hono Modular Architecture**: Small, testable route files grouped by resource.
- **Drizzle ORM Type Safety**: All queries and mutations typed from schema models.
- **Web Standards First**: Use standard `Request`, `Response`, `fetch`, `crypto`, and `Streams`.
