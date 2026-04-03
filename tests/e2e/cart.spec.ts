import { test, expect, TEST_USERS, loginViaAPI, clearCartViaAPI } from './fixtures/base';

test.describe('Shopping Cart', () => {
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async () => {
    // Clear cart via API before each test
    try {
      const token = await loginViaAPI(TEST_USERS.user1.email, TEST_USERS.user1.password);
      await clearCartViaAPI(token);
    } catch (e) {
      // Ignore errors if API is not ready
    }
  });

  test('should show empty cart message', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'page');
    await steps.verifyPresence('CartPage', 'emptyCart');
  });

  test('should display cart page elements', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/');
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'page');
    await steps.verifyPresence('CartPage', 'cartTotal');
    await steps.verifyPresence('CartPage', 'checkoutButton');
  });

  test('should add item to cart from book detail', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForState('Navigation', 'cartBadge', 'visible');
    await steps.verifyPresence('Navigation', 'cartBadge');
  });

  test('should display cart items after adding', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });
    await steps.verifyPresence('CartPage', 'cartTotal');
  });

  test('should increase item quantity', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');

    // Get initial quantity using Steps API
    const initialQty = await steps.getText('CartPage', 'cartQuantity');
    const initialNum = parseInt(initialQty || '1');

    await steps.clickNth('CartPage', 'quantityPlus', 0);
    await steps.waitForNetworkIdle();

    // Verify quantity increased
    const newQty = await steps.getText('CartPage', 'cartQuantity');
    const newNum = parseInt(newQty || '0');
    expect(newNum).toBeGreaterThan(initialNum);
  });

  test('should remove item from cart', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.clickNth('CartPage', 'removeButton', 0);
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('CartPage', 'emptyCart');
  });

  test('should clear entire cart', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/books/book-002');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'clearCartButton');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('CartPage', 'emptyCart');
  });

  test('should show checkout button with items in cart', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'checkoutButton');
  });

  test('should display cart total', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.verifyText('CartPage', 'cartTotal', undefined, { notEmpty: true });
  });
});
