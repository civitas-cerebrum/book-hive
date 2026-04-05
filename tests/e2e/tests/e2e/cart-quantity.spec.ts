import { test, expect } from '../fixtures/base';

test.describe('Cart Quantity Management', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Clear existing cart
    await steps.navigateTo('/cart');
    await steps.waitForNetworkIdle();
    await steps.clickIfPresent('CartPage', 'cartClear');
    await steps.waitForNetworkIdle();
  });

  test('increase quantity with plus button', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.waitForNetworkIdle();
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('CartPage', 'cartItem', { exactly: 1 });
    await steps.verifyText('CartPage', 'cartQty', '1');

    await steps.click('CartPage', 'cartQtyPlus');
    await steps.waitForNetworkIdle();
    await steps.verifyText('CartPage', 'cartQty', '2');
  });

  test('decrease quantity with minus button', async ({ steps }) => {
    // Add book and increase qty to 2 first
    await steps.navigateTo('/books/book-002');
    await steps.waitForNetworkIdle();
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.waitForNetworkIdle();
    await steps.verifyText('CartPage', 'cartQty', '2');

    await steps.click('CartPage', 'cartQtyMinus');
    await steps.waitForNetworkIdle();
    await steps.verifyText('CartPage', 'cartQty', '1');
  });

  test('minus button disabled at quantity 1', async ({ steps }) => {
    await steps.navigateTo('/books/book-003');
    await steps.waitForNetworkIdle();
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.waitForNetworkIdle();
    await steps.verifyText('CartPage', 'cartQty', '1');
    await steps.verifyState('CartPage', 'cartQtyMinus', 'disabled');
  });

  test('remove button removes individual item', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.waitForNetworkIdle();
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/books/book-002');
    await steps.waitForNetworkIdle();
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('CartPage', 'cartItem', { exactly: 2 });

    await steps.clickNth('CartPage', 'cartRemove', 0);
    await steps.waitForNetworkIdle();
    await steps.verifyCount('CartPage', 'cartItem', { exactly: 1 });
  });

  test('cart shows item titles and prices', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.waitForNetworkIdle();
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.waitForNetworkIdle();
    await steps.verifyText('CartPage', 'cartItemTitle', undefined, { notEmpty: true });
    await steps.verifyText('CartPage', 'cartItemPrice', undefined, { notEmpty: true });
  });

  test('total updates after quantity change', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.waitForNetworkIdle();
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.waitForNetworkIdle();
    await steps.verifyText('CartPage', 'cartQty', '1');
    const initialTotal = await steps.getText('CartPage', 'cartTotal');

    await steps.click('CartPage', 'cartQtyPlus');
    await steps.waitForNetworkIdle();

    // Wait for quantity to update to 2 before reading total
    await steps.retryUntil(
      async () => {},
      async () => { await steps.verifyText('CartPage', 'cartQty', '2'); },
      5, 500
    );
    const updatedTotal = await steps.getText('CartPage', 'cartTotal');

    expect(initialTotal).not.toEqual(updatedTotal);
  });
});
