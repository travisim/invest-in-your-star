import { test, expect } from '@playwright/test';

test('example test - check Playwright is working', async ({ page }) => {
  // Navigate to a simple page to test Playwright
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link on Playwright site', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});

test('check navigation', async ({ page }) => {
  await page.goto('https://example.com');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Check that we're on a valid page
  await expect(page).toHaveTitle(/Example Domain/);
  
  // Check for heading
  await expect(page.getByRole('heading', { name: 'Example Domain' })).toBeVisible();
});
