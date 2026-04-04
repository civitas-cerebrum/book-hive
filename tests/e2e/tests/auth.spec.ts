import { test, expect } from './fixtures/base';

test.describe('Authentication', () => {
  test.describe.configure({ timeout: 60_000 });

  test('should login with valid credentials and show authenticated nav', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'loginForm');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Should redirect to home
    await steps.verifyUrlContains('/');

    // Should show authenticated navigation
    await steps.verifyPresence('Navigation', 'cartLink');
    await steps.verifyPresence('Navigation', 'ordersLink');
    await steps.verifyPresence('Navigation', 'profileLink');
    await steps.verifyPresence('Navigation', 'logoutButton');
  });

  test('should logout and show unauthenticated nav', async ({ steps }) => {
    // Login first
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('Navigation', 'logoutButton');

    // Logout
    await steps.click('Navigation', 'logoutButton');
    await steps.waitForNetworkIdle();

    // Should show unauthenticated nav
    await steps.verifyPresence('Navigation', 'loginLink');
    await steps.verifyPresence('Navigation', 'signupLink');
  });
});
