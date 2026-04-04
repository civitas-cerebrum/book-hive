import { test, expect } from '../fixtures/base';

test.describe('Authentication — Login', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.navigateTo('/login');
  });

  test('displays login form', async ({ steps }) => {
    await steps.verifyPresence('LoginPage', 'heading');
    await steps.verifyPresence('LoginPage', 'emailInput');
    await steps.verifyPresence('LoginPage', 'passwordInput');
    await steps.verifyPresence('LoginPage', 'submitButton');
  });

  test('successful login redirects to homepage', async ({ steps }) => {
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('Navigation', 'logoutButton');
  });

  test('shows authenticated navigation after login', async ({ steps }) => {
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('Navigation', 'cartLink');
    await steps.verifyPresence('Navigation', 'ordersLink');
    await steps.verifyPresence('Navigation', 'sellLink');
    await steps.verifyPresence('Navigation', 'profileLink');
  });

  test('failed login with wrong password shows error', async ({ steps }) => {
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'WrongPassword123!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('LoginPage', 'errorMessage');
  });

  test('failed login with non-existent email shows error', async ({ steps }) => {
    await steps.fill('LoginPage', 'emailInput', 'nonexistent@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('LoginPage', 'errorMessage');
  });

  test('has link to signup page', async ({ steps }) => {
    await steps.verifyPresence('LoginPage', 'signupLink');
    await steps.click('LoginPage', 'signupLink');
    await steps.verifyUrlContains('/signup');
  });

  test('logout returns to unauthenticated state', async ({ steps }) => {
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('Navigation', 'logoutButton');
    await steps.click('Navigation', 'logoutButton');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('Navigation', 'loginLink');
  });
});
