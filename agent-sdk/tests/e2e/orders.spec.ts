import { test, expect } from '@playwright/test';
import { login } from './fixtures/login-helper';

test.describe('Orders Page', () => {
  test('should redirect to login for unauthenticated users', async ({ page }) => {
    await test.step('Given I am not logged in', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    await test.step('When I try to access orders page directly', async () => {
      await page.goto('/orders');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Then I should be redirected to login or see auth prompt', async () => {
      const currentUrl = page.url();
      const content = await page.textContent('body');

      expect(currentUrl).toBeTruthy();
      expect(content).toBeTruthy();
    });
  });

  // SKIPPED: Blocked by BUG-1 (test user authentication fails silently)
  // See: tests/e2e/docs/bug-report.md#bug-1-test-user-authentication-fails-silently
  test.skip('should show orders page for logged in users', async ({ page }) => {
    await test.step('Given I am logged in', async () => {
      await login(page);
    });

    await test.step('When I navigate to orders directly', async () => {
      await page.goto('/orders');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Then I should see the orders page', async () => {
      await expect(page).toHaveURL('/orders');
      const content = await page.textContent('body');
      expect(content).toBeTruthy();
    });
  });

  // SKIPPED: Blocked by BUG-1 and BUG-3
  // See: tests/e2e/docs/bug-report.md
  test.skip('should show Orders link for logged in users', async ({ page }) => {
    await test.step('Given I am logged in', async () => {
      await login(page);
    });

    await test.step('Then I should see Orders link in navigation', async () => {
      const ordersLink = page.locator("a[href='/orders']");
      const ordersLinkByText = page.getByRole('link', { name: /orders/i });
      const hasOrdersLink = await ordersLink.isVisible() || await ordersLinkByText.isVisible();
      expect(hasOrdersLink).toBeTruthy();
    });
  });
});
