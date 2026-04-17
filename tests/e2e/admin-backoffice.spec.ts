import { expect, test } from '@playwright/test'

const ADMIN_USERNAME = process.env.E2E_ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '123456'

const fillAdminLoginForm = async (page, username: string, password: string) => {
  await page.locator('input').nth(0).fill(username)
  await page.locator('input').nth(1).fill(password)
  await page.locator('.admin-login-form .el-button').click()
}

test.describe('Admin Backoffice V1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin-login')
    await page.evaluate(() => {
      window.localStorage.clear()
    })
  })

  test('blocks unauthenticated access to admin page', async ({ page }) => {
    await page.goto('/admin')

    await expect(page).toHaveURL(/\/admin-login$/)
  })

  test('shows error and keeps admin session empty when credentials are invalid', async ({ page }) => {
    await page.route('**/api/admin/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 401,
          msg: 'invalid credentials',
          data: null
        })
      })
    })

    await fillAdminLoginForm(page, 'wrong-admin', 'wrong-password')

    await expect(page).toHaveURL(/\/admin-login$/)
    await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('adminToken'))).toBeNull()
    await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('adminUser'))).toBeNull()
  })

  test('logs in as admin, stores session, and shows resume list', async ({ page }) => {
    await page.route('**/api/admin/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          msg: 'ok',
          data: {
            token: 'admin-token',
            user: {
              username: ADMIN_USERNAME,
              isAdmin: true
            }
          }
        })
      })
    })

    await page.route('**/api/admin/resumes?page=1&pageSize=10', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          msg: 'ok',
          data: {
            list: [
              {
                resume_id: 'resume-1',
                user_id: 7,
                name: 'Alice',
                phone: '13800000000',
                email: 'alice@example.com',
                education: 'Bachelor',
                projects: [{ name: 'Admin Portal' }],
                skills: ['Vue', 'TS'],
                created_at: '2026-04-10 09:00:00'
              }
            ],
            pagination: {
              page: 1,
              pageSize: 10,
              total: 1,
              totalPages: 1
            }
          }
        })
      })
    })

    await fillAdminLoginForm(page, ADMIN_USERNAME, ADMIN_PASSWORD)

    await expect(page).toHaveURL(/\/admin$/)
    await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('adminToken'))).toBe('admin-token')
    await expect.poll(async () => {
      return page.evaluate(() => {
        const raw = window.localStorage.getItem('adminUser')
        return raw ? JSON.parse(raw).username : null
      })
    }).toBe(ADMIN_USERNAME)
    await expect(page.locator('.el-table__body tbody tr')).toHaveCount(1)
    await expect(page.locator('.el-table__body').getByText('Alice', { exact: true })).toBeVisible()
  })

  test('deletes a resume and refreshes the list after confirmation', async ({ page }) => {
    let resumeRequestCount = 0
    let deleteRequestSeen = false

    await page.route('**/api/admin/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          msg: 'ok',
          data: {
            token: 'admin-token',
            user: {
              username: ADMIN_USERNAME,
              isAdmin: true
            }
          }
        })
      })
    })

    await page.route('**/api/admin/resumes?page=1&pageSize=10', async (route) => {
      resumeRequestCount += 1

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          msg: 'ok',
          data: {
            list: resumeRequestCount === 1 ? [
              {
                resume_id: 'resume-1',
                user_id: 7,
                name: 'Alice',
                phone: '13800000000',
                email: 'alice@example.com',
                education: 'Bachelor',
                projects: [],
                skills: ['Vue'],
                created_at: '2026-04-10 09:00:00'
              }
            ] : [],
            pagination: {
              page: 1,
              pageSize: 10,
              total: resumeRequestCount === 1 ? 1 : 0,
              totalPages: resumeRequestCount === 1 ? 1 : 0
            }
          }
        })
      })
    })

    await page.route('**/api/admin/resumes/resume-1', async (route) => {
      deleteRequestSeen = true
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          msg: 'deleted',
          data: null
        })
      })
    })

    await fillAdminLoginForm(page, ADMIN_USERNAME, ADMIN_PASSWORD)

    await expect(page).toHaveURL(/\/admin$/)
    await expect(page.locator('.el-table__body').getByText('Alice', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: /删除/ }).click()
    await page.getByRole('button', { name: /确定/ }).click()

    await expect.poll(() => deleteRequestSeen).toBe(true)
    await expect.poll(() => resumeRequestCount).toBe(2)
    await expect(page.locator('.el-table__body').getByText('Alice', { exact: true })).toHaveCount(0)
  })

  test('clears admin session and redirects to admin login when admin API returns 403', async ({ page }) => {
    await page.goto('/admin')
    await page.evaluate(() => {
      window.localStorage.setItem('adminToken', 'stale-admin-token')
      window.localStorage.setItem('adminUser', JSON.stringify({ username: 'admin', isAdmin: true }))
    })

    await page.route('**/api/admin/resumes?page=1&pageSize=10', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 403,
          msg: 'forbidden',
          data: null
        })
      })
    })

    await page.goto('/admin')

    await expect(page).toHaveURL(/\/admin-login$/)
    await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('adminToken'))).toBeNull()
    await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('adminUser'))).toBeNull()
  })

  test('normal user token cannot directly use admin page', async ({ page }) => {
    await page.goto('/login')
    await page.evaluate(() => {
      window.localStorage.setItem('userToken', 'normal-user-token')
      window.localStorage.setItem(
        'userInfo',
        JSON.stringify({ id: 1, username: 'normal-user' })
      )
    })

    await page.goto('/admin')

    await expect(page).toHaveURL(/\/admin-login$/)
  })
})
