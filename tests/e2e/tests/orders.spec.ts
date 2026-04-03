import { test, expect } from './fixtures/base';

test.describe('Orders', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps, request }) => {
    await request.post('http://localhost:8080/api/reset');
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');
  });

  test('orders page shows empty state with no orders', async ({ steps }) => {
    await steps.navigateTo('/orders');
    await steps.waitForState('OrdersPage', 'container');
    await steps.verifyPresence('OrdersPage', 'emptyMessage');
  });

  test('checkout redirects to order detail page', async ({ steps }) => {
    await steps.clickNth('HomePage', 'addToCartButton', 0);
    await steps.waitForState('Sidebar', 'cartBadge');
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.click('CartPage', 'checkoutButton');
    await steps.verifyUrlContains('/orders/');
    await steps.waitForState('OrderDetailPage', 'container');
    await steps.verifyPresence('OrderDetailPage', 'orderStatus');
    await steps.verifyPresence('OrderDetailPage', 'orderTotal');
    await steps.verifyCount('OrderDetailPage', 'orderItem', { greaterThan: 0 });
  });

  test('order appears on orders list after checkout', async ({ steps }) => {
    await steps.clickNth('HomePage', 'addToCartButton', 0);
    await steps.waitForState('Sidebar', 'cartBadge');
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.click('CartPage', 'checkoutButton');
    await steps.verifyUrlContains('/orders/');
    await steps.waitForState('OrderDetailPage', 'container');
    await steps.navigateTo('/orders');
    await steps.waitForState('OrdersPage', 'container');
    await steps.verifyCount('OrdersPage', 'orderCard', { exactly: 1 });
  });

  test('order detail shows return button and countdown for recent orders', async ({ steps }) => {
    await steps.clickNth('HomePage', 'addToCartButton', 0);
    await steps.waitForState('Sidebar', 'cartBadge');
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.click('CartPage', 'checkoutButton');
    await steps.verifyUrlContains('/orders/');
    await steps.waitForState('OrderDetailPage', 'container');
    await steps.verifyPresence('OrderDetailPage', 'returnButton');
    await steps.verifyPresence('OrderDetailPage', 'returnCountdown');
  });

  test('return order changes status to RETURNED', async ({ steps }) => {
    await steps.clickNth('HomePage', 'addToCartButton', 0);
    await steps.waitForState('Sidebar', 'cartBadge');
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.click('CartPage', 'checkoutButton');
    await steps.verifyUrlContains('/orders/');
    await steps.waitForState('OrderDetailPage', 'container');
    await steps.click('OrderDetailPage', 'returnButton');
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'RETURNED');
  });

  test('return order changes status and return button disappears', async ({ steps }) => {
    await steps.clickNth('HomePage', 'addToCartButton', 0);
    await steps.waitForState('Sidebar', 'cartBadge');
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.click('CartPage', 'checkoutButton');
    await steps.verifyUrlContains('/orders/');
    await steps.waitForState('OrderDetailPage', 'container');
    await steps.click('OrderDetailPage', 'returnButton');
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'RETURNED');
    await steps.verifyAbsence('OrderDetailPage', 'returnButton');
  });
});
