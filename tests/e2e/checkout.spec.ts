import { test, expect, loginViaAPI, clearCartViaAPI, TEST_USERS } from './fixtures/base';

test.describe('Checkout', () => {
  test.beforeEach(async () => {
    try {
      const token = await loginViaAPI(TEST_USERS.user1.email, TEST_USERS.user1.password);
      await clearCartViaAPI(token);
    } catch (e) { /* ignore */ }
  });

  test('should complete checkout', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/');
    await page.locator('[data-testid="add-to-cart-book-001"]').click();
    await page.waitForTimeout(500);
    await page.goto('/cart');
    await page.locator(sel('CartPage', 'checkoutButton')).click();
    await expect(page).toHaveURL(/\/orders/);
    await expect(page.locator('[data-testid^="order-card-"]').first()).toBeVisible();
  });

  test('should show order with COMPLETED status', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/');
    await page.locator('[data-testid="add-to-cart-book-002"]').click();
    await page.waitForTimeout(500);
    await page.goto('/cart');
    await page.locator(sel('CartPage', 'checkoutButton')).click();
    await expect(page.locator('[data-testid^="order-status-"]').first()).toContainText('COMPLETED');
  });

  test('should empty cart after checkout', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/');
    await page.locator('[data-testid="add-to-cart-book-003"]').click();
    await page.waitForTimeout(500);
    await page.goto('/cart');
    await page.locator(sel('CartPage', 'checkoutButton')).click();
    await expect(page).toHaveURL(/\/orders/);
    await page.goto('/cart');
    await expect(page.locator(sel('CartPage', 'emptyCart'))).toBeVisible();
  });

  test('should deduct balance', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/profile');
    const initialBalance = await page.locator(sel('ProfilePage', 'balance')).textContent();
    const initialNum = parseFloat(initialBalance?.match(/(\d+\.?\d*)/)?.[1] || '100');

    await page.goto('/');
    await page.locator('[data-testid="add-to-cart-book-004"]').click();
    await page.waitForTimeout(500);
    await page.goto('/cart');
    await page.locator(sel('CartPage', 'checkoutButton')).click();
    await expect(page).toHaveURL(/\/orders/);

    await page.goto('/profile');
    const newBalance = await page.locator(sel('ProfilePage', 'balance')).textContent();
    const newNum = parseFloat(newBalance?.match(/(\d+\.?\d*)/)?.[1] || '0');
    expect(newNum).toBeLessThan(initialNum);
  });
});
