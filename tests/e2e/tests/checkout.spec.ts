import { test, expect } from '../fixtures/base';

test.describe('Checkout Flow', () => {
  test.describe.configure({ timeout: 60_000 });

  // BUG-002: New users cannot checkout because they start with $0 balance
  // and there's no way to add funds in the application.
  // See tests/bug-discovery/checkout-bugs.spec.ts for reproduction tests.
  // These tests are skipped until the bug is fixed.

  test.skip('should complete checkout and create order - BLOCKED BY BUG-002', async ({ steps }) => {
    const timestamp = Date.now();

    // Create account
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `checkout${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `checkout${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    // Verify logged in
    await steps.verifyPresence('Sidebar', 'logoutBtn');

    // Add item to cart
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    // Checkout
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.waitForNetworkIdle();

    // Should be redirected to order detail
    await steps.verifyUrlContains('/orders/');
    await steps.verifyPresence('OrderDetailPage', 'container');
  });

  test.skip('should show order in orders list after checkout - BLOCKED BY BUG-002', async ({ steps }) => {
    const timestamp = Date.now();

    // Create account
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `orderlist${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `orderlist${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    // Verify logged in
    await steps.verifyPresence('Sidebar', 'logoutBtn');

    // Add item and checkout
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.waitForNetworkIdle();

    // Go to orders list
    await steps.navigateTo('/orders');
    await steps.verifyAbsence('OrdersPage', 'noOrders');
    await steps.verifyPresence('OrdersPage', 'orderCard');
  });
});
