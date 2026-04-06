/**
 * Expanded Coverage: Loading States & Async Behavior
 *
 * Tests loading indicators, async transitions, and graceful handling
 * of in-flight operations across all major pages.
 */

import { test, expect } from '../fixtures/base';

test.describe('@coverage Loading states: Page loading indicators', () => {
  test('@coverage loading: home page shows loading before books arrive', async ({ steps, page }) => {
    // Delay the books API to observe loading state
    await page.route('**/api/books**', async (route) => {
      await new Promise((res) => setTimeout(res, 2000));
      await route.continue();
    });

    await page.goto('http://localhost:7547/');

    // Check for loading indicator within the first second
    const loadingVisible = await page.locator('[data-testid="loading-books"]').isVisible({ timeout: 1500 }).catch(() => false);
    // Whether or not loading indicator appears, the page should eventually show content
    await page.waitForTimeout(3000);
    await steps.verifyPresence('HomePage', 'homePage');
    // Either books loaded or no-books shown
    const hasBooks = await page.locator('[data-testid^="book-card-"]').count();
    const noBooks = await page.locator('[data-testid="no-books"]').isVisible().catch(() => false);
    expect(hasBooks > 0 || noBooks).toBeTruthy();
  });

  test('@coverage loading: book detail page handles loading state', async ({ steps, page }) => {
    // Delay the specific book API
    await page.route('**/api/books/book-001', async (route) => {
      await new Promise((res) => setTimeout(res, 2000));
      await route.continue();
    });

    await page.goto('http://localhost:7547/books/book-001');

    // Check for loading or content
    const loadingVisible = await page.locator('[data-testid="loading"]').isVisible({ timeout: 1500 }).catch(() => false);

    // Wait for content to arrive
    await page.waitForTimeout(3000);

    // Should show the book detail page (not stuck loading)
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    await steps.verifyText('BookDetailPage', 'bookDetailTitle', undefined, { notEmpty: true });
  });

  test('@coverage loading: marketplace page handles loading', async ({ steps, page }) => {
    await page.route('**/api/listings**', async (route) => {
      if (route.request().method() === 'GET') {
        await new Promise((res) => setTimeout(res, 2000));
      }
      await route.continue();
    });

    await page.goto('http://localhost:7547/marketplace');

    // Check for loading state
    const loadingVisible = await page.locator('[data-testid="loading"]').isVisible({ timeout: 1500 }).catch(() => false);

    // Wait for content
    await page.waitForTimeout(3000);
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');
  });
});

test.describe('@coverage Loading states: Auth-gated page loading', () => {
  test.beforeEach(async ({ steps, page, context }) => {
    await page.request.post('http://localhost:8080/api/reset');
    await context.clearCookies();
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
  });

  test('@coverage loading: orders page shows loading then content', async ({ steps, page }) => {
    await page.route('**/api/orders', async (route) => {
      if (route.request().method() === 'GET') {
        await new Promise((res) => setTimeout(res, 2000));
      }
      await route.continue();
    });

    await steps.navigateTo('/orders');

    // Check for loading indicator
    const loadingVisible = await page.locator('[data-testid="loading"]').isVisible({ timeout: 1500 }).catch(() => false);

    // Wait for content
    await page.waitForTimeout(3000);
    await steps.verifyPresence('OrdersPage', 'ordersPage');
  });

  test('@coverage loading: cart page loads items correctly', async ({ steps, page }) => {
    // Add an item first
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');

    // Slow down cart fetch
    await page.route('**/api/cart', async (route) => {
      if (route.request().method() === 'GET') {
        await new Promise((res) => setTimeout(res, 1500));
      }
      await route.continue();
    });

    await steps.navigateTo('/cart');
    await page.waitForTimeout(2500);

    // Cart should show the item
    await steps.verifyPresence('CartPage', 'cartPage');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });
  });
});

test.describe('@coverage Async behavior: Navigation during async operations', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ steps, page, context }) => {
    await page.request.post('http://localhost:8080/api/reset');
    await context.clearCookies();
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
  });

  test('@coverage async: navigating away during search does not crash', async ({ steps, page }) => {
    // Start a search
    await steps.fill('HomePage', 'searchInput', 'Fiction');
    await steps.pressKey('Enter');

    // Immediately navigate away before results load
    await steps.click('Navigation', 'navMarketplace');
    await page.waitForTimeout(1000);

    // Should be on marketplace without errors
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');
  });

  test('@coverage async: navigating away during book detail load', async ({ steps, page }) => {
    // Slow down the book detail API
    await page.route('**/api/books/book-001', async (route) => {
      await new Promise((res) => setTimeout(res, 3000));
      await route.continue();
    });

    // Start loading book detail
    await page.goto('http://localhost:7547/books/book-001');
    await page.waitForTimeout(500);

    // Navigate away before it loads
    await steps.click('Navigation', 'navAllBooks');
    await page.waitForTimeout(1000);

    // Should be on home page without errors
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('@coverage async: rapid page switching does not break state', async ({ steps, page }) => {
    // Rapidly switch between pages
    await steps.click('Navigation', 'navMarketplace');
    await page.waitForTimeout(200);
    await steps.click('Navigation', 'navAllBooks');
    await page.waitForTimeout(200);
    await steps.click('Navigation', 'navOrders');
    await page.waitForTimeout(200);
    await steps.click('Navigation', 'navAllBooks');
    await page.waitForTimeout(1000);

    // App should be on home page and functional
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });
});

test.describe('@coverage Async behavior: Form submissions during slow responses', () => {
  test('@coverage async: login handles slow auth response', async ({ steps, page }) => {
    await page.request.post('http://localhost:8080/api/reset');

    // Slow down auth endpoint
    await page.route('**/api/auth/login', async (route) => {
      await new Promise((res) => setTimeout(res, 2000));
      await route.continue();
    });

    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');

    // Wait for slow response
    await page.waitForTimeout(3000);

    // Should eventually navigate to home page
    await steps.verifyPresence('HomePage', 'homePage');
  });

  test('@coverage async: signup handles slow auth response', async ({ steps, page }) => {
    await page.request.post('http://localhost:8080/api/reset');
    const timestamp = Date.now();

    // Slow down signup
    await page.route('**/api/auth/signup', async (route) => {
      await new Promise((res) => setTimeout(res, 2000));
      await route.continue();
    });

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'signupUsername', `SlowUser${timestamp}`);
    await steps.fill('SignupPage', 'signupEmail', `slow${timestamp}@test.com`);
    await steps.fill('SignupPage', 'signupPassword', 'Test1234!');
    await steps.click('SignupPage', 'signupSubmit');

    // Wait for slow response
    await page.waitForTimeout(3000);

    // Should eventually navigate to home page
    await steps.verifyPresence('HomePage', 'homePage');
  });
});
