import { test, expect } from '@playwright/test';
import { getSelector } from '../fixtures/base';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display sidebar with navigation links', async ({ page }) => {
    await test.step('Given I am on the homepage', async () => {
      await expect(page.locator(getSelector('HomePage', 'pageContainer'))).toBeVisible();
    });

    await test.step('Then I should see the sidebar', async () => {
      await expect(page.locator(getSelector('Common', 'sidebar'))).toBeVisible();
    });

    await test.step('And I should see the logo', async () => {
      await expect(page.locator(getSelector('Common', 'logo'))).toBeVisible();
      await expect(page.locator(getSelector('Common', 'logo'))).toContainText('BookHive');
    });

    await test.step('And I should see navigation links', async () => {
      await expect(page.locator(getSelector('Common', 'navAllBooks'))).toBeVisible();
      await expect(page.locator(getSelector('Common', 'navMarketplace'))).toBeVisible();
    });
  });

  test('should navigate to All Books page', async ({ page }) => {
    await test.step('When I click on All Books link', async () => {
      await page.click(getSelector('Common', 'navAllBooks'));
    });

    await test.step('Then I should be on the homepage', async () => {
      await expect(page).toHaveURL('/');
      await expect(page.locator(getSelector('HomePage', 'pageContainer'))).toBeVisible();
    });
  });

  test('should navigate to Marketplace page', async ({ page }) => {
    await test.step('When I click on Marketplace link', async () => {
      await page.click(getSelector('Common', 'navMarketplace'));
    });

    await test.step('Then I should be on the marketplace page', async () => {
      await expect(page).toHaveURL('/marketplace');
      await expect(page.locator(getSelector('MarketplacePage', 'pageContainer'))).toBeVisible();
    });
  });

  test('should display Login and Sign Up links for unauthenticated users', async ({ page }) => {
    await test.step('Given I am not logged in', async () => {
      // Clear any existing session
      await page.evaluate(() => localStorage.clear());
      await page.reload();
    });

    await test.step('Then I should see Login link', async () => {
      await expect(page.locator(getSelector('Common', 'navLogin'))).toBeVisible();
    });

    await test.step('And I should see Sign Up link', async () => {
      await expect(page.locator(getSelector('Common', 'navSignup'))).toBeVisible();
    });
  });

  test('should navigate to Login page', async ({ page }) => {
    await test.step('When I click on Login link', async () => {
      await page.click(getSelector('Common', 'navLogin'));
    });

    await test.step('Then I should be on the login page', async () => {
      await expect(page).toHaveURL('/login');
      await expect(page.locator(getSelector('LoginPage', 'pageContainer'))).toBeVisible();
    });
  });

  test('should navigate to Sign Up page', async ({ page }) => {
    await test.step('When I click on Sign Up link', async () => {
      await page.click(getSelector('Common', 'navSignup'));
    });

    await test.step('Then I should be on the signup page', async () => {
      await expect(page).toHaveURL('/signup');
      await expect(page.locator(getSelector('SignupPage', 'pageContainer'))).toBeVisible();
    });
  });

  test('should filter by genre from sidebar', async ({ page }) => {
    await test.step('When I click on Fiction genre in sidebar', async () => {
      await page.click(getSelector('Common', 'genreFilterFiction'));
    });

    await test.step('Then the URL should contain the genre filter', async () => {
      await expect(page).toHaveURL(/genre=Fiction/);
    });

    await test.step('And I should see filtered books', async () => {
      await page.waitForTimeout(1000);
      await page.waitForSelector('[data-testid^="book-card-"]', { timeout: 10000 });
    });
  });

  test('should navigate using browser back/forward buttons', async ({ page }) => {
    await test.step('Given I navigate to marketplace', async () => {
      await page.click(getSelector('Common', 'navMarketplace'));
      await expect(page).toHaveURL('/marketplace');
    });

    await test.step('When I click browser back button', async () => {
      await page.goBack();
    });

    await test.step('Then I should be back on the homepage', async () => {
      await expect(page).toHaveURL('/');
    });

    await test.step('When I click browser forward button', async () => {
      await page.goForward();
    });

    await test.step('Then I should be on marketplace again', async () => {
      await expect(page).toHaveURL('/marketplace');
    });
  });
});
