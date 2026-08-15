# Edge Functions

Runtime: Deno (Supabase Edge Functions). No Node.js, no Nodemailer.
All functions live in `supabase/functions/<name>/index.ts`.

---

## Shared Helpers (`supabase/functions/_shared/`)

**`cors.ts`** — CORS headers for browser requests:
```ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

**`auth.ts`** — Extract and verify caller JWT, load profile row:
```ts
export async function requireAuth(req: Request, supabase: SupabaseClient)
// throws 401 if no valid JWT
// returns { user, profile }
```

**`resend.ts`** — Thin wrapper around Resend HTTP API:
```ts
export async function sendEmail(to: string, subject: string, html: string)
// uses RESEND_API_KEY env var
```

---

## Functions

### `r2-presign`

**Trigger:** POST from browser (authenticated instructor)  
**Purpose:** Generate S3-compatible presigned PUT URL for R2 upload

```
POST /functions/v1/r2-presign
Authorization: Bearer <supabase-jwt>
Body: { filename: string, mime: string, courseId: string, lessonId?: string }

Response: { uploadUrl: string, publicUrl: string, r2Key: string }
```

**Env vars:** `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`  
**Library:** `aws4fetch` (S3-compatible signing for R2)  
**Access check:** caller profile.role must be `instructor` or `admin`  
**Path convention:** `courses/{courseId}/lessons/{lessonId}/{uuid}-{filename}`  
**After upload:** browser inserts `media_files` row via supabase-js

---

### `stripe-checkout`

**Trigger:** POST from browser (authenticated learner)  
**Purpose:** Create Stripe Checkout Session for paid course

```
POST /functions/v1/stripe-checkout
Authorization: Bearer <supabase-jwt>
Body: { courseId: string }

Response: { url: string }  — Stripe hosted checkout URL
```

**Env vars:** `STRIPE_SECRET_KEY`, `APP_URL`  
**Logic:**
1. Verify caller is authenticated, not already enrolled
2. Fetch course price
3. `stripe.checkout.sessions.create({ mode: 'payment', line_items, success_url, cancel_url, metadata: { userId, courseId } })`
4. Return `{ url: session.url }`

---

### `stripe-webhook`

**Trigger:** Stripe POST (no auth header — use signature verification)  
**Purpose:** Auto-enroll learner after successful payment

```
POST /functions/v1/stripe-webhook
Stripe-Signature: <sig>
Body: raw Stripe event JSON
```

**Env vars:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`  
**Handled events:**
- `checkout.session.completed`:
  1. `stripe.webhooks.constructEvent(body, sig, secret)` — throws on invalid
  2. Insert `payments` row (status = 'paid')
  3. Insert `enrollments` row (upsert)
  4. Call `sendEmail` → enrollment confirmation (Resend)

---

### `quiz-verify`

**Trigger:** POST from browser (authenticated learner)  
**Purpose:** Server-side re-grade to prevent score tampering

```
POST /functions/v1/quiz-verify
Authorization: Bearer <supabase-jwt>
Body: { quizId: string, answers: Record<string, unknown> }

Response: { score: number, passed: boolean, feedback: Record<string, boolean> }
```

**Logic:**
1. Fetch `quiz_definitions` row (schema_json, passing_score, max_attempts)
2. Count existing attempts — reject if ≥ max_attempts
3. Re-grade answers against schema_json correct keys
4. Insert `quiz_attempts` row via service role
5. If passed + all required quizzes done → check for certificate issuance
6. Return result

---

### `send-email`

**Trigger:** Supabase Database Webhook (table insert/update) or called internally  
**Purpose:** Dispatch transactional emails via Resend

Handles these event types (passed in body):
| `type` | Trigger | Recipient |
|--------|---------|-----------|
| `enrollment_confirmation` | DB webhook: enrollments insert | learner |
| `quiz_result` | quiz-verify function | learner |
| `certificate_issued` | quiz-verify (after cert insert) | learner |
| `discussion_reply` | DB webhook: discussions insert where parent_id != null | thread participants |
| `purchase_receipt` | stripe-webhook | learner |

```
POST /functions/v1/send-email
Authorization: Bearer <service-role-key>  (set in DB Webhook config)
Body: { type: string, payload: Record<string, unknown> }
```

**Env vars:** `RESEND_API_KEY`, `EMAIL_FROM`  
**From address:** `noreply@brilliamind.id` (configure in Resend)

---

## Database Webhooks (Supabase Dashboard)

Configure these under **Database → Webhooks**:

| Table | Event | Function URL |
|-------|-------|-------------|
| `enrollments` | INSERT | `/functions/v1/send-email` (type: enrollment_confirmation) |
| `discussions` | INSERT | `/functions/v1/send-email` (type: discussion_reply) |

Stripe-triggered emails fire from inside `stripe-webhook` directly.

---

## Env Vars Summary

Set these in Supabase Dashboard → Edge Functions → Secrets:

| Key | Used By |
|-----|---------|
| `RESEND_API_KEY` | send-email |
| `EMAIL_FROM` | send-email |
| `STRIPE_SECRET_KEY` | stripe-checkout, stripe-webhook |
| `STRIPE_WEBHOOK_SECRET` | stripe-webhook |
| `R2_ACCOUNT_ID` | r2-presign |
| `R2_ACCESS_KEY_ID` | r2-presign |
| `R2_SECRET_ACCESS_KEY` | r2-presign |
| `R2_BUCKET` | r2-presign |
| `R2_PUBLIC_URL` | r2-presign |
| `APP_URL` | stripe-checkout (success/cancel redirect) |
