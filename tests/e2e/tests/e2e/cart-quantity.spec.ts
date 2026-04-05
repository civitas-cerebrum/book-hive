import { test, expect } from '../fixtures/base';

test.describe('Cart — Quantity Controls & Item Removal', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    // Clear cart
    await steps.navigateTo('/cart');
    const cleared = await steps.clickIfPresent('CartPage', 'cartClear');
    if (cleared) await steps.waitForNetworkIdle();
  });

  test('increase quantity with plus button', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.verifyCount('CartPage', 'cartItem', { exactly: 1 });
    await steps.clickNth('CartPage', 'qtyPlus', 0);
    await steps.waitForNetworkIdle();
    await steps.verifyText('CartPage', 'qtyValue', '2');
  });

  test('decrease quantity with minus button', async ({ steps }) => {
    // Add book twice to get qty 2
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.verifyText('CartPage', 'qtyValue', '2');
    await steps.clickNth('CartPage', 'qtyMinus', 0);
    await steps.waitForNetworkIdle();
    await steps.verifyText('CartPage', 'qtyValue', '1');
  });

  test('remove item button removes item from cart', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.verifyCount('CartPage', 'cartItem', { exactly: 1 });
    await steps.clickNth('CartPage', 'removeItem', 0);
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('CartPage', 'emptyMessage');
  });

  test('cart shows item title and price', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.verifyText('CartPage', 'cartItemTitle', undefined, { notEmpty: true });
    await steps.verifyText('CartPage', 'cartItemPrice', undefined, { notEmpty: true });
  });

  test('minus button is disabled when quantity is 1', async ({ steps }) => {
    await steps.navigateTo('/books/book-002');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.verifyCount('CartPage', 'cartItem', { exactly: 1 });
    await steps.verifyText('CartPage', 'qtyValue', '1');
    await steps.verifyState('CartPage', 'qtyMinus', 'disabled');
  });
});
