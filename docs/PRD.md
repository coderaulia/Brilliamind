# Product Requirements Document

## LMS / E-Learning Platform (BrilliaMind.id)

**Version:** 1.3  
**Status:** Draft  
**Author:** Coderaulia (Vanaila Digital)  
**Date:** August 2026  
**Changelog v1.1:** Stack changed to Supabase + Cloudflare hybrid. Auth.js → Supabase Auth, Socket.io → Supabase Realtime, MeiliSearch → Postgres full-text (v1). R2 confirmed for all media.  
**Changelog v1.2:** SCORM removed entirely. Resend confirmed as sole email service. PDF generation confirmed client-side only (jsPDF). React-pdf and Nodemailer removed.  
**Changelog v1.3:** Complete backend architecture migration to Cloudflare Workers (TypeScript + Hono) and Cloudflare D1 (Serverless SQLite at the edge) with Drizzle ORM. Live discussions deferred to v2 in favor of standard REST discussions for v1.

---

## 1. Library & Service Stack Reference

### Platform Services

| #   | Function               | Service                        | Tier                      | Link                                                       |
| --- | ---------------------- | ------------------------------ | ------------------------- | ---------------------------------------------------------- |
| A   | Database               | Cloudflare D1 (SQLite at Edge) | Included in Workers       | https://developers.cloudflare.com/d1                       |
| B   | Authentication         | Cloudflare Workers JWT Auth    | Included in Workers       | https://developers.cloudflare.com/workers                  |
| C   | Serverless Compute/API | Cloudflare Workers (Hono)      | Free → $5/mo Paid         | https://hono.dev · https://workers.cloudflare.com          |
| D   | Media Storage + CDN    | Cloudflare R2 (zero egress)    | Free 10GB → pay-as-you-go | https://developers.cloudflare.com/r2                       |
| E   | Frontend Hosting       | Cloudflare Pages               | Free                      | https://pages.cloudflare.com                               |
| F   | Search (v1)            | SQLite FTS5 Full-Text Search   | Included in D1            | https://www.sqlite.org/fts5.html                           |
| G   | Email                  | Resend                         | Free tier                 | https://resend.com                                         |
| H   | Payments (Global)      | Stripe                         | Free SDK                  | https://stripe.com/docs                                    |

### Frontend / Feature Libraries

| #   | Feature                         | Library               | License    | Link                                                                      |
| --- | ------------------------------- | --------------------- | ---------- | ------------------------------------------------------------------------- |
| 1   | Rich Text Editor                | Tiptap                | MIT        | https://tiptap.dev · https://github.com/ueberdosis/tiptap                 |
| 2   | Video Player                    | Video.js              | Apache 2.0 | https://videojs.com · https://github.com/videojs/video.js                 |
| 2b  | YouTube/Vimeo Embed             | Plyr (iframe wrapper) | MIT        | https://plyr.io · https://github.com/sampotts/plyr                        |
| 3   | Quiz / Assessment               | SurveyJS Form Library | MIT        | https://surveyjs.io · https://github.com/surveyjs/survey-library          |
| 4   | Charts / Analytics UI (v2)      | Chart.js              | MIT        | https://chartjs.org · https://github.com/chartjs/Chart.js                 |
| 5   | PDF / Certificate (client-side) | jsPDF                 | MIT        | https://github.com/parallax/jsPDF                                         |
| 6   | Calendar / Scheduling (v2)      | React Big Calendar    | MIT        | https://github.com/jquense/react-big-calendar                             |
| 7   | Payment (Indonesia, v2)         | Midtrans              | Free SDK   | https://midtrans.com · https://github.com/Midtrans/midtrans-nodejs-client |
| 8   | Search upgrade (v2, optional)   | MeiliSearch           | MIT        | https://meilisearch.com                                                   |

### Replaced from Previous Versions

| Removed                         | Replaced By                    | Reason                                                     |
| ------------------------------- | ------------------------------ | ---------------------------------------------------------- |
| Supabase Edge Functions (Deno)  | Cloudflare Workers (Hono / TS) | Unified edge compute with R2/D1 native bindings            |
| Supabase Postgres + RLS         | Cloudflare D1 + Drizzle ORM    | Native serverless SQLite at edge, zero connection poolers |
| Supabase Auth                   | Cloudflare Worker JWT Auth     | Self-contained edge auth with Web Crypto                   |
| Supabase Realtime               | REST (v1) / WebSockets (v2)    | Simplified v1 discussions, realtime planned for v2         |
| Postgres tsvector               | SQLite FTS5                    | Built-in D1 full-text search index                         |
| SCORM Again / Nodemailer        | Resend                         | Pure HTTP API, zero server overhead                        |

---

## 2. Product Overview

**Product Name:** BrilliaMind LMS (working name: LearnOS)  
**Type:** Web-based LMS / E-Learning Platform  
**Target Users:** Corporate HR teams, training providers, digital academies (Indonesia-first, global capable)

**Stack Assumption:**
- Frontend: React 19 + Vite + Tailwind CSS, deployed on Cloudflare Pages
- Backend: Cloudflare Workers (Hono framework) exposing typed REST API (`/api/*`)
- Database: Cloudflare D1 (SQLite) with Drizzle ORM
- Media: Cloudflare R2 with public bucket + CDN (zero egress)
- Email: Resend via Worker HTTP client

---

## 3. User Roles

| Role       | Description                                           |
| ---------- | ----------------------------------------------------- |
| Admin      | Full platform access, manage users, billing, settings |
| Instructor | Create/manage courses, view learner progress          |
| Learner    | Enroll, take courses, view certificates               |
| Guest      | Browse public course catalog only                     |

Role enforcement: Cloudflare Worker JWT authentication middleware and `profiles.role` checks.

---

## 4. Core Modules & Feature Requirements

### 4.1 Authentication & User Management
**Service:** Cloudflare Workers JWT Auth + D1 Profiles
- Email/password signup + login with password hashing via Web Crypto / bcrypt.
- Google OAuth token verification and account linking.
- JWT session tokens issued upon login and validated via Worker middleware.
- Profiles table in D1 stores user role, avatar, bio, and creation date.

### 4.2 Course Management
**Libraries:** Tiptap (editor), R2 (media), Drizzle ORM
- Instructors create, edit, publish, archive courses.
- Course fields: title, slug, description, cover image (R2), category, tags, price, currency, status.
- Structure: Course > Sections > Lessons.
- Lesson types: Rich text (Tiptap JSON), Video (R2 upload), YouTube/Vimeo embed, PDF, Quiz.
- Auto-save drafts via debounced `PUT /api/lessons/:id`.

### 4.3 Video Playback
**Libraries:** Video.js, Plyr · **Storage:** Cloudflare R2
- Upload MP4 to R2 via S3 presigned PUT URL generated by Worker `/api/r2/presign`.
- Stream from R2 public bucket through Cloudflare CDN.
- YouTube/Vimeo: paste URL → Plyr embed.
- Resume from last position (`video_watch_logs.watch_seconds`, throttled upsert every 10s).
- Completion: 90% watched marks lesson complete.

### 4.4 Quiz & Assessment
**Library:** SurveyJS Form Library (MIT — renderer only)
- Quiz schema stored as JSON in `quiz_definitions.schema_json`.
- Simple custom quiz creator in admin UI generating SurveyJS JSON.
- Question types: multiple choice, multi-select, true/false, short answer, rating.
- Server-side grading via Worker `/api/quiz/verify` to prevent client-side score tampering.
- Enforces attempt limits and records attempt history.

### 4.5 Progress Tracking
**Data:** D1 SQL Views & Aggregations
- Learner dashboard: enrolled courses, completion percentage, last activity, earned certificates.
- Course progress: per-lesson completion checklist via `/api/progress/course/:courseId`.

### 4.6 Certificate Generation
**Library:** jsPDF (client-side) · **Trigger:** Cloudflare Worker `/api/quiz/verify`
- Trigger: All lessons complete + passing score on all required quizzes → auto-inserts row into `certificates`.
- Certificate PDF generated client-side using jsPDF template.
- Public verification: `/verify/:certUuid` queried via public Worker endpoint.

### 4.7 Discussions (REST)
**Service:** Cloudflare Workers REST API
- Per-lesson threaded comments (`discussions` table in D1 with `parent_id`).
- Standard REST endpoints (`/api/discussions/lesson/:lessonId`).
- Markdown rendered safely with DOMPurify sanitization.
- *(Real-time WebSocket / SSE sync planned for v2)*.

### 4.8 Notifications (Email)
**Service:** Resend via Cloudflare Workers
- Triggered on enrollment confirmation, quiz results, certificate issuance, and payment receipt.
- Direct REST calls to Resend API (`https://api.resend.com/emails`).

### 4.9 Search
**Service:** SQLite FTS5 on Cloudflare D1
- `courses_fts` full-text search index across title, description, and tags.
- Query endpoint: `/api/courses/search?q=...`.

### 4.10 File & Media Storage
**Service:** Cloudflare R2
- S3 presigned upload URLs from `/api/r2/presign`.
- Limits: video 2GB, image 10MB, PDF 50MB.
- Path convention: `courses/{courseId}/lessons/{lessonId}/{filename}`.

### 4.11 Payments & Monetization
**Libraries:** Stripe (global), Midtrans (Indonesia, v2)
- Flow: course page → `/api/stripe/checkout` → Stripe Checkout → `/api/stripe/webhook` → auto-enroll.
- Webhook signature verified with Web Crypto.

---

## 5. Non-Functional Requirements

| Area          | Requirement                                                                      |
| ------------- | -------------------------------------------------------------------------------- |
| Performance   | Sub-second API response at edge, video start < 2s (R2 + CF CDN)                 |
| Mobile        | Fully responsive SPA (React 19 + Tailwind)                                       |
| Security      | JWT authentication, CORS lockdown, DOMPurify HTML sanitization, server quiz grade |
| Scalability   | Stateless Cloudflare Workers + serverless D1 + R2 media scale                     |
| Cost Ceiling  | Free / $5 Workers plan + R2 pay-as-you-go + Pages free tier                      |

---

## 6. Database Schema Summary (D1)

```
profiles            — id, email, password_hash, name, role, avatar_url, bio, created_at
courses             — id, instructor_id, title, slug, description, cover_url,
                      category, tags, price, currency, status, created_at
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
courses_fts         — SQLite FTS5 virtual table
```

---

## 7. MVP Scope (v1)

**v1 includes:**
- Cloudflare Workers API with JWT Auth (email + Google OAuth).
- Course authoring: text (Tiptap) / video (R2 + Video.js) / YouTube embed (Plyr) / quiz (SurveyJS).
- Video watch progress & checklist tracking.
- Quiz auto-grading with authoritative server-side verification.
- Learner progress dashboard & certificates (jsPDF + `/verify/:certUuid`).
- Free enrollment & Stripe paid checkout.
- Resend email notifications from Worker.
- Lesson discussions (REST).
- Course search via SQLite FTS5.

**v2 defers:**
- Live sessions calendar (React Big Calendar).
- Live Realtime discussions (WebSockets / Durable Objects).
- Midtrans payment gateway.
- Instructor & admin analytics dashboards (Chart.js).
- Subscriptions and instructor payouts.

---

## 8. Tech Stack Summary

| Layer       | Tech                                   |
| ----------- | -------------------------------------- |
| Frontend    | React 19 + Vite + Tailwind CSS         |
| Hosting     | Cloudflare Pages                       |
| Backend API | Cloudflare Workers (TypeScript + Hono) |
| Database    | Cloudflare D1 (SQLite) + Drizzle ORM   |
| Storage/CDN | Cloudflare R2                          |
| Search      | SQLite FTS5 on D1                      |
| Email       | Resend                                 |
| Payments    | Stripe                                 |

---

_End of PRD v1.3_
