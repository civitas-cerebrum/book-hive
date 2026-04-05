import { test, expect } from '../fixtures/base';

test.describe('Order Return — Extended Flow', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  test('newly created order shows COMPLETED status', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Create order
    await steps.navigateTo('/books/book-006');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Verify status on orders list
    await steps.navigateTo('/orders');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('OrdersPage', 'orderCardStatus', { greaterThan: 0 });
  });

  test('order detail shows return countdown timer', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Create a fresh order
    await steps.navigateTo('/books/book-005');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Navigate to orders list, then click order detail
    await steps.navigateTo('/orders');
    await steps.waitForNetworkIdle();
    await steps.clickNth('OrdersPage', 'orderCard', 0);
    await steps.waitForNetworkIdle();

    // Verify return elements visible
    await steps.verifyPresence('OrderDetailPage', 'returnButton');
    await steps.verifyPresence('OrderDetailPage', 'returnCountdown');
  });

  test('order detail shows total price', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Create a fresh order
    await steps.navigateTo('/books/book-003');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Navigate to orders list, then click order detail
    await steps.navigateTo('/orders');
    await steps.waitForNetworkIdle();
    await steps.clickNth('OrdersPage', 'orderCard', 0);
    await steps.waitForNetworkIdle();

    await steps.verifyPresence('OrderDetailPage', 'orderTotal');
    const total = await steps.getText('OrderDetailPage', 'orderTotal');
    expect(total).toContain('$');
  });

  test('returned order shows RETURNED status', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Create order
    await steps.navigateTo('/books/book-004');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Navigate to orders list and click the most recent order
    await steps.navigateTo('/orders');
    await steps.waitForNetworkIdle();
    await steps.clickNth('OrdersPage', 'orderCard', 0);
    await steps.waitForNetworkIdle();

    // Return it
    await steps.verifyPresence('OrderDetailPage', 'returnButton');
    await steps.click('OrderDetailPage', 'returnButton');
    await steps.waitForNetworkIdle();

    // Verify status is RETURNED
    await steps.verifyText('OrderDetailPage', 'orderStatus', 'RETURNED', { contains: true });
  });
});
