import { test, expect } from '../fixtures/base';

test.describe('Cart and Checkout', () => {
  test.describe.configure({ timeout: 60_000, mode: 'serial' });

  // Helper to create and login a test user
  const createAndLoginUser = async (steps: any) => {
    const timestamp = Date.now();
    const username = `cartuser${timestamp}`;
    const email = `cartuser${timestamp}@example.com`;

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', username);
    await steps.fill('SignupPage', 'emailInput', email);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('Sidebar', 'logoutBtn');
  };

  test('should show empty cart message when cart is empty', async ({ steps }) => {
    await createAndLoginUser(steps);
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'container');
    await steps.verifyPresence('CartPage', 'emptyMessage');
  });

  test('should add book to cart from home page', async ({ steps }) => {
    await createAndLoginUser(steps);
    await steps.navigateTo('/');

    // Add first book to cart
    await steps.click('HomePage', 'addToCartFirst');
    await steps.waitForNetworkIdle();

    // Verify cart badge appears
    await steps.verifyPresence('Sidebar', 'cartBadge');
  });

  test('should add book to cart from detail page', async ({ steps }) => {
    await createAndLoginUser(steps);
    await steps.navigateTo('/books/book-001');

    await steps.verifyPresence('BookDetailPage', 'addToCartBtn');
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    // Verify cart badge appears
    await steps.verifyPresence('Sidebar', 'cartBadge');
  });

  test('should show cart with items after adding', async ({ steps }) => {
    await createAndLoginUser(steps);

    // Add a book to cart
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    // Navigate to cart
    await steps.click('Sidebar', 'navCart');
    await steps.verifyPresence('CartPage', 'container');

    // Should not show empty message
    await steps.verifyAbsence('CartPage', 'emptyMessage');

    // Should show cart total and checkout button
    await steps.verifyPresence('CartPage', 'total');
    await steps.verifyPresence('CartPage', 'checkoutBtn');
    await steps.verifyPresence('CartPage', 'clearBtn');
  });

  test('should clear cart when clicking clear button', async ({ steps }) => {
    await createAndLoginUser(steps);

    // Add a book to cart
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    // Navigate to cart
    await steps.click('Sidebar', 'navCart');
    await steps.verifyAbsence('CartPage', 'emptyMessage');

    // Clear cart
    await steps.click('CartPage', 'clearBtn');
    await steps.waitForNetworkIdle();

    // Should show empty message
    await steps.verifyPresence('CartPage', 'emptyMessage');
  });

  test('should show no orders message when no orders exist', async ({ steps }) => {
    await createAndLoginUser(steps);
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'container');
    await steps.verifyPresence('OrdersPage', 'noOrders');
  });

  test('should display checkout button and allow clicking', async ({ steps }) => {
    await createAndLoginUser(steps);

    // Add a book to cart
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    // Navigate to cart
    await steps.click('Sidebar', 'navCart');
    await steps.verifyPresence('CartPage', 'checkoutBtn');

    // Verify checkout button is clickable (but may fail due to insufficient funds)
    await steps.click('CartPage', 'checkoutBtn');

    // Note: New users have $0 balance, so checkout fails silently
    // This is noted for bug discovery - should show error message
    await steps.waitForNetworkIdle();

    // Still on cart page (checkout failed due to insufficient funds)
    await steps.verifyUrlContains('/cart');
  });

  // Cleanup
  test.afterEach(async ({ steps }) => {
    // Try to logout if logged in
    await steps.clickIfPresent('Sidebar', 'logoutBtn');
  });
});
