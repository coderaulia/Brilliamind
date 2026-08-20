# Feature Breakdown & Implementation Status

Implementation order follows the dependency graph. Each section lists: what to build, key files, gotchas, and current status.

---

## Progress Summary

- [x] **Scaffold & Build Setup** (React 19, Vite, Tailwind CSS, pnpm)
- [x] **Public Landing Page** (`/` - `LandingPage.tsx`)
- [x] **Onboarding Flow** (`/onboarding` - 6-step `OnboardingPage.tsx`)
- [x] **Learner Shell & UI Primitives Prototype** (`AppShell`, `DashboardPage`, `CatalogPage`, `MyCoursesPage` with mock data)
- [ ] **Phase 1: Cloudflare Workers Foundation & Auth** (Hono Worker setup, D1 migrations, JWT Auth, `useAuth` hook, Login/Signup forms)
- [ ] **Phase 2: Course Management Studio** (Instructor Course CRUD on Workers API, Tiptap, Drag-drop, R2 Media Uploads)
- [ ] **Phase 3: Learner Engine** (Video.js progress tracking, SurveyJS Quiz Runner, Server-side Quiz Verify, REST Discussions)
- [ ] **Phase 4: Payments & Certificates** (Stripe checkout & webhook on Workers, jsPDF certificate generation, `/verify/:certUuid`)
- [ ] **Phase 5: Notifications & Email** (Resend transactional email dispatch via Cloudflare Workers)

---

## Phase 1 — Foundation & Auth

### F1.1 Auth (Cloudflare Worker JWT + D1 Profiles) `[In Progress - Store Mocked]`

**Scope:** Email signup/login, Google OAuth verification, password hashing, JWT session cookies/tokens, role-based routing.

**Files to create / update:**
- `worker/routes/auth.ts` — `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`, `/api/auth/google`
- `worker/middleware/auth.ts` — JWT extraction and verification middleware
- `worker/middleware/role.ts` — `requireRole('admin' | 'instructor' | 'learner')` guard
- `src/hooks/useAuth.ts` — calls `/api/auth/me`, syncs session to Zustand auth store
- `src/components/auth/LoginForm.tsx`
- `src/components/auth/SignupForm.tsx`
- `src/components/auth/OAuthButton.tsx` — Google OAuth
- `src/pages/auth/Login.tsx`, `Signup.tsx`, `ResetPassword.tsx`
- `worker/db/migrations/*_profiles.sql`

**Gotchas:**
- Passwords must be hashed using Web Crypto PBKDF2 or bcrypt/Argon2-compatible edge libraries.
- JWT tokens signed with `JWT_SECRET` in Worker environment.
- Role defaults to `learner`; initial `admin` role set via D1 seed script or direct SQL.

---

### F1.2 Routing & Layout Shell `[Partially Built - Prototype]`

**Scope:** Sidebar, topbar, role-based navigation, protected routes.

**Files:**
- `src/components/layout/AppShell.tsx` — wraps authenticated pages (theme switching)
- `src/components/layout/AppSidebar.tsx` — navigation sidebar
- `src/components/layout/AppTopNav.tsx` — top bar with notifications & user profile
- `src/App.tsx` — route tree (learner / instructor / admin groups with auth protection)

**Gotchas:**
- Role check happens after profile loads from `/api/auth/me` — render skeleton loader while loading.

---

## Phase 2 — Course Management

### F2.1 Course CRUD + Section/Lesson Structure

**Scope:** Instructor creates/edits/publishes courses; drag-drop lesson & section reordering.

**Files to create:**
- `worker/routes/courses.ts` — `/api/courses`, `/api/courses/:id/sections`, `/api/sections/:id/lessons`
- `src/pages/instructor/CourseManager.tsx` — list of own courses
- `src/pages/instructor/CourseEditor.tsx` — edit course metadata + section/lesson tree
- `src/components/course/SectionList.tsx` — drag-drop sections (use `@dnd-kit/sortable`)
- `src/components/course/LessonList.tsx` — drag-drop lessons within section
- `worker/db/migrations/*_courses.sql`

**Gotchas:**
- Slug must be unique — auto-generate from title with collision check.
- Batch position updates executed within a single D1 transaction in the Worker.
- Auto-save: debounce 1.5s on Tiptap `onUpdate`, sending `PUT /api/lessons/:id`.

---

### F2.2 Lesson Content Editors & Media Uploads

**Scope:** Rich text (Tiptap), video upload to R2, YouTube/Vimeo embed, PDF upload, quiz builder.

**Files to create:**
- `worker/routes/r2.ts` — `/api/r2/presign` (S3 presigned PUT URL generation with role checks)
- `src/components/lesson/TextEditor.tsx` — Tiptap with StarterKit + Link + Placeholder
- `src/components/lesson/VideoUploader.tsx` — presign → PUT to R2 → store `video_url`
- `src/components/lesson/YoutubeInput.tsx` — URL paste → Plyr embed preview
- `src/components/lesson/PdfUploader.tsx` — presign → PUT to R2 → store `pdf_url`
- `src/components/quiz/QuizBuilder.tsx` — form generating SurveyJS JSON schema

**Gotchas:**
- Tiptap HTML output must be sanitized with DOMPurify before rendering in learner view.
- Video uploads can be up to 2GB — use chunked XHR with progress events directly to R2.
- R2 presigned URLs expire in 15 minutes — generate fresh URLs on demand.

---

## Phase 3 — Learner Experience

### F3.1 Course Catalog + Search

**Scope:** Public catalog, search, category/level filters, course detail page.

**Files to create:**
- `src/pages/public/Catalog.tsx`
- `src/pages/public/CourseDetail.tsx` — syllabus, instructor info, enroll CTA
- `src/components/search/SearchBar.tsx` — full-text search bar
- `src/components/search/FilterPanel.tsx` — category, free/paid, level
- `src/hooks/useCourseSearch.ts` — debounce + `/api/courses/search?q=...` (SQLite FTS5 query)

**Gotchas:**
- Full-text search leverages SQLite FTS5 virtual table (`courses_fts`) on D1.
- Free preview lessons visible to unauthenticated guests (`is_free_preview = 1`).

---

### F3.2 Video Playback + Progress

**Scope:** Video.js player, resume position, 90% watched auto-complete.

**Files to create:**
- `src/components/lesson/VideoPlayer.tsx` — Video.js wrapper, timeupdate handler
- `src/hooks/useVideoProgress.ts` — throttle `POST /api/progress/watch-log` every 10s

**Gotchas:**
- Video.js initialized in `useEffect` with cleanup `player.dispose()`.
- R2 streaming uses direct public CDN URL `<source src="https://media.brilliamind.id/..." type="video/mp4">`.

---

### F3.3 Quiz Runner & Server-side Grading

**Scope:** Render SurveyJS quiz, submit to `/api/quiz/verify`, show instant feedback.

**Files to create:**
- `worker/routes/quiz.ts` — `/api/quiz/verify` (authoritative re-grading)
- `src/components/quiz/QuizRunner.tsx` — SurveyJS Model + ReactSurveyElement, countdown timer
- `src/hooks/useQuiz.ts` — fetch quiz definition, load attempt history, submit

**Gotchas:**
- SurveyJS Form Library (MIT renderer) used exclusively.
- Server-side grading in Worker is authoritative to prevent score tampering.
- Auto-submits on timer expiry.

---

### F3.4 Learner Dashboard & Progress

**Scope:** Enrolled courses, completion %, last activity, earned certificates.

**Files to create:**
- `src/pages/learner/Dashboard.tsx`
- `src/components/dashboard/EnrolledCourseCard.tsx`
- `src/hooks/useProgress.ts` — calls `/api/progress/dashboard`

---

### F3.5 Discussions (REST)

**Scope:** Per-lesson threaded comments and replies.

**Files to create:**
- `worker/routes/discussions.ts` — `/api/discussions/lesson/:lessonId`, `POST /api/discussions`
- `src/components/discussion/DiscussionThread.tsx`
- `src/components/discussion/DiscussionInput.tsx`
- `src/hooks/useDiscussions.ts` — fetch and mutate lesson comments

**Gotchas:**
- Live WebSockets / SSE real-time sync is deferred to v2.
- Comment bodies rendered with `marked` and sanitized with DOMPurify.

---

## Phase 4 — Payments & Certificates

### F4.1 Stripe Checkout & Webhook

**Files to create:**
- `worker/routes/stripe.ts` — `/api/stripe/checkout`, `/api/stripe/webhook`
- `src/lib/stripe.ts` — `loadStripe(VITE_STRIPE_PUBLISHABLE_KEY)` singleton
- `src/pages/public/CourseDetail.tsx` — checkout button triggering Stripe redirect

**Gotchas:**
- Webhook signature verified with Web Crypto: `stripe.webhooks.constructEventAsync(rawBody, sig, secret)`.
- Auto-enrolls user upon `checkout.session.completed` in D1 transaction.

---

### F4.2 Certificate Generation & Public Verification

**Files to create:**
- `worker/routes/certificates.ts` — `/api/certificates/my-certs`, `/api/certificates/verify/:certUuid`
- `src/components/certificate/CertificateDownload.tsx` — jsPDF client-side generation
- `src/lib/certificate.ts` — certificate PDF template with verification URL + QR code
- `src/pages/public/Verify.tsx` — `/verify/:certUuid` public verification page

**Gotchas:**
- Certificate issuance triggered automatically in `/api/quiz/verify` upon 100% course completion.
- Public verification endpoint checks `cert_uuid` and returns non-sensitive metadata.

---

## Phase 5 — Transactional Email Notifications

**Files to create:**
- `worker/lib/resend.ts` — Resend REST API wrapper
- `worker/routes/email.ts` — internal transactional email dispatcher

**Trigger events:**
- `enrollment_confirmation`: After enrollment or Stripe payment.
- `quiz_result`: After quiz submission.
- `certificate_issued`: After certificate award.
- `purchase_receipt`: After successful Stripe webhook processing.

---

## v2 Deferrals (Do Not Build in v1)

| Feature | Reason |
|---------|--------|
| Live sessions calendar (React Big Calendar) | Low v1 priority |
| Live Realtime discussions (WebSockets / Durable Objects) | Standard REST discussions sufficient for v1 |
| Midtrans payment | Indonesia-specific gateway, needs merchant setup |
| Instructor & Admin analytics dashboards (Chart.js) | Requires accumulated real data |
| Subscriptions & instructor revenue share | Business model not yet finalized |
| Custom certificate designer | Admin UI complexity |

---

## Component Dependencies Map

```
AppShell
  └── Sidebar, Topbar
        └── useAuth → Zustand auth store → /api/auth/me (Worker)

CourseEditor
  ├── TextEditor (Tiptap)
  ├── VideoUploader → /api/r2/presign (Worker) → Cloudflare R2
  ├── YoutubeInput → Plyr
  ├── PdfUploader → /api/r2/presign (Worker) → Cloudflare R2
  └── QuizBuilder → /api/courses/:id/lessons (Worker + D1)

LessonViewer (learner)
  ├── VideoPlayer (Video.js) → /api/progress/watch-log (Worker + D1)
  ├── QuizRunner (SurveyJS) → /api/quiz/verify (Worker + D1)
  ├── PdfViewer (iframe)
  └── DiscussionThread → /api/discussions (Worker + D1)

CourseDetail (public)
  └── EnrollButton → /api/stripe/checkout → Stripe → /api/stripe/webhook → D1
```
