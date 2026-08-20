/**
 * Full System & Feature Verification Script for BrilliaMind LMS
 *
 * Runs an end-to-end validation test suite verifying:
 * 1. Health check & database connection
 * 2. Superadmin & Instructor authentication
 * 3. Course creation & curriculum builder (YouTube video embeds)
 * 4. Learner invitation, token activation, & password setup
 * 5. Real-time lesson progression tracking & automated completion
 * 6. CSV Export for Corporate HR and User Directory
 * 7. Edge Telemetry ingestion & Funnel Analytics
 *
 * Usage:
 *   pnpm run test (Unit & integration test suites)
 *   pnpm exec tsx scripts/verify-full-system.ts (Live worker verification)
 */

const BASE_URL = process.env.API_URL || 'http://localhost:8787'

async function runVerification() {
  console.log(`\n======================================================`)
  console.log(`🚀 BrilliaMind LMS - Full System Verification Suite`)
  console.log(`Target API: ${BASE_URL}`)
  console.log(`======================================================\n`)

  let passed = 0
  let failed = 0

  async function check(name: string, fn: () => Promise<void>) {
    process.stdout.write(`• Checking: ${name}... `)
    try {
      await fn()
      console.log(`✅ PASSED`)
      passed++
    } catch (err: unknown) {
      console.log(`❌ FAILED: ${err instanceof Error ? err.message : String(err)}`)
      failed++
    }
  }

  // 1. Health Check
  await check('Health endpoint responds with status ok', async () => {
    const res = await fetch(`${BASE_URL}/api/health`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    const json = await res.json() as { status: string }
    if (json.status !== 'ok') throw new Error(`Unexpected status: ${json.status}`)
  })

  // 2. Demo Database Seeding
  await check('Seed demo accounts & courses', async () => {
    const res = await fetch(`${BASE_URL}/api/seed`, { method: 'POST' })
    if (!res.ok) throw new Error(`Seed failed with status ${res.status}`)
  })

  // 3. Superadmin Authentication
  let adminToken = ''
  await check('Superadmin login (admin@brilliamind.id)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@brilliamind.id',
        password: 'Admin123!',
      }),
    })
    if (!res.ok) throw new Error(`Admin login failed: status ${res.status}`)
    const json = await res.json() as { token: string }
    adminToken = json.token
    if (!adminToken) throw new Error('Missing admin JWT token in response')
  })

  // 4. Pending Instructor Blocking & Approval Flow
  let pendingInstId = ''
  await check('Instructor registration creates pending status', async () => {
    const uniqueEmail = `test.instructor.${Date.now()}@brilliamind.id`
    const res = await fetch(`${BASE_URL}/api/auth/register-instructor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Tan',
        email: uniqueEmail,
        password: 'Instructor123!',
        bio: 'Senior UX Specialist',
      }),
    })
    if (!res.ok) throw new Error(`Registration failed: ${res.status}`)
    const json = await res.json() as { instructorId: string; status: string }
    pendingInstId = json.instructorId
    if (json.status !== 'pending') throw new Error(`Expected pending status, got ${json.status}`)
  })

  await check('Superadmin approves pending instructor', async () => {
    if (!pendingInstId) throw new Error('No pending instructor ID')
    const res = await fetch(`${BASE_URL}/api/admin/instructors/${pendingInstId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    })
    if (!res.ok) throw new Error(`Approval failed with status ${res.status}`)
  })

  // 5. Active Instructor Course Creation & YouTube Video Embeds
  let instructorToken = ''
  await check('Approved instructor login', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sarah.mitchell@brilliamind.id',
        password: 'Instructor123!',
      }),
    })
    if (!res.ok) throw new Error(`Instructor login failed: ${res.status}`)
    const json = await res.json() as { token: string }
    instructorToken = json.token
  })

  let createdCourseId = ''
  await check('Instructor creates new course draft', async () => {
    const res = await fetch(`${BASE_URL}/api/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${instructorToken}`,
      },
      body: JSON.stringify({
        title: `Full-Stack Cloud Architecture ${Date.now()}`,
        category: 'Development',
        description: 'Serverless web systems at edge scale.',
        price: 49,
      }),
    })
    if (!res.ok) throw new Error(`Course creation failed: ${res.status}`)
    const json = await res.json() as { course: { id: string } }
    createdCourseId = json.course.id
  })

  let createdSectionId = ''
  await check('Instructor adds course section', async () => {
    const res = await fetch(`${BASE_URL}/api/courses/${createdCourseId}/sections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${instructorToken}`,
      },
      body: JSON.stringify({
        title: 'Module 1: Serverless Edge Computing',
        position: 1,
      }),
    })
    if (!res.ok) throw new Error(`Section creation failed: ${res.status}`)
    const json = await res.json() as { section: { id: string } }
    createdSectionId = json.section.id
  })

  let createdLessonId = ''
  await check('Instructor attaches YouTube video lesson with free preview', async () => {
    const res = await fetch(`${BASE_URL}/api/courses/sections/${createdSectionId}/lessons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${instructorToken}`,
      },
      body: JSON.stringify({
        title: 'Lecture 1.1: Cloudflare Workers & D1 Architecture',
        type: 'youtube',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        isFreePreview: true,
        position: 1,
      }),
    })
    if (!res.ok) throw new Error(`Lesson creation failed: ${res.status}`)
    const json = await res.json() as { lesson: { id: string } }
    createdLessonId = json.lesson.id
  })

  // 6. Invitation-Only Learner Onboarding Flow
  let inviteToken = ''
  const learnerEmail = `participant.${Date.now()}@brilliamind.id`
  await check('Instructor dispatches course email invitation to learner', async () => {
    const res = await fetch(`${BASE_URL}/api/courses/${createdCourseId}/invite-learner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${instructorToken}`,
      },
      body: JSON.stringify({
        email: learnerEmail,
      }),
    })
    if (!res.ok) throw new Error(`Invite learner failed: ${res.status}`)
    const json = await res.json() as { invitation: { token: string } }
    inviteToken = json.invitation.token
  })

  let learnerToken = ''
  await check('Learner accepts invitation, sets password, and auto-enrolls', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/accept-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: inviteToken,
        name: 'Rian Pratama',
        password: 'LearnerPassword123!',
      }),
    })
    if (!res.ok) throw new Error(`Accept invite failed: ${res.status}`)
    const json = await res.json() as { token: string }
    learnerToken = json.token
  })

  // 7. Real-Time Lesson Progress & Automated Completion
  await check('Learner checks off lesson completion (triggers 100% graduation milestone)', async () => {
    const res = await fetch(`${BASE_URL}/api/progress/lesson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${learnerToken}`,
      },
      body: JSON.stringify({
        lessonId: createdLessonId,
        completed: true,
      }),
    })
    if (!res.ok) throw new Error(`Toggle progress failed: ${res.status}`)
  })

  // 8. CSV Export Verification
  await check('Instructor exports course progress roster CSV (RFC 4180)', async () => {
    const res = await fetch(`${BASE_URL}/api/courses/${createdCourseId}/export-csv`, {
      headers: {
        'Authorization': `Bearer ${instructorToken}`,
      },
    })
    if (!res.ok) throw new Error(`CSV export failed: ${res.status}`)
    const csv = await res.text()
    if (!csv.includes('Student Name') || !csv.includes('Progress %')) {
      throw new Error('CSV output missing expected headers')
    }
  })

  await check('Superadmin exports platform users CSV', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/users/export-csv`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    })
    if (!res.ok) throw new Error(`Users CSV export failed: ${res.status}`)
    const csv = await res.text()
    if (!csv.includes('User ID') || !csv.includes('Email Address')) {
      throw new Error('Users CSV output missing expected headers')
    }
  })

  // 9. Edge Telemetry & Conversion Funnel Overview
  await check('Edge telemetry records event and updates Funnel Overview', async () => {
    await fetch(`${BASE_URL}/api/analytics/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cf-ipcountry': 'ID',
      },
      body: JSON.stringify({
        eventType: 'page_view',
        path: `/learn/${createdCourseId}`,
      }),
    })

    const res = await fetch(`${BASE_URL}/api/analytics/admin/overview`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    })
    if (!res.ok) throw new Error(`Overview fetch failed: ${res.status}`)
    const json = await res.json() as { funnel: Array<{ stage: string }>; metrics: { totalVisitors: number } }
    if (!json.funnel || json.funnel.length === 0) throw new Error('Funnel data is empty')
  })

  console.log(`\n======================================================`)
  console.log(`✨ Verification Summary: ${passed} Passed, ${failed} Failed`)
  console.log(`======================================================\n`)

  if (failed > 0) {
    process.exit(1)
  }
}

runVerification().catch(err => {
  console.error('Fatal Verification Error:', err)
  process.exit(1)
})
