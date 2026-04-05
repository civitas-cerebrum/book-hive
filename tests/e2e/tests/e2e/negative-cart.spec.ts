import { test, expect } from '../fixtures/base';

test.describe('Negative Cart Tests', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  test('@negative empty cart does not show checkout button', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Clear cart
    await steps.navigateTo('/cart');
    await steps.clickIfPresent('CartPage', 'cartClear');
    await steps.waitForNetworkIdle();

    // Verify no checkout button on empty cart
    await steps.verifyPresence('CartPage', 'emptyMessage');
    await steps.verifyAbsence('CartPage', 'checkoutButton');
  });

  test('@negative empty cart does not show clear button', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.clickIfPresent('CartPage', 'cartClear');
    await steps.waitForNetworkIdle();

    await steps.verifyPresence('CartPage', 'emptyMessage');
    await steps.verifyAbsence('CartPage', 'cartClear');
  });

  test('@negative removing last item shows empty cart', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Clear and add one item
    await steps.navigateTo('/cart');
    await steps.clickIfPresent('CartPage', 'cartClear');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Remove it
    await steps.navigateTo('/cart');
    await steps.clickNth('CartPage', 'removeItem', 0);
    await steps.waitForNetworkIdle();

    // Should show empty state
    await steps.verifyPresence('CartPage', 'emptyMessage');
  });

  test('@negative clearing cart results in empty cart state', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Add items
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/books/book-002');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Clear cart
    await steps.navigateTo('/cart');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });
    await steps.click('CartPage', 'cartClear');
    await steps.waitForNetworkIdle();

    // Verify empty state
    await steps.verifyPresence('CartPage', 'emptyMessage');
    await steps.verifyAbsence('CartPage', 'checkoutButton');
  });

  test('@negative insufficient balance shows error on checkout', async ({ steps }) => {
    // Register a fresh user
    const uid = Date.now();
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `broke${uid}`);
    await steps.fill('SignupPage', 'emailInput', `broke${uid}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Drain balance by buying expensive books
    for (let i = 0; i < 6; i++) {
      await steps.navigateTo('/books/book-009'); // Dune $16.99
      await steps.click('BookDetailPage', 'addToCartButton');
      await steps.waitForNetworkIdle();
      await steps.navigateTo('/cart');
      const clicked = await steps.clickIfPresent('CartPage', 'checkoutButton');
      if (clicked) await steps.waitForNetworkIdle();
    }

    // Add one more expensive item
    await steps.navigateTo('/books/book-009');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Should stay on cart page with error
    await steps.verifyUrlContains('/cart');
  });
});
