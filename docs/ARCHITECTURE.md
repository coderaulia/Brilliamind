# Architecture

## Topology

```
Browser (SPA)
  └── Cloudflare Pages (static Vite build)
        ├── fetch → Cloudflare Workers (/api/* — Hono application)
        │     ├── /api/auth           (JWT auth, login, signup, user session)
        │     ├── /api/courses        (Catalog, curriculum CRUD, sections, lessons)
        │     ├── /api/r2/presign     (S3 presigned PUT URLs for direct R2 uploads)
        │     ├── /api/stripe         (Checkout session & webhook handling)
        │     ├── /api/quiz           (Server-side grading & attempt verification)
        │     ├── /api/progress       (Video watch tracking & lesson checklist)
        │     ├── /api/certificates   (Issuance rules & public verification)
        │     ├── /api/discussions    (REST lesson threads & replies)
        │     └── /api/email          (Resend transactional email dispatch)
        ├── fetch → Cloudflare R2 (zero-egress CDN for video, PDF, images)
        └── Cloudflare Edge Bindings (Worker runtime)
              ├── env.DB → Cloudflare D1 (SQLite + Drizzle ORM)
              ├── env.MEDIA_BUCKET → Cloudflare R2 Bucket
              └── env.KV → Cloudflare KV (sessions, rate limiting, cache)
```

Unified Cloudflare Edge architecture. Compute, database, storage, and caching run at the edge with zero egress fees and minimal cold start latency.

---

## Folder Structure

```
lms/
├── docs/                        # Specifications & planning docs
├── public/                      # Static assets (favicon, og image)
├── src/                         # Frontend SPA (React 19 + Vite + Tailwind)
│   ├── components/
│   │   ├── ui/                  # Primitives (CourseCard, StatCard, ProgressRing, ActivityHeatmap…)
│   │   ├── layout/              # AppShell, AppSidebar, AppTopNav
│   │   ├── auth/                # LoginForm, SignupForm, OAuthButton
│   │   ├── course/              # CourseGrid, CourseEditor, LessonList, SectionList
│   │   ├── lesson/              # LessonViewer, VideoPlayer, PdfViewer, QuizRunner
│   │   ├── quiz/                # QuizBuilder, QuizRunner, AttemptHistory
│   │   ├── discussion/          # DiscussionThread, DiscussionInput
│   │   ├── certificate/         # CertificateCard, CertificateDownload
│   │   ├── dashboard/           # LearnerDashboard, CourseProgress
│   │   └── search/              # SearchBar, SearchResults, FilterPanel
│   ├── pages/
│   │   ├── LandingPage.tsx      # Public landing page
│   │   ├── OnboardingPage.tsx   # 6-step learner onboarding flow
│   │   ├── auth/                # Login, Signup, ResetPassword
│   │   ├── learner/             # DashboardPage, MyCoursesPage, CatalogPage, CoursePlayerPage, CertificatesPage
│   │   ├── instructor/          # CourseManager, CourseEditor, Analytics
│   │   └── admin/               # UserManager, PlatformSettings
│   ├── constants/               # Design tokens, theme color palettes
│   ├── data/                    # Mock data for rapid UI prototyping
│   ├── hooks/                   # useAuth, useCourse, useProgress, useDiscussions
│   ├── stores/                  # Zustand (auth, ui)
│   ├── lib/
│   │   ├── api.ts               # typed fetch client for Worker /api routes
│   │   ├── stripe.ts            # loadStripe singleton
│   │   ├── r2.ts                # presigned upload helper
│   │   └── utils.ts             # cn(), formatCurrency(), slugify()
│   ├── types/
│   │   └── api.ts               # Shared API contract & D1 model types
│   ├── main.tsx
│   └── vite-env.d.ts
├── worker/                      # Cloudflare Workers Backend (Hono + TypeScript)
│   ├── index.ts                 # App entry point & route mounting
│   ├── wrangler.jsonc           # Wrangler config (D1, R2, KV bindings)
│   ├── routes/                  # Modular endpoints (auth, courses, r2, stripe, quiz, progress, etc.)
│   ├── middleware/              # JWT auth, role guard, error handler, CORS
│   ├── db/                      # Drizzle ORM client, schema.ts, migrations/
│   ├── lib/                     # R2 presigner, Stripe Web Crypto, Resend HTTP client
│   └── types.ts                 # Env bindings interface & context variables
└── ...config files (package.json, vite.config.ts, tailwind.config.ts)
```

---

## Data Flow Patterns

### Auth
```
User → POST /api/auth/login or /api/auth/signup
     → Cloudflare Worker validates credentials via bcrypt/Web Crypto
     → Issues signed JWT (returned in response or set as HTTP-only cookie)
     → Frontend stores token and includes `Authorization: Bearer <token>`
     → Worker auth middleware validates JWT and populates c.get('user')
     → Role-based authorization enforced by requireRole() middleware
     → useAuth hook synchronizes state with Zustand auth store
```

### Video Upload
```
Instructor → POST /api/r2/presign (authenticated as instructor/admin)
           → Cloudflare Worker: validates permissions, generates S3 presigned PUT URL
           → Browser: PUT file directly to Cloudflare R2 bucket (zero proxy bottleneck)
           → Browser: POST /api/r2/confirm (records media_files row in D1)
           → Lesson video_url = R2 public CDN URL
```

### Quiz Grading
```
Learner submits answers in browser
  → Client evaluates locally for instant feedback
  → POST /api/quiz/verify { quizId, answers }
  → Cloudflare Worker: checks max attempts, re-grades answers against schema_json
  → Worker: inserts quiz_attempts row in D1 via Drizzle ORM
  → If passed & all course lessons done: auto-inserts certificate in D1 & sends email
  → Returns { score, passed, feedback } — client trusts this result only
```

### Payment (Stripe)
```
Learner → POST /api/stripe/checkout { courseId }
        → Cloudflare Worker: verifies user & course, creates Stripe Checkout Session
        → Browser redirects to Stripe hosted payment page
        → Stripe sends POST /api/stripe/webhook (Stripe-Signature header)
        → Cloudflare Worker: verifies signature with Web Crypto
        → Worker: inserts payments row & enrollments row in D1 in a transaction
        → Worker: dispatches enrollment confirmation & receipt email via Resend
```

### Discussions
```
Learner/Instructor views lesson
  → GET /api/discussions/lesson/:lessonId (fetches threaded comments)
User posts reply
  → POST /api/discussions { lessonId, parentId, body }
  → Cloudflare Worker validates enrollment & inserts comment in D1
  → Returns updated comment tree
*(Live WebSockets / SSE deferred to v2)*
```

---

## Key Design Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Compute / API | Cloudflare Workers + Hono | Sub-millisecond cold starts, zero-egress, global edge execution, TypeScript native |
| Database | Cloudflare D1 (SQLite) + Drizzle ORM | Serverless edge SQL, native Workers binding, zero connection pooling overhead |
| Auth & Authorization | Worker JWT + Middleware | Self-contained, standard Web Crypto, role check (`admin`, `instructor`, `learner`) |
| Media Storage | Cloudflare R2 + CDN | Zero egress fees, 2GB upload support via S3 presigned URLs |
| Quiz Integrity | Server-side re-grade in Worker | Prevents client score tampering, enforces attempt limits |
| PDF Certificates | jsPDF client-side | Instant generation, zero server rendering cost, verified via public API |
| Search | SQLite FTS5 | Fast edge full-text search built into D1 with zero external services |
| State Management | Zustand (auth + UI state) | Simple, lightweight, synced with Worker REST endpoints |
| Email | Resend via HTTP API | Standard REST API callable from edge Workers without Node mailer dependencies |

---

## Security Boundaries

- **Worker Authentication Middleware**: All protected endpoints require a valid JWT signed with `JWT_SECRET`.
- **Role Authorization Guard**: Restricted actions (course authoring, publishing, user administration) guarded by `requireRole('admin', 'instructor')`.
- **Tiptap HTML Sanitization**: Rich text HTML sanitized with DOMPurify before rendering in learner view.
- **Quiz Score Validation**: Client answers re-evaluated server-side against authoritative answer key.
- **R2 Presigned Uploads**: Only authenticated instructors and admins can request presigned upload URLs with strict MIME and size limits.
- **Stripe Webhook Signature**: Verified with Web Crypto using `STRIPE_WEBHOOK_SECRET` before processing payment events.
