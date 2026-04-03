import { test, expect } from '../fixtures/base';

test.describe('Cart & Checkout Flow', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    // Reset DB and login
    await steps.page.request.post('http://localhost:8080/api/reset');
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
    await steps.verifyText('CartPage', 'emptyMessage', 'Your cart is empty');
  });

  test('add item to cart from homepage', async ({ steps }) => {
    await steps.clickNth('HomePage', 'addToCartButtons', 0);
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.verifyCount('CartPage', 'cartItems', { greaterThan: 0 });
    await steps.verifyPresence('CartPage', 'totalPrice');
  });

  test('add item to cart from book detail page', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.waitForState('BookDetailPage', 'container');
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.verifyCount('CartPage', 'cartItems', { greaterThan: 0 });
  });

  test('clear cart removes all items', async ({ steps }) => {
    // Add an item first
    await steps.clickNth('HomePage', 'addToCartButtons', 0);
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.verifyCount('CartPage', 'cartItems', { greaterThan: 0 });
    await steps.click('CartPage', 'clearCartBtn');
    await steps.waitForState('CartPage', 'emptyMessage');
    await steps.verifyPresence('CartPage', 'emptyMessage');
  });

  test('checkout creates an order', async ({ steps }) => {
    // Add an item
    await steps.clickNth('HomePage', 'addToCartButtons', 0);
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.verifyCount('CartPage', 'cartItems', { greaterThan: 0 });
    await steps.click('CartPage', 'checkoutBtn');
    // Should redirect to order detail
    await steps.verifyUrlContains('/orders/');
    await steps.waitForState('OrderDetailPage', 'container');
    await steps.verifyPresence('OrderDetailPage', 'orderTotal');
  });

  test('cart heading is displayed', async ({ steps }) => {
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.verifyText('CartPage', 'heading', 'Shopping Cart');
  });
});
