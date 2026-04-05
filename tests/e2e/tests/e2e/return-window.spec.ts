import { test, expect } from '../fixtures/base';

test.describe('Order Return — Window & Status', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  test('recently created order shows return countdown', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Create an order
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Navigate to order detail
    await steps.navigateTo('/orders');
    await steps.clickNth('OrdersPage', 'orderCard', 0);
    await steps.verifyUrlContains('/orders/');
    await steps.verifyPresence('OrderDetailPage', 'returnCountdown');
    await steps.verifyPresence('OrderDetailPage', 'returnButton');
  });

  test('order detail shows order total', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/books/book-002');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/orders');
    await steps.clickNth('OrdersPage', 'orderCard', 0);
    await steps.verifyPresence('OrderDetailPage', 'orderTotal');
    await steps.verifyText('OrderDetailPage', 'orderTotal', undefined, { notEmpty: true });
  });

  test('returned order shows RETURNED status', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Create and return an order
    await steps.navigateTo('/books/book-003');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/orders');
    await steps.clickNth('OrdersPage', 'orderCard', 0);
    await steps.click('OrderDetailPage', 'returnButton');
    await steps.waitForNetworkIdle();

    // Verify returned status
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'RETURNED');
    // Return button should no longer be present
    await steps.verifyAbsence('OrderDetailPage', 'returnButton');
  });

  test('returned order does not show return button', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Create and return
    await steps.navigateTo('/books/book-004');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/orders');
    await steps.clickNth('OrdersPage', 'orderCard', 0);
    await steps.click('OrderDetailPage', 'returnButton');
    await steps.waitForNetworkIdle();

    // Verify no return button on returned order
    await steps.verifyAbsence('OrderDetailPage', 'returnButton');
    await steps.verifyAbsence('OrderDetailPage', 'returnCountdown');
  });
});
