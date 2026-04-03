import { test, expect, loginViaAPI, clearCartViaAPI, TEST_USERS, resetDatabase } from './fixtures/base';

test.describe('Orders', () => {
  test('should show no orders initially', async ({ page, sel, loginAsUser1 }) => {
    await resetDatabase();
    await loginAsUser1();
    await page.goto('/orders');
    await expect(page.locator(sel('OrdersPage', 'noOrders'))).toBeVisible();
  });

  test('should display order after purchase', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/');
    await page.locator('[data-testid="add-to-cart-book-005"]').click();
    await page.waitForTimeout(500);
    await page.goto('/cart');
    await page.locator(sel('CartPage', 'checkoutButton')).click();
    await expect(page.locator('[data-testid^="order-card-"]').first()).toBeVisible();
  });

  test('should navigate to order detail', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/');
    await page.locator('[data-testid="add-to-cart-book-006"]').click();
    await page.waitForTimeout(500);
    await page.goto('/cart');
    await page.locator(sel('CartPage', 'checkoutButton')).click();
    await expect(page).toHaveURL(/\/orders/);
    await page.locator('[data-testid^="order-card-"]').first().click();
    await expect(page.locator(sel('OrderDetailPage', 'page'))).toBeVisible();
  });

  test('should show return button and countdown', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/');
    await page.locator('[data-testid="add-to-cart-book-007"]').click();
    await page.waitForTimeout(500);
    await page.goto('/cart');
    await page.locator(sel('CartPage', 'checkoutButton')).click();
    await page.locator('[data-testid^="order-card-"]').first().click();
    await expect(page.locator('[data-testid^="return-order-"]')).toBeVisible();
    await expect(page.locator(sel('OrderDetailPage', 'returnCountdown'))).toBeVisible();
  });

  test('should process return', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/');
    await page.locator('[data-testid="add-to-cart-book-008"]').click();
    await page.waitForTimeout(500);
    await page.goto('/cart');
    await page.locator(sel('CartPage', 'checkoutButton')).click();
    await page.locator('[data-testid^="order-card-"]').first().click();
    await page.locator('[data-testid^="return-order-"]').click();
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid^="order-status-"]')).toContainText('RETURNED');
  });
});
