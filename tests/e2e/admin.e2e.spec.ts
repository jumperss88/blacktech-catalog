import { test, expect, Page } from '@playwright/test'
import { getPayload } from 'payload'
import config from '../../src/payload.config.js'
import { withSqliteBusyRetry } from './dbRetry'

test.describe('Admin Panel', () => {
  test.describe.configure({ timeout: 120_000 })
  let page: Page
  const baseURL = 'http://localhost:3000'
  const runId = Date.now()
  const testUser = {
    email: `admin-e2e-${runId}@test.com`,
    password: 'test',
  }

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(120_000)
    const payload = await getPayload({ config })
    const existing = await withSqliteBusyRetry(
      () =>
        payload.find({
          collection: 'users',
          limit: 1,
          where: { email: { equals: testUser.email } },
        }),
      'admin.beforeAll.findUser',
    )

    if (existing.docs.length > 0) {
      await withSqliteBusyRetry(
        () =>
          payload.update({
            collection: 'users',
            id: existing.docs[0].id,
            data: { password: testUser.password, roles: ['admin'] },
          }),
        'admin.beforeAll.updateUser',
      )
    } else {
      await withSqliteBusyRetry(
        () =>
          payload.create({
            collection: 'users',
            data: { email: testUser.email, password: testUser.password, roles: ['admin'] },
          }),
        'admin.beforeAll.createUser',
      )
    }

    const context = await browser.newContext()
    page = await context.newPage()

    const loginResponse = await page.request.post(`${baseURL}/api/users/login`, {
      data: {
        email: testUser.email,
        password: testUser.password,
      },
    })
    expect(loginResponse.ok()).toBeTruthy()
    await page.goto(`${baseURL}/admin`)
    await page.waitForURL(/\/admin(\/)?$/)
  })

  test('can navigate to dashboard', async () => {
    await page.goto(`${baseURL}/admin`)
    await expect(page).toHaveURL(`${baseURL}/admin`)
  })

  test('can navigate to list view', async () => {
    await page.goto(`${baseURL}/admin/collections/users`)
    await expect(page).toHaveURL(/\/admin\/collections\/users(\?.*)?$/)
    const listViewArtifact = page.getByRole('heading', { name: /пользователи/i }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('can navigate to edit view', async () => {
    await page.goto(`${baseURL}/admin/collections/users/create`)
    await expect(page).toHaveURL(/\/admin\/collections\/users\/[a-zA-Z0-9-_]+/)
    const editViewArtifact = page.locator('input[name="email"]')
    await expect(editViewArtifact).toBeVisible()
  })
})
