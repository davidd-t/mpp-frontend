import { test, expect } from '@playwright/test'

test.describe('Detail View & Chat', () => {
  test('clicking a codebase name opens detail page', async ({ page }) => {
    await page.goto('#/dashboard')

    await page.locator('button:has-text("api-gateway")').first().click()

    await expect(page.locator('h1:has-text("api-gateway")')).toBeVisible()
    await expect(page.locator('text=Central API gateway')).toBeVisible()

    await expect(page.locator('text=main.py')).toBeVisible()
    await expect(page.locator('text=RAG Chat Interface')).toBeVisible()
  })

  test('can send a chat message and get a reply', async ({ page }) => {
    await page.goto('#/codebases/c1')

    await page.locator('input[placeholder="Ask something..."]').fill('What does this code do?')
    await page.locator('button:has-text("Send")').click()

    const userMsg = page.locator('.ml-auto.bg-cyan-500')
    await expect(userMsg).toHaveCount(1)

    await expect(page.locator('text=I found relevant info')).toBeVisible()
  })

  test('back to dashboard button works from detail', async ({ page }) => {
    await page.goto('#/codebases/c1')
    await expect(page.locator('h1:has-text("api-gateway")')).toBeVisible()

    await page.locator('button:has-text("Back to dashboard")').click()

    await expect(page.locator('h1:has-text("Codebases")')).toBeVisible()
  })

  test('delete from detail page redirects to dashboard', async ({ page }) => {
    await page.goto('#/codebases/c1')
    await expect(page.locator('h1:has-text("api-gateway")')).toBeVisible()

    await page.locator('button:has-text("Delete")').click()

    await expect(page.locator('h1:has-text("Codebases")')).toBeVisible()

    await expect(page.locator('td >> text=api-gateway')).not.toBeVisible()
  })
})
