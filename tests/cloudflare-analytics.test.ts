/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import app from '../worker/index'
import { signJwt } from '../worker/lib/crypto'
import { fetchCloudflareStats } from '../worker/lib/cloudflare'

const createMockD1 = () => ({
  prepare: () => ({
    bind: () => ({
      run: () => Promise.resolve({ success: true, meta: { changes: 1 } }),
      all: () => Promise.resolve({ results: [], success: true }),
      first: () => Promise.resolve(null),
      raw: () => Promise.resolve([]),
      get: () => Promise.resolve({ value: 42 }),
    }),
    run: () => Promise.resolve({ success: true, meta: { changes: 1 } }),
    all: () => Promise.resolve({ results: [], success: true }),
    first: () => Promise.resolve(null),
    raw: () => Promise.resolve([]),
    get: () => Promise.resolve({ value: 42 }),
  }),
  batch: (statements: any[]) => Promise.resolve(statements.map(() => ({ results: [], success: true }))),
  exec: () => Promise.resolve({ count: 1, duration: 0 }),
  dump: () => Promise.resolve(new ArrayBuffer(0)),
})

describe('Cloudflare Direct Analytics & Platform Telemetry Integration', () => {
  const jwtSecret = 'test_jwt_secret_brilliamind_2026'

  it('handles unconfigured Cloudflare credentials gracefully with fallback status', async () => {
    const mockEnv = {
      DB: createMockD1(),
      JWT_SECRET: jwtSecret,
    } as any

    const stats = await fetchCloudflareStats(mockEnv, { colo: 'SIN' }, '30d')

    expect(stats.configured).toBe(false)
    expect(stats.status).toBe('unconfigured')
    expect(stats.message).toContain('credentials are not configured')
    expect(stats.metrics.totalRequests).toBeGreaterThan(0)
    expect(stats.edge.colo).toBe('SIN')
    expect(stats.metrics.uptimePercentage).toBeGreaterThan(99)
  })

  it('calculates uptime SLA and cache hit ratio accurately from Cloudflare API responses', async () => {
    const mockEnv = {
      DB: createMockD1(),
      JWT_SECRET: jwtSecret,
      CLOUDFLARE_API_TOKEN: 'test-cf-token-abc',
      CLOUDFLARE_ZONE_ID: 'test-zone-id-xyz',
    } as any

    const fakeCfResponse = {
      success: true,
      result: {
        totals: {
          requests: {
            all: 1000,
            cached: 800,
            uncached: 200,
            http_status: {
              '200': 950,
              '301': 30,
              '404': 18,
              '500': 2,
            },
          },
          bandwidth: {
            all: 104857600, // 100 MB
            cached: 83886080,
            uncached: 20971520,
          },
          threats: { all: 5 },
          pageviews: { all: 1500 },
          uniques: { all: 320 },
        },
      },
    }

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(fakeCfResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const stats = await fetchCloudflareStats(mockEnv, { colo: 'CGK', httpProtocol: 'HTTP/3' }, '30d')

    expect(stats.configured).toBe(true)
    expect(stats.status).toBe('connected')
    expect(stats.metrics.totalRequests).toBe(1000)
    expect(stats.metrics.cachedRequests).toBe(800)
    expect(stats.metrics.cacheHitRatio).toBe(80) // 800/1000 * 100
    // Uptime: (1000 - 2 5xx) / 1000 * 100 = 99.8%
    expect(stats.metrics.uptimePercentage).toBe(99.8)
    expect(stats.httpStatus.status5xx).toBe(2)
    expect(stats.httpStatus.status2xx).toBe(950)
    expect(stats.edge.colo).toBe('CGK')

    fetchSpy.mockRestore()
  })

  it('authenticates admin and returns complete platform & course analytics via /api/analytics/admin/platform', async () => {
    const adminJwt = await signJwt(
      {
        sub: 'usr-admin-001',
        email: 'admin@brilliamind.id',
        name: 'Super Admin',
        role: 'admin',
        status: 'active',
      },
      jwtSecret
    )

    const mockEnv = {
      JWT_SECRET: jwtSecret,
      APP_URL: 'http://localhost:5173',
      DB: createMockD1(),
    } as any

    const req = new Request('http://localhost/api/analytics/admin/platform?timeframe=30d', {
      headers: {
        Authorization: `Bearer ${adminJwt}`,
      },
    })

    const res = await app.fetch(req, mockEnv)
    expect(res.status).toBe(200)

    const json = (await res.json()) as any
    expect(json.summary).toBeDefined()
    expect(json.summary.requests).toBeDefined()
    expect(json.summary.funnelCompletionRate).toBeDefined()
    expect(json.funnel).toBeInstanceOf(Array)
    expect(json.topPages).toBeInstanceOf(Array)
    expect(json.ctaClicks).toBeInstanceOf(Array)
    expect(json.recentVisitors).toBeInstanceOf(Array)
    expect(json.apiHealth).toBeDefined()
    expect(json.apiHealth.averageLatencyMs).toBeDefined()
    expect(json.cloudflare).toBeDefined()
    expect(json.coursesAndLearning).toBeDefined()
    expect(json.coursesAndLearning.popularCourses).toBeInstanceOf(Array)
    expect(json.coursesAndLearning.coursesPlayed).toBeDefined()
  })

  it('rejects learner role from accessing /api/analytics/admin/platform (403 Forbidden)', async () => {
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

    const mockEnv = {
      JWT_SECRET: jwtSecret,
      APP_URL: 'http://localhost:5173',
      DB: createMockD1(),
    } as any

    const req = new Request('http://localhost/api/analytics/admin/platform', {
      headers: {
        Authorization: `Bearer ${learnerJwt}`,
      },
    })

    const res = await app.fetch(req, mockEnv)
    expect(res.status).toBe(403)
  })

  it('rejects unauthenticated requests to /api/analytics/admin/cloudflare (401 Unauthorized)', async () => {
    const mockEnv = {
      JWT_SECRET: jwtSecret,
      APP_URL: 'http://localhost:5173',
      DB: createMockD1(),
    } as any

    const req = new Request('http://localhost/api/analytics/admin/cloudflare')
    const res = await app.fetch(req, mockEnv)
    expect(res.status).toBe(401)
  })
})
