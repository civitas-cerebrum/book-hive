import { test, expect } from '../fixtures/base';

test.describe('Order Detail -- Complete Coverage', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  test('order detail shows total price', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/books/book-001');
    await steps.waitForNetworkIdle();
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.waitForNetworkIdle();
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
    await steps.verifyPresence('OrderDetailPage', 'orderTotal');
    await steps.verifyText('OrderDetailPage', 'orderTotal', undefined, { notEmpty: true });
    const totalText = await steps.getText('OrderDetailPage', 'orderTotal');
    expect(totalText).toContain('$');
  });

  test('order detail shows return countdown for recent order', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/books/book-002');
    await steps.waitForNetworkIdle();
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.waitForNetworkIdle();
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
    await steps.verifyPresence('OrderDetailPage', 'returnCountdown');
    await steps.verifyPresence('OrderDetailPage', 'returnButton');
  });

  test('order detail shows COMPLETED status for new order', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/books/book-003');
    await steps.waitForNetworkIdle();
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.waitForNetworkIdle();
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'COMPLETED');
  });

  test('order item details are displayed', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/books/book-004');
    await steps.waitForNetworkIdle();
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.waitForNetworkIdle();
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    await steps.verifyPresence('OrderDetailPage', 'orderItem');
    await steps.verifyCount('OrderDetailPage', 'orderItem', { exactly: 1 });
  });
});
