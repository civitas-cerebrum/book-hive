import { test, expect } from '../fixtures/base';

test.describe('Orders Page', () => {
  test.describe.configure({ timeout: 60_000 });

  // Stabilised: reset database before the suite to restore test user balance,
  // which gets depleted across repeated test runs performing checkouts
  test.beforeAll(async ({ request }) => {
    await request.post('http://localhost:8080/api/reset');
  });

  test.beforeEach(async ({ steps, page }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'signInButton');
    await steps.verifyPresence('NavBar', 'cartLink');
    // Stabilised: clear cart via API before each test to prevent accumulated items from prior tests
    await page.request.delete('http://localhost:8080/api/cart');
  });

  test('displays orders page heading', async ({ steps }) => {
    await steps.navigateTo('/orders');
    await steps.verifyText('OrdersPage', 'heading', 'Your Orders');
  });

  test('checkout redirects to order detail and shows completed status', async ({ steps }) => {
    // Add a book and checkout
    await steps.navigateTo('/books/book-003');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');

    // Should land on the individual order detail page
    await steps.verifyUrlContains('/orders/');
    await steps.verifyTextContains('OrderDetailPage', 'heading', 'Order #');
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'COMPLETED');
  });
});
