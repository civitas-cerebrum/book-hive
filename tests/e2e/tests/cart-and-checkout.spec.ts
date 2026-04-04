import { test, expect } from './fixtures/base';

test.describe('Cart & Checkout Flow', () => {
  test.describe.configure({ timeout: 60_000 });

  // Stabilised: reset database before the suite to restore test user balance,
  // which gets depleted across repeated test runs performing checkouts
  test.beforeAll(async ({ request }) => {
    await request.post('http://localhost:8080/api/reset');
  });

  test.beforeEach(async ({ steps, page }) => {
    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    // Stabilised: clear cart to prevent accumulated items from prior tests
    await page.request.delete('http://localhost:8080/api/cart');
  });

  test('should add book to cart, view cart, and checkout to order detail', async ({ steps }) => {
    // Add a book to cart
    await steps.navigateTo('/books/book-002');
    await steps.verifyPresence('BookDetailPage', 'addToCartButton');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Go to cart
    await steps.click('Navigation', 'cartLink');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('CartPage', 'cartPage');
    await steps.verifyCount('CartPage', 'cartItems', { greaterThan: 0 });
    await steps.verifyPresence('CartPage', 'cartTotal');
    await steps.verifyPresence('CartPage', 'checkoutButton');

    // Checkout — redirects to order detail page
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Checkout redirects to order detail, not orders list
    await steps.verifyUrlContains('/orders/');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
    await steps.verifyPresence('OrderDetailPage', 'orderTotal');
    await steps.verifyCount('OrderDetailPage', 'orderItems', { greaterThan: 0 });
  });

  test('should show orders list with past orders', async ({ steps }) => {
    // Add a book and checkout to create an order
    await steps.navigateTo('/books/book-004');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.click('Navigation', 'cartLink');
    await steps.waitForNetworkIdle();
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Navigate to orders list
    await steps.click('Navigation', 'ordersLink');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('OrdersPage', 'ordersPage');
    await steps.verifyCount('OrdersPage', 'orderCards', { greaterThan: 0 });
  });
});
