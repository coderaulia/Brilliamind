import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildVanailaSeedSql } from '../../worker/db/seeds/build-sql'
import { vanailaCourses } from '../../worker/db/seeds/vanaila-seed-data'

describe('golden: vanaila seed', () => {
  it('committed vanaila_seed.sql matches generator output (run: pnpm tsx scripts/generate-vanaila-sql.ts)', () => {
    const committed = readFileSync(join(__dirname, '../../worker/db/seeds/vanaila_seed.sql'), 'utf8')
    expect(committed).toBe(buildVanailaSeedSql())
  })

  it('course catalog shape matches golden file', async () => {
    const summary = vanailaCourses.map((c) => ({
      id: c.id,
      slug: c.slug,
      category: c.category,
      sections: (c.sections ?? (c.section ? [c.section] : [])).map((s) => s.lessons.length),
    }))
    await expect(JSON.stringify(summary, null, 2) + '\n').toMatchFileSnapshot('./__golden__/catalog-shape.json')
  })
})
