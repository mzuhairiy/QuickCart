# E2E Authentication Test Design

**Date:** 2025-02-13
**Project:** QuickCart
**Author:** Design Document

## Overview

End-to-end testing setup for QuickCart authentication flow using Playwright with mocked Clerk authentication state. This approach enables fast, reliable testing of authenticated pages without external dependencies.

**Scope:** Authentication flow E2E tests (Phase 1 - user authentication state verification)

## Architecture

```
tests/
├── fixtures/
│   ├── auth.fixture.js       # Custom Playwright fixture for auth state management
│   └── users.js              # Mock user data (user, seller roles)
├── utils/
│   └── mock-auth.js          # Helper functions to set mock auth data
├── e2e/
│   ├── auth-flow.spec.js     # Auth state and redirect tests
│   ├── cart.spec.js          # Cart page tests
│   └── seller.spec.js        # Seller dashboard tests
└── playwright.config.js      # Playwright configuration
```

**Key Approach:** Pre-populate Clerk's browser storage (localStorage/sessionStorage) to simulate authenticated state without network calls.

## Core Components

### 1. Auth Fixture (`tests/fixtures/auth.fixture.js`)

Custom Playwright extension providing auth state management:

- `authenticatedAs(role)` - Sets up auth state for 'user' or 'seller'
- `unauthenticate()` - Clears auth state for testing public pages
- `getUserData()` - Returns current mock user data

Usage example:
```javascript
test('view my orders page', async ({ authenticatedAs }) => {
  await authenticatedAs('user');
  await page.goto('/my-orders');
  await expect(page.locator('h1, h2')).toBeVisible();
});
```

### 2. Mock Auth Utils (`tests/utils/mock-auth.js`)

Helper functions that manipulate Clerk's storage structure:

- `setMockAuthState(page, userData)` - Writes Clerk session data to storage
- `clearAuthState(page)` - Removes all Clerk-related storage entries
- `getMockUser(role)` - Returns test user data for specified role

### 3. Playwright Config (`playwright.config.js`)

Configuration includes:
- Base URL for local development server
- Test timeout and retry settings
- Viewport configuration for responsive testing
- Reporter setup (HTML/CLI format)
- Trace and screenshot capture on failures

### 4. Test Data (`tests/fixtures/users.js`)

Static mock user data:

```javascript
export const testUsers = {
  user: { id: 'test-user-1', name: 'Test User', email: 'test@example.com' },
  seller: { id: 'test-seller-1', name: 'Test Seller', email: 'seller@example.com' }
};
```

## Data Flow

1. Test starts with isolated browser context (empty storage)
2. Fixture calls `authenticatedAs('user')`
3. `mock-auth.js` generates Clerk session payload
4. Playwright injects payload into browser storage:
   - Sets `__clerk_client_jwt` (session token)
   - Sets `__clerk_db` (user data cache)
   - Sets Clerk-related cookies
5. Test navigates to page → App reads Clerk auth state from storage
6. Page renders as if user is authenticated
7. Test performs minimal assertions
8. Context cleanup → Storage cleared, next test gets fresh state

**Key Insight:** Clerk's React SDK reads from browser storage to determine auth state. By pre-populating that storage, we simulate authentication without network calls.

## Error Handling

### Types of Errors Handled

1. **Navigation Errors:** Check for 404s and handle failed navigations
2. **Auth State Validation:** Verify auth state was set correctly before tests
3. **Test Isolation Failures:** Ensure clean state between tests via Playwright config
4. **Flaky Test Prevention:** Use `waitFor()` and `waitForSelector()` instead of hard timeouts

### Debugging Artifacts
- Screenshots: captured only on failure
- Trace files: retained on failure for debugging
- Clear error messages: no silent failures

## Testing Strategy

### Initial Test Suite (Minimal Assertions First)

**Suite 1: Authentication State** (`auth-flow.spec.js`)
- Unauthenticated user can access home page
- Authenticated user can access my-orders page
- Unauthenticated user is redirected from my-orders page

**Suite 2: Cart Page** (`cart.spec.js`)
- Authenticated user can view cart page
- Cart page displays cart items from userData

**Suite 3: Seller Dashboard** (`seller.spec.js`)
- Seller can access seller dashboard
- Non-seller cannot access seller dashboard

### Phase-Based Approach

**Phase 1:** Smoke tests - Verify pages load without errors
**Phase 2:** Access control - Test redirects and role-based access
**Phase 3:** Functionality - Add page-specific tests only when needed

### Test Organization

- File naming: `.spec.js` extension (Playwright convention)
- Grouping: Use `test.describe()` for related tests
- Setup: Use `test.beforeEach()` for common auth setup
- Independence: Each test runs independently in any order

### Naming Convention

Test names describe user behavior, not implementation:
- ✅ `"seller can view orders"`
- ❌ `"seller page renders when role is seller"`

## Dependencies to Install

```bash
npm install -D @playwright/test
npx playwright install
```

## Next Steps

1. Install Playwright and dependencies
2. Create directory structure
3. Implement mock-auth utilities
4. Create auth fixture
5. Write Phase 1 smoke tests
6. Run tests and verify
7. Add Phase 2 tests as needed
