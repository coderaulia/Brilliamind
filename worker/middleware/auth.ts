import type { Context, Next } from 'hono'
import type { Env, Variables } from '../types'
import { verifyJwt } from '../lib/crypto'

export async function authMiddleware(c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) {
  const authHeader = c.req.header('Authorization')
  let token: string | null = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim()
  } else {
    // Check cookie
    const cookieHeader = c.req.header('Cookie')
    if (cookieHeader) {
      const match = cookieHeader.match(/auth_token=([^;]+)/)
      if (match) token = match[1]
    }
  }

  if (!token) {
    return c.json({ error: 'Unauthorized: missing authentication token' }, 401)
  }

  const payload = await verifyJwt(token, c.env.JWT_SECRET)
  if (!payload) {
    return c.json({ error: 'Unauthorized: invalid or expired token' }, 401)
  }

  c.set('user', {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    status: payload.status,
    avatarUrl: null,
  })

  await next()
}

export async function optionalAuthMiddleware(c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) {
  const authHeader = c.req.header('Authorization')
  let token: string | null = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim()
  }

  if (token) {
    const payload = await verifyJwt(token, c.env.JWT_SECRET)
    if (payload) {
      c.set('user', {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        status: payload.status,
        avatarUrl: null,
      })
    }
  }

  await next()
}
