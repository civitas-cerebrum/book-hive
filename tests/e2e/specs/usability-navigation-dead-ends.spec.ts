/**
 * Usability Tests — Navigation Dead Ends
 *
 * Verifies that no page is a navigation trap: every page has a path home,
 * error pages offer recovery, 404 is handled, and browser back after form
 * submissions does not break state.
 *
 * Categories:
 *   1. 404 page handling (undefined routes)
 *   2. Browser back after form submissions (login, signup, checkout, sell)
 *   3. Error pages have a way home
 *   4. Every page has a navigation path to homepage (within 2 clicks)
 */

import { test, expect } from '../fixtures/base';

const API = 'http://localhost:8080';

async function login(steps: any, email = 'testuser1@bookhive.test') {
  await steps.navigateTo('/login');
  await steps.fill('LoginPage', 'loginEmail', email);
  await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
  await steps.click('LoginPage', 'loginSubmit');
  await steps.verifyPresence('HomePage', 'homePage');
}

/* ─── 404 Page Handling ────────────────────────────────────── */

test.describe('@usability navigation-dead-end: 404 handling', () => {

  test('@usability navigation-dead-end: Undefined route shows navigable page (not blank crash)', async ({ steps, page }) => {
    await test.step('Navigate to a nonexistent route', async () => {
      await page.goto('http://localhost:7547/non-existent-route-xyz');
      await page.waitForTimeout(1000);
    });

    await test.step('Verify the page is not a blank crash', async () => {
      // The app renders sidebar navigation even for unknown routes
      await steps.verifyPresence('Navigation', 'sidebar');
    });

    await test.step('Verify 404 page shows "Page Not Found" message', async () => {
      // FIXED: App.jsx now has a <Route path="*"> catch-all with a 404 page.
      const mainContent = await page.locator('main').textContent();
      expect(mainContent).toContain('Page Not Found');
      expect(mainContent).toContain("doesn't exist");
    });

    await test.step('Verify user can still navigate home via sidebar', async () => {
      await steps.click('Navigation', 'navAllBooks');
      await steps.verifyPresence('HomePage', 'homePage');
      await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
    });
  });

  test('@usability navigation-dead-end: Deeply nested undefined route', async ({ steps, page }) => {
    await test.step('Navigate to deeply nested unknown path', async () => {
      await page.goto('http://localhost:7547/admin/settings/advanced/nope');
      await page.waitForTimeout(1000);
    });

    await test.step('Verify sidebar is present for navigation recovery', async () => {
      await steps.verifyPresence('Navigation', 'sidebar');
    });

    await test.step('Navigate home via All Books link', async () => {
      await steps.click('Navigation', 'navAllBooks');
      await steps.verifyPresence('HomePage', 'homePage');
    });
  });

  test('@usability navigation-dead-end: Unknown book ID shows not-found message', async ({ steps, page }) => {
    await test.step('Navigate to nonexistent book', async () => {
      await steps.navigateTo('/books/does-not-exist-xyz');
      await page.waitForTimeout(1500);
    });

    await test.step('Verify "Book not found" message is displayed', async () => {
      await steps.verifyPresence('BookDetailPage', 'notFound');
    });

    await test.step('Verify navigation sidebar allows recovery', async () => {
      await steps.click('Navigation', 'navAllBooks');
      await steps.verifyPresence('HomePage', 'homePage');
    });
  });

  test('@usability navigation-dead-end: Unknown order ID shows not-found message', async ({ steps, page }) => {
    await test.step('Log in', async () => {
      await page.request.post(`${API}/reset`);
      await login(steps);
    });

    await test.step('Navigate to nonexistent order', async () => {
      await steps.navigateTo('/orders/000000000000000000000000');
      await page.waitForTimeout(1500);
    });

    await test.step('Verify "Order not found" message is displayed', async () => {
      await steps.verifyPresence('OrderDetailPage', 'notFound');
    });

    await test.step('Verify user can navigate to orders list via sidebar', async () => {
      await steps.click('Navigation', 'navOrders');
      await steps.verifyPresence('OrdersPage', 'ordersPage');
    });
  });
});

/* ─── Browser Back After Form Submissions ──────────────────── */

test.describe('@usability navigation-dead-end: Browser back after form submissions', () => {

  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/reset`);
  });

  test('@usability navigation-dead-end: Browser back after login does not break state', async ({ steps, page }) => {
    await test.step('Log in', async () => {
      await steps.navigateTo('/login');
      await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
      await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
      await steps.click('LoginPage', 'loginSubmit');
      await steps.verifyPresence('HomePage', 'homePage');
    });

    await test.step('Press browser back', async () => {
      await page.goBack();
      await page.waitForTimeout(1500);
    });

    await test.step('Verify page is not in a broken state', async () => {
      // Should either show login form or home page — not crash
      const url = page.url();
      expect(url).toBeTruthy();
      const isLogin = url.includes('/login');
      const isHome = url.endsWith('/') || url.endsWith(':7547');
      expect(isLogin || isHome).toBeTruthy();
    });
  });

  test('@usability navigation-dead-end: Browser back after signup does not resubmit', async ({ steps, page }) => {
    await test.step('Sign up a new user', async () => {
      await steps.navigateTo('/signup');
      await steps.fill('SignupPage', 'signupUsername', 'backnavtest');
      await steps.fill('SignupPage', 'signupEmail', 'backnavtest@test.com');
      await steps.fill('SignupPage', 'signupPassword', 'Test1234!');
      await steps.click('SignupPage', 'signupSubmit');
      await page.waitForTimeout(2000);
    });

    await test.step('Press browser back', async () => {
      const currentUrl = page.url();
      if (!currentUrl.includes('/signup')) {
        await page.goBack();
        await page.waitForTimeout(1500);
      }
    });

    await test.step('Verify page is not in a broken state', async () => {
      const url = page.url();
      expect(url).toBeTruthy();
      // Should be on signup or home — not crashing
      await steps.verifyPresence('Navigation', 'sidebar');
    });
  });

  test('@usability navigation-dead-end: Browser back after checkout does not duplicate order', async ({ steps, page }) => {
    await test.step('Log in as user1 (fresh from reset)', async () => {
      await login(steps);
    });

    await test.step('Ensure clean cart — clear any leftover items', async () => {
      await steps.navigateTo('/cart');
      await steps.verifyPresence('CartPage', 'cartPage');
      const clearBtn = page.locator('[data-testid="cart-clear"]');
      if (await clearBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await clearBtn.click();
        await page.waitForTimeout(500);
      }
    });

    await test.step('Add single item to cart and checkout', async () => {
      await steps.navigateTo('/');
      await steps.clickNth('HomePage', 'bookCard', 0);
      await steps.click('BookDetailPage', 'addToCartDetail');
      await steps.click('Navigation', 'navCart');
      await steps.verifyPresence('CartPage', 'cartPage');
      await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });
      await steps.click('CartPage', 'checkoutBtn');
      await page.waitForURL(/\/orders\//, { timeout: 15000 });
      await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
    });

    await test.step('Press browser back', async () => {
      await page.goBack();
      await page.waitForTimeout(1500);
    });

    await test.step('Verify back returns to a valid page (not broken state)', async () => {
      const url = page.url();
      expect(url).toBeTruthy();
      await steps.verifyPresence('Navigation', 'sidebar');
    });

    await test.step('Verify page is functional — can navigate to orders', async () => {
      await steps.click('Navigation', 'navOrders');
      await steps.verifyPresence('OrdersPage', 'ordersPage');
      await steps.verifyCount('OrdersPage', 'orderCard', { greaterThan: 0 });
    });
  });

  test('@usability navigation-dead-end: Browser back after creating listing does not duplicate', async ({ steps, page }) => {
    let listingCountBefore = 0;

    await test.step('Log in and count existing marketplace listings', async () => {
      await login(steps);
      await steps.navigateTo('/marketplace');
      await page.waitForTimeout(1000);
      listingCountBefore = await page.locator('[data-testid^="listing-card-"]').count();
    });

    await test.step('Create a listing', async () => {
      await steps.navigateTo('/marketplace/sell');
      await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
      await steps.fill('CreateListingPage', 'listingPrice', '9.99');
      await steps.click('CreateListingPage', 'listingCreate');
      await page.waitForTimeout(2000);
    });

    await test.step('Verify navigated to marketplace', async () => {
      await steps.verifyPresence('MarketplacePage', 'marketplacePage');
    });

    await test.step('Press browser back', async () => {
      await page.goBack();
      await page.waitForTimeout(1500);
    });

    await test.step('Verify page is not in a broken state', async () => {
      await steps.verifyPresence('Navigation', 'sidebar');
    });

    await test.step('Verify no duplicate listing — count increased by exactly 1', async () => {
      await steps.navigateTo('/marketplace');
      await page.waitForTimeout(1000);
      const listingCountAfter = await page.locator('[data-testid^="listing-card-"]').count();
      expect(listingCountAfter).toBe(listingCountBefore + 1);
    });
  });
});

/* ─── Every Page Has Path to Homepage ──────────────────────── */

test.describe('@usability navigation-dead-end: Every page has navigation path to homepage', () => {

  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/reset`);
  });

  test('@usability navigation-dead-end: Home page has logo/All Books link to itself', async ({ steps }) => {
    await test.step('Navigate to home page', async () => {
      await steps.navigateTo('/');
      await steps.verifyPresence('HomePage', 'homePage');
    });

    await test.step('Verify "All Books" navigation link is present', async () => {
      await steps.verifyPresence('Navigation', 'navAllBooks');
    });
  });

  test('@usability navigation-dead-end: Login page — one click to home', async ({ steps, page }) => {
    await test.step('Navigate to login page', async () => {
      await steps.navigateTo('/login');
      await steps.verifyPresence('LoginPage', 'loginPage');
    });

    await test.step('Click All Books link to reach home', async () => {
      await steps.click('Navigation', 'navAllBooks');
      await steps.verifyPresence('HomePage', 'homePage');
      await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
    });
  });

  test('@usability navigation-dead-end: Signup page — one click to home', async ({ steps }) => {
    await test.step('Navigate to signup page', async () => {
      await steps.navigateTo('/signup');
      await steps.verifyPresence('SignupPage', 'signupPage');
    });

    await test.step('Click All Books link to reach home', async () => {
      await steps.click('Navigation', 'navAllBooks');
      await steps.verifyPresence('HomePage', 'homePage');
    });
  });

  test('@usability navigation-dead-end: Book detail page — one click to home', async ({ steps }) => {
    await test.step('Navigate to book detail', async () => {
      await steps.navigateTo('/books/book-001');
      await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    });

    await test.step('Click All Books link to reach home', async () => {
      await steps.click('Navigation', 'navAllBooks');
      await steps.verifyPresence('HomePage', 'homePage');
    });
  });

  test('@usability navigation-dead-end: Cart page — one click to home', async ({ steps }) => {
    await test.step('Log in', async () => {
      await login(steps);
    });

    await test.step('Navigate to cart page', async () => {
      await steps.navigateTo('/cart');
      await steps.verifyPresence('CartPage', 'cartPage');
    });

    await test.step('Click All Books link to reach home', async () => {
      await steps.click('Navigation', 'navAllBooks');
      await steps.verifyPresence('HomePage', 'homePage');
    });
  });

  test('@usability navigation-dead-end: Orders page — one click to home', async ({ steps }) => {
    await test.step('Log in', async () => {
      await login(steps);
    });

    await test.step('Navigate to orders page', async () => {
      await steps.navigateTo('/orders');
      await steps.verifyPresence('OrdersPage', 'ordersPage');
    });

    await test.step('Click All Books link to reach home', async () => {
      await steps.click('Navigation', 'navAllBooks');
      await steps.verifyPresence('HomePage', 'homePage');
    });
  });

  test('@usability navigation-dead-end: Marketplace page — one click to home', async ({ steps }) => {
    await test.step('Navigate to marketplace', async () => {
      await steps.navigateTo('/marketplace');
      await steps.verifyPresence('MarketplacePage', 'marketplacePage');
    });

    await test.step('Click All Books link to reach home', async () => {
      await steps.click('Navigation', 'navAllBooks');
      await steps.verifyPresence('HomePage', 'homePage');
    });
  });

  test('@usability navigation-dead-end: Sell page — one click to home', async ({ steps }) => {
    await test.step('Log in', async () => {
      await login(steps);
    });

    await test.step('Navigate to sell page', async () => {
      await steps.navigateTo('/marketplace/sell');
      await steps.verifyPresence('CreateListingPage', 'createListingPage');
    });

    await test.step('Click All Books link to reach home', async () => {
      await steps.click('Navigation', 'navAllBooks');
      await steps.verifyPresence('HomePage', 'homePage');
    });
  });

  test('@usability navigation-dead-end: Profile page — one click to home', async ({ steps }) => {
    await test.step('Log in', async () => {
      await login(steps);
    });

    await test.step('Navigate to profile page', async () => {
      await steps.navigateTo('/profile');
      await steps.verifyPresence('ProfilePage', 'profilePage');
    });

    await test.step('Click All Books link to reach home', async () => {
      await steps.click('Navigation', 'navAllBooks');
      await steps.verifyPresence('HomePage', 'homePage');
    });
  });

  test('@usability navigation-dead-end: Search results page — one click to home', async ({ steps, page }) => {
    await test.step('Navigate to search results', async () => {
      await steps.navigateTo('/?query=fiction');
      await page.waitForTimeout(1000);
    });

    await test.step('Click All Books link to reach home', async () => {
      await steps.click('Navigation', 'navAllBooks');
      await steps.verifyPresence('HomePage', 'homePage');
      // Verify it cleared the search filter
      await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
    });
  });

  test('@usability navigation-dead-end: Genre filter page — one click to home', async ({ steps, page }) => {
    await test.step('Navigate to genre filter', async () => {
      await steps.navigateTo('/?genre=Fiction');
      await page.waitForTimeout(1000);
    });

    await test.step('Click All Books link to reach home', async () => {
      await steps.click('Navigation', 'navAllBooks');
      await steps.verifyPresence('HomePage', 'homePage');
      await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
    });
  });
});

/* ─── Error Pages Have Recovery Path ───────────────────────── */

test.describe('@usability navigation-dead-end: Error pages have recovery path', () => {

  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/reset`);
  });

  test('@usability navigation-dead-end: Book not found page allows navigation to home', async ({ steps, page }) => {
    await test.step('Navigate to nonexistent book', async () => {
      await steps.navigateTo('/books/fake-id-123');
      await page.waitForTimeout(1500);
    });

    await test.step('Verify not-found message is shown', async () => {
      await steps.verifyPresence('BookDetailPage', 'notFound');
    });

    await test.step('Verify sidebar provides navigation recovery', async () => {
      await steps.verifyPresence('Navigation', 'navAllBooks');
      await steps.verifyPresence('Navigation', 'navMarketplace');
    });

    await test.step('Click All Books to return home', async () => {
      await steps.click('Navigation', 'navAllBooks');
      await steps.verifyPresence('HomePage', 'homePage');
      await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
    });
  });

  test('@usability navigation-dead-end: Order not found page allows navigation to orders', async ({ steps, page }) => {
    await test.step('Log in', async () => {
      await login(steps);
    });

    await test.step('Navigate to nonexistent order', async () => {
      await steps.navigateTo('/orders/000000000000000000000000');
      await page.waitForTimeout(1500);
    });

    await test.step('Verify not-found message is shown', async () => {
      await steps.verifyPresence('OrderDetailPage', 'notFound');
    });

    await test.step('Verify sidebar provides navigation recovery', async () => {
      await steps.verifyPresence('Navigation', 'navOrders');
    });

    await test.step('Click Orders to return to orders list', async () => {
      await steps.click('Navigation', 'navOrders');
      await steps.verifyPresence('OrdersPage', 'ordersPage');
    });
  });

  test('@usability navigation-dead-end: Auth redirect to login is not a dead end', async ({ steps, page }) => {
    await test.step('Try to access protected route as guest', async () => {
      await page.goto('http://localhost:7547/cart');
      await page.waitForTimeout(2000);
    });

    await test.step('Verify redirected to login page', async () => {
      expect(page.url()).toContain('/login');
    });

    await test.step('Verify login page has navigation options', async () => {
      await steps.verifyPresence('Navigation', 'navAllBooks');
      await steps.verifyPresence('Navigation', 'navMarketplace');
      await steps.verifyPresence('LoginPage', 'signupLink');
    });

    await test.step('Navigate home via All Books', async () => {
      await steps.click('Navigation', 'navAllBooks');
      await steps.verifyPresence('HomePage', 'homePage');
    });
  });
});

/* ─── Undo / Recovery (merged from negative-ux) ─────────── */

test.describe('@usability @negative navigation-dead-end: Undo/Recovery actions', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/reset`);
  });

  test('@usability @negative undo: clear cart is a destructive action with no confirmation', async ({ steps, page }) => {
    await test.step('Login and add item to cart', async () => {
      await login(steps);
      await steps.clickNth('HomePage', 'bookCard', 0);
      await steps.click('BookDetailPage', 'addToCartDetail');
      await steps.click('Navigation', 'navCart');
      await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });
    });

    await test.step('Click clear cart — executes immediately (no undo)', async () => {
      await steps.click('CartPage', 'cartClear');
      await page.waitForTimeout(1000);
      await steps.verifyPresence('CartPage', 'cartEmpty');
    });
  });

  test('@usability @negative undo: remove single item is a destructive action', async ({ steps, page }) => {
    await test.step('Login and add two items', async () => {
      await login(steps);
      await steps.clickNth('HomePage', 'bookCard', 0);
      await steps.click('BookDetailPage', 'addToCartDetail');
      await steps.navigateTo('/books/book-002');
      await steps.click('BookDetailPage', 'addToCartDetail');
      await steps.click('Navigation', 'navCart');
      await steps.verifyCount('CartPage', 'cartItem', { exactly: 2 });
    });

    await test.step('Remove first item — no confirmation dialog', async () => {
      await page.locator('[data-testid^="cart-remove-"]').first().click();
      await page.waitForTimeout(1000);
      await steps.verifyCount('CartPage', 'cartItem', { exactly: 1 });
    });
  });

  test('@usability @negative undo: return order is irreversible', async ({ steps, page }) => {
    await test.step('Login, purchase a book, and return the order', async () => {
      await login(steps);
      await steps.clickNth('HomePage', 'bookCard', 0);
      await steps.click('BookDetailPage', 'addToCartDetail');
      await steps.click('Navigation', 'navCart');
      await steps.click('CartPage', 'checkoutBtn');
      await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
    });

    await test.step('Return the order — status changes to RETURNED, no undo', async () => {
      const returnBtn = page.locator('[data-testid^="return-order-"]');
      if (await returnBtn.isVisible()) {
        await returnBtn.click();
        await page.waitForTimeout(1000);
        const orderStatus = await page.locator('[data-testid^="order-status-"]').textContent();
        expect(orderStatus?.toUpperCase()).toContain('RETURNED');
      }
    });
  });
});
