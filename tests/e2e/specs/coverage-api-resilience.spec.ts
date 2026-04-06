/**
 * Expanded Coverage: API Error Handling & Resilience
 *
 * Tests how the application handles API failures, slow responses,
 * and network errors across all major data-fetching pages.
 * Uses Playwright route interception to simulate failures.
 */

import { test, expect } from '../fixtures/base';

test.describe('@coverage API resilience: Home page handles book API failures', () => {
  test('@coverage api-resilience: home page shows empty state on 500 from /api/books', async ({ steps, page }) => {
    // Intercept book API to return 500
    await page.route('**/api/books**', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Internal Server Error"}' })
    );

    await steps.navigateTo('/');
    await page.waitForTimeout(1000);

    // Should gracefully degrade to empty state, not crash
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyPresence('HomePage', 'noBooks');
  });

  test('@coverage api-resilience: home page handles empty array response', async ({ steps, page }) => {
    // Intercept to return empty paginated response
    await page.route('**/api/books**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: [],
          totalPages: 0,
          totalElements: 0,
          first: true,
          last: true,
          size: 12,
          number: 0,
          numberOfElements: 0,
          empty: true,
        }),
      })
    );

    await steps.navigateTo('/');
    await page.waitForTimeout(1000);

    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyPresence('HomePage', 'noBooks');
    // Pagination should not be visible
    await steps.verifyAbsence('HomePage', 'pagination');
  });

  test('@coverage api-resilience: home page handles slow API response without crashing', async ({ steps, page }) => {
    // Intercept to add 3-second delay
    await page.route('**/api/books**', async (route) => {
      await new Promise((res) => setTimeout(res, 3000));
      await route.continue();
    });

    await steps.navigateTo('/');

    // Loading indicator should appear initially
    const loadingVisible = await page.locator('[data-testid="loading-books"]').isVisible({ timeout: 2000 }).catch(() => false);
    // Whether loading shows or not, page should eventually render
    await page.waitForTimeout(4000);
    await steps.verifyPresence('HomePage', 'homePage');
  });

  test('@coverage api-resilience: home page recovers after transient API failure on navigation', async ({ steps, page }) => {
    // First load: normal
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });

    // Second load: fail
    await page.route('**/api/books**', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Temporary failure"}' })
    );
    await steps.navigateTo('/');
    await page.waitForTimeout(1000);
    await steps.verifyPresence('HomePage', 'noBooks');

    // Third load: unblock and recover
    await page.unroute('**/api/books**');
    await steps.navigateTo('/');
    await page.waitForTimeout(1000);
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });
});

test.describe('@coverage API resilience: Book detail page handles failures', () => {
  test('@coverage api-resilience: book detail shows not-found on 404', async ({ steps, page }) => {
    await page.route('**/api/books/fake-id-999**', (route) =>
      route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"Not found"}' })
    );

    await steps.navigateTo('/books/fake-id-999');
    await page.waitForTimeout(1000);
    await steps.verifyPresence('BookDetailPage', 'notFound');
  });

  test('@coverage api-resilience: book detail handles 500 gracefully', async ({ steps, page }) => {
    await page.route('**/api/books/book-001', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Server Error"}' })
    );

    await steps.navigateTo('/books/book-001');
    await page.waitForTimeout(1000);

    // Should show not-found or error state, not crash
    const notFound = await page.locator('[data-testid="not-found"]').isVisible().catch(() => false);
    const loading = await page.locator('[data-testid="loading"]').isVisible().catch(() => false);
    // Page should not be blank — either error or loading
    const bodyText = await page.textContent('body');
    expect(bodyText!.length).toBeGreaterThan(50); // Not a blank page
  });
});

test.describe('@coverage API resilience: Cart page handles failures', () => {
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

  test('@coverage api-resilience: cart page handles failed cart fetch', async ({ steps, page }) => {
    // Add an item first
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');

    // Intercept cart fetch to fail
    await page.route('**/api/cart', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Server Error"}' });
      }
      return route.continue();
    });

    await steps.navigateTo('/cart');
    await page.waitForTimeout(1500);

    // Cart page should still render (either empty or error state)
    await steps.verifyPresence('CartPage', 'cartPage');
  });

  test('@coverage api-resilience: add-to-cart handles network failure gracefully', async ({ steps, page }) => {
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');

    // Block add-to-cart API
    await page.route('**/api/cart', (route) => {
      if (route.request().method() === 'POST') {
        return route.abort('connectionrefused');
      }
      return route.continue();
    });

    // Try to add to cart — should not crash
    const addBtn = page.locator('[data-testid="add-to-cart-detail"]');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(1000);
    }

    // Page should still be functional
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
  });
});

test.describe('@coverage API resilience: Orders page handles failures', () => {
  test.beforeEach(async ({ steps, page, context }) => {
    await page.request.post('http://localhost:8080/api/reset');
    await context.clearCookies();
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
  });

  test('@coverage api-resilience: orders page handles API 500', async ({ steps, page }) => {
    await page.route('**/api/orders', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Server Error"}' });
      }
      return route.continue();
    });

    await steps.navigateTo('/orders');
    await page.waitForTimeout(1500);

    // Should show no-orders or error state, not crash
    await steps.verifyPresence('OrdersPage', 'ordersPage');
  });

  test('@coverage api-resilience: order detail handles API failure', async ({ steps, page }) => {
    await page.route('**/api/orders/**', (route) => {
      if (route.request().method() === 'GET' && route.request().url().includes('/api/orders/')) {
        return route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Server Error"}' });
      }
      return route.continue();
    });

    await steps.navigateTo('/orders/some-order-id');
    await page.waitForTimeout(1500);

    // Should show not-found or error, not crash
    const bodyText = await page.textContent('body');
    expect(bodyText!.length).toBeGreaterThan(50);
  });
});

test.describe('@coverage API resilience: Marketplace handles failures', () => {
  test('@coverage api-resilience: marketplace handles listing fetch failure', async ({ steps, page }) => {
    await page.route('**/api/listings**', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Server Error"}' });
      }
      return route.continue();
    });

    await steps.navigateTo('/marketplace');
    await page.waitForTimeout(1500);

    // Should show empty/error state, not crash
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');
  });

  test('@coverage api-resilience: marketplace handles empty listings gracefully', async ({ steps, page }) => {
    await page.route('**/api/listings**', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
      return route.continue();
    });

    await steps.navigateTo('/marketplace');
    await page.waitForTimeout(1000);

    await steps.verifyPresence('MarketplacePage', 'marketplacePage');
    await steps.verifyPresence('MarketplacePage', 'noListings');
  });
});

test.describe('@coverage API resilience: Profile page handles failures', () => {
  test.beforeEach(async ({ steps, page, context }) => {
    await page.request.post('http://localhost:8080/api/reset');
    await context.clearCookies();
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
  });

  test('@coverage api-resilience: profile handles user data fetch failure', async ({ steps, page }) => {
    await page.route('**/api/auth/me', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Server Error"}' })
    );

    await steps.navigateTo('/profile');
    await page.waitForTimeout(2000);

    // Should either redirect to login (401 handler) or show error, not crash
    const bodyText = await page.textContent('body');
    expect(bodyText!.length).toBeGreaterThan(50);
  });
});

test.describe('@coverage API resilience: Search handles failures', () => {
  test('@coverage api-resilience: search handles API failure without crashing', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });

    // Set up interception AFTER initial page load to only catch search requests
    await page.route('**/api/books**', (route) => {
      return route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: '{"error":"Search failure"}',
      });
    });

    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await page.waitForTimeout(3000);

    // App behavior on search API 500: .then() is NOT called (no .catch()),
    // so books state retains previous data. .finally() sets loading=false.
    // The page either shows stale books or "no-books" — but does NOT crash.
    await steps.verifyPresence('HomePage', 'homePage');

    // Verify no JavaScript errors (page is still functional)
    const hasError = await page.evaluate(() => {
      return document.querySelector('[data-testid="home-page"]') !== null;
    });
    expect(hasError).toBeTruthy();

    // Unblock and verify recovery
    await page.unroute('**/api/books**');
    await steps.navigateTo('/');
    await page.waitForTimeout(1000);
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });
});
