import { test as base } from '@playwright/test';
import { setMockAuthState, clearAuthState } from '../utils/mock-auth.js';

// Extend base test with auth fixtures
export const test = base.extend({
  // Fixture to authenticate as a specific role
  authenticatedAs: async ({ page }, use) => {
    // This function will be called by tests with the role
    const authHelper = async (role = 'user') => {
      await setMockAuthState(page, role);
    };
    await use(authHelper);
  },

  // Fixture to ensure user is unauthenticated
  unauthenticated: async ({ page }, use) => {
    await clearAuthState(page);
    await use(true);
  },
});

export const expect = test.expect;
