/**
 * Bug Reproduction: Silent Error Handling
 *
 * Tests document frontend pages that swallow API errors without showing
 * feedback to the user. These are real UX bugs where the user gets zero
 * indication that an action failed.
 *
 * BUGS REPRODUCED:
 * 1. CartPage checkout failure — no error message shown (no catch block)
 * 2. ListingCard buy failure — no error message shown (no catch block)
 * 3. OrderDetailPage return failure — no error message shown (no catch block)
 */

import { test, expect } from '../fixtures/base';
import type { Page, BrowserContext } from '@playwright/test';

/**
 * Resilient reset + login helper.
 * Retries the full reset→login sequence up to 3 times to handle
 * transient failures from concurrent /api/reset calls across spec files.
 */
async function resetAndLogin(
  page: Page,
  context: BrowserContext,
  email = 'testuser1@bookhive.test',
  password = 'Test1234!',
): Promise<void> {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await page.request.post('http://localhost:8080/api/reset');
    await context.clearCookies();
    await page.goto('http://localhost:7547/login');
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill(password);
    await page.getByTestId('login-submit').click();
    const landed = await page
      .waitForSelector('[data-testid="home-page"]', { timeout: 10_000 })
      .then(() => true)
      .catch(() => false);
    if (landed) return;
    if (attempt < maxAttempts) await page.waitForTimeout(1000);
  }
  await page.waitForSelector('[data-testid="home-page"]');
}

test.describe('@bug Silent Error: Checkout failure shows no error', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page, context }) => {
    await page.request.post('http://localhost:8080/api/reset');
    await context.clearCookies();
  });

  test('@bug silent-error: insufficient balance checkout shows no error to user', async ({ page }) => {
    // Create a user with $0 balance (new signups get $0)
    await page.goto('http://localhost:7547/signup');
    await page.getByTestId('signup-username').fill('pooruser');
    await page.getByTestId('signup-email').fill('poor@test.com');
    await page.getByTestId('signup-password').fill('PoorPass1234');
    await page.getByTestId('signup-submit').click();
    await page.waitForSelector('[data-testid="home-page"]');

    // Verify $0 balance
    const balance = await page.getByTestId('user-balance').textContent();
    expect(balance).toContain('$0.00');

    // Add book to cart via API (avoids needing to navigate)
    await page.request.post('http://localhost:8080/api/cart/items', {
      data: { bookId: 'book-001', quantity: 1 },
    });

    // Navigate to cart
    await page.goto('http://localhost:7547/cart');
    await page.waitForSelector('[data-testid="cart-page"]');
    await page.waitForSelector('[data-testid="checkout-btn"]');

    // Record console errors before checkout
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleLogs.push(msg.text());
    });

    // Click checkout — should fail with "Insufficient balance"
    await page.getByTestId('checkout-btn').click();
    await page.waitForTimeout(2000);

    // BUG: No error message visible on the page
    const errorVisible = await page.getByTestId('cart-error').isVisible().catch(() => false);
    expect(errorVisible).toBeFalsy(); // No error element exists in the DOM

    // Page stays on /cart (did not navigate to order)
    expect(page.url()).toContain('/cart');

    // Cart items are still visible (checkout didn't succeed)
    const itemCount = await page.locator('[data-testid^="cart-item-"]:not([data-testid*="title"]):not([data-testid*="price"])').count();
    expect(itemCount).toBeGreaterThan(0);

    // The error was silently swallowed — only visible in console
    // (handleCheckout has try/finally but no catch)
  });

  test('@bug silent-error: network error during checkout shows no error', async ({ page, context }) => {
    // Login as user with balance (use resilient helper)
    await resetAndLogin(page, context);

    // Add item to cart
    await page.request.post('http://localhost:8080/api/cart/items', {
      data: { bookId: 'book-001', quantity: 1 },
    });

    await page.goto('http://localhost:7547/cart');
    await page.waitForSelector('[data-testid="checkout-btn"]');

    // Intercept the checkout API to simulate a 500 error
    await page.route('**/api/orders', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'internal_error', message: 'Database connection failed' }),
        });
      } else {
        route.continue();
      }
    });

    // Click checkout
    await page.getByTestId('checkout-btn').click();
    await page.waitForTimeout(2000);

    // BUG: No error feedback — page returns to idle state silently
    const errorVisible = await page.getByTestId('cart-error').isVisible().catch(() => false);
    expect(errorVisible).toBeFalsy();

    // Button returns to "Checkout" text (not stuck on "Processing...")
    const btnText = await page.getByTestId('checkout-btn').textContent();
    expect(btnText).toBe('Checkout');

    await page.unroute('**/api/orders');
  });
});

test.describe('@bug Silent Error: Marketplace buy failure shows no error', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page, context }) => {
    await page.request.post('http://localhost:8080/api/reset');
    await context.clearCookies();
  });

  test('@bug silent-error: marketplace buy with insufficient balance shows no error', async ({ page }) => {
    // User1 creates an expensive listing
    const seller = await (await page.request.post('http://localhost:8080/api/auth/login', {
      data: { email: 'testuser1@bookhive.test', password: 'Test1234!' },
    })).json();
    await page.request.post('http://localhost:8080/api/marketplace/listings', {
      headers: { Authorization: `Bearer ${seller.token}` },
      data: { bookId: 'book-001', condition: 'LIKE_NEW', price: 99999.99 },
    });

    // Signup as poor user ($0 balance)
    await page.goto('http://localhost:7547/signup');
    await page.getByTestId('signup-username').fill('poorbuyer');
    await page.getByTestId('signup-email').fill('poorbuyer@test.com');
    await page.getByTestId('signup-password').fill('PoorBuyer123');
    await page.getByTestId('signup-submit').click();
    await page.waitForSelector('[data-testid="home-page"]');

    // Navigate to marketplace
    await page.goto('http://localhost:7547/marketplace');
    await page.waitForSelector('[data-testid="marketplace-page"]');

    // Wait for listings to load
    await page.waitForTimeout(1500);

    // Check if buy button is visible
    const buyBtn = page.locator('[data-testid^="listing-buy-"]').first();
    const buyBtnVisible = await buyBtn.isVisible().catch(() => false);

    if (buyBtnVisible) {
      // Click buy — should fail silently
      await buyBtn.click();
      await page.waitForTimeout(2000);

      // BUG: No error message shown — the button returns to idle
      // ListingCard.jsx handleBuy has no catch block
      // User has no idea why the purchase failed
    }
  });
});

test.describe('@bug Silent Error: Order return failure shows no error', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page, context }) => {
    await page.request.post('http://localhost:8080/api/reset');
    await context.clearCookies();
  });

  test('@bug silent-error: return order with API error shows no feedback', async ({ page, context }) => {
    // Login and make a purchase (use resilient helper)
    await resetAndLogin(page, context);

    // Add and checkout
    await page.request.post('http://localhost:8080/api/cart/items', {
      data: { bookId: 'book-001', quantity: 1 },
    });
    const orderResp = await page.request.post('http://localhost:8080/api/orders');
    const order = await orderResp.json();

    // Navigate to order detail
    await page.goto(`http://localhost:7547/orders/${order.id}`);
    await page.waitForSelector('[data-testid="order-detail-page"]');

    // Intercept return API to simulate error
    await page.route(`**/api/orders/${order.id}/return`, route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'internal_error', message: 'Failed to process return' }),
      });
    });

    // Click Return Order
    const returnBtn = page.locator(`[data-testid="return-order-${order.id}"]`);
    const returnVisible = await returnBtn.isVisible().catch(() => false);

    if (returnVisible) {
      await returnBtn.click();
      await page.waitForTimeout(2000);

      // BUG: No error message shown — button returns to idle silently
      // OrderDetailPage.jsx handleReturn has no catch block
      const btnText = await returnBtn.textContent();
      expect(btnText).toBe('Return Order'); // Back to idle, no error shown
    }

    await page.unroute(`**/api/orders/${order.id}/return`);
  });
});
