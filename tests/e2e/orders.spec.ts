import { test, expect, TEST_USERS, loginViaAPI, clearCartViaAPI, resetDatabase } from './fixtures/base';

test.describe('Orders', () => {
  test.describe.configure({ timeout: 60000 });

  test('should show no orders initially after reset', async ({ steps, loginAsUser1 }) => {
    await resetDatabase();
    await loginAsUser1();
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'page');
    await steps.verifyPresence('OrdersPage', 'noOrders');
  });

  test('should display order after purchase', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/books/book-006');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    // After checkout, app navigates directly to order detail page
    await steps.verifyUrlContains('/orders/');
    await steps.verifyPresence('OrderDetailPage', 'page');
    // Verify order was created by navigating to orders list
    await steps.navigateTo('/orders');
    await steps.verifyCount('OrdersPage', 'orderCard', { greaterThan: 0 });
  });

  test('should navigate to order detail from list', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/books/book-007');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.verifyUrlContains('/orders/');
    // Navigate to orders list then click to detail
    await steps.navigateTo('/orders');
    await steps.clickNth('OrdersPage', 'orderCard', 0);
    await steps.verifyPresence('OrderDetailPage', 'page');
  });

  test('should show return button and countdown on recent order', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/books/book-008');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    // After checkout, we're already on order detail page
    await steps.verifyUrlContains('/orders/');
    await steps.verifyPresence('OrderDetailPage', 'returnButton');
    await steps.verifyPresence('OrderDetailPage', 'returnCountdown');
  });

  test('should process order return', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/books/book-009');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    // After checkout, we're already on order detail page
    await steps.verifyUrlContains('/orders/');
    await steps.click('OrderDetailPage', 'returnButton');
    await steps.waitForNetworkIdle();
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'RETURNED');
  });

  test('should display order total on detail page', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/books/book-010');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    // After checkout, we're already on order detail page
    await steps.verifyUrlContains('/orders/');
    await steps.verifyPresence('OrderDetailPage', 'total');
    await steps.verifyText('OrderDetailPage', 'total', undefined, { notEmpty: true });
  });
});
