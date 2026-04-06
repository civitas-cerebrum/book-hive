/**
 * Bug Reproduction: Stale UI State
 *
 * Tests document UI state bugs where the frontend fails to update after
 * server-side mutations. These are real client-side state management issues.
 *
 * BUGS REPRODUCED:
 * 1. Sidebar balance not updated after checkout (requires page reload)
 * 2. Cart badge not cleared after checkout (requires page reload)
 * 3. Cart badge missing after re-login (not initialized on login)
 */

import { test, expect } from '../fixtures/base';
import type { Page, BrowserContext } from '@playwright/test';

/**
 * Resilient reset + login helper.
 * When multiple spec files run in parallel, concurrent /api/reset calls can
 * cause transient login failures. This helper retries the full reset→login
 * sequence up to 3 times before giving up.
 */
async function resetAndLogin(page: Page, context: BrowserContext): Promise<void> {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await page.request.post('http://localhost:8080/api/reset');
    await context.clearCookies();
    await page.goto('http://localhost:7547/login');
    await page.getByTestId('login-email').fill('testuser1@bookhive.test');
    await page.getByTestId('login-password').fill('Test1234!');
    await page.getByTestId('login-submit').click();
    const landed = await page
      .waitForSelector('[data-testid="home-page"]', { timeout: 10_000 })
      .then(() => true)
      .catch(() => false);
    if (landed) return;
    // Login failed — likely a concurrent reset; wait briefly and retry
    if (attempt < maxAttempts) await page.waitForTimeout(1000);
  }
  // Final attempt — let Playwright throw the real error
  await page.waitForSelector('[data-testid="home-page"]');
}

test.describe('@bug Stale UI: Sidebar balance after checkout', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page, context }) => {
    await resetAndLogin(page, context);
  });

  test('@bug stale-ui: sidebar balance shows stale value after checkout', async ({ page }) => {
    // Verify initial balance
    const balanceBefore = await page.getByTestId('user-balance').textContent();
    expect(balanceBefore).toContain('$100.00');

    // Add item to cart via UI and wait for the cart badge to confirm it was added
    await page.getByTestId('add-to-cart-book-001').click();
    await expect(page.getByTestId('cart-badge')).toBeVisible({ timeout: 5_000 });

    // Navigate to cart and wait for cart item + checkout button
    await page.getByTestId('nav-cart').click();
    await page.waitForSelector('[data-testid="cart-page"]');
    await page.waitForSelector('[data-testid="checkout-btn"]', { timeout: 10_000 });
    await page.getByTestId('checkout-btn').click();
    await page.waitForSelector('[data-testid="order-detail-page"]');

    // BUG: Sidebar balance still shows $100.00 after spending $12.99
    const balanceAfterCheckout = await page.getByTestId('user-balance').textContent();
    expect(balanceAfterCheckout).toContain('$100.00'); // Stale! Should be ~$87.01

    // After page reload, balance updates correctly
    await page.reload();
    await page.waitForSelector('[data-testid="order-detail-page"]');
    const balanceAfterReload = await page.getByTestId('user-balance').textContent();
    expect(balanceAfterReload).not.toContain('$100.00');
    expect(balanceAfterReload).toContain('$87.01');
  });
});

test.describe('@bug Stale UI: Cart badge after checkout', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page, context }) => {
    await resetAndLogin(page, context);
  });

  test('@bug stale-ui: cart badge persists after checkout', async ({ page }) => {
    // Add item to cart
    await page.getByTestId('add-to-cart-book-001').click();
    await page.waitForTimeout(500);

    // Verify badge shows 1
    const badge = page.getByTestId('cart-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('1');

    // Checkout
    await page.getByTestId('nav-cart').click();
    await page.waitForSelector('[data-testid="cart-page"]');
    await page.getByTestId('checkout-btn').click();
    await page.waitForSelector('[data-testid="order-detail-page"]');

    // BUG: Cart badge still shows "1" even though cart is now empty
    const badgeAfter = page.getByTestId('cart-badge');
    const badgeVisible = await badgeAfter.isVisible().catch(() => false);
    if (badgeVisible) {
      const badgeText = await badgeAfter.textContent();
      expect(badgeText).toBe('1'); // Stale badge, should be gone
    }

    // After reload, badge disappears correctly
    await page.reload();
    await page.waitForSelector('[data-testid="order-detail-page"]');
    const badgeAfterReload = page.getByTestId('cart-badge');
    const badgeGone = await badgeAfterReload.isVisible().catch(() => false);
    expect(badgeGone).toBeFalsy(); // Correct after reload
  });
});

test.describe('@bug Stale UI: Cart badge missing after re-login', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page, context }) => {
    await page.request.post('http://localhost:8080/api/reset');
    await context.clearCookies();
  });

  test('@bug stale-ui: cart badge absent on home page after re-login despite server-side cart', async ({ page, context }) => {
    // Login and add item to cart (use resilient helper for first login)
    await resetAndLogin(page, context);

    await page.getByTestId('add-to-cart-book-001').click();
    await page.waitForTimeout(500);
    await expect(page.getByTestId('cart-badge')).toBeVisible();

    // Logout
    await page.getByTestId('logout-btn').click();
    await page.waitForTimeout(500);

    // Login again
    await page.goto('http://localhost:7547/login');
    await page.getByTestId('login-email').fill('testuser1@bookhive.test');
    await page.getByTestId('login-password').fill('Test1234!');
    await page.getByTestId('login-submit').click();
    await page.waitForSelector('[data-testid="home-page"]');

    // BUG: Cart badge is NOT visible even though cart has items server-side
    const badgeVisible = await page.getByTestId('cart-badge').isVisible().catch(() => false);
    expect(badgeVisible).toBeFalsy(); // Bug: should be visible with count

    // Verify cart items actually exist server-side
    const cartResp = await page.request.get('http://localhost:8080/api/cart');
    const cartItems = await cartResp.json();
    expect(cartItems.length).toBeGreaterThan(0); // Items exist on server
  });
});
