import { test, expect } from '@playwright/test'

test.describe('Navigation & Auth', () => {
  test('home page shows app name and buttons', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('text=SourceStream').first()).toBeVisible()
    await expect(page.locator('text=Your Hub for Code')).toBeVisible()

    await expect(page.locator('text=Get Started')).toBeVisible()
    await expect(page.locator('text=View Dashboard')).toBeVisible()
  })

  test('can navigate from home to login page', async ({ page }) => {
    await page.goto('/')

    await page.locator('text=Sign in').click()

    await expect(page.locator('text=Welcome back')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('can switch between login and register', async ({ page }) => {
    await page.goto('#/login')

    await expect(page.locator('text=Welcome back')).toBeVisible()

    await page.locator('text=Sign up').click()

    await expect(page.locator('text=Create account')).toBeVisible()

    await page.locator('text=Log in').click()
    await expect(page.locator('text=Welcome back')).toBeVisible()
  })

  test('login redirects to dashboard', async ({ page }) => {
    await page.goto('#/login')

    await page.locator('input[type="email"]').fill('test@example.com')
    await page.locator('input[type="password"]').fill('password123')

    await page.locator('button:has-text("Sign in")').click()

    await expect(page.locator('text=Codebases')).toBeVisible()
    await expect(page.locator('text=+ Add codebase')).toBeVisible()
  })

  test('Get Started button goes to register', async ({ page }) => {
    await page.goto('/')
    await page.locator('text=Get Started').click()
    await expect(page.locator('text=Create account')).toBeVisible()
  })

  test('View Dashboard button goes to dashboard', async ({ page }) => {
    await page.goto('/')
    await page.locator('text=View Dashboard').click()
    await expect(page.locator('text=Codebases')).toBeVisible()
  })
})
