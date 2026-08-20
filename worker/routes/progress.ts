import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, sql } from 'drizzle-orm'
import type { Env, Variables } from '../types'
import { getDb, courses, sections, lessons, enrollments, userProgress, videoWatchLogs, profiles } from '../db'
import { authMiddleware } from '../middleware/auth'
import { generateUuid } from '../lib/crypto'
import { sendEmail } from '../lib/email'

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

  const completedAt = completed ? new Date().toISOString() : null
  await db.insert(userProgress).values({
    id: generateUuid(),
    userId: user.id,
    lessonId,
    completed,
    completedAt,
  }).onConflictDoUpdate({
    target: [userProgress.userId, userProgress.lessonId],
    set: {
      completed,
      completedAt,
    },
  })

  // Check and trigger milestones (50% and 100%)
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

      const completedCount = userDone.length
      const totalLessons = allLessons.length
      const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

      const enrollment = await db.select().from(enrollments)
        .where(and(eq(enrollments.userId, user.id), eq(enrollments.courseId, courseId)))
        .get()

      if (enrollment) {
        const targetCourse = await db.select().from(courses).where(eq(courses.id, courseId)).get()
        const courseTitle = targetCourse?.title || 'Your Course'
        const appUrl = c.env.APP_URL || 'http://localhost:5173'

        // 1. 50% Halfway Milestone Email Trigger
        if (progressPct >= 50 && !enrollment.milestone50SentAt) {
          const nowStr = new Date().toISOString()
          await db.update(enrollments).set({ milestone50SentAt: nowStr }).where(eq(enrollments.id, enrollment.id))

          await sendEmail({
            to: user.email,
            toName: user.name,
            subject: `🔥 Halfway there! You're 50% through "${courseTitle}"`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
                <h2 style="color: #4f46e5;">🔥 Fantastic Progress, ${user.name}!</h2>
                <p>You have officially crossed the <strong>50% milestone</strong> in <strong>"${courseTitle}"</strong> (${completedCount} of ${totalLessons} lessons completed).</p>
                <p>Keep the momentum going and finish strong to earn your verified certificate of completion!</p>
                <div style="margin: 24px 0;">
                  <a href="${appUrl}/learn/${courseId}" style="background: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Resume Next Lesson →</a>
                </div>
                <p style="color: #64748b; font-size: 13px;">— The BrilliaMind LMS Team</p>
              </div>
            `,
            apiKey: c.env.BREVO_API_KEY,
            from: c.env.EMAIL_FROM,
          })
        }

        // 2. 100% Course Completion Milestone Email Trigger
        if (progressPct >= 100 && !enrollment.milestone100SentAt) {
          const nowStr = new Date().toISOString()
          await db.update(enrollments).set({
            completedAt: nowStr,
            milestone100SentAt: nowStr,
          }).where(eq(enrollments.id, enrollment.id))

          const certUuid = `bm-cert-${targetCourse?.slug || courseId}-${user.id.slice(0, 6)}`
          const verifyUrl = `${appUrl}/verify/${certUuid}`
          const linkedinAddUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(courseTitle)}&organizationName=BrilliaMind&certUrl=${encodeURIComponent(verifyUrl)}`

          await sendEmail({
            to: user.email,
            toName: user.name,
            subject: `🎓 Congratulations! You've graduated from "${courseTitle}"`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
                <h2 style="color: #10b981;">🎓 Congratulations, ${user.name}!</h2>
                <p>You have completed 100% of <strong>"${courseTitle}"</strong>!</p>
                <p>Your verified graduation certificate is ready. You can download it or share it directly to your LinkedIn profile.</p>
                <div style="margin: 24px 0; display: flex; gap: 12px;">
                  <a href="${verifyUrl}" style="background: #10b981; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin-right: 12px;">View Verified Certificate</a>
                  <a href="${linkedinAddUrl}" style="background: #0a66c2; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Add to LinkedIn Profile</a>
                </div>
                <p style="color: #64748b; font-size: 13px;">— The BrilliaMind LMS Team</p>
              </div>
            `,
            apiKey: c.env.BREVO_API_KEY,
            from: c.env.EMAIL_FROM,
          })
        }
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

  const updatedAt = new Date().toISOString()
  await db.insert(videoWatchLogs).values({
    id: generateUuid(),
    userId: user.id,
    lessonId,
    watchSeconds,
    updatedAt,
  }).onConflictDoUpdate({
    target: [videoWatchLogs.userId, videoWatchLogs.lessonId],
    set: {
      watchSeconds,
      updatedAt,
    },
  })

  return c.json({ success: true, watchSeconds })
})

export default progressRouter
