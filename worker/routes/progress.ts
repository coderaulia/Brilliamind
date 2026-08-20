import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, sql } from 'drizzle-orm'
import type { Env, Variables } from '../types'
import { getDb, courses, sections, lessons, enrollments, userProgress, videoWatchLogs, profiles } from '../db'
import { authMiddleware } from '../middleware/auth'
import { generateUuid } from '../lib/crypto'

const progressRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

progressRouter.use('*', authMiddleware)

const toggleLessonSchema = z.object({
  lessonId: z.string(),
  completed: z.boolean().default(true),
})

const watchLogSchema = z.object({
  lessonId: z.string(),
  watchSeconds: z.number().int().min(0),
})

// 1. Learner Dashboard: Enrolled Courses & Real-Time Progress
progressRouter.get('/dashboard', async (c) => {
  const user = c.get('user')
  const db = getDb(c.env.DB)

  // Fetch all enrolled courses
  const myEnrollments = await db.select({
    enrollmentId: enrollments.id,
    courseId: enrollments.courseId,
    enrolledAt: enrollments.enrolledAt,
    completedAt: enrollments.completedAt,
    title: courses.title,
    slug: courses.slug,
    coverUrl: courses.coverUrl,
    category: courses.category,
    instructorName: profiles.name,
  })
  .from(enrollments)
  .leftJoin(courses, eq(enrollments.courseId, courses.id))
  .leftJoin(profiles, eq(courses.instructorId, profiles.id))
  .where(eq(enrollments.userId, user.id))
  .all()

  // Calculate detailed progress per course
  const enrolledCoursesWithProgress = await Promise.all(myEnrollments.map(async (enr) => {
    if (!enr.courseId) return null

    // Get section IDs
    const courseSections = await db.select().from(sections).where(eq(sections.courseId, enr.courseId)).all()
    const sectionIds = courseSections.map(s => s.id)

    let totalLessons = 0
    let completedLessons = 0

    if (sectionIds.length > 0) {
      const allLessons = await db.select().from(lessons).where(sql`${lessons.sectionId} IN ${sectionIds}`).all()
      totalLessons = allLessons.length
      const lessonIds = allLessons.map(l => l.id)

      if (lessonIds.length > 0) {
        const completedUserLessons = await db.select()
          .from(userProgress)
          .where(
            and(
              eq(userProgress.userId, user.id),
              eq(userProgress.completed, true),
              sql`${userProgress.lessonId} IN ${lessonIds}`
            )
          )
          .all()
        completedLessons = completedUserLessons.length
      }
    }

    const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    return {
      courseId: enr.courseId,
      title: enr.title || 'Untitled Course',
      slug: enr.slug || '',
      coverUrl: enr.coverUrl,
      category: enr.category || 'General',
      instructorName: enr.instructorName || 'Instructor',
      enrolledAt: enr.enrolledAt,
      completedAt: enr.completedAt,
      totalLessons,
      completedLessons,
      progressPct,
      isCompleted: progressPct === 100 || enr.completedAt !== null,
    }
  }))

  const validCourses = enrolledCoursesWithProgress.filter((c): c is NonNullable<typeof c> => c !== null)

  return c.json({
    enrolledCourses: validCourses,
    totalEnrolled: validCourses.length,
    completedCourses: validCourses.filter(c => c.isCompleted).length,
  })
})

// 2. Get Lesson Completion Checklist for a Course
progressRouter.get('/course/:courseId', async (c) => {
  const courseId = c.req.param('courseId') as string
  const user = c.get('user')
  const db = getDb(c.env.DB)

  // Get all lesson IDs in course
  const courseSections = await db.select().from(sections).where(eq(sections.courseId, courseId)).all()
  const sectionIds = courseSections.map(s => s.id)

  if (sectionIds.length === 0) {
    return c.json({ progress: {}, progressPct: 0 })
  }

  const courseLessons = await db.select().from(lessons).where(sql`${lessons.sectionId} IN ${sectionIds}`).all()
  const totalLessons = courseLessons.length
  const lessonIds = courseLessons.map(l => l.id)

  const progressRecords = await db.select()
    .from(userProgress)
    .where(
      and(
        eq(userProgress.userId, user.id),
        sql`${userProgress.lessonId} IN ${lessonIds}`
      )
    )
    .all()

  const progressMap: Record<string, boolean> = {}
  let completedCount = 0

  for (const record of progressRecords) {
    progressMap[record.lessonId] = record.completed
    if (record.completed) completedCount += 1
  }

  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  return c.json({
    progress: progressMap,
    completedCount,
    totalLessons,
    progressPct,
  })
})

// 3. Mark Lesson Completed / Incomplete
progressRouter.post('/lesson', zValidator('json', toggleLessonSchema), async (c) => {
  const { lessonId, completed } = c.req.valid('json')
  const user = c.get('user')
  const db = getDb(c.env.DB)

  const lesson = await db.select().from(lessons).where(eq(lessons.id, lessonId)).get()
  if (!lesson) {
    return c.json({ error: 'Lesson not found' }, 404)
  }

  // Find course via section
  const section = await db.select().from(sections).where(eq(sections.id, lesson.sectionId)).get()
  const courseId = section?.courseId

  const existingProgress = await db.select()
    .from(userProgress)
    .where(and(eq(userProgress.userId, user.id), eq(userProgress.lessonId, lessonId)))
    .get()

  if (existingProgress) {
    await db.update(userProgress).set({
      completed,
      completedAt: completed ? new Date().toISOString() : null,
    }).where(eq(userProgress.id, existingProgress.id))
  } else {
    await db.insert(userProgress).values({
      id: generateUuid(),
      userId: user.id,
      lessonId,
      completed,
      completedAt: completed ? new Date().toISOString() : null,
    })
  }

  // Check if course is now 100% complete
  if (courseId && completed) {
    const courseSections = await db.select().from(sections).where(eq(sections.courseId, courseId)).all()
    const secIds = courseSections.map(s => s.id)
    if (secIds.length > 0) {
      const allLessons = await db.select().from(lessons).where(sql`${lessons.sectionId} IN ${secIds}`).all()
      const allLessonIds = allLessons.map(l => l.id)

      const userDone = await db.select()
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, user.id),
            eq(userProgress.completed, true),
            sql`${userProgress.lessonId} IN ${allLessonIds}`
          )
        )
        .all()

      if (userDone.length >= allLessons.length && allLessons.length > 0) {
        // Mark enrollment completed
        await db.update(enrollments).set({
          completedAt: new Date().toISOString(),
        }).where(and(eq(enrollments.userId, user.id), eq(enrollments.courseId, courseId)))
      }
    }
  }

  return c.json({ message: 'Progress updated successfully', completed })
})

// 4. Video Watch Log
progressRouter.post('/watch-log', zValidator('json', watchLogSchema), async (c) => {
  const { lessonId, watchSeconds } = c.req.valid('json')
  const user = c.get('user')
  const db = getDb(c.env.DB)

  const existing = await db.select()
    .from(videoWatchLogs)
    .where(and(eq(videoWatchLogs.userId, user.id), eq(videoWatchLogs.lessonId, lessonId)))
    .get()

  if (existing) {
    await db.update(videoWatchLogs).set({
      watchSeconds,
      updatedAt: new Date().toISOString(),
    }).where(eq(videoWatchLogs.id, existing.id))
  } else {
    await db.insert(videoWatchLogs).values({
      id: generateUuid(),
      userId: user.id,
      lessonId,
      watchSeconds,
    })
  }

  return c.json({ success: true, watchSeconds })
})

export default progressRouter
