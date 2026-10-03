import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const migrationsDir = join(__dirname, '../../worker/db/migrations')
const journal = JSON.parse(readFileSync(join(migrationsDir, 'meta/_journal.json'), 'utf8')) as {
  entries: { tag: string }[]
}

describe('migration integrity', () => {
  it('has a journal entry for every migration file and vice versa', () => {
    const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).map((f) => f.replace(/\.sql$/, ''))
    expect(journal.entries.map((e) => e.tag).sort()).toEqual(files.sort())
  })

  it('numbers migrations sequentially', () => {
    journal.entries.forEach((e, i) => expect(e.tag.startsWith(String(i).padStart(4, '0')), e.tag).toBe(true))
  })
})
