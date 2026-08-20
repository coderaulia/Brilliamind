import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import type { Env, Variables } from '../types'
import { getDb, profiles, invitations, passwordResetTokens, enrollments } from '../db'
import { hashPassword, verifyPassword, signJwt, generateUuid, generateSecureToken } from '../lib/crypto'
import { authMiddleware } from '../middleware/auth'
import { rateLimit } from '../middleware/rate-limit'
import { sendEmail } from '../lib/email'

const auth = new Hono<{ Bindings: Env; Variables: Variables }>()

// Schema definitions
const registerInstructorSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  bio: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const acceptInviteSchema = z.object({
  token: z.string().min(10),
  name: z.string().min(2).max(100),
  password: z.string().min(6).max(100),
})

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

const resetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(6).max(100),
})

// 1. Register Instructor (Pending Superadmin Approval)
auth.post('/register-instructor', rateLimit(5, 60), zValidator('json', registerInstructorSchema), async (c) => {
  const { name, email, password, bio } = c.req.valid('json')
  const db = getDb(c.env.DB)

  const existing = await db.select().from(profiles).where(eq(profiles.email, email.toLowerCase())).get()
  if (existing) {
    return c.json({ error: 'An account with this email already exists' }, 400)
  }

  const passwordHash = await hashPassword(password)
  const id = generateUuid()

  await db.insert(profiles).values({
    id,
    email: email.toLowerCase(),
    passwordHash,
    name,
    role: 'instructor',
    status: 'pending', // Requires superadmin approval
    bio: bio || null,
  })

  return c.json({
    message: 'Instructor registration submitted successfully. Your account is pending Superadmin approval.',
    status: 'pending',
  }, 201)
})

// 2. User Login
auth.post('/login', rateLimit(10, 60), zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')
  const db = getDb(c.env.DB)

  const user = await db.select().from(profiles).where(eq(profiles.email, email.toLowerCase())).get()
  if (!user || !user.passwordHash) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash)
  if (!isPasswordValid) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  if (user.status === 'pending') {
    return c.json({
      error: 'Your instructor account is pending superadmin approval. You will receive an email once accepted.',
      status: 'pending',
    }, 403)
  }

  if (user.status === 'suspended') {
    return c.json({
      error: 'Your account has been suspended. Please contact support.',
      status: 'suspended',
    }, 403)
  }

  const token = await signJwt(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    },
    c.env.JWT_SECRET
  )

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
    },
  })
})

// 3. Get Current User (/api/auth/me)
auth.get('/me', authMiddleware, async (c) => {
  const authUser = c.get('user')
  const db = getDb(c.env.DB)

  const user = await db.select().from(profiles).where(eq(profiles.id, authUser.id)).get()
  if (!user) {
    return c.json({ error: 'User profile not found' }, 404)
  }

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
    },
  })
})

// 4. Accept Invitation & Create Password (Learner Onboarding)
auth.post('/accept-invite', rateLimit(5, 60), zValidator('json', acceptInviteSchema), async (c) => {
  const { token, name, password } = c.req.valid('json')
  const db = getDb(c.env.DB)

  const invitation = await db.select().from(invitations).where(eq(invitations.token, token)).get()
  if (!invitation || invitation.status !== 'pending') {
    return c.json({ error: 'Invalid or expired invitation token' }, 400)
  }

  // Check expiration
  if (new Date(invitation.expiresAt) < new Date()) {
    await db.update(invitations).set({ status: 'expired' }).where(eq(invitations.id, invitation.id))
    return c.json({ error: 'Invitation has expired. Please request a new invitation.' }, 400)
  }

  // Atomic state claim: Transition from 'pending' to 'accepted'
  const claimResult = await db.update(invitations)
    .set({ status: 'accepted' })
    .where(and(eq(invitations.id, invitation.id), eq(invitations.status, 'pending')))
    .returning({ id: invitations.id })
    .all()

  if (claimResult.length === 0) {
    return c.json({ error: 'Invalid or expired invitation token' }, 400)
  }

  // Check if profile already exists
  const existingUser = await db.select().from(profiles).where(eq(profiles.email, invitation.email.toLowerCase())).get()
  const passwordHash = await hashPassword(password)
  let userId: string

  if (existingUser) {
    userId = existingUser.id
    await db.update(profiles).set({
      name,
      passwordHash,
      status: 'active',
    }).where(eq(profiles.id, userId))
  } else {
    userId = generateUuid()
    await db.insert(profiles).values({
      id: userId,
      email: invitation.email.toLowerCase(),
      name,
      passwordHash,
      role: invitation.role,
      status: 'active',
    })
  }

  // Auto-enroll in designated courses (idempotent with ON CONFLICT DO NOTHING)
  if (invitation.courseIds && invitation.courseIds.length > 0) {
    for (const courseId of invitation.courseIds) {
      await db.insert(enrollments).values({
        id: generateUuid(),
        userId,
        courseId,
      }).onConflictDoNothing({
        target: [enrollments.userId, enrollments.courseId],
      })
    }
  }

  // Issue JWT session
  const jwt = await signJwt(
    {
      sub: userId,
      email: invitation.email.toLowerCase(),
      name,
      role: invitation.role,
      status: 'active',
    },
    c.env.JWT_SECRET
  )

  return c.json({
    message: 'Account setup successfully',
    token: jwt,
    user: {
      id: userId,
      email: invitation.email.toLowerCase(),
      name,
      role: invitation.role,
      status: 'active',
    },
  })
})

// 5. Forgot Password (Initiate Password Reset)
auth.post('/forgot-password', rateLimit(3, 60), zValidator('json', forgotPasswordSchema), async (c) => {
  const { email } = c.req.valid('json')
  const db = getDb(c.env.DB)

  const user = await db.select().from(profiles).where(eq(profiles.email, email.toLowerCase())).get()
  if (user) {
    const token = generateSecureToken(32)
    const expiresAt = new Date(Date.now() + 3600 * 1000 * 2).toISOString() // 2 hours

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
      subject: 'Reset Your BrilliaMind LMS Password',
      html: `<p>Hello ${user.name},</p><p>You requested a password reset. Click the link below to set a new password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 2 hours.</p>`,
      apiKey: c.env.BREVO_API_KEY,
      from: c.env.EMAIL_FROM,
    })
  }

  // Always return success to prevent email enumeration
  return c.json({ message: 'If an account exists with this email, a password reset link has been dispatched.' })
})

// 6. Reset Password (Complete Password Reset)
auth.post('/reset-password', rateLimit(5, 60), zValidator('json', resetPasswordSchema), async (c) => {
  const { token, newPassword } = c.req.valid('json')
  const db = getDb(c.env.DB)

  const resetRecord = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token)).get()
  if (!resetRecord || resetRecord.usedAt) {
    return c.json({ error: 'Invalid or already used password reset link' }, 400)
  }

  if (new Date(resetRecord.expiresAt) < new Date()) {
    return c.json({ error: 'Password reset link has expired. Please request a new one.' }, 400)
  }

  const passwordHash = await hashPassword(newPassword)

  await db.update(profiles).set({ passwordHash }).where(eq(profiles.id, resetRecord.userId))
  await db.update(passwordResetTokens).set({ usedAt: new Date().toISOString() }).where(eq(passwordResetTokens.id, resetRecord.id))

  return c.json({ message: 'Password has been reset successfully. You can now log in.' })
})

export default auth
