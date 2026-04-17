import { expect, test } from '@playwright/test'

const resumeList = [
  {
    id: 'resume-1',
    name: 'Preview Resume',
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

test.describe('PDF Export Preparation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((payload) => {
      window.localStorage.setItem('userToken', 'preview-user-token')
      window.localStorage.setItem('userInfo', JSON.stringify({ id: 1, username: 'alice' }))
      window.localStorage.setItem('resumeList', JSON.stringify(payload.resumeList))
      window.localStorage.setItem('currentResumeId', JSON.stringify('resume-1'))
      window.localStorage.setItem('activeTemplate', JSON.stringify('business'))
    }, { resumeList })

    await page.goto('/')
  })

  test('renders a dedicated export root in preview mode', async ({ page }) => {
    await page.locator('.mode-toggle .el-button--success').click()

    await expect(page.locator('.resume-export-root')).toBeVisible()
  })
})
