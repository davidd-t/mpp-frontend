import { test, expect } from '@playwright/test'

test.describe('CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('#/dashboard')
  })

  test('dashboard shows initial codebases in table', async ({ page }) => {
    await expect(page.locator('text=api-gateway')).toBeVisible()
    await expect(page.locator('text=ml-pipeline')).toBeVisible()
    await expect(page.locator('text=web-client')).toBeVisible()
  })

  test('can create a new codebase', async ({ page }) => {
    await page.locator('text=+ Add codebase').click()
    await expect(page.locator('text=Add codebase').nth(1)).toBeVisible()

    await page.locator('label:has-text("Name") input').fill('my-new-project')
    await page.locator('label:has-text("Language") input').fill('Rust')
    await page.locator('label:has-text("Files") input').fill('50')
    await page.locator('label:has-text("Path") input').fill('src/my-new-project')
    await page.locator('label:has-text("Embedding") input').fill('text-embedding-3-small')
    await page.locator('label:has-text("Summary") textarea').fill('A brand new Rust project for testing')

    await page.locator('button:has-text("Save")').click()

    await expect(page.locator('text=my-new-project')).toBeVisible()
  })

  test('form validation shows errors for empty fields', async ({ page }) => {
    await page.locator('text=+ Add codebase').click()

    await page.locator('button:has-text("Save")').click()

    await expect(page.locator('text=Name must have at least 3 characters')).toBeVisible()
    await expect(page.locator('text=Language is required')).toBeVisible()
    await expect(page.locator('text=Path is required')).toBeVisible()
    await expect(page.locator('text=Embedding model is required')).toBeVisible()
    await expect(page.locator('text=Summary must have at least 5 characters')).toBeVisible()
  })

  test('can update an existing codebase', async ({ page }) => {
    await page.locator('button:has-text("Update")').first().click()

    await expect(page.locator('text=Edit api-gateway')).toBeVisible()

    const nameInput = page.locator('label:has-text("Name") input')
    await nameInput.clear()
    await nameInput.fill('api-gateway-v2')

    await page.locator('button:has-text("Save")').click()

    await expect(page.locator('text=api-gateway-v2')).toBeVisible()
  })

  test('can delete a codebase', async ({ page }) => {
    await expect(page.locator('text=api-gateway')).toBeVisible()

    await page.locator('button:has-text("Delete")').first().click()

    await expect(page.locator('td >> text=api-gateway')).not.toBeVisible()
  })

  test('search filters the table', async ({ page }) => {
    await page.locator('input[placeholder="Search codebases..."]').fill('ml')

    await expect(page.locator('text=ml-pipeline')).toBeVisible()
    await expect(page.locator('td >> text=api-gateway')).not.toBeVisible()
    await expect(page.locator('td >> text=web-client')).not.toBeVisible()
  })

  test('cancel button closes the form', async ({ page }) => {
    await page.locator('text=+ Add codebase').click()
    await expect(page.locator('text=Add codebase').nth(1)).toBeVisible()

    await page.locator('button:has-text("Cancel")').click()

    await expect(page.locator('h3:has-text("Add codebase")')).not.toBeVisible()
  })
})
