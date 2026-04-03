import { test, expect } from './fixtures/base';

test.describe('Authentication', () => {
  test.describe.configure({ timeout: 60_000 });

  test.describe('Login', () => {
    test.beforeEach(async ({ steps, request }) => {
      await request.post('http://localhost:8080/api/reset');
      await steps.navigateTo('/login');
      await steps.waitForState('LoginPage', 'container');
    });

    test('displays login form elements', async ({ steps }) => {
      await steps.verifyPresence('LoginPage', 'heading');
      await steps.verifyPresence('LoginPage', 'emailInput');
      await steps.verifyPresence('LoginPage', 'passwordInput');
      await steps.verifyPresence('LoginPage', 'submitButton');
      await steps.verifyPresence('LoginPage', 'signupLink');
    });

    test('successful login redirects to home and shows authenticated state', async ({ steps }) => {
      await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
      await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
      await steps.click('LoginPage', 'submitButton');
      await steps.verifyUrlContains('/');
      await steps.waitForState('HomePage', 'bookGrid');
      await steps.verifyPresence('Sidebar', 'logoutButton');
      await steps.verifyPresence('Sidebar', 'cartLink');
      await steps.verifyPresence('Sidebar', 'ordersLink');
      await steps.verifyTextContains('Sidebar', 'userBalance', '$100.00');
    });

    test('login with invalid credentials stays on login page', async ({ steps, page }) => {
      await steps.fill('LoginPage', 'emailInput', 'wrong@example.com');
      await steps.fill('LoginPage', 'passwordInput', 'WrongPass1!');
      await steps.click('LoginPage', 'submitButton');
      await page.waitForURL('**/login', { timeout: 10000 });
      await steps.verifyUrlContains('/login');
      await steps.verifyAbsence('Sidebar', 'logoutButton');
    });

    test('login with empty email prevents submission via HTML validation', async ({ steps, page }) => {
      await steps.fill('LoginPage', 'passwordInput', 'SomePass1!');
      await steps.click('LoginPage', 'submitButton');
      await steps.verifyUrlContains('/login');
      const emailInput = page.locator('[data-testid="login-email"]');
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
      expect(isValid).toBe(false);
    });

    test('signup link navigates to signup page', async ({ steps }) => {
      await steps.click('LoginPage', 'signupLink');
      await steps.verifyUrlContains('/signup');
      await steps.verifyPresence('SignupPage', 'container');
    });
  });

  test.describe('Signup', () => {
    test.beforeEach(async ({ steps }) => {
      await steps.navigateTo('/signup');
      await steps.waitForState('SignupPage', 'container');
    });

    test('displays signup form elements', async ({ steps }) => {
      await steps.verifyPresence('SignupPage', 'heading');
      await steps.verifyPresence('SignupPage', 'usernameInput');
      await steps.verifyPresence('SignupPage', 'emailInput');
      await steps.verifyPresence('SignupPage', 'passwordInput');
      await steps.verifyPresence('SignupPage', 'submitButton');
      await steps.verifyPresence('SignupPage', 'loginLink');
    });

    test('successful signup redirects to home with authenticated state', async ({ steps }) => {
      const uniqueId = Date.now().toString(36);
      await steps.fill('SignupPage', 'usernameInput', `newuser_${uniqueId}`);
      await steps.fill('SignupPage', 'emailInput', `newuser_${uniqueId}@test.com`);
      await steps.fill('SignupPage', 'passwordInput', 'NewPass1234!');
      await steps.click('SignupPage', 'submitButton');
      await steps.verifyUrlContains('/');
      await steps.waitForState('HomePage', 'bookGrid');
      await steps.verifyPresence('Sidebar', 'logoutButton');
    });

    test('signup with existing email shows error', async ({ steps }) => {
      await steps.fill('SignupPage', 'usernameInput', 'newuser');
      await steps.fill('SignupPage', 'emailInput', 'testuser1@bookhive.test');
      await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
      await steps.click('SignupPage', 'submitButton');
      await steps.verifyPresence('SignupPage', 'errorMessage');
    });

    test('signup with short password is blocked by HTML validation', async ({ steps, page }) => {
      const uniqueId = Date.now().toString(36);
      await steps.fill('SignupPage', 'usernameInput', `short_${uniqueId}`);
      await steps.fill('SignupPage', 'emailInput', `short_${uniqueId}@test.com`);
      await steps.fill('SignupPage', 'passwordInput', 'Ab1!');
      await steps.click('SignupPage', 'submitButton');
      await steps.verifyUrlContains('/signup');
      const pwInput = page.locator('[data-testid="signup-password"]');
      const isValid = await pwInput.evaluate((el: HTMLInputElement) => el.validity.valid);
      expect(isValid).toBe(false);
    });

    test('login link navigates to login page', async ({ steps }) => {
      await steps.click('SignupPage', 'loginLink');
      await steps.verifyUrlContains('/login');
      await steps.verifyPresence('LoginPage', 'container');
    });
  });

  test.describe('Logout', () => {
    test('logout returns to unauthenticated state', async ({ steps }) => {
      await steps.navigateTo('/login');
      await steps.waitForState('LoginPage', 'container');
      await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
      await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
      await steps.click('LoginPage', 'submitButton');
      await steps.waitForState('HomePage', 'bookGrid');
      await steps.verifyPresence('Sidebar', 'logoutButton');
      await steps.click('Sidebar', 'logoutButton');
      await steps.verifyPresence('Sidebar', 'loginLink');
      await steps.verifyPresence('Sidebar', 'signupLink');
      await steps.verifyAbsence('Sidebar', 'logoutButton');
    });
  });

  test.describe('Protected Routes', () => {
    test('cart redirects to login when not authenticated', async ({ steps }) => {
      await steps.navigateTo('/cart');
      await steps.verifyUrlContains('/login');
    });

    test('orders redirects to login when not authenticated', async ({ steps }) => {
      await steps.navigateTo('/orders');
      await steps.verifyUrlContains('/login');
    });

    test('profile redirects to login when not authenticated', async ({ steps }) => {
      await steps.navigateTo('/profile');
      await steps.verifyUrlContains('/login');
    });

    test('sell page redirects to login when not authenticated', async ({ steps }) => {
      await steps.navigateTo('/marketplace/sell');
      await steps.verifyUrlContains('/login');
    });
  });
});
