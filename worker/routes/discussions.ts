import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, asc } from 'drizzle-orm'
import type { Env, Variables } from '../types'
import { getDb, discussions, lessons, sections, courses, enrollments, profiles } from '../db'
import { authMiddleware } from '../middleware/auth'
import { rateLimit } from '../middleware/rate-limit'
import { generateUuid } from '../lib/crypto'

const discussionsRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

discussionsRouter.use('*', authMiddleware)

const postSchema = z.object({
  body: z.string().trim().min(1).max(4000),
  parentId: z.string().optional(),
})

type AppContextUser = Variables['user']

// Only enrolled learners, the course instructor, or admins may read/post on a lesson thread
async function canAccessLesson(db: ReturnType<typeof getDb>, lessonId: string, user: AppContextUser) {
  const lesson = await db.select({ courseId: sections.courseId, instructorId: courses.instructorId })
    .from(lessons)
    .innerJoin(sections, eq(lessons.sectionId, sections.id))
    .innerJoin(courses, eq(sections.courseId, courses.id))
    .where(eq(lessons.id, lessonId))
    .get()
  if (!lesson) return { found: false, allowed: false }
  if (user.role === 'admin' || lesson.instructorId === user.id) return { found: true, allowed: true }
  const enrollment = await db.select({ id: enrollments.id })
    .from(enrollments)
    .where(and(eq(enrollments.courseId, lesson.courseId), eq(enrollments.userId, user.id)))
    .get()
  return { found: true, allowed: !!enrollment }
}

function initials(name: string | null) {
  return (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('') || '?'
}

// 1. List a lesson's discussion thread (top-level questions with nested replies)
discussionsRouter.get('/lesson/:lessonId', async (c) => {
  const user = c.get('user')
  const lessonId = c.req.param('lessonId') ?? ''
  const db = getDb(c.env.DB)

  const access = await canAccessLesson(db, lessonId, user)
  if (!access.found) return c.json({ error: 'Lesson not found' }, 404)
  if (!access.allowed) return c.json({ error: 'Forbidden' }, 403)

  const rows = await db.select({
    id: discussions.id,
    parentId: discussions.parentId,
    body: discussions.body,
    createdAt: discussions.createdAt,
    authorName: profiles.name,
    authorRole: profiles.role,
  })
  .from(discussions)
  .leftJoin(profiles, eq(discussions.userId, profiles.id))
  .where(eq(discussions.lessonId, lessonId))
  .orderBy(asc(discussions.createdAt))
  .all()

  const toComment = (r: typeof rows[number]) => ({
    id: r.id,
    authorName: r.authorName || 'Deleted user',
    authorAvatar: initials(r.authorName),
    authorRole: r.authorRole === 'instructor' || r.authorRole === 'admin' ? 'Instructor' : 'Learner',
    createdAt: r.createdAt,
    content: r.body,
    upvotes: 0,
  })

  const topLevel = rows.filter((r) => !r.parentId).reverse()
  const comments = topLevel.map((r) => ({
    ...toComment(r),
    replies: rows.filter((reply) => reply.parentId === r.id).map(toComment),
  }))

  return c.json({ discussions: comments })
})

// 2. Post a question or reply on a lesson
discussionsRouter.post('/lesson/:lessonId', rateLimit(20, 60), zValidator('json', postSchema), async (c) => {
  const user = c.get('user')
  const lessonId = c.req.param('lessonId') ?? ''
  const { body, parentId } = c.req.valid('json')
  const db = getDb(c.env.DB)

  const access = await canAccessLesson(db, lessonId, user)
  if (!access.found) return c.json({ error: 'Lesson not found' }, 404)
  if (!access.allowed) return c.json({ error: 'Forbidden' }, 403)

  if (parentId) {
    const parent = await db.select({ id: discussions.id }).from(discussions)
      .where(and(eq(discussions.id, parentId), eq(discussions.lessonId, lessonId)))
      .get()
    if (!parent) return c.json({ error: 'Parent comment not found' }, 404)
  }

  const id = generateUuid()
  const createdAt = new Date().toISOString()
  await db.insert(discussions).values({ id, lessonId, userId: user.id, parentId: parentId ?? null, body, createdAt })

  return c.json({
    discussion: {
      id,
      authorName: user.name,
      authorAvatar: initials(user.name),
      authorRole: user.role === 'instructor' || user.role === 'admin' ? 'Instructor' : 'Learner',
      createdAt,
      content: body,
      upvotes: 0,
    },
  }, 201)
})

export default discussionsRouter
