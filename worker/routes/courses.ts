import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc, sql } from 'drizzle-orm'
import type { Env, Variables } from '../types'
import { getDb, courses, sections, lessons, profiles, enrollments, userProgress, invitations } from '../db'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth'
import { requireRole } from '../middleware/role'
import { generateUuid, generateSecureToken } from '../lib/crypto'
import { sendEmail } from '../lib/email'

const coursesRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

const courseSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  coverUrl: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  price: z.number().int().min(0).default(0),
  currency: z.string().default('USD'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
})

const sectionSchema = z.object({
  title: z.string().min(1).max(200),
  position: z.number().int().default(0),
})

const lessonSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(['text', 'video', 'youtube', 'pdf', 'quiz']).default('youtube'),
  videoUrl: z.string().optional(),
  pdfUrl: z.string().optional(),
  contentJson: z.record(z.string(), z.unknown()).optional(),
  position: z.number().int().default(0),
  isFreePreview: z.boolean().default(false),
})

const inviteLearnerSchema = z.object({
  email: z.string().email(),
})

// 1. List Published Courses (Public)
coursesRouter.get('/', optionalAuthMiddleware, async (c) => {
  const db = getDb(c.env.DB)
  const allCourses = await db.select({
    id: courses.id,
    title: courses.title,
    slug: courses.slug,
    description: courses.description,
    coverUrl: courses.coverUrl,
    category: courses.category,
    tags: courses.tags,
    price: courses.price,
    currency: courses.currency,
    status: courses.status,
    createdAt: courses.createdAt,
    instructorName: profiles.name,
    instructorAvatar: profiles.avatarUrl,
  })
  .from(courses)
  .leftJoin(profiles, eq(courses.instructorId, profiles.id))
  .where(eq(courses.status, 'published'))
  .orderBy(desc(courses.createdAt))
  .all()

  return c.json({ courses: allCourses })
})

// 2. Instructor: Get My Courses
coursesRouter.get('/instructor/my-courses', authMiddleware, requireRole('instructor', 'admin'), async (c) => {
  const user = c.get('user')
  const db = getDb(c.env.DB)

  const myCourses = await db.select()
    .from(courses)
    .where(user.role === 'admin' ? undefined : eq(courses.instructorId, user.id))
    .orderBy(desc(courses.createdAt))
    .all()

  return c.json({ courses: myCourses })
})

// 3. Get Single Course with Sections & Lessons
coursesRouter.get('/:id', optionalAuthMiddleware, async (c) => {
  const courseId = c.req.param('id') as string
  const db = getDb(c.env.DB)

  const course = await db.select({
    id: courses.id,
    instructorId: courses.instructorId,
    title: courses.title,
    slug: courses.slug,
    description: courses.description,
    coverUrl: courses.coverUrl,
    category: courses.category,
    tags: courses.tags,
    price: courses.price,
    currency: courses.currency,
    status: courses.status,
    createdAt: courses.createdAt,
    instructorName: profiles.name,
  })
  .from(courses)
  .leftJoin(profiles, eq(courses.instructorId, profiles.id))
  .where(eq(courses.id, courseId))
  .get()

  if (!course) {
    return c.json({ error: 'Course not found' }, 404)
  }

  const courseSections = await db.select().from(sections).where(eq(sections.courseId, courseId)).orderBy(sections.position).all()
  const sectionIds = courseSections.map(s => s.id)

  let courseLessons: (typeof lessons.$inferSelect)[] = []
  if (sectionIds.length > 0) {
    courseLessons = await db.select().from(lessons).where(sql`${lessons.sectionId} IN ${sectionIds}`).orderBy(lessons.position).all()
  }

  const structuredSections = courseSections.map(sec => ({
    ...sec,
    lessons: courseLessons.filter(l => l.sectionId === sec.id),
  }))

  return c.json({
    course,
    sections: structuredSections,
  })
})

// 4. Instructor: Create Course
coursesRouter.post('/', authMiddleware, requireRole('instructor', 'admin'), zValidator('json', courseSchema), async (c) => {
  const data = c.req.valid('json')
  const user = c.get('user')
  const db = getDb(c.env.DB)

  const id = generateUuid()
  const slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${id.substring(0, 6)}`

  await db.insert(courses).values({
    id,
    instructorId: user.id,
    title: data.title,
    slug,
    description: data.description || null,
    coverUrl: data.coverUrl || null,
    category: data.category || 'General',
    tags: data.tags,
    price: data.price,
    currency: data.currency,
    status: data.status,
  })

  // Create default Section 1
  const defaultSectionId = generateUuid()
  await db.insert(sections).values({
    id: defaultSectionId,
    courseId: id,
    title: 'Module 1: Introduction',
    position: 0,
  })

  return c.json({ id, slug, message: 'Course created successfully' }, 201)
})

// 5. Instructor: Update Course
coursesRouter.put('/:id', authMiddleware, requireRole('instructor', 'admin'), zValidator('json', courseSchema.partial()), async (c) => {
  const courseId = c.req.param('id') as string
  const data = c.req.valid('json')
  const user = c.get('user')
  const db = getDb(c.env.DB)

  const course = await db.select().from(courses).where(eq(courses.id, courseId)).get()
  if (!course) return c.json({ error: 'Course not found' }, 404)
  if (user.role !== 'admin' && course.instructorId !== user.id) {
    return c.json({ error: 'Forbidden: you do not own this course' }, 403)
  }

  await db.update(courses).set(data).where(eq(courses.id, courseId))
  return c.json({ message: 'Course updated successfully' })
})

// 6. Instructor: Add Section
coursesRouter.post('/:id/sections', authMiddleware, requireRole('instructor', 'admin'), zValidator('json', sectionSchema), async (c) => {
  const courseId = c.req.param('id') as string
  const { title, position } = c.req.valid('json')
  const user = c.get('user')
  const db = getDb(c.env.DB)

  const course = await db.select().from(courses).where(eq(courses.id, courseId)).get()
  if (!course) return c.json({ error: 'Course not found' }, 404)
  if (user.role !== 'admin' && course.instructorId !== user.id) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const id = generateUuid()
  await db.insert(sections).values({ id, courseId, title, position })
  return c.json({ id, title, position }, 201)
})

// 7. Instructor: Add Lesson to Section (YouTube / Video)
coursesRouter.post('/sections/:sectionId/lessons', authMiddleware, requireRole('instructor', 'admin'), zValidator('json', lessonSchema), async (c) => {
  const sectionId = c.req.param('sectionId') as string
  const data = c.req.valid('json')
  const user = c.get('user')
  const db = getDb(c.env.DB)

  const section = await db.select().from(sections).where(eq(sections.id, sectionId)).get()
  if (!section) return c.json({ error: 'Section not found' }, 404)

  const course = await db.select().from(courses).where(eq(courses.id, section.courseId)).get()
  if (!course) return c.json({ error: 'Course not found' }, 404)
  if (user.role !== 'admin' && course.instructorId !== user.id) {
    return c.json({ error: 'Forbidden: you do not own this course' }, 403)
  }

  const id = generateUuid()
  await db.insert(lessons).values({
    id,
    sectionId,
    title: data.title,
    type: data.type,
    videoUrl: data.videoUrl || null,
    pdfUrl: data.pdfUrl || null,
    contentJson: data.contentJson || null,
    position: data.position,
    isFreePreview: data.isFreePreview,
  })

  return c.json({ id, ...data }, 201)
})

// 8. Instructor: Update Lesson
coursesRouter.put('/lessons/:id', authMiddleware, requireRole('instructor', 'admin'), zValidator('json', lessonSchema.partial()), async (c) => {
  const lessonId = c.req.param('id') as string
  const data = c.req.valid('json')
  const user = c.get('user')
  const db = getDb(c.env.DB)

  const lesson = await db.select().from(lessons).where(eq(lessons.id, lessonId)).get()
  if (!lesson) return c.json({ error: 'Lesson not found' }, 404)

  const section = await db.select().from(sections).where(eq(sections.id, lesson.sectionId)).get()
  const course = section ? await db.select().from(courses).where(eq(courses.id, section.courseId)).get() : null
  if (!course) return c.json({ error: 'Course not found' }, 404)
  if (user.role !== 'admin' && course.instructorId !== user.id) {
    return c.json({ error: 'Forbidden: you do not own this course' }, 403)
  }

  await db.update(lessons).set(data).where(eq(lessons.id, lessonId))
  return c.json({ message: 'Lesson updated successfully' })
})

// 9. Instructor: Delete Lesson
coursesRouter.delete('/lessons/:id', authMiddleware, requireRole('instructor', 'admin'), async (c) => {
  const lessonId = c.req.param('id') as string
  const user = c.get('user')
  const db = getDb(c.env.DB)

  const lesson = await db.select().from(lessons).where(eq(lessons.id, lessonId)).get()
  if (!lesson) return c.json({ error: 'Lesson not found' }, 404)

  const section = await db.select().from(sections).where(eq(sections.id, lesson.sectionId)).get()
  const course = section ? await db.select().from(courses).where(eq(courses.id, section.courseId)).get() : null
  if (!course) return c.json({ error: 'Course not found' }, 404)
  if (user.role !== 'admin' && course.instructorId !== user.id) {
    return c.json({ error: 'Forbidden: you do not own this course' }, 403)
  }

  await db.delete(lessons).where(eq(lessons.id, lessonId))
  return c.json({ message: 'Lesson deleted successfully' })
})

// 10. Instructor: Invite Learner to Course
coursesRouter.post('/:id/invite-learner', authMiddleware, requireRole('instructor', 'admin'), zValidator('json', inviteLearnerSchema), async (c) => {
  const courseId = c.req.param('id') as string
  const { email } = c.req.valid('json')
  const user = c.get('user')
  const db = getDb(c.env.DB)

  const course = await db.select().from(courses).where(eq(courses.id, courseId)).get()
  if (!course) return c.json({ error: 'Course not found' }, 404)
  if (user.role !== 'admin' && course.instructorId !== user.id) {
    return c.json({ error: 'Forbidden: you do not own this course' }, 403)
  }

  const token = generateSecureToken(32)
  const expiresAt = new Date(Date.now() + 86400 * 1000 * 7).toISOString()
  const id = generateUuid()

  await db.insert(invitations).values({
    id,
    email: email.toLowerCase(),
    role: 'learner',
    courseIds: [courseId],
    token,
    invitedBy: user.id,
    status: 'pending',
    expiresAt,
  })

  const appUrl = c.env.APP_URL || 'http://localhost:5173'
  const inviteUrl = `${appUrl}/invite/accept?token=${token}`

  await sendEmail({
    to: email,
    subject: `You have been invited to the course: "${course.title}" on BrilliaMind LMS`,
    html: `<p>Hello,</p><p>Instructor ${user.name} has invited you to join the course <strong>"${course.title}"</strong>.</p><p>Click the link below to accept the invitation, set your password, and start learning:</p><p><a href="${inviteUrl}">${inviteUrl}</a></p>`,
    apiKey: c.env.BREVO_API_KEY,
    from: c.env.EMAIL_FROM,
  })

  return c.json({
    message: 'Learner invited successfully',
    invitation: { id, email, token, expiresAt, inviteUrl },
  }, 201)
})

// 11. Instructor: Get Learner Progress Roster for Course
coursesRouter.get('/:id/learners', authMiddleware, requireRole('instructor', 'admin'), async (c) => {
  const courseId = c.req.param('id') as string
  const user = c.get('user')
  const db = getDb(c.env.DB)

  const course = await db.select().from(courses).where(eq(courses.id, courseId)).get()
  if (!course) return c.json({ error: 'Course not found' }, 404)
  if (user.role !== 'admin' && course.instructorId !== user.id) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  // Get total lessons count in course
  const courseSections = await db.select().from(sections).where(eq(sections.courseId, courseId)).all()
  const sectionIds = courseSections.map(s => s.id)
  let totalLessons = 0
  let courseLessonIds: string[] = []

  if (sectionIds.length > 0) {
    const courseLessonsList = await db.select().from(lessons).where(sql`${lessons.sectionId} IN ${sectionIds}`).all()
    totalLessons = courseLessonsList.length
    courseLessonIds = courseLessonsList.map(l => l.id)
  }

  // Get enrolled learners
  const enrolledUsers = await db.select({
    userId: enrollments.userId,
    enrolledAt: enrollments.enrolledAt,
    completedAt: enrollments.completedAt,
    name: profiles.name,
    email: profiles.email,
    avatarUrl: profiles.avatarUrl,
  })
  .from(enrollments)
  .leftJoin(profiles, eq(enrollments.userId, profiles.id))
  .where(eq(enrollments.courseId, courseId))
  .all()

  // Calculate each user's completed lessons count
  const roster = await Promise.all(enrolledUsers.map(async (u) => {
    let completedLessons = 0
    if (courseLessonIds.length > 0) {
      const userCompletedProgress = await db.select()
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, u.userId),
            eq(userProgress.completed, true),
            sql`${userProgress.lessonId} IN ${courseLessonIds}`
          )
        )
        .all()
      completedLessons = userCompletedProgress.length
    }

    const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    return {
      userId: u.userId,
      name: u.name || 'Anonymous Learner',
      email: u.email,
      avatarUrl: u.avatarUrl,
      enrolledAt: u.enrolledAt,
      completedAt: u.completedAt,
      completedLessons,
      totalLessons,
      progressPct,
    }
  }))

  return c.json({
    course: { id: course.id, title: course.title, totalLessons },
    learners: roster,
  })
})

function escapeCsvCell(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '""'
  let str = String(val)
  // Prevent CSV Formula Injection in Excel/Google Sheets
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`
  }
  return `"${str.replace(/"/g, '""')}"`
}

// 12. Export Course Roster as CSV (for HR & Instructors)
coursesRouter.get('/:id/export-csv', authMiddleware, requireRole('instructor'), async (c) => {
  const courseId = c.req.param('id') as string
  const user = c.get('user')
  const db = getDb(c.env.DB)

  const course = await db.select().from(courses).where(eq(courses.id, courseId)).get()
  if (!course) {
    return c.text('Course not found', 404)
  }

  if (user.role !== 'admin' && course.instructorId !== user.id) {
    return c.text('Unauthorized: You can only export roster for your own courses', 403)
  }

  // Get all lessons for this course
  const courseSections = await db.select().from(sections).where(eq(sections.courseId, courseId)).all()
  const secIds = courseSections.map(s => s.id)
  let courseLessonIds: string[] = []
  if (secIds.length > 0) {
    const allCourseLessons = await db.select().from(lessons).where(sql`${lessons.sectionId} IN ${secIds}`).all()
    courseLessonIds = allCourseLessons.map(l => l.id)
  }
  const totalLessons = courseLessonIds.length

  const enrolledUsers = await db.select({
    userId: enrollments.userId,
    name: profiles.name,
    email: profiles.email,
    enrolledAt: enrollments.enrolledAt,
    completedAt: enrollments.completedAt,
  })
  .from(enrollments)
  .innerJoin(profiles, eq(enrollments.userId, profiles.id))
  .where(eq(enrollments.courseId, courseId))
  .all()

  const csvRows: string[] = [
    ['Student Name', 'Email Address', 'Enrolled Date', 'Completed Lessons', 'Total Lessons', 'Progress %', 'Status', 'Completion Date']
      .map(h => `"${h}"`).join(','),
  ]

  for (const u of enrolledUsers) {
    let completedLessons = 0
    if (courseLessonIds.length > 0) {
      const userCompletedProgress = await db.select()
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, u.userId),
            eq(userProgress.completed, true),
            sql`${userProgress.lessonId} IN ${courseLessonIds}`
          )
        )
        .all()
      completedLessons = userCompletedProgress.length
    }
    const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    const status = progressPct >= 100 ? 'Completed' : progressPct > 0 ? 'In Progress' : 'Not Started'

    csvRows.push([
      escapeCsvCell(u.name),
      escapeCsvCell(u.email),
      escapeCsvCell(u.enrolledAt ? u.enrolledAt.slice(0, 10) : ''),
      escapeCsvCell(completedLessons),
      escapeCsvCell(totalLessons),
      escapeCsvCell(`${progressPct}%`),
      escapeCsvCell(status),
      escapeCsvCell(u.completedAt ? u.completedAt.slice(0, 10) : ''),
    ].join(','))
  }

  const csvContent = csvRows.join('\r\n')
  const filename = `course-${course.slug || course.id}-roster.csv`

  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache',
    },
  })
})

export default coursesRouter
