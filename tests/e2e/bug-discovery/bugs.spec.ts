import { test, expect } from '../fixtures/base';

test.describe('Bug Discovery', () => {
  test.describe.configure({ timeout: 60_000 });

  /**
   * @bug BUG-001
   * @severity Medium
   * @steps
   * 1. Log in as testuser1
   * 2. Add a book to cart on the home page
   * 3. Verify cart badge appears
   * 4. Navigate to a different page via full page reload
   * 5. Check if cart badge is still visible
   * Expected: Cart badge visible after navigation
   * Actual: Cart badge disappears after hard page navigation
   */
  test('@bug-discovery BUG-001: cart badge disappears after hard page navigation', async ({ page, loginAs, resetApp }) => {
    await resetApp();
    await loginAs('user1');
    await expect(page.locator('[data-testid="book-grid"]')).toBeVisible();
    await page.locator('[data-testid^="add-to-cart-"]').first().click();
    await expect(page.locator('[data-testid="cart-badge"]')).toBeVisible({ timeout: 10000 });
    await page.goto('/marketplace');
    await expect(page.locator('[data-testid="marketplace-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-badge"]')).toBeVisible({ timeout: 5000 });
  });

  /**
   * @bug BUG-003
   * @severity Medium
   * @steps
   * 1. Sign up a new user via the signup form
   * 2. After redirect to home, check the balance in sidebar
   * Expected: New user should have $100.00 starting balance
   * Actual: New user shows $0.00 balance
   */
  test('@bug-discovery BUG-003: newly signed-up user shows $0.00 balance instead of $100.00', async ({ page, resetApp }) => {
    await resetApp();
    const uniqueId = Date.now().toString(36);
    await page.goto('/signup');
    await expect(page.locator('[data-testid="signup-page"]')).toBeVisible();
    await page.locator('[data-testid="signup-username"]').fill(`buguser_${uniqueId}`);
    await page.locator('[data-testid="signup-email"]').fill(`buguser_${uniqueId}@test.com`);
    await page.locator('[data-testid="signup-password"]').fill('TestPass1234!');
    await page.locator('[data-testid="signup-submit"]').click();
    await page.waitForTimeout(3000);
    await expect(page.locator('[data-testid="book-grid"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-balance"]')).toContainText('$100.00');
  });
});
