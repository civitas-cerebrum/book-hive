import { test, expect } from '../fixtures/base';

test.describe('Order Return Happy Path', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ steps, page }) => {
    await page.request.post('http://localhost:8080/api/reset');
    // Log in as testuser2 (reset gives $100 balance, clean cart)
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
  });

  test('@functional order-return-happy returns a recently completed order', async ({ steps }) => {
    // Create an order by purchasing a book
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'COMPLETED');

    // Verify return countdown is visible (within 10-minute window)
    await steps.verifyPresence('OrderDetailPage', 'returnCountdown');
    await steps.verifyPresence('OrderDetailPage', 'returnOrderBtn');

    // Click return order
    await steps.click('OrderDetailPage', 'returnOrderBtn');

    // Verify order status changed to RETURNED
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'RETURNED');
  });

  test('@functional order-return-happy returned order appears in orders list', async ({ steps }) => {
    // Create and return an order
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
    await steps.click('OrderDetailPage', 'returnOrderBtn');
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'RETURNED');

    // Go to orders list and verify order appears
    await steps.click('Navigation', 'navOrders');
    await steps.verifyPresence('OrdersPage', 'ordersPage');
    await steps.verifyCount('OrdersPage', 'orderCard', { greaterThan: 0 });
  });

  test('@functional order-return-happy order detail shows total and items', async ({ steps }) => {
    // Create an order
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');

    // Verify order detail data
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
    await steps.verifyText('OrderDetailPage', 'orderTotal', undefined, { notEmpty: true });
    await steps.verifyCount('OrderDetailPage', 'orderItem', { greaterThan: 0 });
  });
});
