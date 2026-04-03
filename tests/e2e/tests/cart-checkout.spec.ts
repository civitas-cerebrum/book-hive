import { test, expect } from './fixtures/base';

test.describe('Cart & Checkout', () => {
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

  test('empty cart shows empty message', async ({ steps }) => {
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.verifyPresence('CartPage', 'emptyMessage');
  });

  test('add to cart from home page', async ({ steps }) => {
    await steps.clickNth('HomePage', 'addToCartButton', 0);
    await steps.waitForState('Sidebar', 'cartBadge');
    await steps.verifyTextContains('Sidebar', 'cartBadge', '1');
  });

  test('add to cart from book detail page', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.waitForState('BookDetailPage', 'container');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForState('Sidebar', 'cartBadge');
    await steps.verifyTextContains('Sidebar', 'cartBadge', '1');
  });

  test('cart displays added items correctly', async ({ steps }) => {
    await steps.clickNth('HomePage', 'addToCartButton', 0);
    await steps.waitForState('Sidebar', 'cartBadge');
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.waitForState('CartPage', 'cartTotal');
    await steps.verifyCount('CartPage', 'cartItem', { exactly: 1 });
    await steps.verifyPresence('CartPage', 'cartTotal');
    await steps.verifyPresence('CartPage', 'checkoutButton');
    await steps.verifyPresence('CartPage', 'clearCartButton');
  });

  test('clear cart removes all items', async ({ steps }) => {
    await steps.clickNth('HomePage', 'addToCartButton', 0);
    await steps.waitForState('Sidebar', 'cartBadge');
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.waitForState('CartPage', 'cartItem');
    await steps.click('CartPage', 'clearCartButton');
    await steps.verifyPresence('CartPage', 'emptyMessage');
  });

  test('checkout creates order and redirects to order detail', async ({ steps }) => {
    await steps.clickNth('HomePage', 'addToCartButton', 0);
    await steps.waitForState('Sidebar', 'cartBadge');
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.waitForState('CartPage', 'checkoutButton');
    await steps.click('CartPage', 'checkoutButton');
    await steps.verifyUrlContains('/orders/');
    await steps.waitForState('OrderDetailPage', 'container');
    await steps.verifyPresence('OrderDetailPage', 'orderStatus');
    await steps.verifyCount('OrderDetailPage', 'orderItem', { greaterThan: 0 });
  });

  test('checkout navigates to order detail with correct status', async ({ steps }) => {
    await steps.clickNth('HomePage', 'addToCartButton', 0);
    await steps.waitForState('Sidebar', 'cartBadge');
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.waitForState('CartPage', 'checkoutButton');
    await steps.click('CartPage', 'checkoutButton');
    await steps.verifyUrlContains('/orders/');
    await steps.waitForState('OrderDetailPage', 'container');
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'COMPLETED');
    await steps.verifyPresence('OrderDetailPage', 'orderTotal');
  });
});
