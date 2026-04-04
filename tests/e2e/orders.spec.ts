import { test, expect, API_BASE, TEST_USERS } from './fixtures/base';

test.describe('OrdersPage — Order Management', () => {
  test.describe.configure({ timeout: 60_000 });

  test('orders page shows no orders for fresh user', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'page');
    await steps.verifyPresence('OrdersPage', 'noOrders');
  });

  test('orders page shows order after checkout', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');

    // Add item and checkout
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Verify order appears
    await steps.navigateTo('/orders');
    await steps.verifyCount('OrderCard', 'card', { greaterThan: 0 });
  });

  test('order card shows status badge', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');

    // Create an order
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Check order status
    await steps.navigateTo('/orders');
    await steps.verifyCount('OrderCard', 'status', { greaterThan: 0 });
  });

  test('clicking order card navigates to order detail', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');

    // Create an order
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Wait for redirect to orders and verify we're still logged in
    await steps.navigateTo('/orders');
    await steps.waitForState('OrderCard', 'card', 'visible');
    await steps.clickNth('OrderCard', 'card', 0);
    await steps.verifyUrlContains('/orders/');
    await steps.verifyPresence('OrderDetailPage', 'page');
  });

  test('order detail shows items and total', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');

    // Create an order
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Navigate to order detail
    await steps.navigateTo('/orders');
    await steps.clickNth('OrderCard', 'card', 0);
    await steps.verifyPresence('OrderDetailPage', 'orderTotal');
    await steps.verifyCount('OrderDetailPage', 'orderItems', { greaterThan: 0 });
  });

  test('order detail shows return button within return window', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');

    // Create a fresh order
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Go to order detail - should have return button
    await steps.navigateTo('/orders');
    await steps.clickNth('OrderCard', 'card', 0);
    await steps.verifyPresence('OrderDetailPage', 'returnButton');
  });
});
