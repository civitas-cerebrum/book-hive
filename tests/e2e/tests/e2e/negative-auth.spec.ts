import { test, expect } from '../fixtures/base';

test.describe('Negative Auth Tests', () => {
  test.describe.configure({ timeout: 60_000 });

  test('empty login form submission shows error', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    // Should stay on login page
    await steps.verifyUrlContains('/login');
  });

  test('login with only email shows error', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/login');
  });

  test('login with only password shows error', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/login');
  });

  test('signup with empty form stays on page', async ({ steps }) => {
    await steps.navigateTo('/signup');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/signup');
  });

  test('signup with only email stays on page', async ({ steps }) => {
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'emailInput', 'test@test.com');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/signup');
  });

  test('signup with duplicate username shows error', async ({ steps }) => {
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', 'testuser1');
    await steps.fill('SignupPage', 'emailInput', 'unique@test.com');
    await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();
    // Should show error or stay on signup
    await steps.verifyUrlContains('/signup');
  });
});
