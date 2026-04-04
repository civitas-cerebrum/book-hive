import { test, expect } from '../fixtures/base';

test.describe('Orders', () => {
  test.describe.configure({ timeout: 60_000 });

  test('unauthenticated user cannot access orders', async ({ steps }) => {
    await steps.navigateTo('/orders');
    await steps.verifyUrlContains('/login');
  });

  test('orders page shows empty state when no orders', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'heading');
    await steps.verifyPresence('OrdersPage', 'noOrdersMessage');
  });

  test('orders page shows orders after checkout', async ({ steps }) => {
    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Add item and checkout
    await steps.navigateTo('/books/book-003');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Verify orders
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'heading');
    await steps.verifyCount('OrdersPage', 'orderCard', { greaterThan: 0 });
  });

  test('clicking an order card shows order detail', async ({ steps }) => {
    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Add item and checkout
    await steps.navigateTo('/books/book-004');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Navigate to orders and click one
    await steps.navigateTo('/orders');
    await steps.clickNth('OrdersPage', 'orderCard', 0);
    await steps.verifyUrlContains('/orders/');
  });
});
