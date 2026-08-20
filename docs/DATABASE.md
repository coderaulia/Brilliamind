# Database Architecture (Cloudflare D1 + Drizzle ORM)

Database engine: **Cloudflare D1** (Serverless SQLite at the Edge).  
ORM & Migration manager: **Drizzle ORM** (`drizzle-orm` + `drizzle-kit`).  
Access layer: Native Worker binding (`env.DB`).

---

## Migration Workflow

Migrations are managed via Drizzle Kit and applied using Wrangler:

```bash
# 1. Update schema in worker/db/schema.ts
# 2. Generate migration SQL files in worker/db/migrations/
pnpm run db:generate

# 3. Apply to local D1 database (.wrangler/state/v3/d1)
pnpm run db:migrate:local

# 4. Apply to remote production Cloudflare D1
pnpm run db:migrate:remote
```

---

## Drizzle ORM Schema (`worker/db/schema.ts`)

```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// 1. Profiles Table
export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(), // UUID string
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'), // Nullable if OAuth-only
  name: text('name').notNull(),
  role: text('role', { enum: ['admin', 'instructor', 'learner'] }).notNull().default('learner'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

// 2. Courses Table
export const courses = sqliteTable('courses', {
  id: text('id').primaryKey(),
  instructorId: text('instructor_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  coverUrl: text('cover_url'),
  category: text('category'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  price: integer('price').notNull().default(0), // In cents
  currency: text('currency').notNull().default('USD'),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).notNull().default('draft'),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

// 3. Sections Table
export const sections = sqliteTable('sections', {
  id: text('id').primaryKey(),
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  position: integer('position').notNull().default(0),
})

// 4. Lessons Table
export const lessons = sqliteTable('lessons', {
  id: text('id').primaryKey(),
  sectionId: text('section_id').notNull().references(() => sections.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  type: text('type', { enum: ['text', 'video', 'youtube', 'pdf', 'quiz'] }).notNull(),
  contentJson: text('content_json', { mode: 'json' }).$type<Record<string, unknown>>(),
  videoUrl: text('video_url'),
  pdfUrl: text('pdf_url'),
  position: integer('position').notNull().default(0),
  isFreePreview: integer('is_free_preview', { mode: 'boolean' }).notNull().default(false),
})

// 5. Enrollments Table
export const enrollments = sqliteTable('enrollments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  enrolledAt: text('enrolled_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  completedAt: text('completed_at'),
})

// 6. User Progress Table
export const userProgress = sqliteTable('user_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  lessonId: text('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  completedAt: text('completed_at'),
})

// 7. Video Watch Logs Table
export const videoWatchLogs = sqliteTable('video_watch_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  lessonId: text('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  watchSeconds: integer('watch_seconds').notNull().default(0),
  updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

// 8. Quiz Definitions Table
export const quizDefinitions = sqliteTable('quiz_definitions', {
  id: text('id').primaryKey(),
  lessonId: text('lesson_id').notNull().unique().references(() => lessons.id, { onDelete: 'cascade' }),
  schemaJson: text('schema_json', { mode: 'json' }).$type<Record<string, unknown>>().notNull(),
  passingScore: integer('passing_score').notNull().default(70), // Percent
  timeLimitSec: integer('time_limit_sec'),
  maxAttempts: integer('max_attempts').notNull().default(3),
})

// 9. Quiz Attempts Table
export const quizAttempts = sqliteTable('quiz_attempts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  quizId: text('quiz_id').notNull().references(() => quizDefinitions.id, { onDelete: 'cascade' }),
  score: integer('score').notNull(),
  passed: integer('passed', { mode: 'boolean' }).notNull(),
  answersJson: text('answers_json', { mode: 'json' }).$type<Record<string, unknown>>().notNull(),
  attemptedAt: text('attempted_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

// 10. Certificates Table
export const certificates = sqliteTable('certificates', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  certUuid: text('cert_uuid').notNull().unique(),
  issuedAt: text('issued_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

// 11. Discussions Table
export const discussions = sqliteTable('discussions', {
  id: text('id').primaryKey(),
  lessonId: text('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  parentId: text('parent_id'),
  body: text('body').notNull(),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

// 12. Payments Table
export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // 'stripe' | 'midtrans'
  providerRef: text('provider_ref').notNull(),
  amount: integer('amount').notNull(), // In cents
  currency: text('currency').notNull(),
  status: text('status', { enum: ['pending', 'paid', 'failed', 'refunded'] }).notNull().default('pending'),
  paidAt: text('paid_at'),
})

// 13. Media Files Table
export const mediaFiles = sqliteTable('media_files', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  courseId: text('course_id').references(() => courses.id, { onDelete: 'set null' }),
  r2Key: text('r2_key').notNull().unique(),
  sizeBytes: integer('size_bytes').notNull(),
  mime: text('mime').notNull(),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})
```

---

## Full-Text Search (SQLite FTS5)

Cloudflare D1 natively supports SQLite FTS5 for fast full-text searching:

```sql
-- FTS5 Virtual Table for Courses
CREATE VIRTUAL TABLE courses_fts USING fts5(
  id UNINDEXED,
  title,
  description,
  tags,
  tokenize='porter unicode61'
);

-- Triggers to keep courses_fts synchronized with courses table
CREATE TRIGGER courses_ai AFTER INSERT ON courses BEGIN
  INSERT INTO courses_fts(id, title, description, tags)
  VALUES (new.id, new.title, coalesce(new.description, ''), coalesce(new.tags, ''));
END;

CREATE TRIGGER courses_ad AFTER DELETE ON courses BEGIN
  DELETE FROM courses_fts WHERE id = old.id;
END;

CREATE TRIGGER courses_au AFTER UPDATE ON courses BEGIN
  UPDATE courses_fts SET
    title = new.title,
    description = coalesce(new.description, ''),
    tags = coalesce(new.tags, '')
  WHERE id = old.id;
END;
```

---

## Progress Calculation Query Pattern

Course progress is computed dynamically or queried via a SQL view in D1:

```sql
CREATE VIEW IF NOT EXISTS course_progress_view AS
SELECT
  e.user_id,
  e.course_id,
  COUNT(l.id) AS total_lessons,
  COUNT(CASE WHEN up.completed = 1 THEN 1 END) AS completed_lessons,
  CASE
    WHEN COUNT(l.id) = 0 THEN 0
    ELSE ROUND((CAST(COUNT(CASE WHEN up.completed = 1 THEN 1 END) AS REAL) / COUNT(l.id)) * 100)
  END AS progress_pct,
  CASE WHEN e.completed_at IS NOT NULL THEN 1 ELSE 0 END AS course_completed
FROM enrollments e
JOIN courses c ON c.id = e.course_id
JOIN sections s ON s.course_id = c.id
JOIN lessons l ON l.section_id = s.id
LEFT JOIN user_progress up ON up.lesson_id = l.id AND up.user_id = e.user_id
GROUP BY e.user_id, e.course_id, e.completed_at;
```

---

## Access Control & Authorization

Since Cloudflare D1 is queried through Cloudflare Workers backend APIs rather than direct client-side SQL connections, security and permissions are enforced at the Worker middleware layer:

1. **Authentication:** Validated via JWT bearer tokens and `worker/middleware/auth.ts`.
2. **Role Authorization:** Protected routes verify caller role (`admin`, `instructor`, `learner`) via `worker/middleware/role.ts`.
3. **Data Scoping:** All write queries (such as updating courses or progress) explicitly filter by the authenticated `user.id` or verify instructor course ownership before mutation.
4. **Certificate Issuance:** Enforced in `/api/quiz/verify` upon completing 100% of course lessons and achieving passing scores on all required quizzes.
