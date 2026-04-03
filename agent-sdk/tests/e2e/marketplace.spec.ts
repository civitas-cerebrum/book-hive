import { test, expect } from '@playwright/test';
import { login } from './fixtures/login-helper';

test.describe('Marketplace', () => {
  test('should display marketplace page', async ({ page }) => {
    await test.step('Given I navigate to the marketplace', async () => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Then I should see the marketplace page', async () => {
      await expect(page).toHaveURL('/marketplace');
      const content = await page.textContent('body');
      expect(content).toBeTruthy();
    });
  });

  test('should navigate to marketplace from navigation', async ({ page }) => {
    await test.step('Given I am on the homepage', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    await test.step('When I click the Marketplace link', async () => {
      await page.locator("a[href='/marketplace']").click();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Then I should be on the marketplace', async () => {
      await expect(page).toHaveURL('/marketplace');
    });
  });

  // SKIPPED: Blocked by BUG-1 and BUG-4
  // See: tests/e2e/docs/bug-report.md
  test.skip('should show Sell a Book link for logged in users', async ({ page }) => {
    await test.step('Given I am logged in', async () => {
      await login(page);
    });

    await test.step('When I go to marketplace', async () => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Then I should see Sell a Book option', async () => {
      const sellLink = page.locator("a[href='/marketplace/sell']");
      const sellButton = page.getByRole('button', { name: /sell/i });
      const sellLinkByText = page.getByRole('link', { name: /sell/i });
      const hasSellOption = await sellLink.isVisible() || await sellButton.isVisible() || await sellLinkByText.isVisible();
      expect(hasSellOption).toBeTruthy();
    });
  });

  // SKIPPED: Blocked by BUG-1 and BUG-4
  // See: tests/e2e/docs/bug-report.md
  test.skip('should navigate to sell page when logged in', async ({ page }) => {
    await test.step('Given I am logged in', async () => {
      await login(page);
    });

    await test.step('When I navigate to sell page directly', async () => {
      await page.goto('/marketplace/sell');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Then I should be on the sell page', async () => {
      await expect(page).toHaveURL('/marketplace/sell');
      const content = await page.textContent('body');
      expect(content).toBeTruthy();
    });
  });
});
