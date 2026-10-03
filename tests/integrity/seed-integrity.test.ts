import { describe, it, expect } from 'vitest'
import { vanailaCourses } from '../../worker/db/seeds/vanaila-seed-data'

const sectionsOf = (c: (typeof vanailaCourses)[number]) => c.sections ?? (c.section ? [c.section] : [])
const allSections = vanailaCourses.flatMap(sectionsOf)
const allLessons = allSections.flatMap((s) => s.lessons)

describe('seed data integrity', () => {
  it('has unique ids and slugs at every level', () => {
    for (const ids of [
      vanailaCourses.map((c) => c.id),
      vanailaCourses.map((c) => c.slug),
      allSections.map((s) => s.id),
      allLessons.map((l) => l.id),
    ]) {
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('gives every course at least one section and every section at least one lesson', () => {
    for (const c of vanailaCourses) expect(sectionsOf(c).length, c.id).toBeGreaterThan(0)
    for (const s of allSections) expect(s.lessons.length, s.id).toBeGreaterThan(0)
  })

  it('numbers section and lesson positions contiguously from 0', () => {
    for (const c of vanailaCourses) {
      expect(sectionsOf(c).map((s) => s.position), c.id).toEqual(sectionsOf(c).map((_, i) => i))
    }
    for (const s of allSections) {
      expect(s.lessons.map((l) => l.position), s.id).toEqual(s.lessons.map((_, i) => i))
    }
  })

  it('uses valid YouTube urls and non-empty titles', () => {
    for (const l of allLessons) {
      expect(l.videoUrl, l.id).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/)
      expect(l.title.trim(), l.id).not.toBe('')
    }
  })

  it('has required course metadata', () => {
    for (const c of vanailaCourses) {
      expect(c.title.trim(), c.id).not.toBe('')
      expect(c.slug, c.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      expect(c.coverUrl, c.id).toMatch(/^https:\/\//)
      expect(c.tags.length, c.id).toBeGreaterThan(0)
    }
  })
})
