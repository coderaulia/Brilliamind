# Cloudflare Workers Backend API

Runtime: Cloudflare Workers (Workerd V8 isolates / Web Standards).  
Framework: **Hono** (`hono` + `@hono/zod-validator`).  
Directory: `worker/`

---

## Architecture Overview

All backend compute, database access, storage presigning, Stripe checkout/webhooks, quiz verification, and transactional emails run inside a unified, typed Cloudflare Worker application.

```
worker/
├── index.ts               # Hono entry point & route mounting
├── wrangler.jsonc         # Wrangler config (D1, R2, KV bindings, compatibility flags)
├── routes/
│   ├── auth.ts            # /api/auth (signup, login, me, refresh, logout)
│   ├── courses.ts         # /api/courses (catalog, search, CRUD, sections, lessons)
│   ├── r2.ts              # /api/r2 (presigned upload URLs, media metadata)
│   ├── stripe.ts          # /api/stripe (checkout session, webhook handler)
│   ├── quiz.ts            # /api/quiz (verify submission, attempt history)
│   ├── progress.ts        # /api/progress (lesson completion, milestones, video watch logs)
│   ├── analytics.ts       # /api/analytics (edge telemetry ingestion, funnel overview)
│   ├── seed.ts            # /api/seed (local demo database seed)
│   └── certificates.ts    # /api/certificates (issuance, public verification)
├── middleware/
│   ├── auth.ts            # JWT verification & context extraction (c.set('user', ...))
│   ├── role.ts            # Role-based access control guard (admin, instructor, learner)
│   └── rate-limit.ts      # Cloudflare KV rate limiting guard
├── db/
│   ├── index.ts           # Drizzle ORM client initialization with env.DB (D1)
│   ├── schema.ts          # Drizzle SQLite table definitions
│   └── migrations/        # D1 SQL migration files
├── lib/
│   ├── crypto.ts          # Web Crypto PBKDF2 hashing & HMAC-SHA256 JWT
│   └── email.ts           # Brevo v3 Transactional SMTP REST API client
└── types.ts               # Env bindings interface & Hono Context types
```

---

## Bindings & Configuration (`worker/wrangler.jsonc`)

```jsonc
{
  "name": "brilliamind-api",
  "main": "index.ts",
  "compatibility_date": "2026-08-01",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "brilliamind-db",
      "database_id": "<d1-database-id>",
      "migrations_dir": "db/migrations"
    }
  ],
  "r2_buckets": [
    {
      "binding": "MEDIA_BUCKET",
      "bucket_name": "brilliamind-media"
    }
  ],
  "kv_namespaces": [
    {
      "binding": "KV",
      "id": "<kv-namespace-id>"
    }
  ],
  "vars": {
    "APP_URL": "http://localhost:5173",
    "R2_PUBLIC_URL": "https://media.brilliamind.id"
  }
}
```

---

## Shared Middleware

### CORS (`hono/cors`)
Configured to allow requests from `VITE_APP_URL` and `localhost:5173` with credentials support.

### JWT Authentication Middleware (`worker/middleware/auth.ts`)
1. Reads `Authorization: Bearer <token>` or HTTP-only `auth_token` cookie.
2. Verifies signature using `env.JWT_SECRET` with Web Crypto.
3. Attaches payload `{ id, email, role, name }` to Hono Context: `c.set('user', user)`.
4. Returns `401 Unauthorized` if token is missing or invalid.

### Role Authorization Guard (`worker/middleware/role.ts`)
```ts
export const requireRole = (...roles: ('admin' | 'instructor' | 'learner')[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user')
    if (!user || !roles.includes(user.role)) {
      return c.json({ error: 'Forbidden: insufficient permissions' }, 403)
    }
    await next()
  }
}
```

---

## API Endpoints Specification

### 1. Authentication (`/api/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/signup` | Public | Register with email + password, create profile in D1 |
| `POST` | `/api/auth/login` | Public | Verify credentials, return JWT + profile |
| `GET`  | `/api/auth/me` | User | Return currently authenticated user + profile |
| `POST` | `/api/auth/logout` | User | Invalidate session / clear cookie |
| `POST` | `/api/auth/google` | Public | Exchange Google OAuth id_token for user session |

---

### 2. Media Upload & R2 (`/api/r2`)

#### `POST /api/r2/presign`
- **Auth:** Instructor or Admin (`requireRole('instructor', 'admin')`)
- **Body:**
  ```json
  {
    "filename": "lesson-video.mp4",
    "mime": "video/mp4",
    "courseId": "c4b1d7...",
    "lessonId": "l9f2a1..."
  }
  ```
- **Response:**
  ```json
  {
    "uploadUrl": "https://<account-id>.r2.cloudflarestorage.com/brilliamind-media/courses/c4b1d7.../lessons/l9f2a1.../uuid-lesson-video.mp4?X-Amz-Signature=...",
    "publicUrl": "https://media.brilliamind.id/courses/c4b1d7.../lessons/l9f2a1.../uuid-lesson-video.mp4",
    "r2Key": "courses/c4b1d7.../lessons/l9f2a1.../uuid-lesson-video.mp4"
  }
  ```
- **Logic:**
  1. Validates file size limit based on MIME type (Video: 2GB, PDF: 50MB, Images: 10MB).
  2. Generates S3 presigned PUT URL using `@aws-sdk/s3-request-presigner` configured with R2 S3 API keys.
  3. Records entry in D1 `media_files` table.

---

### 3. Stripe Payments (`/api/stripe`)

#### `POST /api/stripe/checkout`
- **Auth:** Learner (`requireRole('learner', 'admin', 'instructor')`)
- **Body:** `{ "courseId": "c4b1d7..." }`
- **Response:** `{ "url": "https://checkout.stripe.com/c/pay/cs_test_..." }`
- **Logic:**
  1. Checks if user is already enrolled in course.
  2. Retrieves course price and title from D1.
  3. Creates Stripe Checkout session with `client_reference_id = user.id` and `metadata = { courseId, userId }`.
  4. Returns Stripe hosted checkout URL.

#### `POST /api/stripe/webhook`
- **Auth:** Public (Stripe signature verified via `Stripe-Signature` header)
- **Body:** Raw payload
- **Logic:**
  1. Reads `await c.req.raw.text()` to preserve exact payload bytes.
  2. Verifies signature with Web Crypto using `STRIPE_WEBHOOK_SECRET`.
  3. On `checkout.session.completed`:
     - Inserts row into `payments` (`status: 'paid'`).
     - Inserts / upserts row into `enrollments`.
     - Calls internal `sendEmail` helper to dispatch purchase receipt + enrollment confirmation via Resend.
  4. Returns `{ received: true }`.

---

### 4. Quiz Grading & Integrity (`/api/quiz`)

#### `POST /api/quiz/verify`
- **Auth:** Learner (`requireRole('learner', 'admin', 'instructor')`)
- **Body:**
  ```json
  {
    "quizId": "q8e1...",
    "answers": {
      "question1": "b",
      "question2": ["opt1", "opt3"]
    }
  }
  ```
- **Response:**
  ```json
  {
    "score": 85,
    "passed": true,
    "passingScore": 70,
    "feedback": { "question1": true, "question2": true },
    "attemptNumber": 1,
    "maxAttempts": 3,
    "certificateEarned": false
  }
  ```
- **Logic:**
  1. Fetches `quiz_definitions` from D1.
  2. Verifies attempt limit (`count(quiz_attempts) < max_attempts`).
  3. Re-evaluates answers server-side against authoritative key in `schema_json`.
  4. Calculates score percentage and sets `passed = (score >= passing_score)`.
  5. Inserts record into `quiz_attempts`.
  6. Checks if all course lessons are complete and all required quizzes are passed. If yes, auto-issues certificate and dispatches `certificate_issued` email.

---

### 5. Progress Tracking (`/api/progress`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/progress/lesson` | Learner | Toggle or set lesson completion status |
| `POST` | `/api/progress/watch-log` | Learner | Upsert video watch seconds (throttled every 10s from client; auto-completes at 90%) |
| `GET`  | `/api/progress/course/:courseId` | Learner | Get learner's detailed progress & checklist for a course |
| `GET`  | `/api/progress/dashboard` | Learner | Aggregate progress across all enrolled courses |

---

### 6. Certificates (`/api/certificates`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/api/certificates/my-certs` | Learner | List certificates earned by authenticated user |
| `GET`  | `/api/certificates/verify/:certUuid` | Public | Public verification endpoint returning recipient name, course title, and issue date |

---

### 7. Course Management & Catalog (`/api/courses`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/api/courses` | Public | Paginated published course catalog with category & tag filters |
| `GET`  | `/api/courses/search?q=...` | Public | Full-text search using SQLite FTS5 |
| `GET`  | `/api/courses/:slug` | Public | Public course detail (syllabus, instructor info, preview lessons) |
| `POST` | `/api/courses` | Instructor | Create new course draft |
| `PUT`  | `/api/courses/:id` | Instructor | Update course metadata |
| `DELETE`| `/api/courses/:id` | Instructor | Archive / delete course |
| `POST` | `/api/courses/:id/sections` | Instructor | Create section |
| `POST` | `/api/sections/:id/lessons` | Instructor | Create lesson |
| `PUT`  | `/api/lessons/:id` | Instructor | Update lesson content (`content_json`, `video_url`, `pdf_url`) |

---

### 8. Discussions (`/api/discussions`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/api/discussions/lesson/:lessonId` | Learner/Inst | List threaded comments for a lesson |
| `POST` | `/api/discussions` | Learner/Inst | Post a new comment or reply (`parent_id`) |
| `PUT`  | `/api/discussions/:id` | Author | Edit own comment |
| `DELETE`| `/api/discussions/:id` | Author/Admin | Delete comment |

---

### 9. Transactional Email Service (`worker/lib/resend.ts`)

Direct HTTP call to Resend REST API (`https://api.resend.com/emails`):
- `enrollment_confirmation`: Sent when learner enrolls or completes checkout.
- `quiz_result`: Sent after quiz submission with score summary.
- `certificate_issued`: Sent with certificate verification link and congratulations.
- `purchase_receipt`: Sent upon successful Stripe payment.

---

## Environment Variables & Secrets

### Set via `.dev.vars` (Local) / `wrangler secret put` (Production)

| Key | Description |
|-----|-------------|
| `JWT_SECRET` | Secret key used to sign and verify user JWTs |
| `STRIPE_SECRET_KEY` | Stripe secret API key (`sk_live_...` or `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `RESEND_API_KEY` | Resend API key (`re_...`) |
| `EMAIL_FROM` | Verified sender email (e.g., `noreply@brilliamind.id`) |
| `R2_ACCOUNT_ID` | Cloudflare Account ID for S3 presigning |
| `R2_ACCESS_KEY_ID` | S3-compatible R2 Access Key ID |
| `R2_SECRET_ACCESS_KEY` | S3-compatible R2 Secret Access Key |
| `R2_BUCKET` | R2 bucket name (`brilliamind-media`) |
| `R2_PUBLIC_URL` | CDN domain (`https://media.brilliamind.id`) |
| `APP_URL` | Base frontend URL (`https://app.brilliamind.id` or `http://localhost:5173`) |
