# Product Requirements Document

## LMS / E-Learning Platform (BrilliaMind.id)

**Version:** 1.2  
**Status:** Draft  
**Author:** Coderaulia (Vanaila Digital)
**Date:** June 2026  
**Changelog v1.1:** Stack changed to Supabase + Cloudflare hybrid. Auth.js → Supabase Auth, Socket.io → Supabase Realtime, MeiliSearch → Postgres full-text (v1). R2 confirmed for all media.  
**Changelog v1.2:** SCORM removed entirely. Resend confirmed as sole email service. PDF generation confirmed client-side only (jsPDF). React-pdf and Nodemailer removed.

---

## 1. Library & Service Stack Reference

### Platform Services

| #   | Function               | Service                        | Tier                      | Link                                                       |
| --- | ---------------------- | ------------------------------ | ------------------------- | ---------------------------------------------------------- |
| A   | Database               | Supabase Postgres + RLS        | Free → $25/mo Pro         | https://supabase.com                                       |
| B   | Authentication         | Supabase Auth                  | Included                  | https://supabase.com/docs/guides/auth                      |
| C   | Realtime (discussions) | Supabase Realtime              | Included                  | https://supabase.com/docs/guides/realtime                  |
| D   | Serverless compute     | Supabase Edge Functions (Deno) | Included                  | https://supabase.com/docs/guides/functions                 |
| E   | Media storage + CDN    | Cloudflare R2 (zero egress)    | Free 10GB → pay-as-you-go | https://developers.cloudflare.com/r2                       |
| F   | Frontend hosting       | Cloudflare Pages               | Free                      | https://pages.cloudflare.com                               |
| G   | Search (v1)            | Postgres full-text (tsvector)  | Included in A             | https://supabase.com/docs/guides/database/full-text-search |

### Frontend / Feature Libraries

| #   | Feature                         | Library               | License    | Link                                                                      |
| --- | ------------------------------- | --------------------- | ---------- | ------------------------------------------------------------------------- |
| 1   | Rich Text Editor                | Tiptap                | MIT        | https://tiptap.dev · https://github.com/ueberdosis/tiptap                 |
| 2   | Video Player                    | Video.js              | Apache 2.0 | https://videojs.com · https://github.com/videojs/video.js                 |
| 2b  | YouTube/Vimeo Embed             | Plyr (iframe wrapper) | MIT        | https://plyr.io · https://github.com/sampotts/plyr                        |
| 3   | Quiz / Assessment               | SurveyJS Form Library | MIT        | https://surveyjs.io · https://github.com/surveyjs/survey-library          |
| 4   | Charts / Analytics UI           | Chart.js              | MIT        | https://chartjs.org · https://github.com/chartjs/Chart.js                 |
| 5   | PDF / Certificate (client-side) | jsPDF                 | MIT        | https://github.com/parallax/jsPDF                                         |
| 6   | Calendar / Scheduling (v2)      | React Big Calendar    | MIT        | https://github.com/jquense/react-big-calendar                             |
| 7   | Email                           | Resend                | Free tier  | https://resend.com                                                        |
| 8   | Payment (Global)                | Stripe                | Free SDK   | https://stripe.com/docs                                                   |
| 8b  | Payment (Indonesia, v2)         | Midtrans              | Free SDK   | https://midtrans.com · https://github.com/Midtrans/midtrans-nodejs-client |
| 9   | Search upgrade (v2, optional)   | MeiliSearch           | MIT        | https://meilisearch.com                                                   |

### Replaced from v1.0

| Removed            | Replaced By       | Reason                                                |
| ------------------ | ----------------- | ----------------------------------------------------- |
| Auth.js (NextAuth) | Supabase Auth     | Built-in email + OAuth, no extra code                 |
| Socket.io          | Supabase Realtime | Postgres-change subscriptions, zero server management |
| MeiliSearch (v1)   | Postgres tsvector | Good enough for v1, one less service to run           |
| MinIO              | —                 | R2 chosen; no self-hosted storage needed              |
| Matrix SDK         | —                 | Out of scope                                          |
| SCORM Again        | —                 | Removed entirely; no SCORM requirement                |
| React-pdf          | —                 | jsPDF client-side sufficient; React-pdf unnecessary   |
| Nodemailer         | Resend            | Nodemailer incompatible with Deno Edge Functions      |

---

## 2. Product Overview

**Product Name:** TBD (working name: LearnOS)  
**Type:** Web-based LMS / E-Learning Platform  
**Target Users:** Corporate HR teams, training providers, digital academies (Indonesia-first, global capable)

**Stack Assumption:**

- Frontend: React 19 + Vite + Tailwind, deployed on Cloudflare Pages
- Backend: Supabase (Postgres + RLS as primary API via supabase-js; Edge Functions for webhooks, payment handling, emails)
- Media: Cloudflare R2 with public bucket + CDN
- Architecture pattern: same as HR Performance Suite (browser SPA + Supabase), proven stack

**SSR Note:** v1 ships as Vite SPA. If public course catalog SEO becomes a priority, migrate catalog pages to Next.js on CF Pages (or pre-render static catalog pages) in v2.

---

## 3. User Roles

| Role       | Description                                           |
| ---------- | ----------------------------------------------------- |
| Admin      | Full platform access, manage users, billing, settings |
| Instructor | Create/manage courses, view learner progress          |
| Learner    | Enroll, take courses, view certificates               |
| Guest      | Browse public course catalog only                     |

Role enforcement: Postgres RLS policies per role + `role` column on `profiles` table.

---

## 4. Core Modules & Feature Requirements

---

### 4.1 Authentication & User Management

**Service:** Supabase Auth

**Requirements:**

- Email/password signup + login (Supabase Auth built-in)
- OAuth: Google (enable in Supabase dashboard)
- Email verification on signup (Supabase built-in)
- Password reset flow (Supabase built-in, custom email template)
- `profiles` table linked to `auth.users` via trigger: name, avatar_url, bio, role
- RLS: users read/update own profile; admin reads all
- Session: Supabase JWT, auto-refresh via supabase-js

**Out of scope (v1):** SSO/SAML, magic link, phone OTP

---

### 4.2 Course Management

**Libraries:** Tiptap (editor), R2 (media)

**Requirements:**

- Instructors create, edit, publish, archive courses
- Course fields: title, slug, description, cover image (R2), category, tags, price, currency, visibility (public/private/draft)
- Structure: Course > Sections > Lessons
- Lesson types:
   - Rich text (Tiptap, stored as JSON in `content_json`)
   - Video (R2 upload, Video.js playback)
   - YouTube/Vimeo embed (URL, Plyr)
   - PDF attachment (R2)
   - Quiz (SurveyJS JSON schema)
- Drag-and-drop reorder (position integer columns)
- Auto-save drafts (debounced upsert via supabase-js)
- Preview mode before publish
- RLS: instructors CRUD own courses; learners read enrolled/published only

---

### 4.3 Video Playback

**Libraries:** Video.js, Plyr · **Storage:** Cloudflare R2

**Requirements:**

- Upload MP4 to R2 via presigned URL (generated by Edge Function with R2 S3-compatible API)
- Stream from R2 public bucket through Cloudflare CDN (zero egress cost)
- YouTube/Vimeo: paste URL → Plyr embed
- Controls: play/pause, seek, volume, fullscreen, speed (0.5x–2x)
- Resume from last position (`video_watch_logs.watch_seconds`, upsert every 10s)
- Completion: 90% watched → lesson marked complete

---

### 4.4 Quiz & Assessment

**Library:** SurveyJS Form Library (MIT — renderer only)

**Requirements:**

- Quiz schema stored as JSON in `quiz_definitions.schema_json`
- v1 quiz creator: simple custom form in admin UI that outputs SurveyJS JSON (do NOT use commercial SurveyJS Creator)
- Question types: multiple choice, multi-select, true/false, short answer, rating
- Per-quiz settings: time limit, passing score, max attempts, randomize question order
- Auto-grading client-side, score verified server-side in Edge Function before insert (prevent tampering)
- Results: score, pass/fail, per-question feedback (configurable)
- Attempt history stored in `quiz_attempts`, RLS: learner reads own, instructor reads own courses'

---

### 4.5 Progress Tracking

**Library:** Chart.js · **Data:** Postgres views

**Requirements:**

- Learner dashboard: enrolled courses, completion %, last activity, certificates earned
- Course progress: per-lesson completion checklist
- Instructor dashboard (v2): enrollment counts, avg completion, quiz score distribution (Chart.js bar), activity over time (line)
- Admin dashboard (v2): platform enrollments, revenue, DAU/MAU
- Implementation: Postgres views (`course_progress_view`) computed from `user_progress` + `enrollments`; queried via supabase-js

---

### 4.6 Certificate Generation

**Library:** jsPDF (client-side) · **Trigger:** Supabase Edge Function + DB trigger

**Requirements:**

- Trigger: all lessons complete + required quizzes passed → insert into `certificates` (Postgres trigger via Edge Function)
- Fields: learner name, course name, completion date, instructor name, cert UUID
- PDF generated client-side with jsPDF from default hardcoded template; download button on learner dashboard
- Public verification: `/verify/:certUuid` → public RLS select on `certificates` (limited columns)
- v2: admin-customizable template

---

### 4.7 Discussions (Real-time)

**Service:** Supabase Realtime

**Requirements:**

- Per-lesson threaded discussion (`discussions` table, `parent_id` for replies)
- Live updates: subscribe to Postgres changes on `discussions` filtered by `lesson_id`
- Simple text + basic markdown (rendered with marked.js or Tiptap read-only)
- Notification badge updates live via Realtime subscription
- RLS: enrolled learners + course instructor can read/insert; authors edit/delete own

---

### 4.8 Notifications (Email)

**Service:** Resend via Supabase Edge Functions + Database Webhooks

**Trigger events:**
| Event | Recipient | Sent By |
|-------|-----------|---------|
| Signup verification | Learner | Supabase Auth (built-in) |
| Password reset | Learner | Supabase Auth (built-in) |
| Enrollment confirmation | Learner | Edge Function + Resend |
| Quiz result | Learner | Edge Function + Resend |
| Certificate issued | Learner | Edge Function + Resend |
| New discussion reply | Thread participants | DB Webhook → Edge Function + Resend |
| Purchase receipt | Learner | Stripe webhook → Edge Function + Resend |

Implementation: Supabase Database Webhooks fire on table insert/update → Edge Function calls Resend HTTP API.

---

### 4.9 Search

**Service:** Postgres full-text search (v1)

**Requirements:**

- `tsvector` column on `courses` (title + description + tags), GIN index, trigger to keep updated
- Search endpoint via supabase-js `.textSearch()`
- Filters: category, free/paid, level
- Typeahead: ILIKE prefix query on title (fast enough with index)
- v2 upgrade path: MeiliSearch if relevance quality or fuzzy matching becomes a problem

---

### 4.10 File & Media Storage

**Service:** Cloudflare R2

**Requirements:**

- Presigned upload URLs from Edge Function (R2 S3 API, aws4fetch in Deno)
- Limits: video 2GB, image 10MB, PDF 50MB
- Path convention: `courses/{courseId}/lessons/{lessonId}/{filename}`
- Public bucket + custom domain for CDN delivery
- File metadata tracked in `media_files` table (size, type, owner) for storage quota reporting

---

### 4.11 Payments & Monetization

**Libraries:** Stripe (global), Midtrans (Indonesia, v2)

**Requirements:**

- Pricing: free or one-time paid (subscription in v2)
- Flow: course page → checkout → Stripe Checkout Session (created by Edge Function) → webhook → auto-enroll
- Stripe webhook handler: Edge Function verifies signature, inserts `payments` + `enrollments`
- Midtrans (v2): Snap checkout, VA/QRIS/GoPay/OVO; webhook → same enrollment flow
- Revenue share: `platform_fee_pct` config; payout ledger in v2
- Receipt email on purchase (Resend)
- Free courses: direct enroll insert (RLS-guarded)

---

### 4.12 Live Sessions / ILT (v2)

**Library:** React Big Calendar

- Instructor schedules sessions (title, datetime, duration, meeting URL)
- Learner calendar view (month/week/day)
- Reminder email 24h before (pg_cron + Edge Function)
- Attendance marking

---

## 5. Non-Functional Requirements

| Area              | Requirement                                                                                        |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| Performance       | Page load < 3s, video start < 2s (R2 + CF CDN)                                                     |
| Mobile            | Fully responsive SPA                                                                               |
| SEO               | v1: SPA with meta tags; v2: pre-rendered/SSR catalog if selling publicly                           |
| Security          | RLS on every table, Supabase JWT, sanitize Tiptap HTML output, server-side quiz score verification |
| Scalability       | Stateless SPA + managed Supabase; R2 handles media scale                                           |
| Cost ceiling (v1) | Supabase Free/Pro ($0–25/mo) + R2 (~free under 10GB) + Pages (free)                                |
| Data              | Supabase daily backups (Pro); manual pg_dump on Free                                               |
| UU PDP / GDPR     | User data export + delete via admin function                                                       |

---

## 6. Database Schema (Key Tables)

```
profiles            — id (FK auth.users), name, role, avatar_url, bio, created_at
courses             — id, instructor_id, title, slug, description, cover_url,
                      category, tags[], price, currency, status, search_tsv, created_at
sections            — id, course_id, title, position
lessons             — id, section_id, title, type, content_json, video_url,
                      pdf_url, position, is_free_preview
enrollments         — id, user_id, course_id, enrolled_at, completed_at
user_progress       — id, user_id, lesson_id, completed, completed_at
video_watch_logs    — id, user_id, lesson_id, watch_seconds, updated_at
quiz_definitions    — id, lesson_id, schema_json, passing_score, time_limit_sec, max_attempts
quiz_attempts       — id, user_id, quiz_id, score, passed, answers_json, attempted_at
certificates        — id, user_id, course_id, cert_uuid, issued_at
discussions         — id, lesson_id, user_id, parent_id, body, created_at
payments            — id, user_id, course_id, provider, provider_ref, amount,
                      currency, status, paid_at
media_files         — id, owner_id, course_id, r2_key, size_bytes, mime, created_at
live_sessions (v2)  — id, course_id, instructor_id, title, starts_at, duration_min, meeting_url
```

All tables: RLS enabled. Admin bypass via service role key in Edge Functions only.

---

## 7. MVP Scope (Phase 1)

**v1 includes:**

- Supabase Auth (email + Google)
- Course creation: text (Tiptap) / video (R2 + Video.js) / YouTube embed (Plyr) / quiz (SurveyJS)
- Resume video playback + progress tracking
- Quiz auto-grading with server-side verification
- Learner progress dashboard
- Certificate PDF (jsPDF) + public verification page
- Free enrollment + Stripe paid checkout
- Email notifications (Resend via Edge Functions)
- Per-lesson discussions (Supabase Realtime)
- Course search (Postgres full-text)

**v2 defers:**

- Live sessions calendar (React Big Calendar)
- Midtrans payments
- Instructor/admin analytics dashboards (Chart.js)
- MeiliSearch upgrade
- Subscriptions, payouts, custom cert templates

---

## 8. Tech Stack Summary

| Layer       | Tech                                   |
| ----------- | -------------------------------------- |
| Frontend    | React 19 + Vite + Tailwind + shadcn/ui |
| Hosting     | Cloudflare Pages                       |
| Database    | Supabase Postgres + RLS                |
| Auth        | Supabase Auth                          |
| Realtime    | Supabase Realtime                      |
| Serverless  | Supabase Edge Functions (Deno)         |
| Storage/CDN | Cloudflare R2                          |
| Search      | Postgres tsvector (v1)                 |
| Email       | Resend                                 |
| Payments    | Stripe (v1), Midtrans (v2)             |
| Client SDK  | supabase-js                            |

---

_End of PRD v1.2_
