import { test, expect } from '../fixtures/base';

test.describe('Checkout — Insufficient Balance', () => {
  test.describe.configure({ timeout: 60_000 });

  test('checkout with insufficient balance shows error', async ({ steps }) => {
    // Register a fresh user with $100 starting balance
    const uniqueId = Date.now();
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `pooruser${uniqueId}`);
    await steps.fill('SignupPage', 'emailInput', `pooruser${uniqueId}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Drain balance by buying expensive books repeatedly
    // Each checkout spends money. Add expensive books ($16.99 each) until balance runs low
    for (let i = 0; i < 6; i++) {
      await steps.navigateTo('/books/book-009'); // Dune - $16.99
      await steps.click('BookDetailPage', 'addToCartButton');
      await steps.waitForNetworkIdle();
      await steps.navigateTo('/cart');
      const checkoutClicked = await steps.clickIfPresent('CartPage', 'checkoutButton');
      if (checkoutClicked) {
        await steps.waitForNetworkIdle();
      }
    }

    // Now try to checkout with insufficient balance
    await steps.navigateTo('/books/book-009'); // Dune - $16.99
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Should stay on cart page (checkout failed)
    await steps.verifyUrlContains('/cart');
  });
});
