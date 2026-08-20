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

# 2. Copy environment variable configurations
cp .env.example .env.local
cp .dev.vars.example worker/.dev.vars

# 3. Apply migrations to local D1 database
pnpm run db:migrate:local

# 4. Start frontend and worker dev servers
pnpm run dev:worker       # Cloudflare Worker API on http://localhost:8787
pnpm run dev              # Vite SPA on http://localhost:5173
```

---

## Quick Test Credentials (Local Seed)

Click **"Seed Demo DB"** on the [Login Page](http://localhost:5173/login) (or send `POST http://localhost:8787/api/seed`) to initialize demo accounts:

| Role | Email | Password | Primary Route | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Superadmin** | `admin@brilliamind.id` | `Admin123!` | `/admin` | Approve instructors, manage users, send invites |
| **Approved Instructor** | `sarah.mitchell@brilliamind.id` | `Instructor123!` | `/instructor/courses` | Create courses, add YouTube lessons, view learners |
| **Pending Instructor** | `alex.tan@brilliamind.id` | `Instructor123!` | `/login` | Test pending approval banner & blocked login |
| **Enrolled Learner** | `budi.santoso@brilliamind.id` | `Learner123!` | `/dashboard` | Watch YouTube lessons, check off progress |

---

## Environment Variables

### Frontend (`.env.local`)
| Variable | Description | Default (Local) |
| :--- | :--- | :--- |
| `VITE_API_URL` | Cloudflare Worker API base URL | `http://localhost:8787` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` |
| `VITE_R2_PUBLIC_URL` | Cloudflare R2 CDN public base URL | `https://media.brilliamind.id` |
| `VITE_APP_URL` | App base URL | `http://localhost:5173` |

### Worker Secrets (`worker/.dev.vars` / `wrangler secret put`)
| Secret | Description |
| :--- | :--- |
| `JWT_SECRET` | Secret key used to sign and verify user JWTs (Web Crypto HMAC-SHA256) |
| `STRIPE_SECRET_KEY` | Stripe secret API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend API key for transactional emails |
| `EMAIL_FROM` | Sender email (`noreply@brilliamind.id`) |
| `APP_URL` | App base URL for invitation and password reset links |
| `R2_PUBLIC_URL` | Cloudflare R2 public bucket base URL |

---

## MVP Feature Architecture

### 1. Instructor Registration & Superadmin Approval
- Instructors register at `/register/instructor`. Their account is assigned `role: 'instructor'` and `status: 'pending'`.
- Logging in while pending shows a "Pending Superadmin Approval" notice and blocks studio access.
- Superadmin visits `/admin` to review applications and approve (`status = 'active'`) or reject/suspend them.

### 2. Course Creation & YouTube Video Embeds
- Approved instructors manage courses in the Instructor Studio (`/instructor/courses`).
- Curriculum Editor (`/instructor/courses/:id/edit`) allows creating sections and adding YouTube video lessons with live embed previews and free-preview toggles.
- Instructors can publish/unpublish courses with instant status updates.

### 3. Invitation-Only Learner Onboarding & Password Management
- Public learner registration is disabled; learners join via email invitation only.
- Superadmin (`/admin`) or Course Instructors (`/instructor/courses/:id/learners`) send email invitations.
- The worker creates an `invitations` record and dispatches an invite link (`/invite/accept?token=...`).
- Participant visits the link, sets their name and password, automatically activates their account, enrolls in designated courses, and logs in.
- **Password Reset**: Self-service via `/forgot-password` (token emailed), or Superadmin override via `/admin/users`.

### 4. Learner Course Playback & Video Progression
- Enrolled learners access the course player at `/learn/:courseId`.
- The player embeds YouTube video lectures and local video streams alongside an interactive curriculum checklist.
- Checking off a lesson or finishing a video sends `POST /api/progress/lesson`, updating progress percentages and marking course enrollment complete upon reaching 100%.

### 5. Dashboards & Progress Analytics
- **Learner Dashboard (`/dashboard`)**: Displays active enrolled courses, overall completion percentage rings, and quick-resume buttons.
- **Instructor Analytics (`/instructor/courses/:id/learners`)**: Real-time roster table of enrolled learners, completed lesson counts, progression percentage bars, and invitation dispatchers.

### 6. Backend Authentication & Security Hardening
- Edge-compatible Web Crypto PBKDF2 password hashing (100k iterations SHA-256 + 16-byte random salt).
- Signed HMAC-SHA256 JWT tokens with role claims and 7-day expiration.
- KV-backed rate limiting on auth endpoints.
- Strict RBAC middleware (`requireRole('admin')`, `requireRole('instructor')`, `requireRole('learner')`).
- Zod schema validation on all incoming request bodies.

---

## Local Development & Emulation

Wrangler uses **Miniflare** under the hood to simulate the full Cloudflare edge environment locally, including SQLite D1 databases, R2 object storage buckets, and KV namespaces.

```bash
# Terminal 1: Run Worker API with local D1 & R2 emulation
pnpm run dev:worker

# Terminal 2: Run Vite dev server
pnpm run dev
```

Local API URL: `http://localhost:8787`  
Vite Dev App: `http://localhost:5173`

---

## Database Migrations (D1 + Drizzle)

```bash
# 1. Generate new migration SQL files when worker/db/schema.ts changes
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
pnpm run dev:worker          # Start local Cloudflare Worker (port 8787)
pnpm run build               # Type-check + production build (tsc -b && vite build)
pnpm run preview             # Preview production frontend build
pnpm run lint                # ESLint code verification
pnpm run type-check          # tsc --noEmit
pnpm run db:generate         # Generate D1 SQL migrations from Drizzle schema
pnpm run db:migrate:local    # Apply migrations locally
pnpm run deploy:worker       # Deploy Cloudflare Worker to production
```
