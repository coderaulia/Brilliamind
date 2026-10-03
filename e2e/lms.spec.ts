import { test, expect, type Page } from '@playwright/test'

const API = 'http://localhost:8787'

async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByPlaceholder('name@company.com').fill(email)
  await page.getByPlaceholder('••••••••').fill(password)
  await page.getByRole('button', { name: 'Sign In' }).click()
}

test.beforeAll(async ({ request }) => {
  const res = await request.post(`${API}/api/seed`)
  expect(res.ok()).toBeTruthy()
})

test('landing page and public pages load', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/.+/)
  for (const path of ['/faq', '/privacy', '/terms']) {
    const res = await page.goto(path)
    expect(res?.ok()).toBeTruthy()
  }
})

test('rejects bad credentials', async ({ page }) => {
  await login(page, 'admin@brilliamind.id', 'wrong-password')
  await expect(page).toHaveURL(/\/login/)
})

test('superadmin signs in and reaches admin area', async ({ page }) => {
  await login(page, 'admin@brilliamind.id', 'Admin123!')
  await expect(page).toHaveURL(/\/admin/)
})

test('instructor signs in and sees seeded courses', async ({ page }) => {
  await login(page, 'vanaila.course@brilliamind.id', 'Vanaila123!')
  await expect(page).toHaveURL(/\/instructor\/courses/)
  await expect(page.getByText(/Microsoft Excel/i).first()).toBeVisible()
})

test('learner signs in, opens enrolled course player', async ({ page }) => {
  await login(page, 'budi.santoso@brilliamind.id', 'Learner123!')
  await expect(page).toHaveURL(/\/dashboard/)
  await page.goto('/learn/crs-web-dev-001')
  await expect(page.getByText(/Welcome to Cloudflare Edge Architecture/i).first()).toBeVisible()
})

test('unauthenticated user is redirected from protected routes', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/login/)
})

test('API rejects unauthenticated admin access', async ({ request }) => {
  const res = await request.get(`${API}/api/admin/users`)
  expect([401, 403]).toContain(res.status())
})
