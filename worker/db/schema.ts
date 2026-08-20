import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// 1. Profiles Table
export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  name: text('name').notNull(),
  role: text('role', { enum: ['admin', 'instructor', 'learner'] }).notNull().default('learner'),
  status: text('status', { enum: ['pending', 'active', 'suspended'] }).notNull().default('active'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

// 2. Invitations Table (Learner & Instructor onboarding via token)
export const invitations = sqliteTable('invitations', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  role: text('role', { enum: ['learner', 'instructor'] }).notNull().default('learner'),
  courseIds: text('course_ids', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  token: text('token').notNull().unique(),
  invitedBy: text('invited_by').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['pending', 'accepted', 'expired'] }).notNull().default('pending'),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

// 3. Password Reset Tokens Table
export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  usedAt: text('used_at'),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

// 4. Courses Table
export const courses = sqliteTable('courses', {
  id: text('id').primaryKey(),
  instructorId: text('instructor_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  coverUrl: text('cover_url'),
  category: text('category'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  price: integer('price').notNull().default(0),
  currency: text('currency').notNull().default('USD'),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).notNull().default('draft'),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

// 5. Sections Table
export const sections = sqliteTable('sections', {
  id: text('id').primaryKey(),
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  position: integer('position').notNull().default(0),
})

// 6. Lessons Table
export const lessons = sqliteTable('lessons', {
  id: text('id').primaryKey(),
  sectionId: text('section_id').notNull().references(() => sections.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  type: text('type', { enum: ['text', 'video', 'youtube', 'pdf', 'quiz'] }).notNull().default('youtube'),
  contentJson: text('content_json', { mode: 'json' }).$type<Record<string, unknown>>(),
  videoUrl: text('video_url'),
  pdfUrl: text('pdf_url'),
  position: integer('position').notNull().default(0),
  isFreePreview: integer('is_free_preview', { mode: 'boolean' }).notNull().default(false),
})

// 7. Enrollments Table
export const enrollments = sqliteTable('enrollments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  enrolledAt: text('enrolled_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  completedAt: text('completed_at'),
  milestone50SentAt: text('milestone_50_sent_at'),
  milestone100SentAt: text('milestone_100_sent_at'),
})

// 8. User Progress Table
export const userProgress = sqliteTable('user_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  lessonId: text('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  completedAt: text('completed_at'),
})

// 9. Video Watch Logs Table
export const videoWatchLogs = sqliteTable('video_watch_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  lessonId: text('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  watchSeconds: integer('watch_seconds').notNull().default(0),
  updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

// 10. Quiz Definitions Table
export const quizDefinitions = sqliteTable('quiz_definitions', {
  id: text('id').primaryKey(),
  lessonId: text('lesson_id').notNull().unique().references(() => lessons.id, { onDelete: 'cascade' }),
  schemaJson: text('schema_json', { mode: 'json' }).$type<Record<string, unknown>>().notNull(),
  passingScore: integer('passing_score').notNull().default(70),
  timeLimitSec: integer('time_limit_sec'),
  maxAttempts: integer('max_attempts').notNull().default(3),
})

// 11. Quiz Attempts Table
export const quizAttempts = sqliteTable('quiz_attempts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  quizId: text('quiz_id').notNull().references(() => quizDefinitions.id, { onDelete: 'cascade' }),
  score: integer('score').notNull(),
  passed: integer('passed', { mode: 'boolean' }).notNull(),
  answersJson: text('answers_json', { mode: 'json' }).$type<Record<string, unknown>>().notNull(),
  attemptedAt: text('attempted_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

// 12. Certificates Table
export const certificates = sqliteTable('certificates', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  certUuid: text('cert_uuid').notNull().unique(),
  issuedAt: text('issued_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

// 13. Discussions Table
export const discussions = sqliteTable('discussions', {
  id: text('id').primaryKey(),
  lessonId: text('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  parentId: text('parent_id'),
  body: text('body').notNull(),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

// 14. Payments Table
export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull().default('stripe'),
  providerRef: text('provider_ref').notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  status: text('status', { enum: ['pending', 'paid', 'failed', 'refunded'] }).notNull().default('pending'),
  paidAt: text('paid_at'),
})

// 15. Media Files Table
export const mediaFiles = sqliteTable('media_files', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  courseId: text('course_id').references(() => courses.id, { onDelete: 'set null' }),
  r2Key: text('r2_key').notNull().unique(),
  sizeBytes: integer('size_bytes').notNull(),
  mime: text('mime').notNull(),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

// 16. Analytics Events Table (Cloudflare-native telemetry)
export const analyticsEvents = sqliteTable('analytics_events', {
  id: text('id').primaryKey(),
  eventType: text('event_type').notNull(),
  userId: text('user_id'),
  anonymousId: text('anonymous_id'),
  courseId: text('course_id'),
  lessonId: text('lesson_id'),
  path: text('path'),
  referrer: text('referrer'),
  ipCountry: text('ip_country'),
  propertiesJson: text('properties_json', { mode: 'json' }).$type<Record<string, unknown>>(),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

