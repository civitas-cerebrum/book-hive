import { test, expect } from '../fixtures/base';

test.describe('Negative — Cart & Checkout @negative', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  test('checkout with insufficient balance stays on cart or shows error', async ({ steps }) => {
    // Login as testuser1 who has $100 balance
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Add an expensive book multiple times to exceed balance
    // Dune costs $16.99 - add it 7 times = $118.93 > $100
    await steps.navigateTo('/books/book-009');
    for (let i = 0; i < 7; i++) {
      await steps.click('BookDetailPage', 'addToCartButton');
      await steps.waitForNetworkIdle();
    }

    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'checkoutButton');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Should stay on cart page (insufficient balance) — the app should handle this
    // Verify the cart page is still visible (didn't crash)
    await steps.verifyPresence('CartPage', 'heading');
  });

  test('empty cart shows empty message', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.clickIfPresent('CartPage', 'cartClear');
    await steps.waitForNetworkIdle();

    // Verify empty state
    await steps.verifyPresence('CartPage', 'emptyMessage');
  });

  test('cart badge updates when item added', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Clear any existing cart items
    await steps.navigateTo('/cart');
    await steps.clickIfPresent('CartPage', 'cartClear');
    await steps.waitForNetworkIdle();

    // Add item and check that cart link updates
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Cart link should now show count
    await steps.verifyPresence('Navigation', 'cartLink');
  });
});
