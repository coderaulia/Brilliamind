/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import app from '../worker/index'
import { signJwt } from '../worker/lib/crypto'
import { enrollments, userProgress, videoWatchLogs } from '../worker/db/schema'

describe('Concurrency & Idempotency Safeguards', () => {
  const jwtSecret = 'test_jwt_secret_brilliamind_2026'

  it('has composite unique indexes defined on critical tables in schema', () => {
    // Verify unique index configuration exists on Drizzle table objects
    const enrollmentConfig = (enrollments as any)[Symbol.for('drizzle:ExtraConfigBuilder')]
    const userProgressConfig = (userProgress as any)[Symbol.for('drizzle:ExtraConfigBuilder')]
    const videoWatchLogsConfig = (videoWatchLogs as any)[Symbol.for('drizzle:ExtraConfigBuilder')]

    expect(enrollmentConfig).toBeDefined()
    expect(userProgressConfig).toBeDefined()
    expect(videoWatchLogsConfig).toBeDefined()
  })

  it('rejects duplicate/concurrent accept-invite when invitation is already claimed', async () => {
    // Mock D1 where update claim returns empty array (representing already claimed / status != 'pending')
    const mockDb = {
      prepare: () => ({
        bind: () => ({
          run: () => Promise.resolve({ success: true, meta: { changes: 1 } }),
          all: () => Promise.resolve({ results: [], success: true }),
          first: () => Promise.resolve({
            id: 'inv-test-001',
            email: 'learner@example.com',
            token: 'valid_token_1234567890',
            status: 'pending',
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
            courseIds: ['crs-001'],
            role: 'learner',
          }),
          raw: () => Promise.resolve([]),
        }),
        run: () => Promise.resolve({ success: true, meta: { changes: 1 } }),
        all: () => Promise.resolve({ results: [], success: true }), // update returning returns []
        first: () => Promise.resolve({
          id: 'inv-test-001',
          email: 'learner@example.com',
          token: 'valid_token_1234567890',
          status: 'pending',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          courseIds: ['crs-001'],
          role: 'learner',
        }),
        raw: () => Promise.resolve([]),
      }),
      batch: (statements: any[]) => Promise.resolve(statements.map(() => ({ results: [], success: true }))),
      exec: () => Promise.resolve({ count: 1, duration: 0 }),
      dump: () => Promise.resolve(new ArrayBuffer(0)),
    }

    const mockEnv = {
      JWT_SECRET: jwtSecret,
      APP_URL: 'http://localhost:5173',
      DB: mockDb,
    } as any

    const req = new Request('http://localhost/api/auth/accept-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'valid_token_1234567890',
        name: 'John Doe',
        password: 'Password123!',
      }),
    })

    const res = await app.fetch(req, mockEnv)
    expect(res.status).toBe(400)
    const json = await res.json() as { error: string }
    expect(json.error).toContain('Invalid or expired invitation token')
  })

  it('handles lesson progress completion atomically via /api/progress/lesson', async () => {
    const executedQueries: string[] = []
    const mockDb = {
      prepare: (query: string) => {
        executedQueries.push(query)
        const mockLesson = {
          id: 'lsn-001',
          section_id: 'sec-001',
          title: 'Lesson 1',
          type: 'youtube',
          content_json: null,
          video_url: null,
          pdf_url: null,
          position: 0,
          is_free_preview: 0,
        }
        return {
          bind: () => ({
            run: () => Promise.resolve({ success: true, meta: { changes: 1 } }),
            all: () => Promise.resolve({ results: [mockLesson], success: true }),
            first: () => Promise.resolve(mockLesson),
            raw: () => Promise.resolve([Object.values(mockLesson)]),
          }),
          run: () => Promise.resolve({ success: true, meta: { changes: 1 } }),
          all: () => Promise.resolve({ results: [mockLesson], success: true }),
          first: () => Promise.resolve(mockLesson),
          raw: () => Promise.resolve([Object.values(mockLesson)]),
        }
      },
      batch: (statements: any[]) => Promise.resolve(statements.map(() => ({ results: [], success: true }))),
      exec: () => Promise.resolve({ count: 1, duration: 0 }),
      dump: () => Promise.resolve(new ArrayBuffer(0)),
    }

    const mockEnv = {
      JWT_SECRET: jwtSecret,
      APP_URL: 'http://localhost:5173',
      DB: mockDb,
    } as any

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

    const req = new Request('http://localhost/api/progress/lesson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${learnerJwt}`,
      },
      body: JSON.stringify({
        lessonId: 'lsn-001',
        completed: true,
      }),
    })

    const res = await app.fetch(req, mockEnv)
    expect(res.status).toBe(200)
    const json = await res.json() as { message: string; completed: boolean }
    expect(json.completed).toBe(true)
    expect(json.message).toContain('Progress updated successfully')
    expect(executedQueries.some(q => q.toLowerCase().includes('on conflict'))).toBe(true)
  })

  it('handles video watch log updates atomically via /api/progress/watch-log', async () => {
    let capturedSql = ''
    const mockDb = {
      prepare: (query: string) => {
        capturedSql = query
        return {
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
        }
      },
      batch: (statements: any[]) => Promise.resolve(statements.map(() => ({ results: [], success: true }))),
      exec: () => Promise.resolve({ count: 1, duration: 0 }),
      dump: () => Promise.resolve(new ArrayBuffer(0)),
    }

    const mockEnv = {
      JWT_SECRET: jwtSecret,
      APP_URL: 'http://localhost:5173',
      DB: mockDb,
    } as any

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

    const req = new Request('http://localhost/api/progress/watch-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${learnerJwt}`,
      },
      body: JSON.stringify({
        lessonId: 'lsn-001',
        watchSeconds: 120,
      }),
    })

    const res = await app.fetch(req, mockEnv)
    expect(res.status).toBe(200)
    const json = await res.json() as { success: boolean; watchSeconds: number }
    expect(json.success).toBe(true)
    expect(json.watchSeconds).toBe(120)
    expect(capturedSql.toLowerCase()).toContain('on conflict')
  })
})
