import { test, expect } from '../fixtures/base';

test.describe('Order Detail & Return', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    // Reset database to ensure clean balance state for order tests
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  test('order detail page shows order information', async ({ steps }) => {
    // Login and create an order
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Add item and checkout
    await steps.navigateTo('/books/book-005');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Navigate to order detail
    await steps.navigateTo('/orders');
    await steps.clickNth('OrdersPage', 'orderCard', 0);
    await steps.verifyUrlContains('/orders/');
    await steps.verifyPresence('OrderDetailPage', 'orderStatus');
  });

  test('order detail shows order items', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/books/book-006');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/orders');
    await steps.clickNth('OrdersPage', 'orderCard', 0);
    await steps.verifyPresence('OrderDetailPage', 'orderItem');
  });

  test('recently created order shows return button', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/books/book-007');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/orders');
    await steps.clickNth('OrdersPage', 'orderCard', 0);
    await steps.verifyPresence('OrderDetailPage', 'returnButton');
  });

  test('return order changes order status', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/books/book-008');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/orders');
    await steps.clickNth('OrdersPage', 'orderCard', 0);
    await steps.click('OrderDetailPage', 'returnButton');
    await steps.waitForNetworkIdle();

    // Verify order status changed
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'RETURNED');
  });
});
