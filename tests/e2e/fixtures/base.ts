import { test as base, expect, Page } from '@playwright/test';
import pageRepository from '../data/page-repository.json';

// Test data constants
export const TEST_USER_1 = {
  email: 'testuser1@bookhive.test',
  password: 'Test1234!',
  username: 'testuser1'
};

export const TEST_USER_2 = {
  email: 'testuser2@bookhive.test',
  password: 'Test1234!',
  username: 'testuser2'
};

export const API_BASE_URL = 'http://localhost:8080';

// Helper type for page repository
type PageRepository = typeof pageRepository;

// Custom test fixture with helpers
export const test = base.extend<{
  pageRepo: PageRepository;
  loginAs: (email: string, password: string) => Promise<void>;
  resetApp: () => Promise<void>;
  seedApp: () => Promise<void>;
}>({
  pageRepo: async ({}, use) => {
    await use(pageRepository);
  },

  loginAs: async ({ page }, use) => {
    const login = async (email: string, password: string) => {
      await page.goto('/login');
      await page.getByTestId('login-email').fill(email);
      await page.getByTestId('login-password').fill(password);
      await page.getByTestId('login-submit').click();
      // Wait for navigation after successful login
      await page.waitForURL(/^(?!.*\/login).*$/);
    };
    await use(login);
  },

  resetApp: async ({ request }, use) => {
    const reset = async () => {
      await request.post(`${API_BASE_URL}/api/reset`);
    };
    await use(reset);
  },

  seedApp: async ({ request }, use) => {
    const seed = async () => {
      await request.post(`${API_BASE_URL}/api/seed`);
    };
    await use(seed);
  },
});

export { expect };

// Helper functions
export async function getSelector(page: Page, pageKey: string, elementKey: string): Promise<string> {
  const pageSelectors = (pageRepository as any)[pageKey];
  if (!pageSelectors) {
    throw new Error(`Page "${pageKey}" not found in page repository`);
  }
  const selector = pageSelectors[elementKey];
  if (!selector) {
    throw new Error(`Element "${elementKey}" not found in page "${pageKey}"`);
  }
  return selector;
}

export async function waitForApiResponse(page: Page, urlPattern: string | RegExp): Promise<any> {
  const response = await page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    }
  );
  return response.json();
}
