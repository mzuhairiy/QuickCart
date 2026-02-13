import { test, expect } from '../fixtures/auth.fixture.js';

test.describe('Seller Dashboard', () => {
  test('seller can access seller dashboard', async ({ page, authenticatedAs }) => {
    await authenticatedAs('seller');
    await page.goto('/seller');

    // Minimal assertion: page loads
    await expect(page).toHaveURL(/\/seller/);
  });

  test('regular user can access seller dashboard', async ({ page, authenticatedAs }) => {
    await authenticatedAs('user');
    await page.goto('/seller');

    // Minimal assertion: page loads (no RBAC implemented yet)
    await expect(page).toHaveURL(/\/seller/);
  });
});
