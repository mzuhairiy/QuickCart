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

test.describe('Authentication Flow - My Orders', () => {
  test('authenticated user can access my-orders page', async ({ page, authenticatedAs }) => {
    await authenticatedAs('user');
    await page.goto('/my-orders');

    // Minimal assertion: page loads without redirecting
    await expect(page).toHaveURL(/\/my-orders/);
  });

  test('unauthenticated user can access my-orders page', async ({ page, unauthenticated }) => {
    await unauthenticated;
    await page.goto('/my-orders');

    // Minimal assertion: page loads (no auth guard implemented yet)
    await expect(page).toHaveURL(/\/my-orders/);
  });
});
