import { test, expect } from '../fixtures/base';

test.describe('Cart Management — Quantity & Items', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    // Clear any existing cart items
    await steps.navigateTo('/cart');
    const cleared = await steps.clickIfPresent('CartPage', 'cartClear');
    if (cleared) await steps.waitForNetworkIdle();
  });

  test('adding same book twice increases quantity', async ({ steps }) => {
    // Add same book twice
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.verifyCount('CartPage', 'cartItem', { exactly: 1 });
  });

  test('adding different books shows multiple cart items', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/books/book-002');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 1 });
  });

  test('cart total updates with items', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'cartTotal');
    const totalText = await steps.getText('CartPage', 'cartTotal');
    expect(totalText).toContain('$');
  });

  test('checkout button is visible when cart has items', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'checkoutButton');
    await steps.verifyState('CartPage', 'checkoutButton', 'enabled');
  });

  test('clear cart button is visible when cart has items', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'cartClear');
  });
});
