import { test, expect, loginViaAPI, clearCartViaAPI, TEST_USERS } from './fixtures/base';

test.describe('Shopping Cart', () => {
  test.beforeEach(async () => {
    try {
      const token = await loginViaAPI(TEST_USERS.user1.email, TEST_USERS.user1.password);
      await clearCartViaAPI(token);
    } catch (e) { /* ignore */ }
  });

  test('should show empty cart', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/cart');
    await expect(page.locator(sel('CartPage', 'emptyCart'))).toBeVisible();
  });

  test('should add item from homepage', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/');
    await page.locator('[data-testid="add-to-cart-book-001"]').click();
    await expect(page.locator(sel('Navigation', 'cartBadge'))).toContainText('1');
  });

  test('should display cart items', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/');
    await page.locator('[data-testid="add-to-cart-book-001"]').click();
    await page.waitForTimeout(500);
    await page.goto('/cart');
    await expect(page.locator('[data-testid^="cart-item-"]').first()).toBeVisible();
    await expect(page.locator(sel('CartPage', 'cartTotal'))).toBeVisible();
  });

  test('should increase quantity', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/');
    await page.locator('[data-testid="add-to-cart-book-001"]').click();
    await page.waitForTimeout(500);
    await page.goto('/cart');
    await page.locator('[data-testid^="cart-qty-plus-"]').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid^="cart-qty-"]:not([data-testid*="minus"]):not([data-testid*="plus"])').first()).toContainText('2');
  });

  test('should remove item', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/');
    await page.locator('[data-testid="add-to-cart-book-001"]').click();
    await page.waitForTimeout(500);
    await page.goto('/cart');
    await page.locator('[data-testid^="cart-remove-"]').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator(sel('CartPage', 'emptyCart'))).toBeVisible();
  });

  test('should clear cart', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/');
    await page.locator('[data-testid="add-to-cart-book-001"]').click();
    await page.locator('[data-testid="add-to-cart-book-002"]').click();
    await page.waitForTimeout(500);
    await page.goto('/cart');
    await page.locator(sel('CartPage', 'clearCartButton')).click();
    await page.waitForTimeout(500);
    await expect(page.locator(sel('CartPage', 'emptyCart'))).toBeVisible();
  });

  test('should show checkout button', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/');
    await page.locator('[data-testid="add-to-cart-book-001"]').click();
    await page.waitForTimeout(500);
    await page.goto('/cart');
    await expect(page.locator(sel('CartPage', 'checkoutButton'))).toBeVisible();
  });
});
