import { expect, test } from '@playwright/test'

const fillUserLoginForm = async (page, username: string, password: string) => {
  await page.locator('input').nth(0).fill(username)
  await page.locator('input').nth(1).fill(password)
  await page.getByRole('button', { name: '登录' }).click()
}

const openRegisterMode = async (page) => {
  await page.getByRole('button', { name: '还没有账号？立即注册' }).click()
}

const fillUserRegisterForm = async (
  page,
  username: string,
  password: string,
  confirmPassword: string
) => {
  await page.locator('input').nth(0).fill(username)
  await page.locator('input').nth(1).fill(password)
  await page.locator('input').nth(2).fill(confirmPassword)
  await page.getByRole('button', { name: '注册' }).click()
}

test.describe('Ordinary User Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.evaluate(() => {
      window.localStorage.clear()
    })
  })

  test('redirects an unauthenticated user from home to /login', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveURL(/\/login$/)
  })

  test('sends login through the frontend /api path and logs in successfully', async ({ page }) => {
    let requestUrl = ''

    await page.route('**/api/users/login', async (route) => {
      requestUrl = route.request().url()

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          msg: 'ok',
          data: {
            token: 'user-token',
            user: {
              id: 1,
              username: 'alice'
            }
          }
        })
      })
    })

    await fillUserLoginForm(page, 'alice', 'secret123')

    await expect.poll(() => requestUrl).toContain('/api/users/login')
    await expect.poll(() => requestUrl).not.toContain(':3001')
    await expect(page).toHaveURL(/\/$/)
    await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('userToken'))).toBe('user-token')
  })

  test('shows handled failure and keeps session empty when credentials are invalid', async ({ page }) => {
    await page.route('**/api/users/login', async (route) => {
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

    await fillUserLoginForm(page, 'alice', 'wrong-password')

    await expect(page).toHaveURL(/\/login$/)
    await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('userToken'))).toBeNull()
  })

  test('registers a new user from the login page and returns to the login mode', async ({ page }) => {
    let requestUrl = ''
    let requestBody: Record<string, string> | null = null

    await openRegisterMode(page)

    await page.route('**/api/users/register', async (route) => {
      requestUrl = route.request().url()
      requestBody = route.request().postDataJSON() as Record<string, string>

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          msg: 'register ok',
          data: null
        })
      })
    })

    await fillUserRegisterForm(page, 'new-user', 'secret123', 'secret123')

    await expect.poll(() => requestUrl).toContain('/api/users/register')
    await expect(requestBody).toEqual({
      username: 'new-user',
      password: 'secret123'
    })
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible()
    await expect(page.getByRole('button', { name: '还没有账号？立即注册' })).toBeVisible()
    await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('userToken'))).toBeNull()
  })

  test('blocks registration submission when passwords do not match', async ({ page }) => {
    let registerRequestCount = 0

    await openRegisterMode(page)

    await page.route('**/api/users/register', async (route) => {
      registerRequestCount += 1
      await route.abort()
    })

    await fillUserRegisterForm(page, 'new-user', 'secret123', 'different123')

    await expect(page.getByText('两次输入的密码不一致')).toBeVisible()
    await expect.poll(() => registerRequestCount).toBe(0)
    await expect(page).toHaveURL(/\/login$/)
  })

  test('redirects an already logged-in user away from /login', async ({ page }) => {
    await page.goto('/login')

    await page.evaluate(() => {
      window.localStorage.setItem('userToken', 'existing-user-token')
    })

    await page.goto('/login')

    await expect(page).toHaveURL(/\/$/)
  })
})
