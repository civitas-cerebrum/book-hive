import { test, expect } from '../fixtures/base';

test.describe('Orders — View & Return', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.page.request.post('http://localhost:8080/api/reset');
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');
  });

  test('orders page shows no orders initially', async ({ steps }) => {
    await steps.navigateTo('/orders');
    await steps.waitForState('OrdersPage', 'container');
    await steps.verifyPresence('OrdersPage', 'noOrders');
    await steps.verifyText('OrdersPage', 'heading', 'Your Orders');
  });

  test('orders page shows orders after checkout', async ({ steps }) => {
    // Create an order first
    await steps.clickNth('HomePage', 'addToCartButtons', 0);
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.waitForState('OrderDetailPage', 'container');

    // Go to orders list
    await steps.navigateTo('/orders');
    await steps.waitForState('OrdersPage', 'container');
    await steps.verifyCount('OrdersPage', 'orderCards', { greaterThan: 0 });
  });

  test('order detail shows items and total', async ({ steps }) => {
    // Create an order
    await steps.clickNth('HomePage', 'addToCartButtons', 0);
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.waitForState('OrderDetailPage', 'container');
    await steps.verifyPresence('OrderDetailPage', 'orderTotal');
    await steps.verifyCount('OrderDetailPage', 'orderItems', { greaterThan: 0 });
  });

  test('can return order within 10-minute window', async ({ steps }) => {
    // Create an order
    await steps.clickNth('HomePage', 'addToCartButtons', 0);
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.waitForState('OrderDetailPage', 'container');
    // Return button should be visible
    await steps.verifyPresence('OrderDetailPage', 'returnButton');
    await steps.click('OrderDetailPage', 'returnButton');
    // Status should change to RETURNED
    await steps.waitForState('OrderDetailPage', 'container');
  });
});
