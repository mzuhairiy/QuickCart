import { test, expect } from '../fixtures/auth.fixture.js';

test.describe('Authentication Flow - Home Page', () => {
  test('unauthenticated user can access home page', async ({ page, unauthenticated }) => {
    await unauthenticated;
    await page.goto('/');

    // Minimal assertion: page has a heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });
});
