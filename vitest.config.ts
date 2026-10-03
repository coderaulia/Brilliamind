import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/integrity/**/*.test.ts', 'tests/golden/**/*.test.ts'],
  },
})
