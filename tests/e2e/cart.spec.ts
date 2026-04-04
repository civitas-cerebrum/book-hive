import { test, expect } from './fixtures/base';

test.describe('CartPage — Shopping Cart', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');
  });

  test('empty cart shows empty message', async ({ steps }) => {
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'emptyMessage');
  });

  test('add to cart from book detail page', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'page');
    await steps.verifyAbsence('CartPage', 'emptyMessage');
    await steps.verifyCount('CartItem', 'item', { greaterThan: 0 });
  });

  test('add to cart from home page card', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.clickNth('BookCard', 'addToCart', 0);
    await steps.navigateTo('/cart');
    await steps.verifyAbsence('CartPage', 'emptyMessage');
    await steps.verifyCount('CartItem', 'item', { greaterThan: 0 });
  });

  test('cart displays item title and price', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    await steps.verifyCount('CartItem', 'title', { greaterThan: 0 });
    await steps.verifyCount('CartItem', 'price', { greaterThan: 0 });
  });

  test('increase item quantity in cart', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    await steps.clickNth('CartItem', 'plusButton', 0);
    await steps.waitForNetworkIdle();
    const quantities = await steps.getAll('CartItem', 'quantity');
    expect(parseInt(quantities[0])).toBe(2);
  });

  test('decrease item quantity in cart', async ({ steps, page }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    // Increase first to 2
    await steps.clickNth('CartItem', 'plusButton', 0);
    await steps.waitForNetworkIdle();
    // Verify increased to 2
    await expect(page.locator("span[data-testid^='cart-qty-']").first()).toHaveText('2');
    // Then decrease back to 1
    await steps.clickNth('CartItem', 'minusButton', 0);
    await steps.waitForNetworkIdle();
    await expect(page.locator("span[data-testid^='cart-qty-']").first()).toHaveText('1');
  });

  test('remove item from cart', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    await steps.clickNth('CartItem', 'removeButton', 0);
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('CartPage', 'emptyMessage');
  });

  test('clear cart removes all items', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/books/book-002');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    await steps.verifyCount('CartItem', 'item', { greaterThan: 1 });
    await steps.click('CartPage', 'clearButton');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('CartPage', 'emptyMessage');
  });

  test('cart total updates correctly', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    const total = await steps.getText('CartPage', 'cartTotal');
    expect(total).toContain('$');
    expect(parseFloat(total.replace(/[^0-9.]/g, ''))).toBeGreaterThan(0);
  });

  test('checkout creates an order and redirects', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/orders');
  });
});
