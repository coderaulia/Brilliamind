# Architecture

## Topology

```
Browser (SPA)
  └── Cloudflare Pages (static Vite build)
        ├── supabase-js → Supabase (Postgres + RLS + Auth + Realtime)
        ├── fetch → Supabase Edge Functions (Deno)
        │     ├── R2 presigned upload URLs
        │     ├── Stripe Checkout Session
        │     ├── Stripe webhook handler
        │     ├── Quiz score verification
        │     └── Resend email dispatch
        └── fetch → Cloudflare R2 (media CDN, zero egress)
```

No traditional backend server. All compute = Edge Functions or browser.

---

## Folder Structure

```
lms/
├── docs/                        # Planning docs (this folder)
├── public/                      # Static assets (favicon, og image)
├── src/
│   ├── components/
│   │   ├── ui/                  # shadcn-style primitives (Button, Input, Badge…)
│   │   ├── layout/              # AppShell, Sidebar, Topbar, PageWrapper
│   │   ├── auth/                # LoginForm, SignupForm, OAuthButton
│   │   ├── course/              # CourseCard, CourseGrid, CourseEditor, LessonList
│   │   ├── lesson/              # LessonViewer, VideoPlayer, PdfViewer, QuizRunner
│   │   ├── quiz/                # QuizBuilder, QuizRunner, AttemptHistory
│   │   ├── discussion/          # DiscussionThread, DiscussionInput
│   │   ├── certificate/         # CertificateCard, CertificatePDF
│   │   ├── dashboard/           # LearnerDashboard, CourseProgress
│   │   └── search/              # SearchBar, SearchResults, FilterPanel
│   ├── pages/
│   │   ├── public/              # Home, Catalog, CourseDetail, Verify
│   │   ├── auth/                # Login, Signup, ResetPassword
│   │   ├── learner/             # Dashboard, MyCourses, Learn, Certificates
│   │   ├── instructor/          # CourseManager, CourseEditor, Analytics
│   │   └── admin/               # UserManager, PlatformSettings
│   ├── hooks/                   # useAuth, useCourse, useProgress, useRealtime
│   ├── stores/                  # Zustand: auth.ts, ui.ts
│   ├── lib/
│   │   ├── supabase.ts          # typed client
│   │   ├── stripe.ts            # loadStripe singleton
│   │   ├── r2.ts                # presigned upload helper
│   │   └── utils.ts             # cn(), formatCurrency(), slugify()
│   ├── types/
│   │   └── database.ts          # generated DB types (all tables)
│   └── main.tsx
├── supabase/
│   ├── functions/               # Edge Functions (Deno)
│   │   ├── r2-presign/
│   │   ├── stripe-checkout/
│   │   ├── stripe-webhook/
│   │   ├── quiz-verify/
│   │   ├── send-email/
│   │   └── _shared/             # cors.ts, auth.ts helpers
│   └── migrations/              # SQL migration files
└── ...config files
```

---

## Data Flow Patterns

### Auth
```
User → Supabase Auth (email or Google OAuth)
     → JWT stored in localStorage via supabase-js
     → supabase-js auto-attaches Bearer token on every request
     → Postgres RLS enforces per-row access by auth.uid()
     → useAuth hook syncs session → Zustand auth store
```

### Video Upload
```
Instructor → POST /functions/v1/r2-presign (authenticated)
           → Edge Function: verify instructor role, generate S3 presigned PUT URL
           → Browser: PUT file directly to R2 (no proxy)
           → Browser: insert media_files row via supabase-js
           → Lesson video_url = R2 public CDN URL
```

### Quiz Grading
```
Learner submits answers (client)
  → Client grades locally (instant feedback)
  → POST /functions/v1/quiz-verify { quizId, answers }
  → Edge Function: re-grades server-side, inserts quiz_attempts row
  → Returns { score, passed } — client trusts this result only
```

### Payment (Stripe)
```
Learner → POST /functions/v1/stripe-checkout { courseId }
        → Edge Function: create Stripe Checkout Session, return URL
        → Redirect to Stripe hosted page
        → Stripe POST /functions/v1/stripe-webhook (signature verified)
        → Edge Function: insert payments + enrollments rows
        → Resend enrollment confirmation email
```

### Realtime Discussions
```
Component mounts → supabase.channel('lesson:123')
                    .on('postgres_changes', { event: 'INSERT', table: 'discussions',
                        filter: 'lesson_id=eq.123' }, handler)
                    .subscribe()
User posts → supabase.from('discussions').insert(…) — triggers live update for all
```

---

## Key Design Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Auth | Supabase Auth | Built-in email + OAuth, no extra infra |
| Authorization | Postgres RLS | Single source of truth, no API middleware layer |
| Realtime | Supabase Realtime (Postgres Changes) | Zero extra infra, good enough for discussions |
| Media | R2 presigned PUT from browser | No proxy cost, 2GB file support |
| Quiz integrity | Server-side re-grade in Edge Function | Prevent client-side tampering |
| PDF certs | jsPDF client-side | No server cost, instant download |
| Search | Postgres tsvector GIN index | Good enough for v1, one less service |
| State | Zustand (auth + ui only) | Server state lives in supabase-js queries |

---

## Security Boundaries

- **Every table has RLS enabled** — no table is publicly writable
- **Service role key** only in Edge Functions (never shipped to browser)
- **Tiptap HTML output** must be sanitized before rendering (DOMPurify)
- **Quiz scores** never trusted from client — always re-verified server-side
- **R2 presign** restricted to authenticated instructors with role check
- **Stripe webhooks** verified with `stripe.webhooks.constructEvent()` signature
