/**
 * Regenerates worker/db/seeds/vanaila_seed.sql from vanaila-seed-data.ts.
 *
 * Usage: pnpm tsx scripts/generate-vanaila-sql.ts
 */

import { writeFileSync } from 'node:fs'
import { buildVanailaSeedSql } from '../worker/db/seeds/build-sql'

writeFileSync(new URL('../worker/db/seeds/vanaila_seed.sql', import.meta.url), buildVanailaSeedSql())
console.log('Wrote worker/db/seeds/vanaila_seed.sql')
