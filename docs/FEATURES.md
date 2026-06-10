# Feature Breakdown

Implementation order follows dependency graph. Each section lists: what to build, key files, and gotchas.

---

## Phase 1 — Foundation

### F1.1 Auth (Supabase Auth + profiles)

**Scope:** Email signup/login, Google OAuth, profile auto-create trigger, role-based routing

**Files to create:**
- `src/hooks/useAuth.ts` — subscribe to `supabase.auth.onAuthStateChange`, sync to Zustand, load profile
- `src/components/auth/LoginForm.tsx`
- `src/components/auth/SignupForm.tsx`
- `src/components/auth/OAuthButton.tsx` — Google
- `src/pages/auth/Login.tsx`, `Signup.tsx`, `ResetPassword.tsx`
- `supabase/migrations/*_profiles.sql`

**Gotchas:**
- OAuth redirect URL must be whitelisted in Supabase dashboard (add localhost + production domain)
- `handle_new_user` trigger uses `security definer` — test it separately
- After Google OAuth, `name` comes from `raw_user_meta_data.name`
- Role defaults to `learner` — admin must be set manually via Supabase dashboard or SQL

---

### F1.2 Routing & Layout Shell

**Scope:** Sidebar, topbar, role-based nav, protected routes

**Files to create:**
- `src/components/layout/AppShell.tsx` — wraps authenticated pages
- `src/components/layout/Sidebar.tsx` — different nav items per role
- `src/components/layout/Topbar.tsx` — user avatar, notifications badge
- `src/App.tsx` — expand route tree (learner/instructor/admin groups)

**Gotchas:**
- Role check happens after profile loads — show skeleton, not redirect, while loading
- Instructor and admin pages share some routes — use role check inside page, not route

---

## Phase 2 — Course Management

### F2.1 Course CRUD + Section/Lesson Structure

**Scope:** Instructor creates/edits/publishes courses; drag-drop lesson reorder

**Files to create:**
- `src/pages/instructor/CourseManager.tsx` — list of own courses
- `src/pages/instructor/CourseEditor.tsx` — edit course metadata + section/lesson tree
- `src/components/course/SectionList.tsx` — drag-drop sections (use `@dnd-kit/sortable`)
- `src/components/course/LessonList.tsx` — drag-drop lessons within section
- `supabase/migrations/*_courses.sql`

**Gotchas:**
- `@dnd-kit/sortable` not in package.json yet — add it when building this
- Position reorder: update all affected rows in a single `supabase.from('lessons').upsert([…])` batch
- Slug must be unique — auto-generate from title, check collision before insert
- Auto-save: debounce 1.5s on every Tiptap `onUpdate`, upsert lesson content_json

---

### F2.2 Lesson Content Editors

**Scope:** Rich text (Tiptap), video upload to R2, YouTube/Vimeo embed, PDF upload, quiz config

**Files to create:**
- `src/components/lesson/TextEditor.tsx` — Tiptap with StarterKit + Link + Placeholder
- `src/components/lesson/VideoUploader.tsx` — presign → PUT → store video_url
- `src/components/lesson/YoutubeInput.tsx` — URL paste → Plyr embed preview
- `src/components/lesson/PdfUploader.tsx` — presign → PUT → store pdf_url
- `src/components/quiz/QuizBuilder.tsx` — custom form outputting SurveyJS JSON schema
- `supabase/functions/r2-presign/index.ts`

**Gotchas:**
- DO NOT use SurveyJS Creator (commercial) — build own simple quiz builder outputting SurveyJS-compatible JSON
- Tiptap HTML output must be run through DOMPurify before rendering in learner view
- Video uploads can be 2GB — use chunked XHR with progress event, not fetch
- R2 presigned URL expires in 15 min — generate fresh URL per upload, not per session

---

## Phase 3 — Learner Experience

### F3.1 Course Catalog + Search

**Scope:** Public catalog, search, filters, course detail page

**Files to create:**
- `src/pages/public/Catalog.tsx`
- `src/pages/public/CourseDetail.tsx` — syllabus, instructor, enroll/buy CTA
- `src/components/search/SearchBar.tsx` — typeahead via ILIKE
- `src/components/search/FilterPanel.tsx` — category, free/paid, level
- `src/hooks/useCourseSearch.ts` — debounce + supabase `.textSearch()`

**Gotchas:**
- `textSearch()` uses `search_tsv` column — requires GIN index (in migration)
- Typeahead uses `.ilike('title', '%query%')` with `pg_trgm` GIN index — fast enough for v1
- Free-preview lessons visible to guests — RLS uses `is_free_preview = true`

---

### F3.2 Video Playback + Progress

**Scope:** Video.js player, resume position, 90% → complete

**Files to create:**
- `src/components/lesson/VideoPlayer.tsx` — Video.js wrapper, timeupdate handler
- `src/hooks/useVideoProgress.ts` — upsert `video_watch_logs` every 10s, mark complete at 90%

**Gotchas:**
- Video.js must be initialized in `useEffect` with cleanup `player.dispose()`
- `timeupdate` fires very frequently — throttle to every 10s before upserting
- R2 streaming: set `<source src="https://cdn.../…" type="video/mp4">` — no CORS issue with public bucket

---

### F3.3 Quiz Runner

**Scope:** Render SurveyJS quiz, submit to quiz-verify, show results

**Files to create:**
- `src/components/quiz/QuizRunner.tsx` — SurveyJS Model + ReactSurveyElement, timer
- `src/hooks/useQuiz.ts` — fetch quiz_definition, load attempt history, submit
- `supabase/functions/quiz-verify/index.ts`

**Gotchas:**
- Import only `survey-core` + `survey-react-ui` (MIT renderer) — never `survey-creator-*`
- Client-side grading for instant feedback; server-side (`quiz-verify`) is authoritative
- Time limit: use `useEffect` countdown, disable submit on expiry, auto-submit current state

---

### F3.4 Learner Dashboard + Progress

**Scope:** Enrolled courses, completion %, last activity, certificates list

**Files to create:**
- `src/pages/learner/Dashboard.tsx`
- `src/components/dashboard/EnrolledCourseCard.tsx`
- `src/hooks/useProgress.ts` — query `course_progress_view`

---

### F3.5 Discussions (Realtime)

**Scope:** Per-lesson threaded comments, live updates

**Files to create:**
- `src/components/discussion/DiscussionThread.tsx`
- `src/components/discussion/DiscussionInput.tsx`
- `src/hooks/useDiscussion.ts` — initial fetch + Realtime subscription

**Gotchas:**
- Subscribe on mount, unsubscribe on unmount: `supabase.removeChannel(channel)`
- Realtime Postgres Changes require `replica identity full` on `discussions` table:
  `alter table discussions replica identity full;`
- Render body with `marked` (markdown) — sanitize with DOMPurify before `dangerouslySetInnerHTML`

---

## Phase 4 — Payments + Certificates

### F4.1 Stripe Checkout

**Files to create:**
- `src/pages/public/CourseDetail.tsx` (enroll/pay button, already started in F3.1)
- `src/lib/stripe.ts` — `loadStripe(VITE_STRIPE_PUBLISHABLE_KEY)` singleton
- `supabase/functions/stripe-checkout/index.ts`
- `supabase/functions/stripe-webhook/index.ts`

**Gotchas:**
- Webhook endpoint must be registered in Stripe dashboard pointing to function URL
- `stripe-webhook` must read raw body (not parsed JSON) for signature verification:
  `const body = await req.text()` before any parsing

---

### F4.2 Certificate Generation

**Files to create:**
- `src/components/certificate/CertificateDownload.tsx` — download button
- `src/lib/certificate.ts` — jsPDF template function
- `src/pages/public/Verify.tsx` — `/verify/:certUuid` public page
- (cert issuance logic in `quiz-verify` Edge Function)

**Gotchas:**
- jsPDF 4.x API may differ from 2.x — check migration notes
- Certificate UUID used for public verification — never expose internal `id`

---

## Phase 5 — Notifications (Email)

**Files to create:**
- `supabase/functions/send-email/index.ts`
- Email templates (HTML strings in send-email function or separate template files)
- Configure DB Webhooks in Supabase dashboard

---

## v2 Deferrals (Do Not Build in v1)

| Feature | Blocker |
|---------|---------|
| Live sessions calendar (React Big Calendar) | Low v1 priority |
| Midtrans payment | Indonesia-specific, needs test account |
| Instructor analytics (Chart.js) | Needs sufficient data first |
| Admin analytics dashboard | Same |
| MeiliSearch upgrade | Postgres FTS sufficient for v1 |
| Subscriptions + revenue share | Business model not finalized |
| Custom certificate templates | Admin UI complexity |

---

## Component Dependencies Map

```
AppShell
  └── Sidebar, Topbar
        └── useAuth → Zustand auth store → Supabase Auth

CourseEditor
  ├── TextEditor (Tiptap)
  ├── VideoUploader → r2-presign EdgeFn → R2
  ├── YoutubeInput → Plyr
  ├── PdfUploader → r2-presign EdgeFn → R2
  └── QuizBuilder → quiz_definitions table

LessonViewer (learner)
  ├── VideoPlayer (Video.js) → useVideoProgress → video_watch_logs
  ├── QuizRunner (SurveyJS) → quiz-verify EdgeFn → quiz_attempts
  ├── PdfViewer (iframe)
  └── DiscussionThread → useDiscussion → Realtime

CourseDetail (public)
  └── EnrollButton → stripe-checkout EdgeFn → Stripe → stripe-webhook → enrollments
```
