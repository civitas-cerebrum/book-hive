import { test, expect } from './fixtures/base';

test.describe('Order Return Flow', () => {
  test.describe.configure({ timeout: 60_000 });

  test('return an order within return window', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');

    // Create an order
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Go to order detail and return
    await steps.navigateTo('/orders');
    await steps.waitForState('OrderCard', 'card', 'visible');
    await steps.clickNth('OrderCard', 'card', 0);
    await steps.verifyPresence('OrderDetailPage', 'returnButton');
    await steps.verifyPresence('OrderDetailPage', 'returnCountdown');
    await steps.clickNth('OrderDetailPage', 'returnButton', 0);
    await steps.waitForNetworkIdle();

    // Verify order status changed
    const status = await steps.getText('OrderDetailPage', 'orderStatus');
    expect(status.toUpperCase()).toContain('RETURNED');
  });

  test('order detail shows order total', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');

    // Create an order
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Check order detail
    await steps.navigateTo('/orders');
    await steps.waitForState('OrderCard', 'card', 'visible');
    await steps.clickNth('OrderCard', 'card', 0);
    const total = await steps.getText('OrderDetailPage', 'orderTotal');
    expect(total).toContain('$');
    expect(parseFloat(total.replace(/[^0-9.]/g, ''))).toBeGreaterThan(0);
  });

  test('order with multiple items shows all items', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');

    // Add multiple items
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/books/book-002');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Check order detail
    await steps.navigateTo('/orders');
    await steps.waitForState('OrderCard', 'card', 'visible');
    await steps.clickNth('OrderCard', 'card', 0);
    await steps.verifyCount('OrderDetailPage', 'orderItems', { exactly: 2 });
  });
});
