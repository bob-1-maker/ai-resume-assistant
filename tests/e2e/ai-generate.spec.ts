import { expect, test } from '@playwright/test'

const resumeList = [
  {
    id: 'resume-1',
    name: 'AI Resume',
    basic: {
      name: 'Alice',
      gender: '',
      phone: '',
      email: '',
      position: 'Frontend Engineer',
      expectedSalary: '',
      location: '',
      summary: ''
    },
    education: [],
    work: [],
    project: [],
    skills: [],
    awards: [],
    selfEvaluation: {
      content: '',
      keywords: []
    },
    moduleOrder: ['basic', 'education', 'work', 'project', 'skills', 'awards', 'selfEvaluation'],
    createdAt: '2026-04-13T00:00:00.000Z',
    updatedAt: '2026-04-13T00:00:00.000Z'
  }
]

test.describe('AI Generate Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((payload) => {
      window.localStorage.setItem('userToken', 'user-token')
      window.localStorage.setItem('resumeList', JSON.stringify(payload.resumeList))
      window.localStorage.setItem('currentResumeId', JSON.stringify('resume-1'))
      window.localStorage.setItem('activeTemplate', JSON.stringify('business'))
    }, { resumeList })
  })

  test('sends generation through /api/ai/generate and renders the result', async ({ page }) => {
    let requestUrl = ''

    await page.route('**/api/ai/generate', async (route) => {
      requestUrl = route.request().url()

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          msg: 'ok',
          data: {
            content: 'Generated resume content'
          }
        })
      })
    })

    await page.goto('/')
    await page.locator('.ai-generate-card input').first().fill('Frontend Engineer')
    await page.locator('.ai-generate-card .el-button--primary').first().click()

    await expect.poll(() => requestUrl).toContain('/api/ai/generate')
    await expect.poll(() => requestUrl).not.toContain(':3001')
    await expect(page.getByText('Generated resume content')).toBeVisible()
  })
})
