import { test, expect } from '@playwright/test';
import { getSelector, generateTestUser, signupUserViaUI } from '../fixtures/base';

test.describe('Profile Page', () => {
  let user: { email: string; password: string; username: string };

  test.beforeEach(async ({ page }) => {
    user = generateTestUser();
    await signupUserViaUI(page, user.username, user.email, user.password);
  });

  test('should display profile page with user information', async ({ page }) => {
    await test.step('When I navigate to the profile page', async () => {
      await page.click(getSelector('Common', 'navProfile'));
    });

    await test.step('Then I should see the profile page', async () => {
      await expect(page).toHaveURL('/profile');
      await expect(page.locator(getSelector('ProfilePage', 'pageContainer'))).toBeVisible();
    });

    await test.step('And I should see my username', async () => {
      await expect(page.locator(getSelector('ProfilePage', 'username'))).toBeVisible();
      await expect(page.locator(getSelector('ProfilePage', 'username'))).toContainText(user.username);
    });

    await test.step('And I should see my email', async () => {
      await expect(page.locator(getSelector('ProfilePage', 'email'))).toBeVisible();
      await expect(page.locator(getSelector('ProfilePage', 'email'))).toContainText(user.email);
    });
  });

  test('should display user balance', async ({ page }) => {
    await test.step('When I navigate to the profile page', async () => {
      await page.click(getSelector('Common', 'navProfile'));
    });

    await test.step('Then I should see my balance', async () => {
      await expect(page.locator(getSelector('ProfilePage', 'balance'))).toBeVisible();
      await expect(page.locator(getSelector('ProfilePage', 'balance'))).toContainText('$');
    });
  });

  test('should show user balance in sidebar', async ({ page }) => {
    await test.step('Then I should see balance in sidebar', async () => {
      await expect(page.locator(getSelector('Common', 'userBalance'))).toBeVisible();
      await expect(page.locator(getSelector('Common', 'userBalance'))).toContainText('Balance:');
    });
  });

  test('should show no listings message for new user', async ({ page }) => {
    await test.step('When I navigate to the profile page', async () => {
      await page.click(getSelector('Common', 'navProfile'));
    });

    await test.step('Then I should see no active listings message', async () => {
      await expect(page.locator(getSelector('ProfilePage', 'noListings'))).toBeVisible();
    });
  });

  test('should display user listings after creating one', async ({ page }) => {
    await test.step('Given I create a listing', async () => {
      await page.goto('/marketplace/sell');
      await page.waitForTimeout(1000);
      await page.selectOption(getSelector('CreateListingPage', 'bookSelect'), { index: 1 });
      await page.selectOption(getSelector('CreateListingPage', 'conditionSelect'), 'GOOD');
      await page.fill(getSelector('CreateListingPage', 'priceInput'), '5.99');
      await page.click(getSelector('CreateListingPage', 'createBtn'));
      await expect(page).toHaveURL('/marketplace', { timeout: 10000 });
    });

    await test.step('When I navigate to the profile page', async () => {
      await page.click(getSelector('Common', 'navProfile'));
    });

    await test.step('Then I should see my listing', async () => {
      await page.waitForTimeout(1000);
      await expect(page.locator('[data-testid^="my-listing-"]')).toBeVisible();
    });
  });

  test('should cancel a listing from profile page', async ({ page }) => {
    await test.step('Given I have an active listing', async () => {
      await page.goto('/marketplace/sell');
      await page.waitForTimeout(1000);
      await page.selectOption(getSelector('CreateListingPage', 'bookSelect'), { index: 1 });
      await page.selectOption(getSelector('CreateListingPage', 'conditionSelect'), 'FAIR');
      await page.fill(getSelector('CreateListingPage', 'priceInput'), '4.99');
      await page.click(getSelector('CreateListingPage', 'createBtn'));
      await expect(page).toHaveURL('/marketplace', { timeout: 10000 });
    });

    await test.step('When I navigate to profile and cancel the listing', async () => {
      await page.click(getSelector('Common', 'navProfile'));
      await page.waitForTimeout(1000);
      await page.click('[data-testid^="cancel-listing-"]');
    });

    await test.step('Then the listing should be removed', async () => {
      await page.waitForTimeout(1000);
      await expect(page.locator(getSelector('ProfilePage', 'noListings'))).toBeVisible({ timeout: 5000 });
    });
  });

  test('should redirect unauthenticated users from profile page', async ({ page }) => {
    await test.step('Given I am logged out', async () => {
      await page.click(getSelector('Common', 'logoutBtn'));
      await page.waitForTimeout(500);
    });

    await test.step('When I try to access profile page directly', async () => {
      await page.goto('/profile');
    });

    await test.step('Then I should be redirected to login', async () => {
      await expect(page).toHaveURL('/login');
    });
  });

  test('should maintain user session across page navigation', async ({ page }) => {
    await test.step('Given I am logged in', async () => {
      // Already logged in from beforeEach
    });

    await test.step('When I navigate to different pages', async () => {
      await page.click(getSelector('Common', 'navMarketplace'));
      await expect(page).toHaveURL('/marketplace');

      await page.click(getSelector('Common', 'navAllBooks'));
      await expect(page).toHaveURL('/');

      await page.click(getSelector('Common', 'navOrders'));
      await expect(page).toHaveURL('/orders');
    });

    await test.step('Then I should still be logged in', async () => {
      await expect(page.locator(getSelector('Common', 'logoutBtn'))).toBeVisible();
      await expect(page.locator(getSelector('Common', 'navProfile'))).toBeVisible();
    });
  });
});
