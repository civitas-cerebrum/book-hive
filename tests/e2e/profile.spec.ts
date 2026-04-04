import { test, expect, TEST_USERS } from './fixtures/base';

test.describe('ProfilePage — User Profile', () => {
  test.describe.configure({ timeout: 60_000 });

  test('profile page displays user information', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'page');
    await steps.verifyPresence('ProfilePage', 'username');
    await steps.verifyPresence('ProfilePage', 'email');
    await steps.verifyPresence('ProfilePage', 'balance');
  });

  test('profile shows correct username', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');
    await steps.navigateTo('/profile');
    await steps.verifyTextContains('ProfilePage', 'username', TEST_USERS.user1.username);
  });

  test('profile shows correct email', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');
    await steps.navigateTo('/profile');
    await steps.verifyTextContains('ProfilePage', 'email', TEST_USERS.user1.email);
  });

  test('profile shows balance', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');
    await steps.navigateTo('/profile');
    const balance = await steps.getText('ProfilePage', 'balance');
    expect(balance).toContain('$');
  });

  test('profile link navigates to profile page', async ({ steps, loginAs }) => {
    await loginAs('user1');
    await steps.click('Sidebar', 'profileLink');
    await steps.verifyUrlContains('/profile');
    await steps.verifyPresence('ProfilePage', 'page');
  });
});
