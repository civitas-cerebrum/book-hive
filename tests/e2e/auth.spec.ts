import { test, expect, TEST_USERS } from './fixtures/base';

test.describe('Authentication', () => {
  test.describe.configure({ timeout: 60000 });

  test('should display login page elements', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'page');
    await steps.verifyPresence('LoginPage', 'emailInput');
    await steps.verifyPresence('LoginPage', 'passwordInput');
    await steps.verifyPresence('LoginPage', 'submitButton');
  });

  test('should login successfully with valid credentials', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', TEST_USERS.user1.email);
    await steps.fill('LoginPage', 'passwordInput', TEST_USERS.user1.password);
    await steps.click('LoginPage', 'submitButton');
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('Navigation', 'logoutButton');
  });

  test('should show error for invalid credentials', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'invalid@email.com');
    await steps.fill('LoginPage', 'passwordInput', 'wrongpassword');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('LoginPage', 'errorMessage', 'visible');
    await steps.verifyPresence('LoginPage', 'errorMessage');
  });

  test('should display signup page elements', async ({ steps }) => {
    await steps.navigateTo('/signup');
    await steps.verifyPresence('SignupPage', 'page');
    await steps.verifyPresence('SignupPage', 'usernameInput');
    await steps.verifyPresence('SignupPage', 'emailInput');
    await steps.verifyPresence('SignupPage', 'passwordInput');
    await steps.verifyPresence('SignupPage', 'submitButton');
  });

  test('should signup successfully with valid data', async ({ steps }) => {
    const uniqueEmail = `newuser_${Date.now()}@bookhive.test`;
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', 'newuser');
    await steps.fill('SignupPage', 'emailInput', uniqueEmail);
    await steps.fill('SignupPage', 'passwordInput', 'NewPassword123');
    await steps.click('SignupPage', 'submitButton');
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('Navigation', 'logoutButton');
  });

  test('should show error for duplicate email signup', async ({ steps }) => {
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', 'duplicate');
    await steps.fill('SignupPage', 'emailInput', TEST_USERS.user1.email);
    await steps.fill('SignupPage', 'passwordInput', 'Password123');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForState('SignupPage', 'errorMessage', 'visible');
    await steps.verifyPresence('SignupPage', 'errorMessage');
  });

  test('should logout successfully', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.click('Navigation', 'logoutButton');
    await steps.verifyPresence('Navigation', 'loginLink');
  });

  test('should redirect protected routes to login when not authenticated', async ({ steps }) => {
    await steps.navigateTo('/cart');
    await steps.verifyUrlContains('/login');

    await steps.navigateTo('/orders');
    await steps.verifyUrlContains('/login');

    await steps.navigateTo('/profile');
    await steps.verifyUrlContains('/login');

    await steps.navigateTo('/marketplace/sell');
    await steps.verifyUrlContains('/login');
  });

  test('should navigate from login to signup page', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.click('LoginPage', 'signupLink');
    await steps.verifyUrlContains('/signup');
    await steps.verifyPresence('SignupPage', 'page');
  });

  test('should navigate from signup to login page', async ({ steps }) => {
    await steps.navigateTo('/signup');
    await steps.click('SignupPage', 'loginLink');
    await steps.verifyUrlContains('/login');
    await steps.verifyPresence('LoginPage', 'page');
  });
});
