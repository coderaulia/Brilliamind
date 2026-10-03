import { defineConfig, devices } from '@playwright/test'

const WORKER_PORT = 8787
const WEB_PORT = 5173
const STATE_DIR = '.wrangler/e2e-state'
const wrangler = `pnpm exec wrangler`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${WEB_PORT}`, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      // Fresh local D1 per run, migrated, then worker started.
      command: `rm -rf ${STATE_DIR} && ${wrangler} d1 migrations apply DB -c worker/wrangler.jsonc --local --persist-to ${STATE_DIR} && ${wrangler} dev -c worker/wrangler.jsonc --port ${WORKER_PORT} --persist-to ${STATE_DIR} --var JWT_SECRET:e2e_jwt_secret_not_for_production`,
      url: `http://localhost:${WORKER_PORT}/api/health`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `pnpm exec vite --port ${WEB_PORT} --strictPort`,
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
})
