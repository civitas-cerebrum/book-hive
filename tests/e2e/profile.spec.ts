import { test, expect, TEST_USERS, resetDatabase } from './fixtures/base';

test.describe('Profile', () => {
  test('should display profile page', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/profile');
    await expect(page.locator(sel('ProfilePage', 'page'))).toBeVisible();
    await expect(page.locator(sel('ProfilePage', 'username'))).toContainText(TEST_USERS.user1.username);
    await expect(page.locator(sel('ProfilePage', 'email'))).toContainText(TEST_USERS.user1.email);
    await expect(page.locator(sel('ProfilePage', 'balance'))).toBeVisible();
  });

  test('should display starting balance', async ({ page, sel, loginAsUser1 }) => {
    await resetDatabase();
    await loginAsUser1();
    await page.goto('/profile');
    const balance = await page.locator(sel('ProfilePage', 'balance')).textContent();
    expect(balance).toContain('100');
  });

  test('should show no listings when none exist', async ({ page, sel, loginAsUser1 }) => {
    await resetDatabase();
    await loginAsUser1();
    await page.goto('/profile');
    await expect(page.locator(sel('ProfilePage', 'noListings'))).toBeVisible();
  });

  test('should navigate from sidebar', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.locator(sel('Navigation', 'profileLink')).click();
    await expect(page).toHaveURL('/profile');
  });

  test('should show balance in sidebar', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/');
    await expect(page.locator(sel('Navigation', 'userBalance'))).toBeVisible();
  });
});
