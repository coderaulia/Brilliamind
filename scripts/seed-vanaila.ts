/**
 * Vanaila Course Seed Runner
 *
 * Seeds instructor "Vanaila Course" and all extracted YouTube training series:
 * - 3 Categories: Excel, Spreadsheet, Sales
 * - 8 Series (Courses)
 * - 234 Video Lessons
 *
 * Usage:
 *   npx tsx scripts/seed-vanaila.ts
 *   wrangler d1 execute DB --local --file=worker/db/seeds/vanaila_seed.sql
 */

import { vanailaInstructor, vanailaCourses } from '../worker/db/seeds/vanaila-seed-data'

const BASE_URL = process.env.API_URL || 'http://localhost:8787'

async function runSeed() {
  console.log('\n======================================================')
  console.log('🌱 Vanaila Course Database Seed Runner')
  console.log('======================================================')
  console.log(`Instructor: ${vanailaInstructor.name} (${vanailaInstructor.email})`)
  console.log(`Total Courses / Series: ${vanailaCourses.length}`)
  const totalLessons = vanailaCourses.reduce((sum, c) => {
    if (c.sections) return sum + c.sections.reduce((s, sec) => s + sec.lessons.length, 0)
    if (c.section) return sum + c.section.lessons.length
    return sum
  }, 0)
  console.log(`Total Video Lessons: ${totalLessons}\n`)

  console.log('--- Series Summary by Category ---')
  for (const c of vanailaCourses) {
    const courseLessonsCount = c.sections
      ? c.sections.reduce((s, sec) => s + sec.lessons.length, 0)
      : c.section?.lessons.length || 0
    const firstLesson = c.sections ? c.sections[0]?.lessons[0] : c.section?.lessons[0]
    console.log(`• [${c.category}] ${c.title}`)
    console.log(`  ID: ${c.id} | Slug: ${c.slug}`)
    console.log(`  Lessons: ${courseLessonsCount} | First: ${firstLesson?.title.slice(0, 50)}...`)
    console.log(`  First Video URL: ${firstLesson?.videoUrl}`)
  }

  console.log('\n--- Seeding via Local Worker API ---')
  try {
    const res = await fetch(`${BASE_URL}/api/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.ok) {
      const json = await res.json()
      console.log('✅ Successfully seeded via API /api/seed!')
      console.log(JSON.stringify(json, null, 2))
    } else {
      console.log(`⚠️  API seed returned status ${res.status}: ${await res.text()}`)
      console.log('ℹ️  Ensure your local worker is running: `npm run dev:worker`')
      console.log('ℹ️  Alternatively, execute SQL directly with D1:')
      console.log('   npx wrangler d1 execute DB --local --file=worker/db/seeds/vanaila_seed.sql')
    }
  } catch {
    console.log(`⚠️  Could not connect to ${BASE_URL}/api/seed (Worker dev server not currently running).`)
    console.log('ℹ️  To execute the seed in SQLite/D1:')
    console.log('   1. Start worker: npm run dev:worker, then run: npx tsx scripts/seed-vanaila.ts')
    console.log('   2. OR run SQL directly:')
    console.log('      npx wrangler d1 execute DB --local --file=worker/db/seeds/vanaila_seed.sql')
  }

  console.log('\n======================================================')
  console.log('✨ SQL Seed File available at: worker/db/seeds/vanaila_seed.sql')
  console.log('✨ TypeScript Seed Data at: worker/db/seeds/vanaila-seed-data.ts')
  console.log('======================================================\n')
}

runSeed().catch(console.error)
