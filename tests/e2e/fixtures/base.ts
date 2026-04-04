import { test as base, expect } from '@playwright/test';
import { baseFixture } from '@civitas-cerebrum/element-interactions';
import * as fs from 'fs';
import * as path from 'path';

// Extend with baseFixture for Steps API + element repository
const baseTest = baseFixture(base, 'data/page-repository.json');

// Load flat page repository for getSelector helper
const flatRepoPath = path.join(__dirname, '../data/page-repository-flat.json');
let flatPageRepository: Record<string, Record<string, string>> = {};
if (fs.existsSync(flatRepoPath)) {
  flatPageRepository = JSON.parse(fs.readFileSync(flatRepoPath, 'utf-8'));
}

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

// Helper to get selector from flat page repository
export function getSelector(pageName: string, elementName: string, id?: string): string {
  const page = flatPageRepository[pageName];
  if (!page) {
    throw new Error(`Page "${pageName}" not found in page repository`);
  }
  let selector = page[elementName];
  if (!selector) {
    throw new Error(`Element "${elementName}" not found in page "${pageName}"`);
  }
  if (id && selector.includes('{id}')) {
    selector = selector.replace('{id}', id);
  }
  return selector;
}

// Define additional fixture types
type TestFixtures = {
  resetApp: () => Promise<void>;
  loginAs: (user: 'user1' | 'user2') => Promise<void>;
};

// Extended test with custom helpers
export const test = baseTest.extend<TestFixtures>({
  resetApp: async ({ page }, use) => {
    const reset = async () => {
      const response = await page.request.post(`${API_BASE}/api/reset`);
      expect(response.ok()).toBeTruthy();
    };
    await use(reset);
  },

  loginAs: async ({ page }, use) => {
    const login = async (user: 'user1' | 'user2') => {
      const credentials = TEST_USERS[user];
      await page.goto('/login');
      await page.locator('[data-testid="login-email"]').fill(credentials.email);
      await page.locator('[data-testid="login-password"]').fill(credentials.password);
      await page.locator('[data-testid="login-submit"]').click();
      await page.waitForURL('/', { timeout: 10000 });
    };
    await use(login);
  },
});

export { expect };
