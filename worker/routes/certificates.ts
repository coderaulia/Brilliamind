import { Hono } from 'hono'
import { eq, desc } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import type { Env, Variables } from '../types'
import { getDb, certificates, courses, profiles } from '../db'
import { authMiddleware } from '../middleware/auth'
import { rateLimit } from '../middleware/rate-limit'

const certificatesRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

const learner = alias(profiles, 'learner')
const instructor = alias(profiles, 'instructor')

function selectCertificates(db: ReturnType<typeof getDb>) {
  return db.select({
    id: certificates.id,
    uuid: certificates.certUuid,
    courseId: certificates.courseId,
    issuedAt: certificates.issuedAt,
    courseTitle: courses.title,
    category: courses.category,
    recipientName: learner.name,
    instructorName: instructor.name,
  })
  .from(certificates)
  .innerJoin(courses, eq(certificates.courseId, courses.id))
  .innerJoin(learner, eq(certificates.userId, learner.id))
  .leftJoin(instructor, eq(courses.instructorId, instructor.id))
}

type CertificateRow = Awaited<ReturnType<ReturnType<typeof selectCertificates>['all']>>[number]

function toCertificateItem(row: CertificateRow, appUrl: string) {
  return {
    id: row.id,
    uuid: row.uuid,
    courseId: row.courseId,
    courseTitle: row.courseTitle,
    recipientName: row.recipientName,
    issueDate: row.issuedAt,
    grade: 'Completed',
    instructorName: row.instructorName || 'BrilliaMind Instructor',
    instructorRole: 'Course Instructor',
    skillsAcquired: row.category ? [row.category] : [],
    credentialUrl: `${appUrl}/verify/${row.uuid}`,
  }
}

// 1. Learner: list my issued certificates
certificatesRouter.get('/mine', authMiddleware, async (c) => {
  const user = c.get('user')
  const db = getDb(c.env.DB)
  const rows = await selectCertificates(db)
    .where(eq(certificates.userId, user.id))
    .orderBy(desc(certificates.issuedAt))
    .all()
  const appUrl = c.env.APP_URL || new URL(c.req.url).origin
  return c.json({ certificates: rows.map((r) => toCertificateItem(r, appUrl)) })
})

// 2. Public: verify a certificate by its UUID
certificatesRouter.get('/verify/:uuid', rateLimit(30, 60), async (c) => {
  const uuid = c.req.param('uuid') ?? ''
  const db = getDb(c.env.DB)
  const row = await selectCertificates(db).where(eq(certificates.certUuid, uuid)).get()
  if (!row) {
    return c.json({ error: 'Certificate not found' }, 404)
  }
  const appUrl = c.env.APP_URL || new URL(c.req.url).origin
  return c.json({ certificate: toCertificateItem(row, appUrl) })
})

export default certificatesRouter
