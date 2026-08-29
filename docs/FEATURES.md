# Feature Breakdown & Implementation Status

Implementation status reflects the current development progress of the BrilliaMind LMS.

---

## MVP Scope (Launch)

Launch is intentionally limited to Phases 1–3: authentication and administration, instructor course studio, invitation-only learner onboarding, course playback, progress tracking, and roster analytics. Payments, certificates, advanced search, and discussions are post-MVP and must not be presented as launch functionality.

## Progress Summary

- [x] **Scaffold & Build Setup** (React 19, Vite, Tailwind CSS, pnpm, Cloudflare Workers, D1 + Drizzle)
- [x] **Public Landing Page** (`/` — `LandingPage.tsx`)
- [x] **Onboarding Flow** (`/onboarding` — 6-step `OnboardingPage.tsx`)
- [x] **Learner Shell & UI Primitives** (`AppShell`, `DashboardPage`, `CatalogPage`, `MyCoursesPage`, `CalendarPage`, `CertificatesPage`, `SettingsPage`)
- [x] **Phase 1: Cloudflare Workers Foundation & Auth** (`worker/routes/auth.ts`, `worker/routes/admin.ts`, Web Crypto PBKDF2, JWT auth, `src/stores/auth.ts`, `LoginPage.tsx`, `InstructorRegisterPage.tsx`, `AcceptInvitePage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`)
- [x] **Phase 2: Instructor Course Studio & Video Curriculum** (`worker/routes/courses.ts`, `CourseManagerPage.tsx`, `CourseEditorPage.tsx` with YouTube embed player, section & lesson builder)
- [x] **Phase 3: Learner Engine & Progress Roster** (`worker/routes/progress.ts`, `CoursePlayerPage.tsx` with YouTube/MP4 playback, `CourseAnalyticsPage.tsx` with instructor learner roster, realtime progress tracking)
- [ ] **Phase 4: Payments & Certificates — Post-MVP**
- [ ] **Phase 5: Advanced Search & Discussions — Post-MVP**

---

## Phase 1 — Foundation, Auth & Administration `[Completed]`

### F1.1 Authentication & Security (`worker/routes/auth.ts`, `worker/lib/crypto.ts`)
- **Password Hashing**: Web Crypto PBKDF2 (SHA-256, 100,000 iterations, 16-byte random salt).
- **Session Tokens**: HMAC-SHA256 signed JWTs with role claims (`admin`, `instructor`, `learner`) and 7-day expiry.
- **Rate Limiting**: Cloudflare KV-backed rate limiter on sensitive endpoints (`/api/auth/*`).
- **Instructor Registration Flow**: New instructor applicants register with `status = 'pending'`. Login blocks pending instructors until approved.
- **Invitation Token Verification**: `/api/auth/accept-invite` validates invitation token, creates profile, activates account, and auto-enrolls in courses.
- **Password Resets**: Self-service (`/forgot-password` and `/reset-password`) with 24-hour expiration tokens.

### F1.2 Superadmin Control Center (`worker/routes/admin.ts`, `src/pages/admin/AdminDashboardPage.tsx`)
- **Instructor Approval Queue**: Superadmin reviews pending instructor applicants and approves or suspends with one click.
- **User Directory**: View all registered users, roles, and account statuses with manual password reset trigger.
- **Invitation Dispatcher**: Superadmin invites learners or instructors by email with auto-generated onboarding links.

---

## Phase 2 — Instructor Studio & Course Curriculum `[Completed]`

### F2.1 Course Management (`worker/routes/courses.ts`, `src/pages/instructor/CourseManagerPage.tsx`)
- **Course Studio**: Instructors manage drafts and published courses.
- **Course Publishing**: Instant status toggle between `draft` and `published`.

### F2.2 Curriculum Builder & YouTube Video Lessons (`src/pages/instructor/CourseEditorPage.tsx`)
- **Curriculum Tree**: Instructors create and manage structured modules/sections.
- **YouTube Embed Builder**: Add video lessons using third-party YouTube links or direct video URLs with instant embed preview.
- **Preview Flag**: Mark lessons as "Free Preview" for unauthenticated guests.

---

## Phase 3 — Learner Experience & Progress Analytics `[Completed]`

### F3.1 Course Playback & Progress Checklist (`src/pages/learner/CoursePlayerPage.tsx`, `worker/routes/progress.ts`)
- **Interactive Player**: Embeds YouTube video lectures and local video streams.
- **Progress Checklist**: Real-time lesson completion checkboxes. Checking off lessons calls `POST /api/progress/lesson` and updates progress percentage.
- **Automatic Course Completion**: Recalculates course completion on every lesson update; sets `completed_at` timestamp on 100% completion.

### F3.2 Dashboards & Roster Analytics
- **Learner Dashboard (`src/pages/learner/DashboardPage.tsx`)**: Displays enrolled courses and overall completion progress rings.
- **Instructor Learner Roster (`src/pages/instructor/CourseAnalyticsPage.tsx`)**: Real-time roster showing each student's completed lessons, progression percentage bar, enrollment date, and course invitation sender.

---

## Phase 4 — Payments & Certificate Verification `[In Progress / Up Next]`

- [x] Client-side certificate preview UI (`CertificatesPage.tsx`, `VerifyCertificatePage.tsx`)
- [ ] Worker Stripe Checkout API (`/api/stripe/checkout`)
- [ ] Stripe Webhook signature verification and auto-enrollment
- [ ] jsPDF certificate export and D1 certificate issuance records

---

## Phase 5 — Search & Discussions `[Planned]`

- [ ] SQLite FTS5 course and lesson catalog search
- [ ] REST-based lesson discussion threads & replies
- [ ] Community Q&A notifications via Brevo email
