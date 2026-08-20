import type { D1Database, R2Bucket, KVNamespace } from '@cloudflare/workers-types'

export type UserRole = 'admin' | 'instructor' | 'learner'
export type UserStatus = 'pending' | 'active' | 'suspended'
export type CourseStatus = 'draft' | 'published' | 'archived'
export type LessonType = 'text' | 'video' | 'youtube' | 'pdf' | 'quiz'
export type InvitationStatus = 'pending' | 'accepted' | 'expired'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  status: UserStatus
  avatarUrl: string | null
}

export interface Env {
  DB: D1Database
  MEDIA_BUCKET: R2Bucket
  KV: KVNamespace

  // Secret environment variables
  JWT_SECRET: string
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  BREVO_API_KEY?: string
  EMAIL_FROM?: string
  R2_ACCOUNT_ID?: string
  R2_ACCESS_KEY_ID?: string
  R2_SECRET_ACCESS_KEY?: string
  R2_BUCKET?: string
  R2_PUBLIC_URL?: string
  APP_URL?: string
}

export interface Variables {
  user: AuthUser
}
