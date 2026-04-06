/**
 * Usability Tests — Empty States
 *
 * Verifies that every data-driven page shows a helpful empty-state message
 * (not blank), with intact layout and a call-to-action where appropriate.
 *
 * Pages tested:
 *   / (home)          — empty catalog via route interception
 *   /?query=<term>    — no search results
 *   /?genre=<genre>   — no books in genre
 *   /books/:id        — nonexistent book
 *   /cart             — empty cart (authenticated)
 *   /orders           — no orders (authenticated)
 *   /orders/:id       — nonexistent order (authenticated)
 *   /marketplace      — no listings
 *   /profile          — no active listings (authenticated)
 */

import { test, expect } from '../fixtures/base';

/* ─── helpers ──────────────────────────────────────────────── */

const API = 'http://localhost:8080';

async function login(steps: any, email = 'testuser2@bookhive.test') {
  await steps.navigateTo('/login');
  await steps.fill('LoginPage', 'loginEmail', email);
  await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
  await steps.click('LoginPage', 'loginSubmit');
  await steps.verifyPresence('HomePage', 'homePage');
}

/* ─── Empty States ─────────────────────────────────────────── */

test.describe('@usability empty-state: Data-driven pages with zero data', () => {

  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/reset`);
  });

  /* ── Home / Catalog ─────────────────────────────────────── */

  test('@usability empty-state: Home page shows message when API returns no books', async ({ steps, page }) => {
    await test.step('Intercept books API to return empty list', async () => {
      await page.route('**/api/books**', route =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [], totalPages: 0 }) }),
      );
    });

    await test.step('Navigate to home page', async () => {
      await steps.navigateTo('/');
    });

    await test.step('Verify "No books found" message is displayed', async () => {
      await steps.verifyPresence('HomePage', 'noBooks');
    });

    await test.step('Verify layout is intact — sidebar and navigation render', async () => {
      await steps.verifyPresence('Navigation', 'sidebar');
      await steps.verifyPresence('HomePage', 'homePage');
    });

    await test.step('Verify no horizontal overflow', async () => {
      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasOverflow).toBe(false);
    });
  });

  /* ── Search — No Results ────────────────────────────────── */

  test('@usability empty-state: Search with no matching results shows helpful message', async ({ steps, page }) => {
    await test.step('Navigate to home page', async () => {
      await steps.navigateTo('/');
      await steps.verifyPresence('HomePage', 'homePage');
    });

    await test.step('Search for a term that matches nothing', async () => {
      await steps.fill('HomePage', 'searchInput', 'zzzznonexistent999xyz');
      await steps.pressKey('Enter');
      await page.waitForTimeout(1000);
    });

    await test.step('Verify "No books found" message is displayed', async () => {
      await steps.verifyPresence('HomePage', 'noBooks');
    });

    await test.step('Verify search input retains the query', async () => {
      const inputVal = await page.locator('[data-testid="search-input"]').inputValue();
      expect(inputVal).toContain('zzzznonexistent999xyz');
    });

    await test.step('Verify layout is intact', async () => {
      await steps.verifyPresence('HomePage', 'homePage');
      await steps.verifyPresence('Navigation', 'sidebar');
    });
  });

  /* ── Genre Filter — No Results ──────────────────────────── */

  test('@usability empty-state: Genre filter with no matching books shows message', async ({ steps, page }) => {
    await test.step('Navigate to an invalid genre', async () => {
      await steps.navigateTo('/?genre=ZZZ_NoSuchGenre');
      await page.waitForTimeout(1000);
    });

    await test.step('Verify "No books found" message is displayed', async () => {
      await steps.verifyPresence('HomePage', 'noBooks');
    });

    await test.step('Verify layout is intact', async () => {
      await steps.verifyPresence('HomePage', 'homePage');
      await steps.verifyPresence('Navigation', 'sidebar');
    });
  });

  /* ── Book Detail — Not Found ────────────────────────────── */

  test('@usability empty-state: Nonexistent book detail shows "Book not found" message', async ({ steps, page }) => {
    await test.step('Navigate to a nonexistent book', async () => {
      await steps.navigateTo('/books/nonexistent-book-id-xyz');
      await page.waitForTimeout(1000);
    });

    await test.step('Verify "Book not found" message is displayed', async () => {
      await steps.verifyPresence('BookDetailPage', 'notFound');
    });

    await test.step('Verify navigation sidebar renders for recovery', async () => {
      await steps.verifyPresence('Navigation', 'sidebar');
    });

    await test.step('Verify user can navigate home via sidebar', async () => {
      await steps.click('Navigation', 'navAllBooks');
      await steps.verifyPresence('HomePage', 'homePage');
      await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
    });
  });

  /* ── Cart — Empty ───────────────────────────────────────── */

  test('@usability empty-state: Empty cart shows "Your cart is empty" with no checkout button', async ({ steps, page }) => {
    await test.step('Log in', async () => {
      await login(steps);
    });

    await test.step('Intercept cart API to return empty list', async () => {
      await page.route('**/api/cart', route => {
        if (route.request().method() === 'GET') {
          return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
        }
        return route.continue();
      });
    });

    await test.step('Navigate to cart', async () => {
      await steps.navigateTo('/cart');
      await steps.verifyPresence('CartPage', 'cartPage');
    });

    await test.step('Verify empty cart message is displayed', async () => {
      await steps.verifyPresence('CartPage', 'cartEmpty');
    });

    await test.step('Verify checkout button is absent', async () => {
      await steps.verifyAbsence('CartPage', 'checkoutBtn');
    });

    await test.step('Verify layout is intact', async () => {
      await steps.verifyPresence('Navigation', 'sidebar');
    });
  });

  /* ── Orders — Empty ─────────────────────────────────────── */

  test('@usability empty-state: Orders page with no orders shows "No orders yet" message', async ({ steps, page }) => {
    await test.step('Log in', async () => {
      await login(steps);
    });

    await test.step('Intercept orders API to return empty list', async () => {
      await page.route('**/api/orders', route => {
        if (route.request().method() === 'GET' && !route.request().url().includes('/orders/')) {
          return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
        }
        return route.continue();
      });
    });

    await test.step('Navigate to orders', async () => {
      await steps.navigateTo('/orders');
      await steps.verifyPresence('OrdersPage', 'ordersPage');
    });

    await test.step('Verify "No orders yet" message is displayed', async () => {
      await steps.verifyPresence('OrdersPage', 'noOrders');
    });

    await test.step('Verify layout is intact', async () => {
      await steps.verifyPresence('Navigation', 'sidebar');
    });
  });

  /* ── Order Detail — Not Found ───────────────────────────── */

  test('@usability empty-state: Nonexistent order detail shows "Order not found" message', async ({ steps, page }) => {
    await test.step('Log in', async () => {
      await login(steps);
    });

    await test.step('Navigate to a nonexistent order', async () => {
      await steps.navigateTo('/orders/000000000000000000000000');
      await page.waitForTimeout(1500);
    });

    await test.step('Verify "Order not found" message is displayed', async () => {
      await steps.verifyPresence('OrderDetailPage', 'notFound');
    });

    await test.step('Verify navigation sidebar is present for recovery', async () => {
      await steps.verifyPresence('Navigation', 'sidebar');
    });
  });

  /* ── Marketplace — Empty ────────────────────────────────── */

  test('@usability empty-state: Marketplace with no listings shows "No listings available"', async ({ steps, page }) => {
    await test.step('Intercept marketplace API to return empty list', async () => {
      await page.route('**/api/marketplace', route => {
        if (route.request().method() === 'GET') {
          return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
        }
        return route.continue();
      });
    });

    await test.step('Navigate to marketplace', async () => {
      await steps.navigateTo('/marketplace');
      await page.waitForTimeout(1000);
    });

    await test.step('Verify "No listings available" message is displayed', async () => {
      await steps.verifyPresence('MarketplacePage', 'noListings');
    });

    await test.step('Verify layout is intact', async () => {
      await steps.verifyPresence('MarketplacePage', 'marketplacePage');
      await steps.verifyPresence('Navigation', 'sidebar');
    });
  });

  /* ── Profile — No Listings ──────────────────────────────── */

  test('@usability empty-state: Profile with no active listings shows "No active listings"', async ({ steps }) => {
    await test.step('Log in as a fresh user', async () => {
      await login(steps);
    });

    await test.step('Navigate to profile', async () => {
      await steps.navigateTo('/profile');
      await steps.verifyPresence('ProfilePage', 'profilePage');
    });

    await test.step('Verify "No active listings" message is displayed', async () => {
      await steps.verifyPresence('ProfilePage', 'noListings');
    });

    await test.step('Verify user details still render', async () => {
      await steps.verifyPresence('ProfilePage', 'profileUsername');
      await steps.verifyPresence('ProfilePage', 'profileEmail');
      await steps.verifyPresence('ProfilePage', 'profileBalance');
    });

    await test.step('Verify layout is intact', async () => {
      await steps.verifyPresence('Navigation', 'sidebar');
    });
  });

  /* ── Home page — API unreachable ────────────────────────── */

  test('@usability empty-state: Home page when API returns error shows graceful empty state', async ({ steps, page }) => {
    await test.step('Intercept books API to return 500 error', async () => {
      await page.route('**/api/books**', route =>
        route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Internal server error"}' }),
      );
    });

    await test.step('Navigate to home page', async () => {
      await steps.navigateTo('/');
    });

    await test.step('Verify the page does not show blank — shows empty state or error', async () => {
      // The app defaults to empty books array on API error, which shows "No books found"
      await steps.verifyPresence('HomePage', 'homePage');
      // Should show no-books message since the catch defaults to empty array
      const noBooks = await page.locator('[data-testid="no-books"]').isVisible().catch(() => false);
      const loading = await page.locator('[data-testid="loading-books"]').isVisible().catch(() => false);
      // Either showing no-books message or still loading — not blank
      expect(noBooks || loading).toBeTruthy();
    });

    await test.step('Verify navigation is intact', async () => {
      await steps.verifyPresence('Navigation', 'sidebar');
    });
  });
});
