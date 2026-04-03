import { test as base, expect, Page, APIRequestContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Load page repository
const pageRepository = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/page-repository.json'), 'utf-8')
);

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

// Helper to get selector from page repository
export function getSelector(pageName: string, elementName: string, id?: string): string {
  const page = pageRepository[pageName];
  if (!page) {
    throw new Error(`Page "${pageName}" not found in page repository`);
  }
  let selector = page[elementName];
  if (!selector) {
    throw new Error(`Element "${elementName}" not found in page "${pageName}"`);
  }
  // Replace template placeholder with actual id if provided
  if (id && selector.includes('{id}')) {
    selector = selector.replace('{id}', id);
  }
  return selector;
}

// Define fixtures type
type TestFixtures = {
  resetApp: () => Promise<void>;
  loginAs: (user: 'user1' | 'user2') => Promise<void>;
  selector: (pageName: string, elementName: string, id?: string) => string;
  apiRequest: APIRequestContext;
};

// Extended test fixture with helpers
export const test = base.extend<TestFixtures>({
  resetApp: async ({ request }, use) => {
    const reset = async () => {
      const response = await request.post(`${API_BASE}/api/reset`);
      expect(response.ok()).toBeTruthy();
    };
    await use(reset);
  },

  loginAs: async ({ page }, use) => {
    const login = async (user: 'user1' | 'user2') => {
      const credentials = TEST_USERS[user];
      await page.goto('/login');
      await page.locator(getSelector('LoginPage', 'emailInput')).fill(credentials.email);
      await page.locator(getSelector('LoginPage', 'passwordInput')).fill(credentials.password);
      await page.locator(getSelector('LoginPage', 'submitButton')).click();
      // Wait for login to complete
      await page.waitForURL('/', { timeout: 10000 });
    };
    await use(login);
  },

  selector: async ({}, use) => {
    await use(getSelector);
  },

  apiRequest: async ({ request }, use) => {
    await use(request);
  },
});

export { expect };
