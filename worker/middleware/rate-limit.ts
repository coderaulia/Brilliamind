import type { Context, Next } from 'hono'
import type { Env, Variables } from '../types'

// In-memory fallback if KV is not bound in development
const inMemoryStore = new Map<string, { count: number; expiresAt: number }>()

export function rateLimit(limit = 10, windowSec = 60) {
  return async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('x-forwarded-for') || '127.0.0.1'
    const key = `ratelimit:${c.req.path}:${ip}`
    const now = Math.floor(Date.now() / 1000)

    try {
      if (c.env.KV) {
        const currentCountStr = await c.env.KV.get(key)
        const count = currentCountStr ? parseInt(currentCountStr, 10) : 0

        if (count >= limit) {
          return c.json({ error: 'Too many requests. Please try again later.' }, 429)
        }

        await c.env.KV.put(key, (count + 1).toString(), { expirationTtl: windowSec })
      } else {
        // Fallback for local testing without KV
        const record = inMemoryStore.get(key)
        if (record && record.expiresAt > now) {
          if (record.count >= limit) {
            return c.json({ error: 'Too many requests. Please try again later.' }, 429)
          }
          record.count += 1
        } else {
          inMemoryStore.set(key, { count: 1, expiresAt: now + windowSec })
        }
      }
    } catch {
      // In case of KV lookup error, fail open to avoid service outage
    }

    await next()
  }
}
