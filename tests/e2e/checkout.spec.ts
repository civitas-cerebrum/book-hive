import { test, expect, TEST_USERS, loginViaAPI, clearCartViaAPI } from './fixtures/base';

test.describe('Checkout', () => {
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async () => {
    // Clear cart via API before each test
    try {
      const token = await loginViaAPI(TEST_USERS.user1.email, TEST_USERS.user1.password);
      await clearCartViaAPI(token);
    } catch (e) {
      // Ignore errors
    }
  });

  test('should complete checkout successfully', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    // After checkout, app navigates to order detail page, not orders list
    await steps.verifyUrlContains('/orders/');
    await steps.verifyPresence('OrderDetailPage', 'page');
  });

  test('should show order with COMPLETED status after checkout', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/books/book-002');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    // Navigates directly to order detail showing COMPLETED
    await steps.verifyUrlContains('/orders/');
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'COMPLETED');
  });

  test('should empty cart after checkout', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/books/book-003');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.verifyUrlContains('/orders/');
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'emptyCart');
  });

  test('should deduct balance after checkout', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/profile');
    const initialBalance = await steps.getText('ProfilePage', 'balance');
    const initialNum = parseFloat(initialBalance?.match(/(\d+\.?\d*)/)?.[1] || '100');

    await steps.navigateTo('/books/book-004');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.verifyUrlContains('/orders/');

    await steps.navigateTo('/profile');
    const newBalance = await steps.getText('ProfilePage', 'balance');
    const newNum = parseFloat(newBalance?.match(/(\d+\.?\d*)/)?.[1] || '0');
    expect(newNum).toBeLessThan(initialNum);
  });

  test('should display order items on detail page after checkout', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/books/book-005');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.verifyUrlContains('/orders/');
    await steps.verifyPresence('OrderDetailPage', 'page');
    await steps.verifyPresence('OrderDetailPage', 'total');
  });
});
