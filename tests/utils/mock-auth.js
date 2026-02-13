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

  // Set Clerk cookies for server-side middleware
  const domain = 'localhost';
  await page.context().addCookies([
    {
      name: '__session',
      value: `mock-session-token-${userData.id}`,
      domain,
      path: '/',
      httpOnly: true,
      secure: false, // false for http/localhost
      sameSite: 'Lax',
    },
  ]);

  // Set Clerk storage via page script for client-side SDK
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
  // Clear cookies
  await page.context().clearCookies();

  // Clear localStorage
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
