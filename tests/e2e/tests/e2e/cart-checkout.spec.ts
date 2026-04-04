import { test, expect } from '../fixtures/base';

test.describe('Cart & Checkout', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    // Reset database to ensure clean balance state for checkout tests
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  test.beforeEach(async ({ steps }) => {
    // Login before each test
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
  });

  test('empty cart shows empty message', async ({ steps }) => {
    // Clear cart if any items remain from other tests
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'heading');
    const hasItems = await steps.clickIfPresent('CartPage', 'cartClear');
    if (hasItems) {
      await steps.waitForNetworkIdle();
    }
    await steps.verifyPresence('CartPage', 'emptyMessage');
  });

  test('add item to cart from homepage', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.clickNth('HomePage', 'addToCartButton', 0);
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });
  });

  test('add item to cart from book detail page', async ({ steps }) => {
    await steps.navigateTo('/books/book-002');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });
  });

  test('cart shows total price', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'cartTotal');
    await steps.verifyText('CartPage', 'cartTotal', undefined, { notEmpty: true });
  });

  test('clear cart removes all items', async ({ steps }) => {
    // Add item
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'cartClear');
    await steps.click('CartPage', 'cartClear');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('CartPage', 'emptyMessage');
  });

  test('checkout creates an order', async ({ steps }) => {
    // Add item
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'checkoutButton');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();
    // Should redirect to orders
    await steps.verifyUrlContains('/orders');
  });
});
