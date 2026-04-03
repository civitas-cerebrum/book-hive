import { test, expect } from '../fixtures/base';

test.describe('Order History — Multiple Orders', () => {
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

  test('multiple orders appear in order history', async ({ steps }) => {
    // First order
    await steps.clickNth('HomePage', 'addToCartButtons', 0);
    await steps.page.waitForTimeout(1000);
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.waitForState('OrderDetailPage', 'container');

    // Second order
    await steps.navigateTo('/');
    await steps.waitForState('HomePage', 'bookGrid');
    await steps.clickNth('HomePage', 'addToCartButtons', 1);
    await steps.page.waitForTimeout(1000);
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.waitForState('OrderDetailPage', 'container');

    // Check orders list
    await steps.navigateTo('/orders');
    await steps.waitForState('OrdersPage', 'container');
    await steps.verifyCount('OrdersPage', 'orderCards', { exactly: 2 });
  });

  test('clicking order card navigates to order detail', async ({ steps }) => {
    // Create an order
    await steps.clickNth('HomePage', 'addToCartButtons', 0);
    await steps.page.waitForTimeout(1000);
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.waitForState('OrderDetailPage', 'container');

    // Go to orders list and click
    await steps.navigateTo('/orders');
    await steps.waitForState('OrdersPage', 'container');
    await steps.clickNth('OrdersPage', 'orderCards', 0);
    await steps.verifyUrlContains('/orders/');
    await steps.waitForState('OrderDetailPage', 'container');
  });

  test('orders page heading is correct', async ({ steps }) => {
    await steps.navigateTo('/orders');
    await steps.waitForState('OrdersPage', 'container');
    await steps.verifyText('OrdersPage', 'heading', 'Your Orders');
  });
});
