import { test, expect } from '../fixtures/base';

test.describe('Profile', () => {
  test.describe.configure({ timeout: 60_000 });

  test('should display profile page with user info', async ({ steps }) => {
    const timestamp = Date.now();
    const username = `profile${timestamp}`;
    const email = `profile${timestamp}@test.com`;

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', username);
    await steps.fill('SignupPage', 'emailInput', email);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    // Verify logged in before proceeding
    await steps.verifyPresence('Sidebar', 'logoutBtn');

    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'container');
    await steps.verifyText('ProfilePage', 'username', username);
    await steps.verifyText('ProfilePage', 'email', email);
  });

  test('should display balance on profile page', async ({ steps }) => {
    const timestamp = Date.now();

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `balance${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `balance${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    // Verify logged in before proceeding
    await steps.verifyPresence('Sidebar', 'logoutBtn');

    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'balance');
    await steps.verifyTextContains('ProfilePage', 'balance', '$0.00');
  });

  test('should display no listings message when user has no listings', async ({ steps }) => {
    const timestamp = Date.now();

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `nolist${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `nolist${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    // Verify logged in before proceeding
    await steps.verifyPresence('Sidebar', 'logoutBtn');

    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'noListings');
    await steps.verifyText('ProfilePage', 'noListings', 'No active listings');
  });

  test('should navigate to profile from sidebar', async ({ steps }) => {
    const timestamp = Date.now();

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `profnav${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `profnav${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    // Verify logged in before proceeding
    await steps.verifyPresence('Sidebar', 'logoutBtn');

    await steps.click('Sidebar', 'navProfile');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/profile');
    await steps.verifyPresence('ProfilePage', 'container');
  });
});
