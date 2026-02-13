import { test, expect } from '../fixtures/auth.fixture.js';

test.describe('Cart Page', () => {
  test('authenticated user can view cart page', async ({ page, authenticatedAs }) => {
    await authenticatedAs('user');
    await page.goto('/cart');

    // Minimal assertion: page loads
    await expect(page).toHaveURL(/\/cart/);
  });
});
