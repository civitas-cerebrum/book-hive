import { test, expect } from '../../fixtures/base';

test.describe('Authentication', () => {
  test.describe.configure({ timeout: 60_000 });

  test.describe('Signup', () => {
    test('should display signup form', async ({ steps }) => {
      await steps.navigateTo('/signup');
      await steps.verifyPresence('SignupPage', 'container');
      await steps.verifyPresence('SignupPage', 'usernameInput');
      await steps.verifyPresence('SignupPage', 'emailInput');
      await steps.verifyPresence('SignupPage', 'passwordInput');
      await steps.verifyPresence('SignupPage', 'submitButton');
    });

    test('should navigate to login from signup', async ({ steps }) => {
      await steps.navigateTo('/signup');
      await steps.click('SignupPage', 'loginLink');
      await steps.verifyPresence('LoginPage', 'container');
    });

    test('should successfully signup a new user', async ({ steps }) => {
      const uniqueEmail = `test${Date.now()}@example.com`;
      const username = `testuser${Date.now()}`;

      await steps.navigateTo('/signup');
      await steps.fill('SignupPage', 'usernameInput', username);
      await steps.fill('SignupPage', 'emailInput', uniqueEmail);
      await steps.fill('SignupPage', 'passwordInput', 'Password123!');
      await steps.click('SignupPage', 'submitButton');

      // Should redirect to home page after signup
      await steps.waitForNetworkIdle();
      await steps.verifyPresence('HomePage', 'container');

      // Sidebar should show authenticated state
      await steps.verifyPresence('Sidebar', 'logoutButton');
      await steps.verifyAbsence('Sidebar', 'loginLink');
    });

    test('should show error for duplicate email', async ({ steps }) => {
      // First signup with unique username and email
      const timestamp = Date.now();
      const uniqueEmail = `duplicate${timestamp}@example.com`;
      const uniqueUsername1 = `dupuser1_${timestamp}`;
      const uniqueUsername2 = `dupuser2_${timestamp}`;

      await steps.navigateTo('/signup');
      await steps.fill('SignupPage', 'usernameInput', uniqueUsername1);
      await steps.fill('SignupPage', 'emailInput', uniqueEmail);
      await steps.fill('SignupPage', 'passwordInput', 'Password123!');
      await steps.click('SignupPage', 'submitButton');
      await steps.waitForNetworkIdle();

      // Should redirect to home after successful signup
      await steps.verifyPresence('HomePage', 'container');

      // Logout
      await steps.click('Sidebar', 'logoutButton');
      await steps.waitForNetworkIdle();

      // Try to signup with same email but different username
      await steps.navigateTo('/signup');
      await steps.fill('SignupPage', 'usernameInput', uniqueUsername2);
      await steps.fill('SignupPage', 'emailInput', uniqueEmail);
      await steps.fill('SignupPage', 'passwordInput', 'Password123!');
      await steps.click('SignupPage', 'submitButton');
      await steps.waitForNetworkIdle();

      // Should show error and stay on signup page
      await steps.verifyPresence('SignupPage', 'errorMessage');
    });
  });

  test.describe('Login', () => {
    test('should display login form', async ({ steps }) => {
      await steps.navigateTo('/login');
      await steps.verifyPresence('LoginPage', 'container');
      await steps.verifyPresence('LoginPage', 'emailInput');
      await steps.verifyPresence('LoginPage', 'passwordInput');
      await steps.verifyPresence('LoginPage', 'submitButton');
    });

    test('should navigate to signup from login', async ({ steps }) => {
      await steps.navigateTo('/login');
      await steps.click('LoginPage', 'signupLink');
      await steps.verifyPresence('SignupPage', 'container');
    });

    test('should not redirect on invalid credentials', async ({ steps }) => {
      await steps.navigateTo('/login');
      await steps.fill('LoginPage', 'emailInput', 'nonexistent@example.com');
      await steps.fill('LoginPage', 'passwordInput', 'wrongpassword');
      await steps.waitForResponse('/api/auth/login', async () => {
        await steps.click('LoginPage', 'submitButton');
      });

      // Should stay on login page (not redirect to home)
      await steps.verifyPresence('LoginPage', 'container');
      await steps.verifyAbsence('Sidebar', 'logoutButton');
    });

    test('should successfully login and logout', async ({ steps }) => {
      // First create a user via signup
      const uniqueEmail = `logintest${Date.now()}@example.com`;
      const username = `loginuser${Date.now()}`;

      await steps.navigateTo('/signup');
      await steps.fill('SignupPage', 'usernameInput', username);
      await steps.fill('SignupPage', 'emailInput', uniqueEmail);
      await steps.fill('SignupPage', 'passwordInput', 'Password123!');
      await steps.click('SignupPage', 'submitButton');
      await steps.waitForNetworkIdle();

      // Logout
      await steps.click('Sidebar', 'logoutButton');
      await steps.waitForNetworkIdle();
      await steps.verifyPresence('Sidebar', 'loginLink');

      // Login with the created user
      await steps.navigateTo('/login');
      await steps.fill('LoginPage', 'emailInput', uniqueEmail);
      await steps.fill('LoginPage', 'passwordInput', 'Password123!');
      await steps.click('LoginPage', 'submitButton');
      await steps.waitForNetworkIdle();

      // Should redirect to home page
      await steps.verifyPresence('HomePage', 'container');
      await steps.verifyPresence('Sidebar', 'logoutButton');
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing cart without auth', async ({ steps }) => {
      await steps.navigateTo('/cart');
      // ProtectedRoute should redirect to login
      await steps.verifyPresence('LoginPage', 'container');
    });

    test('should redirect to login when accessing orders without auth', async ({ steps }) => {
      await steps.navigateTo('/orders');
      await steps.verifyPresence('LoginPage', 'container');
    });

    test('should redirect to login when accessing profile without auth', async ({ steps }) => {
      await steps.navigateTo('/profile');
      await steps.verifyPresence('LoginPage', 'container');
    });

    test('should redirect to login when accessing sell page without auth', async ({ steps }) => {
      await steps.navigateTo('/marketplace/sell');
      await steps.verifyPresence('LoginPage', 'container');
    });
  });
});
