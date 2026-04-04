import { test, expect } from './fixtures/base';

test.describe('Balance & Order Detail', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async ({ request }) => {
    await request.post('http://localhost:8080/api/reset');
  });

  test.beforeEach(async ({ steps, page }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await page.request.delete('http://localhost:8080/api/cart');
  });

  test('should display user balance in navigation', async ({ steps }) => {
    await steps.verifyPresence('Navigation', 'userBalance');
    await steps.verifyText('Navigation', 'userBalance', undefined, { notEmpty: true });
  });

  test('should deduct balance after checkout', async ({ steps }) => {
    // Get initial balance
    const initialBalance = await steps.getText('Navigation', 'userBalance');

    // Add a cheap book and checkout
    await steps.navigateTo('/books/book-006');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.click('Navigation', 'cartLink');
    await steps.waitForNetworkIdle();
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Verify order detail page
    await steps.verifyUrlContains('/orders/');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');

    // Navigate to profile to check updated balance
    await steps.click('Navigation', 'profileLink');
    await steps.waitForNetworkIdle();
    const newBalance = await steps.getText('ProfilePage', 'balance');

    // Balance should have changed (decreased)
    expect(newBalance).not.toBe(initialBalance);
  });

  test('should show order items on order detail page', async ({ steps }) => {
    // Add book and checkout
    await steps.navigateTo('/books/book-005');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.click('Navigation', 'cartLink');
    await steps.waitForNetworkIdle();
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Verify order detail
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
    await steps.verifyCount('OrderDetailPage', 'orderItems', { greaterThan: 0 });
    await steps.verifyPresence('OrderDetailPage', 'orderTotal');
    await steps.verifyText('OrderDetailPage', 'orderTotal', undefined, { notEmpty: true });
  });

  test('should navigate from orders list to order detail', async ({ steps }) => {
    // First create an order
    await steps.navigateTo('/books/book-004');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.click('Navigation', 'cartLink');
    await steps.waitForNetworkIdle();
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Go to orders list
    await steps.click('Navigation', 'ordersLink');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('OrdersPage', 'ordersPage');
    await steps.verifyCount('OrdersPage', 'orderCards', { greaterThan: 0 });

    // Click first order card to see details
    await steps.clickNth('OrdersPage', 'orderCards', 0);
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/orders/');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
  });
});
