import { test as base, expect } from '@playwright/test';
import { baseFixture } from '@civitas-cerebrum/element-interactions';

// Extend with baseFixture for Steps API + element repository
const baseTest = baseFixture(base, 'data/page-repository.json');

// Test user credentials from seed data
export const TEST_USERS = {
  user1: {
    email: 'testuser1@bookhive.test',
    password: 'Test1234!',
    username: 'testuser1',
  },
  user2: {
    email: 'testuser2@bookhive.test',
    password: 'Test1234!',
    username: 'testuser2',
  },
};

// API endpoints
export const API_BASE = 'http://localhost:8080';

// Define additional fixture types
type TestFixtures = {
  resetApp: () => Promise<void>;
  loginAs: (user: 'user1' | 'user2') => Promise<void>;
};

// Extended test with custom helpers
export const test = baseTest.extend<TestFixtures>({
  resetApp: async ({ page }, use) => {
    const reset = async () => {
      // Navigate to a safe page first to prevent 401 redirect loops
      await page.goto('/login');
      const response = await page.request.post(`${API_BASE}/api/reset`);
      expect(response.ok()).toBeTruthy();
    };
    await use(reset);
  },

  loginAs: async ({ page, steps }, use) => {
    const login = async (user: 'user1' | 'user2') => {
      const credentials = TEST_USERS[user];
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      await page.locator('[data-testid="login-email"]').fill(credentials.email);
      await page.locator('[data-testid="login-password"]').fill(credentials.password);
      await page.locator('[data-testid="login-submit"]').click();
      await page.waitForURL('/', { timeout: 10000 });
    };
    await use(login);
  },
});

export { expect };
