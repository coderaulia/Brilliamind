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
})
