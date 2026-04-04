import { test, expect } from './fixtures/base';

test.describe('Cart — Advanced Scenarios', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');
  });

  test('adding same book twice increases quantity', async ({ steps, page }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'addToCartButton');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    // Go back to same page and add again
    await steps.refresh();
    await steps.verifyPresence('BookDetailPage', 'addToCartButton');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.verifyAbsence('CartPage', 'emptyMessage');
    const qty = await page.locator("span[data-testid^='cart-qty-']").first().textContent();
    expect(parseInt(qty || '0')).toBe(2);
  });

  test('adding multiple different books shows multiple items', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'addToCartButton');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/books/book-002');
    await steps.verifyPresence('BookDetailPage', 'addToCartButton');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.verifyCount('CartItem', 'item', { greaterThan: 1 });
  });

  test('cart badge shows item count in sidebar', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('Sidebar', 'cartBadge');
    const badgeText = await steps.getText('Sidebar', 'cartBadge');
    expect(badgeText).toContain('1');
  });

  test('minus button disabled when quantity is 1', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    await steps.verifyState('CartItem', 'minusButton', 'disabled');
  });

  test('cart total reflects multiple items correctly', async ({ steps }) => {
    // Add two different books
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/books/book-002');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    const total = await steps.getText('CartPage', 'cartTotal');
    // Total should be $12.99 + $10.99 = $23.98
    const totalValue = parseFloat(total.replace(/[^0-9.]/g, ''));
    expect(totalValue).toBeCloseTo(23.98, 1);
  });

  test('checkout empties the cart', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();
    // Go back to cart to verify it's empty
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'emptyMessage');
  });
});
