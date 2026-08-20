import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, desc } from 'drizzle-orm'
import type { Env, Variables } from '../types'
import { getDb, profiles, invitations, passwordResetTokens } from '../db'
import { authMiddleware } from '../middleware/auth'
import { requireRole } from '../middleware/role'
import { generateUuid, generateSecureToken } from '../lib/crypto'
import { sendEmail } from '../lib/email'

const admin = new Hono<{ Bindings: Env; Variables: Variables }>()

// Enforce Superadmin role for all routes in this router
admin.use('*', authMiddleware, requireRole('admin'))

const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['learner', 'instructor']).default('learner'),
  courseIds: z.array(z.string()).default([]),
})

// 1. List Instructors (Pending, Active, Suspended)
admin.get('/instructors', async (c) => {
  const db = getDb(c.env.DB)
  const instructorList = await db.select({
    id: profiles.id,
    email: profiles.email,
    name: profiles.name,
    role: profiles.role,
    status: profiles.status,
    bio: profiles.bio,
    avatarUrl: profiles.avatarUrl,
    createdAt: profiles.createdAt,
  })
  .from(profiles)
  .where(eq(profiles.role, 'instructor'))
  .orderBy(desc(profiles.createdAt))
  .all()

  return c.json({ instructors: instructorList })
})

// 2. Approve Pending Instructor
admin.post('/instructors/:id/approve', async (c) => {
  const instructorId = c.req.param('id') as string
  const db = getDb(c.env.DB)

  const instructor = await db.select().from(profiles).where(eq(profiles.id, instructorId)).get()
  if (!instructor || instructor.role !== 'instructor') {
    return c.json({ error: 'Instructor not found' }, 404)
  }

  await db.update(profiles).set({ status: 'active' }).where(eq(profiles.id, instructorId))

  const appUrl = c.env.APP_URL || 'http://localhost:5173'
  await sendEmail({
    to: instructor.email,
    subject: 'Your Instructor Account Has Been Approved! - BrilliaMind LMS',
    html: `<p>Hello ${instructor.name},</p><p>Congratulations! Your instructor application has been reviewed and approved by the Superadmin.</p><p>You can now log in to the Instructor Studio and create your courses:</p><p><a href="${appUrl}/login">${appUrl}/login</a></p>`,
    apiKey: c.env.BREVO_API_KEY,
    from: c.env.EMAIL_FROM,
  })

  return c.json({ message: 'Instructor approved successfully', status: 'active' })
})

// 3. Reject / Suspend Instructor
admin.post('/instructors/:id/reject', async (c) => {
  const instructorId = c.req.param('id') as string
  const db = getDb(c.env.DB)

  const instructor = await db.select().from(profiles).where(eq(profiles.id, instructorId)).get()
  if (!instructor || instructor.role !== 'instructor') {
    return c.json({ error: 'Instructor not found' }, 404)
  }

  await db.update(profiles).set({ status: 'suspended' }).where(eq(profiles.id, instructorId))

  return c.json({ message: 'Instructor account suspended', status: 'suspended' })
})

// 4. List All Platform Users
admin.get('/users', async (c) => {
  const db = getDb(c.env.DB)
  const users = await db.select({
    id: profiles.id,
    email: profiles.email,
    name: profiles.name,
    role: profiles.role,
    status: profiles.status,
    createdAt: profiles.createdAt,
  })
  .from(profiles)
  .orderBy(desc(profiles.createdAt))
  .all()

  return c.json({ users })
})

// 5. Send User Invitation (Learner or Instructor)
admin.post('/invite-user', zValidator('json', inviteUserSchema), async (c) => {
  const { email, role, courseIds } = c.req.valid('json')
  const adminUser = c.get('user')
  const db = getDb(c.env.DB)

  const token = generateSecureToken(32)
  const expiresAt = new Date(Date.now() + 86400 * 1000 * 7).toISOString() // 7 days

  const id = generateUuid()
  await db.insert(invitations).values({
    id,
    email: email.toLowerCase(),
    role,
    courseIds,
    token,
    invitedBy: adminUser.id,
    status: 'pending',
    expiresAt,
  })

  const appUrl = c.env.APP_URL || 'http://localhost:5173'
  const inviteUrl = `${appUrl}/invite/accept?token=${token}`

  await sendEmail({
    to: email,
    subject: `You're Invited to BrilliaMind LMS as a ${role === 'instructor' ? 'Course Instructor' : 'Learner'}`,
    html: `<p>Hello,</p><p>You have been invited by the Superadmin to join BrilliaMind LMS.</p><p>Click the link below to set up your password and access your dashboard:</p><p><a href="${inviteUrl}">${inviteUrl}</a></p><p>This invitation link expires in 7 days.</p>`,
    apiKey: c.env.BREVO_API_KEY,
    from: c.env.EMAIL_FROM,
  })

  return c.json({
    message: 'Invitation dispatched successfully',
    invitation: { id, email, role, token, expiresAt, inviteUrl },
  }, 201)
})

// 6. Superadmin Trigger Password Reset For User
admin.post('/users/:id/reset-password', async (c) => {
  const userId = c.req.param('id') as string
  const db = getDb(c.env.DB)

  const user = await db.select().from(profiles).where(eq(profiles.id, userId)).get()
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  const token = generateSecureToken(32)
  const expiresAt = new Date(Date.now() + 3600 * 1000 * 24).toISOString() // 24 hours

  await db.insert(passwordResetTokens).values({
    id: generateUuid(),
    userId: user.id,
    token,
    expiresAt,
  })

  const appUrl = c.env.APP_URL || 'http://localhost:5173'
  const resetUrl = `${appUrl}/reset-password?token=${token}`

  await sendEmail({
    to: user.email,
    subject: 'Password Reset Notification from Superadmin - BrilliaMind LMS',
    html: `<p>Hello ${user.name},</p><p>The platform administrator has initiated a password reset for your account. Please set a new password using the link below:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    apiKey: c.env.BREVO_API_KEY,
    from: c.env.EMAIL_FROM,
  })

  return c.json({ message: 'Password reset link dispatched to user email' })
})

function escapeCsvCell(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '""'
  let str = String(val)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`
  }
  return `"${str.replace(/"/g, '""')}"`
}

// 7. Export Platform Users as CSV
admin.get('/users/export-csv', async (c) => {
  const db = getDb(c.env.DB)
  const users = await db.select({
    id: profiles.id,
    email: profiles.email,
    name: profiles.name,
    role: profiles.role,
    status: profiles.status,
    createdAt: profiles.createdAt,
  })
  .from(profiles)
  .orderBy(desc(profiles.createdAt))
  .all()

  const csvRows: string[] = [
    ['User ID', 'Name', 'Email Address', 'Role', 'Status', 'Registered Date']
      .map(h => `"${h}"`).join(','),
  ]

  for (const u of users) {
    csvRows.push([
      escapeCsvCell(u.id),
      escapeCsvCell(u.name),
      escapeCsvCell(u.email),
      escapeCsvCell(u.role),
      escapeCsvCell(u.status),
      escapeCsvCell(u.createdAt ? u.createdAt.slice(0, 10) : ''),
    ].join(','))
  }

  const csvContent = csvRows.join('\r\n')
  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="brilliamind-platform-users.csv"',
      'Cache-Control': 'no-cache',
    },
  })
})

export default admin
