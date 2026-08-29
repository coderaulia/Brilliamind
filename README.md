# BrilliaMind LMS

Modern, scalable LMS / E-Learning Platform. Built on serverless Cloudflare Edge architecture with TypeScript, React 19, Hono, and Cloudflare D1.

**Stack:** React 19 · Vite · TypeScript · Tailwind CSS · Cloudflare Workers (Hono) · Cloudflare D1 (SQLite) · Cloudflare R2 + Pages · Drizzle ORM · Brevo

---

## ⚡ MVP Feature Highlights

1. **Instructor Registration & Superadmin Approvals**:
   - Instructors apply at `/register/instructor` (created with `status = 'pending'`).
   - Superadmin reviews and authorizes instructors in the Control Center (`/admin`).
2. **Curriculum Studio & YouTube Video Embeds**:
   - Authorized instructors create structured modules/sections and attach YouTube/video lessons with live embed preview and free-preview flags.
3. **Invitation-Only Participant Onboarding & Password Management**:
   - Invitation links (`/invite/accept?token=...`) allow participants to set their own password and auto-enroll.
   - Self-service password recovery (`/forgot-password` and `/reset-password`) + Superadmin password reset override.
4. **Interactive Course Player & Progression Checklist**:
   - Course Player (`/learn/:courseId`) with real-time lesson completion checkboxes and automated course completion detection (`POST /api/progress/lesson`).
5. **Dashboards & Learner Roster Analytics**:
   - Learner Dashboard (`/dashboard`) with completion progress rings.
   - Instructor Analytics (`/instructor/courses/:id/learners`) with student progress roster.
6. **Hardened Edge Security**:
   - Web Crypto PBKDF2 (100k iterations SHA-256), HMAC-SHA256 JWT tokens, KV rate limiting, and RBAC middleware.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment variables
cp .env.example .env.local
cp .dev.vars.example worker/.dev.vars

# 3. Apply local D1 database migrations
pnpm run db:migrate:local

# 4. Start frontend and worker dev servers
pnpm run dev:worker       # Cloudflare Worker API on http://localhost:8787
pnpm run dev              # Vite SPA on http://localhost:5173
```

---

## 🧪 Quick Test Credentials (Local Demo)

The local-only seed endpoint is available for development and automated verification. Send `POST http://localhost:8787/api/seed` against a local Worker; it is disabled when `APP_URL` is a production URL. Do not use seeded credentials in production.

| Role | Email | Password | Primary Route | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Superadmin** | `admin@brilliamind.id` | `Admin123!` | `/admin` | Approve instructors, manage users, send invites |
| **Approved Instructor** | `sarah.mitchell@brilliamind.id` | `Instructor123!` | `/instructor/courses` | Create courses, add YouTube lessons, view learners |
| **Pending Instructor** | `alex.tan@brilliamind.id` | `Instructor123!` | `/login` | Test pending approval banner & blocked login |
| **Enrolled Learner** | `budi.santoso@brilliamind.id` | `Learner123!` | `/dashboard` | Watch YouTube lessons, check off progress |

---

## 🛠️ Commands

```bash
pnpm run dev                 # Start Vite frontend dev server (port 5173)
pnpm run dev:worker          # Start local Cloudflare Worker (port 8787)
pnpm run build               # Production build (tsc -b && vite build)
pnpm run preview             # Preview production build
pnpm run type-check          # tsc --noEmit
pnpm run lint                # ESLint code verification

# Testing & Quality Assurance
pnpm run test                # Run Vitest test suites (25 unit & integration tests)
pnpm run test:watch          # Run Vitest in interactive watch mode
pnpm run test:system         # Run live end-to-end API verification script

# Database & Migrations (D1 + Drizzle)
pnpm run db:generate         # Generate SQL migrations from Drizzle schema
pnpm run db:migrate:local    # Apply migrations to local D1 database
pnpm run db:migrate:remote   # Apply migrations to production Cloudflare D1

# Cloudflare Deployment
pnpm run deploy:worker       # Deploy Cloudflare Worker API (wrangler deploy)
```

---

## 📁 Project Structure

```
src/
  components/       # UI primitives, layout, feature components
  pages/
    auth/           # LoginPage, InstructorRegisterPage, AcceptInvitePage, Forgot/ResetPassword
    admin/          # AdminDashboardPage (instructor approvals, user directory, invitations)
    instructor/     # CourseManagerPage, CourseEditorPage, CourseAnalyticsPage
    learner/        # DashboardPage, MyCoursesPage, CatalogPage, CoursePlayerPage, CertificatesPage
    public/         # LandingPage, OnboardingPage, VerifyCertificatePage
  stores/           # Zustand (auth, ui)
  lib/              # typed api client, utils
worker/
  index.ts          # Hono app entry point & CORS
  wrangler.jsonc    # Cloudflare Wrangler config (D1, R2, KV bindings)
  routes/           # auth, admin, courses, progress, seed
  middleware/       # JWT auth, role validation, rate limiting
  db/               # Drizzle ORM schema, migrations, SQLite client
  lib/              # Web Crypto PBKDF2/JWT, Brevo email client
docs/
  PRD.md            # Product Requirements Document v1.4
  ARCHITECTURE.md   # System topology, folder structure, data flow
  DATABASE.md       # Cloudflare D1 schema (SQLite) + Drizzle ORM
  WORKERS.md        # Cloudflare Workers API specs & Hono routes
  FEATURES.md       # Feature breakdown & implementation progression
  DEVELOPMENT.md    # Setup guide, test accounts, deployment
```

---

## 📖 Documentation Index

- [PRD v1.4](docs/PRD.md) — Product requirements and MVP scope
- [Architecture](docs/ARCHITECTURE.md) — System design and data flows
- [Database](docs/DATABASE.md) — Cloudflare D1 schema, Drizzle ORM, FTS5
- [Workers API](docs/WORKERS.md) — Cloudflare Workers & Hono API specs
- [Features](docs/FEATURES.md) — Feature breakdown & implementation progression
- [Development](docs/DEVELOPMENT.md) — Setup guide, test accounts, and deployment
