# E2E Authentication Test Setup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up Playwright-based end-to-end testing for QuickCart authentication flow with mocked Clerk auth state, enabling fast, reliable tests for authenticated pages.

**Architecture:** Use Playwright to pre-populate Clerk's browser storage (localStorage/sessionStorage) with mock session data, simulating authenticated state without network calls to Clerk.

**Tech Stack:** Playwright (@playwright/test), JavaScript/ES modules, QuickCart (Next.js + Clerk)

---

## Task 1: Install Playwright and dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install Playwright**

Run:
```bash
npm install -D @playwright/test
```

Expected: Playwright added to devDependencies in package.json

**Step 2: Install Playwright browsers**

Run:
```bash
npx playwright install chromium
```

Expected: Chromium browser downloaded (shows installation progress)

**Step 3: Verify installation**

Run:
```bash
npx playwright --version
```

Expected: Version number displayed (e.g., "Version 1.x.x")

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "test: install playwright and chromium browser

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create Playwright configuration

**Files:**
- Create: `playwright.config.js`

**Step 1: Create base Playwright config**

Create `playwright.config.js`:

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Step 2: Commit**

```bash
git add playwright.config.js
git commit -m "test: add playwright configuration

Set up Playwright with:
- Chromium on Desktop Chrome
- HTML reporter with traces/screenshots on failure
- Dev server auto-start

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create test directory structure

**Files:**
- Create: `tests/fixtures/`
- Create: `tests/utils/`
- Create: `tests/e2e/`

**Step 1: Create directories**

Run:
```bash
mkdir -p tests/fixtures tests/utils tests/e2e
```

Expected: No output, directories created

**Step 2: Create placeholder files**

Run:
```bash
touch tests/fixtures/.gitkeep tests/utils/.gitkeep tests/e2e/.gitkeep
```

**Step 3: Commit**

```bash
git add tests/
git commit -m "test: create test directory structure

Add fixtures, utils, and e2e directories.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create mock user data fixture

**Files:**
- Create: `tests/fixtures/users.js`

**Step 1: Write test user data**

Create `tests/fixtures/users.js`:

```javascript
// Mock user data for E2E tests
export const testUsers = {
  user: {
    id: 'test-user-1',
    name: 'Test User',
    email: 'test@example.com',
    imageUrl: 'https://example.com/avatar-user.png',
  },
  seller: {
    id: 'test-seller-1',
    name: 'Test Seller',
    email: 'seller@example.com',
    imageUrl: 'https://example.com/avatar-seller.png',
  },
};
```

**Step 2: Commit**

```bash
git add tests/fixtures/users.js
git commit -m "test: add mock user data fixture

Define test users for standard user and seller roles.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create mock auth utilities

**Files:**
- Create: `tests/utils/mock-auth.js`

**Step 1: Write auth state helper functions**

Create `tests/utils/mock-auth.js`:

```javascript
import { testUsers } from '../fixtures/users.js';

// Clerk storage keys (based on Clerk's implementation)
const CLERK_STORAGE_KEYS = {
  JWT: '__clerk_client_jwt',
  DB: '__clerk_db',
};

/**
 * Generate a mock Clerk session payload
 */
function generateClerkSession(userData) {
  return {
    user: {
      id: userData.id,
      firstName: userData.name.split(' ')[0],
      lastName: userData.name.split(' ')[1] || '',
      imageUrl: userData.imageUrl,
      primaryEmailAddress: {
        emailAddress: userData.email,
      },
    },
    sessions: [
      {
        id: `sess_${userData.id}`,
        userId: userData.id,
        status: 'active',
        lastActiveAt: Date.now(),
        expireAt: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
      },
    ],
  };
}

/**
 * Set mock authentication state in browser storage
 */
export async function setMockAuthState(page, role = 'user') {
  const userData = testUsers[role];
  if (!userData) {
    throw new Error(`Unknown role: ${role}. Use 'user' or 'seller'`);
  }

  const clerkSession = generateClerkSession(userData);

  // Set Clerk storage via page script
  await page.addInitScript(({ session, jwtKey, dbKey }) => {
    localStorage.setItem(jwtKey, 'mock-jwt-token');
    localStorage.setItem(dbKey, JSON.stringify(session));
  }, {
    session: clerkSession,
    jwtKey: CLERK_STORAGE_KEYS.JWT,
    dbKey: CLERK_STORAGE_KEYS.DB,
  });
}

/**
 * Clear all Clerk authentication state
 */
export async function clearAuthState(page) {
  await page.addInitScript(({ jwtKey, dbKey }) => {
    localStorage.removeItem(jwtKey);
    localStorage.removeItem(dbKey);
  }, {
    jwtKey: CLERK_STORAGE_KEYS.JWT,
    dbKey: CLERK_STORAGE_KEYS.DB,
  });
}

/**
 * Get mock user data by role
 */
export function getMockUser(role) {
  return testUsers[role];
}
```

**Step 2: Commit**

```bash
git add tests/utils/mock-auth.js
git commit -m "test: add mock auth utilities

Implement helpers to set/clear Clerk auth state in browser storage.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create custom auth fixture

**Files:**
- Create: `tests/fixtures/auth.fixture.js`

**Step 1: Write auth fixture with test extend**

Create `tests/fixtures/auth.fixture.js`:

```javascript
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
```

**Step 2: Commit**

```bash
git add tests/fixtures/auth.fixture.js
git commit -m "test: add custom auth fixture

Extend Playwright test with authenticatedAs and unauthenticated fixtures.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Write first smoke test - home page

**Files:**
- Create: `tests/e2e/auth-flow.spec.js`

**Step 1: Write failing test for home page**

Create `tests/e2e/auth-flow.spec.js`:

```javascript
import { test } from '../fixtures/auth.fixture.js';

test.describe('Authentication Flow - Home Page', () => {
  test('unauthenticated user can access home page', async ({ page, unauthenticated }) => {
    await unauthenticated;
    await page.goto('/');

    // Minimal assertion: page has a heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });
});
```

**Step 2: Run test to verify it works**

Run:
```bash
npx playwright test
```

Expected: Test PASSES (dev server starts, home page loads)

**Step 3: Commit**

```bash
git add tests/e2e/auth-flow.spec.js
git commit -m "test: add smoke test for home page

Verify unauthenticated users can access the home page.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Write test for authenticated page - my-orders

**Files:**
- Modify: `tests/e2e/auth-flow.spec.js`

**Step 1: Add test for authenticated my-orders page**

Add to `tests/e2e/auth-flow.spec.js`:

```javascript
test.describe('Authentication Flow - My Orders', () => {
  test('authenticated user can access my-orders page', async ({ page, authenticatedAs }) => {
    await authenticatedAs('user');
    await page.goto('/my-orders');

    // Minimal assertion: page loads without redirecting
    await expect(page).toHaveURL(/\/my-orders/);
  });

  test('unauthenticated user is redirected from my-orders page', async ({ page, unauthenticated }) => {
    await unauthenticated;
    await page.goto('/my-orders');

    // Minimal assertion: redirected away from my-orders
    await expect(page).not.toHaveURL(/\/my-orders/);
  });
});
```

**Step 2: Run tests to verify behavior**

Run:
```bash
npx playwright test
```

Expected: Both tests PASS (auth state works, redirects work)

**Step 3: Commit**

```bash
git add tests/e2e/auth-flow.spec.js
git commit -m "test: add tests for my-orders access control

Verify authenticated access and unauthenticated redirect.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Write test for cart page

**Files:**
- Create: `tests/e2e/cart.spec.js`

**Step 1: Write cart page test**

Create `tests/e2e/cart.spec.js`:

```javascript
import { test } from '../fixtures/auth.fixture.js';

test.describe('Cart Page', () => {
  test('authenticated user can view cart page', async ({ page, authenticatedAs }) => {
    await authenticatedAs('user');
    await page.goto('/cart');

    // Minimal assertion: page loads
    await expect(page).toHaveURL(/\/cart/);
  });
});
```

**Step 2: Run test**

Run:
```bash
npx playwright test tests/e2e/cart.spec.js
```

Expected: Test PASSES

**Step 3: Commit**

```bash
git add tests/e2e/cart.spec.js
git commit -m "test: add smoke test for cart page

Verify authenticated users can access the cart page.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Write tests for seller dashboard

**Files:**
- Create: `tests/e2e/seller.spec.js`

**Step 1: Write seller dashboard tests**

Create `tests/e2e/seller.spec.js`:

```javascript
import { test } from '../fixtures/auth.fixture.js';

test.describe('Seller Dashboard', () => {
  test('seller can access seller dashboard', async ({ page, authenticatedAs }) => {
    await authenticatedAs('seller');
    await page.goto('/seller');

    // Minimal assertion: page loads
    await expect(page).toHaveURL(/\/seller/);
  });

  test('regular user cannot access seller dashboard', async ({ page, authenticatedAs }) => {
    await authenticatedAs('user');
    await page.goto('/seller');

    // Minimal assertion: redirected away
    await expect(page).not.toHaveURL(/\/seller/);
  });
});
```

**Step 2: Run seller tests**

Run:
```bash
npx playwright test tests/e2e/seller.spec.js
```

Expected: Tests PASS (seller access, user denied)

**Step 3: Commit**

```bash
git add tests/e2e/seller.spec.js
git commit -m "test: add seller dashboard access control tests

Verify sellers can access and regular users are denied.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Update package.json with test script

**Files:**
- Modify: `package.json`

**Step 1: Add test script**

Add `"test:e2e": "playwright test"` to scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test:e2e": "playwright test"
  }
}
```

**Step 2: Verify test script works**

Run:
```bash
npm run test:e2e
```

Expected: All tests run and pass

**Step 3: Commit**

```bash
git add package.json
git commit -m "test: add npm script for E2E tests

Add test:e2e script for running Playwright tests.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 12: Verify all tests pass

**Files:**
- None (verification task)

**Step 1: Run full test suite**

Run:
```bash
npx playwright test
```

Expected: All 6 tests PASS:
- Home page (unauthenticated)
- My-orders (authenticated)
- My-orders redirect (unauthenticated)
- Cart page (authenticated)
- Seller dashboard (seller)
- Seller redirect (user)

**Step 2: View HTML report**

Run:
```bash
npx playwright show-report
```

Expected: HTML report opens in browser showing all passed tests

**Step 3: Final commit (if any adjustments needed)**

If you made any fixes during verification:

```bash
git add -A
git commit -m "test: final adjustments to E2E test suite

All tests passing with minimal assertions.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 13: Update documentation

**Files:**
- Modify: `README.md`

**Step 1: Add testing section to README**

Add to `README.md` after "Getting Started" section:

```markdown
## Testing

### E2E Tests

This project uses Playwright for end-to-end testing with mocked Clerk authentication.

**Run all E2E tests:**
```bash
npm run test:e2e
```

**Run specific test file:**
```bash
npx playwright test tests/e2e/auth-flow.spec.js
```

**Run tests in headed mode (see browser):**
```bash
npx playwright test --headed
```

**View test report:**
```bash
npx playwright show-report
```

**Test structure:**
- `tests/e2e/` - Test files
- `tests/fixtures/` - Reusable fixtures and test data
- `tests/utils/` - Helper functions
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add E2E testing documentation

Document Playwright setup, test commands, and structure.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Completion Checklist

- [ ] Playwright installed and configured
- [ ] Mock auth utilities implemented
- [ ] Auth fixture working
- [ ] All 6 smoke tests passing
- [ ] Test script added to package.json
- [ ] README updated with testing docs
- [ ] HTML report viewable

## Next Steps (Future Enhancements)

After completing this plan, consider:

1. **Add CI integration** - Run tests in GitHub Actions
2. **Phase 2 tests** - Add more detailed assertions as needed
3. **Visual regression** - Add screenshot comparison tests
4. **API mocking** - Use MSW for more complex scenarios

Remember: YAGNI - only add these when you actually need them.
