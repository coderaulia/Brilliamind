/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import app from '../worker/index'
import { signJwt } from '../worker/lib/crypto'

const createMockD1 = () => ({
  prepare: () => ({
    bind: () => ({
      run: () => Promise.resolve({ success: true, meta: { changes: 1 } }),
      all: () => Promise.resolve({ results: [], success: true }),
      first: () => Promise.resolve(null),
      raw: () => Promise.resolve([]),
    }),
    run: () => Promise.resolve({ success: true, meta: { changes: 1 } }),
    all: () => Promise.resolve({ results: [], success: true }),
    first: () => Promise.resolve(null),
    raw: () => Promise.resolve([]),
  }),
  batch: (statements: any[]) => Promise.resolve(statements.map(() => ({ results: [], success: true }))),
  exec: () => Promise.resolve({ count: 1, duration: 0 }),
  dump: () => Promise.resolve(new ArrayBuffer(0)),
})

describe('Cloudflare Workers Hono API Integration', () => {
  const jwtSecret = 'test_jwt_secret_brilliamind_2026'
  const mockEnv = {
    JWT_SECRET: jwtSecret,
    APP_URL: 'http://localhost:5173',
    DB: createMockD1(),
  } as any

  it('responds with status ok on /api/health', async () => {
    const req = new Request('http://localhost/api/health')
    const res = await app.fetch(req, mockEnv)

    expect(res.status).toBe(200)
    const json = await res.json() as { status: string; service: string }
    expect(json.status).toBe('ok')
    expect(json.service).toBe('brilliamind-api')
  })

  it('enforces authentication on protected routes when token is missing', async () => {
    const req = new Request('http://localhost/api/progress/dashboard')
    const res = await app.fetch(req, mockEnv)

    expect(res.status).toBe(401)
    const json = await res.json() as { error: string }
    expect(json.error).toContain('Unauthorized')
  })

  it('rejects unauthorized access when role permissions do not match (RBAC guard)', async () => {
    // Generate a learner JWT
    const learnerJwt = await signJwt(
      {
        sub: 'usr-learner-001',
        email: 'learner@brilliamind.id',
        name: 'Learner One',
        role: 'learner',
        status: 'active',
      },
      jwtSecret
    )

    // Attempt to access Superadmin instructors queue
    const req = new Request('http://localhost/api/admin/instructors', {
      headers: {
        'Authorization': `Bearer ${learnerJwt}`,
      },
    })

    const res = await app.fetch(req, mockEnv)
    expect(res.status).toBe(403)
    const json = await res.json() as { error: string }
    expect(json.error).toContain('Forbidden')
  })

  it('validates request bodies with Zod schemas and returns structured validation errors', async () => {
    const req = new Request('http://localhost/api/auth/register-instructor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'A', // Too short (min 2)
        email: 'not-an-email',
        password: '123', // Too short (min 6)
      }),
    })

    const res = await app.fetch(req, mockEnv)
    expect(res.status).toBe(400)
  })

  it('accepts analytics telemetry events on /api/analytics/event', async () => {
    const req = new Request('http://localhost/api/analytics/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cf-ipcountry': 'ID',
      },
      body: JSON.stringify({
        eventType: 'page_view',
        path: '/learn/crs-web-dev-001',
        anonymousId: 'anon_test_suite_123',
      }),
    })

    const res = await app.fetch(req, mockEnv)
    expect(res.status).toBe(200)
    const json = await res.json() as { success: boolean; eventId: string }
    expect(json.success).toBe(true)
    expect(json.eventId).toBeDefined()
  })

  describe('Security & Hardening Safeguards', () => {
    it('blocks /api/seed in production environments (OWASP A01/A05)', async () => {
      const prodEnv = {
        ...mockEnv,
        APP_URL: 'https://brilliamind.id',
      }
      const req = new Request('http://localhost/api/seed', { method: 'POST' })
      const res = await app.fetch(req, prodEnv)

      expect(res.status).toBe(403)
      const json = await res.json() as { error: string }
      expect(json.error).toContain('disabled in production')
    })

    it('does not expose plaintext password credentials in /api/seed response in dev', async () => {
      const req = new Request('http://localhost/api/seed', { method: 'POST' })
      const res = await app.fetch(req, mockEnv)

      expect(res.status).toBe(200)
      const json = await res.json() as Record<string, any>
      expect(json.credentials).toBeUndefined()
    })

    it('does not authenticate requests via ambient cookies (CSRF mitigation)', async () => {
      const req = new Request('http://localhost/api/progress/dashboard', {
        headers: {
          'Cookie': 'auth_token=some_injected_cookie_token',
        },
      })
      const res = await app.fetch(req, mockEnv)
      expect(res.status).toBe(401)
    })

    it('emits OWASP recommended security headers on responses', async () => {
      const req = new Request('http://localhost/api/health')
      const res = await app.fetch(req, mockEnv)

      expect(res.headers.get('x-frame-options')).toBe('DENY')
      expect(res.headers.get('x-content-type-options')).toBe('nosniff')
      expect(res.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin')
      expect(res.headers.get('strict-transport-security')).toContain('max-age=31536000')
      expect(res.headers.get('content-security-policy')).toBeDefined()
    })

    it('strictly denies unauthorized cross-origin requests via CORS', async () => {
      const req = new Request('http://localhost/api/health', {
        headers: {
          'Origin': 'https://malicious-site.example.com',
        },
      })
      const res = await app.fetch(req, mockEnv)
      expect(res.headers.get('access-control-allow-origin')).toBeNull()
    })

    it('permits authorized origins via CORS', async () => {
      const req = new Request('http://localhost/api/health', {
        headers: {
          'Origin': 'http://localhost:5173',
        },
      })
      const res = await app.fetch(req, mockEnv)
      expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:5173')
    })

    it('redacts internal error messages in production environments', async () => {
      const validJwt = await signJwt(
        {
          sub: 'usr-admin-001',
          email: 'admin@brilliamind.id',
          name: 'Admin',
          role: 'admin',
          status: 'active',
        },
        jwtSecret
      )
      const prodEnv = {
        ...mockEnv,
        APP_URL: 'https://brilliamind.id',
        DB: {
          ...createMockD1(),
          prepare: () => {
            throw new Error('FATAL: Internal SQLite database connection timeout at sqlite3.c:4821')
          },
        },
      }
      const req = new Request('http://localhost/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${validJwt}`,
        },
      })
      const res = await app.fetch(req, prodEnv)
      expect(res.status).toBe(500)
      const json = await res.json() as { error: string }
      expect(json.error).toBe('Internal Server Error')
      expect(json.error).not.toContain('SQLite')
    })
  })
})
