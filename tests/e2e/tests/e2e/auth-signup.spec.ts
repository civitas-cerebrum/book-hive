import { test, expect } from '../fixtures/base';

test.describe('Authentication — Signup', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.navigateTo('/signup');
  });

  test('displays signup form with all fields', async ({ steps }) => {
    await steps.verifyPresence('SignupPage', 'heading');
    await steps.verifyPresence('SignupPage', 'usernameInput');
    await steps.verifyPresence('SignupPage', 'emailInput');
    await steps.verifyPresence('SignupPage', 'passwordInput');
    await steps.verifyPresence('SignupPage', 'submitButton');
  });

  test('successful signup redirects to homepage', async ({ steps }) => {
    const uniqueId = Date.now();
    await steps.fill('SignupPage', 'usernameInput', `newuser${uniqueId}`);
    await steps.fill('SignupPage', 'emailInput', `newuser${uniqueId}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'NewPass123!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('Navigation', 'logoutButton');
  });

  test('has link to login page', async ({ steps }) => {
    await steps.verifyPresence('SignupPage', 'loginLink');
    await steps.click('SignupPage', 'loginLink');
    await steps.verifyUrlContains('/login');
  });

  test('duplicate email shows error', async ({ steps }) => {
    await steps.fill('SignupPage', 'usernameInput', 'duplicateuser');
    await steps.fill('SignupPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('SignupPage', 'errorMessage');
  });
});
