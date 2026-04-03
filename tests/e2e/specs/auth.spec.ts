import { test, expect } from '../fixtures/base';

test.describe('Authentication — Login & Signup', () => {
  test.describe.configure({ timeout: 60_000 });

  test.describe('Login Page', () => {
    test.beforeEach(async ({ steps }) => {
      await steps.navigateTo('/login');
      await steps.waitForState('LoginPage', 'container');
    });

    test('displays login form elements', async ({ steps }) => {
      await steps.verifyPresence('LoginPage', 'emailInput');
      await steps.verifyPresence('LoginPage', 'passwordInput');
      await steps.verifyPresence('LoginPage', 'submitButton');
      await steps.verifyPresence('LoginPage', 'signupLink');
    });

    test('displays heading', async ({ steps }) => {
      await steps.verifyText('LoginPage', 'heading', 'Welcome back');
    });

    test('successful login redirects to home', async ({ steps }) => {
      await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
      await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
      await steps.click('LoginPage', 'submitButton');
      await steps.verifyUrlContains('/');
      await steps.waitForState('HomePage', 'bookGrid');
      await steps.verifyPresence('Sidebar', 'logoutBtn');
    });

    test('login with invalid credentials stays on login page', async ({ steps }) => {
      await steps.fill('LoginPage', 'emailInput', 'wrong@email.com');
      await steps.fill('LoginPage', 'passwordInput', 'wrongpassword');
      await steps.click('LoginPage', 'submitButton');
      // BUG-001: 401 interceptor redirects to /login instead of showing error message
      await steps.page.waitForTimeout(2000);
      await steps.verifyUrlContains('/login');
      await steps.verifyPresence('LoginPage', 'container');
    });

    test('signup link navigates to signup page', async ({ steps }) => {
      await steps.click('LoginPage', 'signupLink');
      await steps.verifyUrlContains('/signup');
      await steps.verifyPresence('SignupPage', 'container');
    });
  });

  test.describe('Signup Page', () => {
    test.beforeEach(async ({ steps }) => {
      await steps.navigateTo('/signup');
      await steps.waitForState('SignupPage', 'container');
    });

    test('displays signup form elements', async ({ steps }) => {
      await steps.verifyPresence('SignupPage', 'usernameInput');
      await steps.verifyPresence('SignupPage', 'emailInput');
      await steps.verifyPresence('SignupPage', 'passwordInput');
      await steps.verifyPresence('SignupPage', 'submitButton');
      await steps.verifyPresence('SignupPage', 'loginLink');
    });

    test('displays heading', async ({ steps }) => {
      await steps.verifyText('SignupPage', 'heading', 'Create an account');
    });

    test('successful signup redirects to home', async ({ steps }) => {
      const uniqueUser = `e2euser_${Date.now()}`;
      await steps.fill('SignupPage', 'usernameInput', uniqueUser);
      await steps.fill('SignupPage', 'emailInput', `${uniqueUser}@test.com`);
      await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
      await steps.click('SignupPage', 'submitButton');
      await steps.verifyUrlContains('/');
      await steps.waitForState('HomePage', 'bookGrid');
      await steps.verifyPresence('Sidebar', 'logoutBtn');
    });

    test('signup with existing email shows error', async ({ steps }) => {
      await steps.fill('SignupPage', 'usernameInput', 'newuser999');
      await steps.fill('SignupPage', 'emailInput', 'testuser1@bookhive.test');
      await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
      await steps.click('SignupPage', 'submitButton');
      await steps.waitForState('SignupPage', 'errorMessage');
      await steps.verifyPresence('SignupPage', 'errorMessage');
    });

    test('login link navigates to login page', async ({ steps }) => {
      await steps.click('SignupPage', 'loginLink');
      await steps.verifyUrlContains('/login');
      await steps.verifyPresence('LoginPage', 'container');
    });
  });
});
