import { test, expect } from '../fixtures/base';

test.describe('Cart & Checkout Flow', () => {
  test.describe.configure({ timeout: 60_000 });

  // Stabilised: reset database before the suite to restore test user balance,
  // which gets depleted across repeated test runs performing checkouts
  test.beforeAll(async ({ request }) => {
    await request.post('http://localhost:8080/api/reset');
  });

  test.beforeEach(async ({ steps, page }) => {
    // Stabilised: clear cart via API before each test to prevent state leaking between tests
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'signInButton');
    await steps.verifyPresence('NavBar', 'cartLink');
    // Clear any leftover cart items from previous tests
    await page.request.delete('http://localhost:8080/api/cart');
  });

  test('shows empty cart initially', async ({ steps }) => {
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'emptyCart');
  });

  test('adds book to cart from detail page and sees it in cart', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });
    await steps.verifyPresence('CartPage', 'cartTotal');
  });

  test('completes checkout flow', async ({ steps }) => {
    // Add an item to cart
    await steps.navigateTo('/books/book-002');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });

    // Checkout
    await steps.click('CartPage', 'checkoutButton');
    await steps.verifyUrlContains('/orders');
  });
});
