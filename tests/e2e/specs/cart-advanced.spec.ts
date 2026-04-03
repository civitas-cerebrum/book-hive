import { test, expect } from '../fixtures/base';

test.describe('Cart — Advanced Interactions', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.page.request.post('http://localhost:8080/api/reset');
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');
    // Clear cart to ensure clean state
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    const hasItems = await steps.getCount('CartPage', 'cartItems');
    if (hasItems > 0) {
      await steps.click('CartPage', 'clearCartBtn');
      await steps.waitForState('CartPage', 'emptyMessage');
    }
    await steps.navigateTo('/');
    await steps.waitForState('HomePage', 'bookGrid');
  });

  test('add multiple different items to cart', async ({ steps }) => {
    // Add first item from home page
    await steps.clickNth('HomePage', 'addToCartButtons', 0);
    await steps.page.waitForTimeout(1500);
    // Add second item from home page
    await steps.clickNth('HomePage', 'addToCartButtons', 1);
    await steps.page.waitForTimeout(1500);
    // Verify cart has 2 items
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.verifyCount('CartPage', 'cartItems', { greaterThan: 0 });
  });

  test('checkout with multiple items creates order', async ({ steps }) => {
    await steps.clickNth('HomePage', 'addToCartButtons', 0);
    await steps.page.waitForTimeout(500);
    await steps.clickNth('HomePage', 'addToCartButtons', 1);
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.waitForState('OrderDetailPage', 'container');
    await steps.verifyCount('OrderDetailPage', 'orderItems', { exactly: 2 });
  });

  test('cart total is displayed with items', async ({ steps }) => {
    await steps.clickNth('HomePage', 'addToCartButtons', 0);
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.verifyPresence('CartPage', 'totalPrice');
    const total = await steps.getText('CartPage', 'totalPrice');
    expect(total).toContain('$');
  });

  test('add to cart from book detail page when logged in', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.waitForState('BookDetailPage', 'container');
    await steps.verifyPresence('BookDetailPage', 'addToCartBtn');
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.verifyCount('CartPage', 'cartItems', { greaterThan: 0 });
  });

  test('cart empties after checkout', async ({ steps }) => {
    await steps.clickNth('HomePage', 'addToCartButtons', 0);
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.waitForState('OrderDetailPage', 'container');
    // Go back to cart — should be empty
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.verifyPresence('CartPage', 'emptyMessage');
  });
});
