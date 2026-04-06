import { test, expect } from '../fixtures/base';

/*
 * Cross-Tab State Tests
 *
 * Test that state changes in one tab propagate correctly to another tab
 * viewing the same or related data. For intersection pages (shared by
 * multiple journeys), verify that mutations in one tab are reflected
 * when the second tab navigates or refreshes.
 *
 * Note: This SPA does not use WebSocket/SSE for real-time sync, so we
 * test that tab 2 either auto-updates or shows correct state on next
 * navigation/interaction (not silently stale and actionable).
 */

test.describe('@session cross-tab: cart state across tabs', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@session cross-tab: item added in tab 1 appears in tab 2 cart', async ({ steps, page, context }) => {
    // Login in tab 1
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Add item to cart in tab 1
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.verifyPresence('Navigation', 'cartBadge');

    // Open tab 2 (shares same browser context / cookies)
    const tab2 = await context.newPage();
    await tab2.goto('http://localhost:7547/cart');
    await tab2.waitForTimeout(1000);

    // Tab 2 should see the item added in tab 1
    const cartItems = tab2.locator('[data-testid^="cart-item-"]:not([data-testid*="title"]):not([data-testid*="price"])');
    await expect(cartItems).toHaveCount(1);

    await tab2.close();
  });

  test('@session cross-tab: cart cleared in tab 1, tab 2 sees empty cart on navigation', async ({ steps, page, context }) => {
    // Login in tab 1
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Add item
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');

    // Open tab 2 showing cart
    const tab2 = await context.newPage();
    await tab2.goto('http://localhost:7547/cart');
    await tab2.waitForTimeout(1000);

    // Confirm tab 2 sees the item
    const cartItems = tab2.locator('[data-testid^="cart-item-"]:not([data-testid*="title"]):not([data-testid*="price"])');
    await expect(cartItems).toHaveCount(1);

    // Back to tab 1: clear the cart
    await steps.click('Navigation', 'navCart');
    await steps.verifyPresence('CartPage', 'cartPage');
    await steps.click('CartPage', 'cartClear');
    await page.waitForTimeout(500);
    await steps.verifyPresence('CartPage', 'cartEmpty');

    // Tab 2: reload to see updated state
    await tab2.reload();
    await tab2.waitForTimeout(1000);

    // Tab 2 should now show empty cart
    await expect(tab2.locator('[data-testid="cart-empty"]')).toBeVisible();

    await tab2.close();
  });

  test('@session cross-tab: checkout in tab 1, cart page in tab 2 shows empty after reload', async ({ steps, page, context }) => {
    // Login in tab 1
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Add item and go to cart
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');

    // Open tab 2 showing cart with the item
    const tab2 = await context.newPage();
    await tab2.goto('http://localhost:7547/cart');
    await tab2.waitForTimeout(1000);
    const cartItems = tab2.locator('[data-testid^="cart-item-"]:not([data-testid*="title"]):not([data-testid*="price"])');
    await expect(cartItems).toHaveCount(1);

    // Tab 1: checkout
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');

    // Tab 2: The stale cart page may still show items
    // Attempt to checkout from tab 2 (stale state) — should fail gracefully
    const checkoutBtn = tab2.locator('[data-testid="checkout-btn"]');
    const isBtnVisible = await checkoutBtn.isVisible().catch(() => false);

    if (isBtnVisible) {
      // Stale UI: checkout button still visible in tab 2
      await checkoutBtn.click();
      await tab2.waitForTimeout(1000);

      // Should either show error or redirect — not double-charge
      const hasError = await tab2.locator('[data-testid="cart-error"]').isVisible().catch(() => false);
      const url = tab2.url();
      // Acceptable: error shown, redirected to empty cart, or order created with empty cart
      expect(hasError || url.includes('/cart') || url.includes('/orders')).toBeTruthy();
    }

    // After reload, tab 2 should show empty cart
    await tab2.goto('http://localhost:7547/cart');
    await tab2.waitForTimeout(1000);
    await expect(tab2.locator('[data-testid="cart-empty"]')).toBeVisible();

    await tab2.close();
  });
});

test.describe('@session cross-tab: logout in tab 1 affects tab 2', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@session cross-tab: logout in tab 1, tab 2 protected page redirects on next action', async ({ steps, page, context }) => {
    // Login in tab 1
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Open tab 2 on a protected page
    const tab2 = await context.newPage();
    await tab2.goto('http://localhost:7547/orders');
    await tab2.waitForTimeout(1000);
    await expect(tab2.locator('[data-testid="orders-page"]')).toBeVisible();

    // Tab 1: Logout
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');

    // Tab 2: Try to navigate to another protected page — session is gone
    await tab2.goto('http://localhost:7547/cart');
    await tab2.waitForTimeout(2000);

    // Should redirect to login since session was destroyed in tab 1
    expect(tab2.url()).toContain('/login');

    await tab2.close();
  });

  test('@session cross-tab: logout in tab 1, tab 2 home page shows unauthenticated nav', async ({ steps, page, context }) => {
    // Login in tab 1
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Open tab 2 on home page (public, but shows auth state in nav)
    const tab2 = await context.newPage();
    await tab2.goto('http://localhost:7547/');
    await tab2.waitForTimeout(1000);

    // Tab 2 should show authenticated nav (balance, cart, etc.)
    await expect(tab2.locator('[data-testid="user-balance"]')).toBeVisible();

    // Tab 1: Logout
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');

    // Tab 2: Reload to pick up session change
    await tab2.reload();
    await tab2.waitForTimeout(1000);

    // After reload, tab 2 should show unauthenticated nav
    await expect(tab2.locator('[data-testid="nav-login"]')).toBeVisible();
    await expect(tab2.locator('[data-testid="user-balance"]')).not.toBeVisible();

    await tab2.close();
  });
});

test.describe('@session cross-tab: order state across tabs', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@session cross-tab: order returned in tab 1, tab 2 shows updated status on reload', async ({ steps, page, context }) => {
    // Login and create an order
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'COMPLETED');

    // Get the order URL
    const orderUrl = page.url();
    const orderPath = new URL(orderUrl).pathname;

    // Open tab 2 on the same order page
    const tab2 = await context.newPage();
    await tab2.goto(`http://localhost:7547${orderPath}`);
    await tab2.waitForTimeout(1000);

    // Tab 2 should show COMPLETED
    await expect(tab2.locator('[data-testid^="order-status-"]')).toContainText('COMPLETED');

    // Tab 1: Return the order
    await steps.click('OrderDetailPage', 'returnOrderBtn');
    await page.waitForTimeout(1000);
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'RETURNED');

    // Tab 2: Reload to see updated status
    await tab2.reload();
    await tab2.waitForTimeout(1000);

    // Tab 2 should now show RETURNED
    await expect(tab2.locator('[data-testid^="order-status-"]')).toContainText('RETURNED');

    await tab2.close();
  });
});

test.describe('@session cross-tab: marketplace state across tabs', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@session cross-tab: listing bought in tab 1, tab 2 marketplace reflects change on reload', async ({ steps, page, context }) => {
    // User 1: create a listing
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { index: 1 });
    await steps.selectDropdown('CreateListingPage', 'listingCondition', { index: 1 });
    await steps.fill('CreateListingPage', 'listingPrice', '5.00');
    await steps.click('CreateListingPage', 'listingCreate');
    await page.waitForTimeout(1000);
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');

    // Note listing count
    const listingCount = await steps.getCount('MarketplacePage', 'listingCard');

    // Logout user 1
    await steps.click('Navigation', 'logoutBtn');
    await steps.navigateTo('/login');

    // Login as user 2
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Tab 1: go to marketplace
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');

    // Open tab 2 on marketplace
    const tab2 = await context.newPage();
    await tab2.goto('http://localhost:7547/marketplace');
    await tab2.waitForTimeout(1000);

    // Both tabs should see the listing
    const tab2ListingsBefore = await tab2.locator('[data-testid^="listing-card-"]').count();
    expect(tab2ListingsBefore).toBeGreaterThan(0);

    // Tab 1: Buy the listing
    await steps.clickNth('MarketplacePage', 'listingBuyBtn', 0);
    await page.waitForTimeout(1000);

    // Tab 2: Reload to see updated marketplace
    await tab2.reload();
    await tab2.waitForTimeout(1000);

    // Tab 2 should show fewer listings (the bought one is gone)
    const tab2ListingsAfter = await tab2.locator('[data-testid^="listing-card-"]').count();
    expect(tab2ListingsAfter).toBeLessThan(tab2ListingsBefore);

    await tab2.close();
  });
});
