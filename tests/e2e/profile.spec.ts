import { test, expect, TEST_USERS, resetDatabase } from './fixtures/base';

test.describe('Profile', () => {
  test.describe.configure({ timeout: 60000 });

  test('should display profile page with user info', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'page');
    await steps.verifyTextContains('ProfilePage', 'username', TEST_USERS.user1.username);
    await steps.verifyTextContains('ProfilePage', 'email', TEST_USERS.user1.email);
    await steps.verifyPresence('ProfilePage', 'balance');
  });

  test('should display starting balance after reset', async ({ steps, loginAsUser1 }) => {
    await resetDatabase();
    await loginAsUser1();
    await steps.navigateTo('/profile');
    const balance = await steps.getText('ProfilePage', 'balance');
    expect(balance).toContain('100');
  });

  test('should show no listings when none exist', async ({ steps, loginAsUser1 }) => {
    await resetDatabase();
    await loginAsUser1();
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'noListings');
  });

  test('should navigate from sidebar to profile', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.click('Navigation', 'profileLink');
    await steps.verifyUrlContains('/profile');
    await steps.verifyPresence('ProfilePage', 'page');
  });

  test('should show balance in sidebar', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/');
    await steps.verifyPresence('Navigation', 'userBalance');
  });

  test('should display email correctly', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/profile');
    await steps.verifyText('ProfilePage', 'email', undefined, { notEmpty: true });
  });

  test('should display username correctly', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/profile');
    await steps.verifyText('ProfilePage', 'username', undefined, { notEmpty: true });
  });
});
