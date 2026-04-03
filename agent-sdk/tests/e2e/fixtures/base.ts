import { test as base, expect, Page } from '@playwright/test';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load page repository
const __dirname = dirname(fileURLToPath(import.meta.url));
const pageRepositoryPath = join(__dirname, '..', 'data', 'page-repository.json');
const pageRepository = JSON.parse(readFileSync(pageRepositoryPath, 'utf-8'));

/**
 * Extended test fixture with page repository and helper methods
 */
export interface PageRepository {
  [pageName: string]: {
    [elementName: string]: string;
  };
}

export interface TestHelpers {
  getSelector: (pageName: string, elementName: string) => string;
  waitForPageLoad: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  addToCart: (bookId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const test = base.extend<{ helpers: TestHelpers }>({
  helpers: async ({ page }, use) => {
    const helpers: TestHelpers = {
      /**
       * Get selector from page repository
       */
      getSelector: (pageName: string, elementName: string): string => {
        const repo = pageRepository as PageRepository;
        if (!repo[pageName]) {
          throw new Error(`Page "${pageName}" not found in page repository`);
        }
        if (!repo[pageName][elementName]) {
          throw new Error(`Element "${elementName}" not found on page "${pageName}"`);
        }
        return repo[pageName][elementName];
      },

      /**
       * Wait for page to fully load
       */
      waitForPageLoad: async (): Promise<void> => {
        await page.waitForLoadState('networkidle');
      },

      /**
       * Login with credentials
       */
      login: async (email: string, password: string): Promise<void> => {
        await page.goto('/login');
        await page.getByPlaceholder('Email').fill(email);
        await page.getByPlaceholder('Password').fill(password);
        await page.locator("button:has-text('Sign In')").click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
      },

      /**
       * Add book to cart via UI
       */
      addToCart: async (bookId: string): Promise<void> => {
        await page.goto(`/books/${bookId}`);
        await page.waitForLoadState('networkidle');
        const addButton = page.locator("button:has-text('Add to Cart')");
        if (await addButton.isVisible()) {
          await addButton.click();
          await page.waitForTimeout(500);
        }
      },

      /**
       * Clear cart via UI
       */
      clearCart: async (): Promise<void> => {
        await page.goto('/cart');
        await page.waitForLoadState('networkidle');
        const clearButton = page.locator("button:has-text('Clear cart')");
        if (await clearButton.isVisible()) {
          await clearButton.click();
          await page.waitForTimeout(500);
        }
      },
    };

    await use(helpers);
  },
});

export { expect };
export { pageRepository };
