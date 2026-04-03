import { test, expect, getSelector, TEST_USERS, API_BASE } from './fixtures/base';

test.describe('Profile Page', () => {

  test('should display profile page with user information', async ({ page, loginAs }) => {
    await test.step('Given I am logged in', async () => {
      await loginAs('user1');
    });

    await test.step('When I navigate to the profile page', async () => {
      await page.locator(getSelector('Navigation', 'profileLink')).click();
      await page.waitForURL('/profile');
    });

    await test.step('Then I should see the profile container', async () => {
      await expect(page.locator(getSelector('ProfilePage', 'container'))).toBeVisible();
    });

    await test.step('And I should see my username', async () => {
      await expect(page.locator(getSelector('ProfilePage', 'username'))).toBeVisible();
      await expect(page.locator(getSelector('ProfilePage', 'username'))).toContainText(TEST_USERS.user1.username);
    });

    await test.step('And I should see my email', async () => {
      await expect(page.locator(getSelector('ProfilePage', 'email'))).toBeVisible();
      await expect(page.locator(getSelector('ProfilePage', 'email'))).toContainText(TEST_USERS.user1.email);
    });

    await test.step('And I should see my balance', async () => {
      await expect(page.locator(getSelector('ProfilePage', 'balance'))).toBeVisible();
      await expect(page.locator(getSelector('ProfilePage', 'balance'))).toContainText('$');
    });
  });

  test('should show profile listings section', async ({ page, loginAs }) => {
    await test.step('Given I am logged in', async () => {
      await loginAs('user1');
    });

    await test.step('When I navigate to the profile page', async () => {
      await page.locator(getSelector('Navigation', 'profileLink')).click();
      await page.waitForURL('/profile');
    });

    await test.step('Then I should see listings section (either listings or no-listings message)', async () => {
      await expect(page.locator(getSelector('ProfilePage', 'container'))).toBeVisible();
      // Either shows active listings or "no listings" message
      const hasListings = await page.locator('[data-testid^="my-listing-"]').count() > 0;
      const hasNoListingsMessage = await page.locator(getSelector('ProfilePage', 'noListings')).isVisible();
      expect(hasListings || hasNoListingsMessage).toBeTruthy();
    });
  });

  test('should display user balance from sidebar', async ({ page, loginAs }) => {
    await test.step('Given I am logged in', async () => {
      await loginAs('user1');
    });

    await test.step('Then I should see my balance in the sidebar', async () => {
      await expect(page.locator(getSelector('Navigation', 'userBalance'))).toBeVisible();
      await expect(page.locator(getSelector('Navigation', 'userBalance'))).toContainText('$');
    });
  });

  test('should require authentication to access profile', async ({ page }) => {
    await test.step('Given I am not logged in', async () => {
      await page.goto('/profile');
    });

    await test.step('Then I should be redirected to login', async () => {
      // Protected route should redirect to login
      await page.waitForURL('/login');
      await expect(page.locator(getSelector('LoginPage', 'container'))).toBeVisible();
    });
  });
});
