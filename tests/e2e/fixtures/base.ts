import { test as baseTest, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Load page repository
const pageRepositoryPath = path.join(__dirname, '../data/page-repository.json');
const pageRepository = JSON.parse(fs.readFileSync(pageRepositoryPath, 'utf-8'));

// Helper to get selector from page repository
export function getSelector(pageName: string, elementName: string): string {
  const page = pageRepository[pageName];
  if (!page) {
    throw new Error(`Page "${pageName}" not found in page-repository.json`);
  }
  const selector = page[elementName];
  if (!selector) {
    throw new Error(`Element "${elementName}" not found in page "${pageName}" in page-repository.json`);
  }
  return selector;
}

// Helper for dynamic selectors with IDs
export function getDynamicSelector(pageName: string, elementName: string, id: string): string {
  const prefix = getSelector(pageName, elementName);
  return `${prefix}${id}']`;
}

// Test user credentials for authenticated tests
export const testUser = {
  email: 'test@bookhive.com',
  password: 'Test123!@#',
  username: 'testuser'
};

// API base URL
export const API_BASE_URL = 'http://localhost:8080';

// Helper to create a unique test user
export function generateTestUser() {
  const timestamp = Date.now();
  return {
    email: `test${timestamp}@bookhive.com`,
    password: 'Test123!@#',
    username: `testuser${timestamp}`
  };
}

// Sign up a user through the UI
export async function signupUserViaUI(page: Page, username: string, email: string, password: string): Promise<void> {
  await page.goto('/signup');
  await page.fill(getSelector('SignupPage', 'usernameInput'), username);
  await page.fill(getSelector('SignupPage', 'emailInput'), email);
  await page.fill(getSelector('SignupPage', 'passwordInput'), password);
  await page.click(getSelector('SignupPage', 'submitButton'));
  await page.waitForURL('/', { timeout: 15000 });
}

// Extended test with custom fixtures
export const test = baseTest.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    // Create a test user via UI signup
    const user = generateTestUser();

    await signupUserViaUI(page, user.username, user.email, user.password);

    await use(page);
  },
});

export { expect };

// Helper functions for common test operations
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.clear());
}

export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
}

// Login helper for tests that need authentication
export async function loginUser(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.fill(getSelector('LoginPage', 'emailInput'), email);
  await page.fill(getSelector('LoginPage', 'passwordInput'), password);
  await page.click(getSelector('LoginPage', 'submitButton'));
  await page.waitForURL('/', { timeout: 10000 });
}

// Register a new user via API (use as fallback)
export async function registerUserViaAPI(username: string, email: string, password: string): Promise<Response> {
  return fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
}
