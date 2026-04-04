import { test, expect } from '../fixtures/base';

test.describe('Profile Page', () => {
  test.describe.configure({ timeout: 60_000 });

  test('profile page requires authentication', async ({ steps }) => {
    await steps.navigateTo('/profile');
    await steps.verifyUrlContains('/login');
  });

  test('displays user profile information', async ({ steps }) => {
    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'username');
    await steps.verifyPresence('ProfilePage', 'email');
    await steps.verifyPresence('ProfilePage', 'balance');
  });

  test('shows correct username and email', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/profile');
    await steps.verifyText('ProfilePage', 'username', 'testuser1');
    await steps.verifyText('ProfilePage', 'email', 'testuser1@bookhive.test');
  });

  test('shows My Listings section', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'myListingsHeading');
  });
});
