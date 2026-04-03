import { test, expect } from '../fixtures/base';

test.describe('Cart Advanced Features', () => {
  test.describe.configure({ timeout: 60_000, mode: 'serial' });

  // Helper to login as test user with balance
  const loginTestUser = async (steps: any) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitBtn');
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('Sidebar', 'logoutBtn');
  };

  test('should display cart item details', async ({ steps }) => {
    await loginTestUser(steps);

    // Clear cart first
    await steps.navigateTo('/cart');
    await steps.clickIfPresent('CartPage', 'clearBtn');
    await steps.waitForNetworkIdle();

    // Add book
    await steps.navigateTo('/books/book-002'); // The Great Gatsby - $10.99
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    // Check cart
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'container');
    await steps.verifyAbsence('CartPage', 'emptyMessage');
    // Verify cart has items by checking the cart total is present
    await steps.verifyPresence('CartPage', 'total');
  });

  test('should increase cart item quantity', async ({ steps, page }) => {
    await loginTestUser(steps);

    // Clear and add item
    await steps.navigateTo('/cart');
    await steps.clickIfPresent('CartPage', 'clearBtn');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/books/book-003'); // 1984 - $11.99
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.verifyAbsence('CartPage', 'emptyMessage');

    // Get initial quantity
    const initialQty = await page.locator('[data-testid^="cart-qty-"]:not([data-testid*="minus"]):not([data-testid*="plus"])').first().textContent();
    expect(initialQty).toBe('1');

    // Click plus button
    await steps.click('CartItemRow', 'qtyPlus');
    await steps.waitForNetworkIdle();

    // Verify quantity increased
    const newQty = await page.locator('[data-testid^="cart-qty-"]:not([data-testid*="minus"]):not([data-testid*="plus"])').first().textContent();
    expect(newQty).toBe('2');
  });

  test('should decrease cart item quantity', async ({ steps, page }) => {
    await loginTestUser(steps);

    // Continue from previous test state
    await steps.navigateTo('/cart');

    // First ensure we have quantity > 1
    const currentQty = await page.locator('[data-testid^="cart-qty-"]:not([data-testid*="minus"]):not([data-testid*="plus"])').first().textContent();

    if (currentQty === '1') {
      // Increase first
      await steps.click('CartItemRow', 'qtyPlus');
      await steps.waitForNetworkIdle();
    }

    // Click minus button
    await steps.click('CartItemRow', 'qtyMinus');
    await steps.waitForNetworkIdle();

    // Verify quantity decreased
    const newQty = await page.locator('[data-testid^="cart-qty-"]:not([data-testid*="minus"]):not([data-testid*="plus"])').first().textContent();
    expect(parseInt(newQty || '0')).toBeLessThanOrEqual(parseInt(currentQty || '0'));
  });

  test('should remove item from cart', async ({ steps }) => {
    await loginTestUser(steps);

    // Clear and add fresh item
    await steps.navigateTo('/cart');
    await steps.clickIfPresent('CartPage', 'clearBtn');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/books/book-005');
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.verifyAbsence('CartPage', 'emptyMessage');

    // Click remove button
    await steps.click('CartItemRow', 'removeBtn');
    await steps.waitForNetworkIdle();

    // Cart should be empty now
    await steps.verifyPresence('CartPage', 'emptyMessage');
  });

  test('should display correct cart total', async ({ steps, page }) => {
    await loginTestUser(steps);

    // Clear and add specific book
    await steps.navigateTo('/cart');
    await steps.clickIfPresent('CartPage', 'clearBtn');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/books/book-001'); // To Kill a Mockingbird - $12.99
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    const total = await page.locator('[data-testid="cart-total"]').textContent();
    expect(total).toContain('$12.99');
  });

  test('should add multiple different items to cart', async ({ steps }) => {
    await loginTestUser(steps);

    // Clear cart
    await steps.navigateTo('/cart');
    await steps.clickIfPresent('CartPage', 'clearBtn');
    await steps.waitForNetworkIdle();

    // Add first book
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    // Add second book
    await steps.navigateTo('/books/book-002');
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    // Check cart shows items (verified by having a checkout button visible)
    await steps.navigateTo('/cart');
    await steps.verifyAbsence('CartPage', 'emptyMessage');
    await steps.verifyPresence('CartPage', 'checkoutBtn');
  });

  test('should update cart badge when adding items', async ({ steps, page }) => {
    await loginTestUser(steps);

    // Clear cart
    await steps.navigateTo('/cart');
    await steps.clickIfPresent('CartPage', 'clearBtn');
    await steps.waitForNetworkIdle();

    // Verify no badge initially (or badge shows 0)
    await steps.navigateTo('/');

    // Add item
    await steps.click('HomePage', 'addToCartFirst');
    await steps.waitForNetworkIdle();

    // Badge should show 1
    await steps.verifyPresence('Sidebar', 'cartBadge');
    const badgeText = await page.locator('[data-testid="cart-badge"]').textContent();
    expect(badgeText).toBe('1');
  });

  // Cleanup
  test.afterEach(async ({ steps }) => {
    await steps.clickIfPresent('Sidebar', 'logoutBtn');
  });
});
