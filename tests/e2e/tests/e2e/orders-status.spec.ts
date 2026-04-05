import { test, expect } from '../fixtures/base';

test.describe('Orders -- Status Display', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  test('order card displays status badge', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Create an order
    await steps.navigateTo('/books/book-010');
    await steps.waitForNetworkIdle();
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.waitForNetworkIdle();
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Go to orders list
    await steps.navigateTo('/orders');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('OrdersPage', 'orderCard', { greaterThan: 0 });
    await steps.verifyCount('OrdersPage', 'orderCardStatus', { greaterThan: 0 });
    await steps.verifyText('OrdersPage', 'orderCardStatus', undefined, { notEmpty: true });
  });

  test('returned order shows RETURNED status on orders list', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Create and return an order
    await steps.navigateTo('/books/book-011');
    await steps.waitForNetworkIdle();
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.waitForNetworkIdle();
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Return the order
    await steps.verifyPresence('OrderDetailPage', 'returnButton');
    await steps.click('OrderDetailPage', 'returnButton');
    await steps.waitForNetworkIdle();
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'RETURNED');

    // Verify on orders list
    await steps.navigateTo('/orders');
    await steps.waitForNetworkIdle();

    const allStatuses = await steps.getAll('OrdersPage', 'orderCardStatus');
    const hasReturned = allStatuses.some((s: string) => s.includes('RETURNED'));
    expect(hasReturned).toBe(true);
  });

  test('multiple orders show correct count', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/orders');
    await steps.waitForNetworkIdle();

    const orderCount = await steps.getCount('OrdersPage', 'orderCard');
    expect(orderCount).toBeGreaterThan(0);
  });
});
