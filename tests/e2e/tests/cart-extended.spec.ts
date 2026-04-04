import { test, expect } from './fixtures/base';

test.describe('Cart — Extended', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async ({ request }) => {
    await request.post('http://localhost:8080/api/reset');
  });

  test.beforeEach(async ({ steps, page }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await page.request.delete('http://localhost:8080/api/cart');
  });

  test('should show empty cart message when cart is empty', async ({ steps }) => {
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'cartEmpty');
  });

  test('should clear cart using clear button', async ({ steps }) => {
    // Add a book to cart
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Go to cart and verify item exists
    await steps.click('Navigation', 'cartLink');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('CartPage', 'cartItems', { greaterThan: 0 });

    // Clear cart
    await steps.click('CartPage', 'cartClear');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('CartPage', 'cartEmpty');
  });

  test('should display cart total when items are in cart', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.click('Navigation', 'cartLink');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('CartPage', 'cartTotal');
    await steps.verifyText('CartPage', 'cartTotal', undefined, { notEmpty: true });
  });

  test('should add multiple books to cart', async ({ steps }) => {
    // Add first book
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Add second book
    await steps.navigateTo('/books/book-002');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Verify cart has multiple items
    await steps.click('Navigation', 'cartLink');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('CartPage', 'cartItems', { greaterThan: 1 });
  });
});
