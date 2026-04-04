import { test, expect } from '../fixtures/base';

test.describe('Profile Page', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'signInButton');
    await steps.verifyPresence('NavBar', 'cartLink');
  });

  test('displays user profile information', async ({ steps }) => {
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'profilePage');
    await steps.verifyText('ProfilePage', 'username', 'testuser1');
    await steps.verifyTextContains('ProfilePage', 'email', 'testuser1@bookhive.test');
    await steps.verifyText('ProfilePage', 'balance', undefined, { notEmpty: true });
  });

  test('logout returns to unauthenticated state', async ({ steps }) => {
    await steps.verifyPresence('NavBar', 'logoutButton');
    await steps.click('NavBar', 'logoutButton');
    await steps.verifyPresence('NavBar', 'loginLink');
    await steps.verifyAbsence('NavBar', 'logoutButton');
  });
});
