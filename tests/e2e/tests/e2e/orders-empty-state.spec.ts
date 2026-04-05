import { test, expect } from '../fixtures/base';

test.describe('Orders — Empty State & Display', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  test('orders page shows no-orders message for fresh user', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'heading');
    await steps.verifyPresence('OrdersPage', 'noOrdersMessage');
  });

  test('order card shows status badge on orders list', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Create an order
    await steps.navigateTo('/books/book-006');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Check orders list for status
    await steps.navigateTo('/orders');
    await steps.verifyCount('OrdersPage', 'orderCard', { greaterThan: 0 });
    await steps.verifyCount('OrdersPage', 'orderStatus', { greaterThan: 0 });
  });

  test('multiple orders display in list after several checkouts', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Create first order
    await steps.navigateTo('/books/book-006');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Create second order
    await steps.navigateTo('/books/book-004');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Verify multiple orders
    await steps.navigateTo('/orders');
    await steps.verifyCount('OrdersPage', 'orderCard', { greaterThan: 1 });
  });
});
