import { test, expect } from '../fixtures/base';

test.describe('Authentication', () => {
  test.describe.configure({ timeout: 60_000 });

  test.describe('Login Page', () => {
    test('should display login form', async ({ steps }) => {
      await steps.navigateTo('/login');
      await steps.verifyPresence('LoginPage', 'container');
      await steps.verifyPresence('LoginPage', 'emailInput');
      await steps.verifyPresence('LoginPage', 'passwordInput');
      await steps.verifyPresence('LoginPage', 'submitBtn');
    });

    test('should display "Welcome back" title', async ({ steps }) => {
      await steps.navigateTo('/login');
      await steps.verifyText('LoginPage', 'title', 'Welcome back');
    });

    test('should have link to signup page', async ({ steps }) => {
      await steps.navigateTo('/login');
      await steps.verifyPresence('LoginPage', 'signupLink');
      await steps.click('LoginPage', 'signupLink');
      await steps.verifyUrlContains('/signup');
    });

    // BUG: Login error message never shown due to 401 interceptor redirect
    // See tests/bug-discovery/auth-bugs.spec.ts for reproduction test
    test.skip('should show error for invalid credentials - KNOWN BUG', async ({ steps }) => {
      await steps.navigateTo('/login');
      await steps.fill('LoginPage', 'emailInput', 'invalid@test.com');
      await steps.fill('LoginPage', 'passwordInput', 'wrongpassword');
      await steps.click('LoginPage', 'submitBtn');
      await steps.waitForNetworkIdle();
      await steps.verifyPresence('LoginPage', 'errorMessage');
    });

    test('should login successfully with valid credentials', async ({ steps }) => {
      // First, create a test user via signup
      const timestamp = Date.now();
      const email = `logintest${timestamp}@test.com`;
      const password = 'testpass123';

      await steps.navigateTo('/signup');
      await steps.fill('SignupPage', 'usernameInput', `logintest${timestamp}`);
      await steps.fill('SignupPage', 'emailInput', email);
      await steps.fill('SignupPage', 'passwordInput', password);
      await steps.click('SignupPage', 'submitBtn');
      await steps.waitForNetworkIdle();

      // Logout
      await steps.click('Sidebar', 'logoutBtn');
      await steps.waitForNetworkIdle();

      // Now login with those credentials
      await steps.navigateTo('/login');
      await steps.fill('LoginPage', 'emailInput', email);
      await steps.fill('LoginPage', 'passwordInput', password);
      await steps.click('LoginPage', 'submitBtn');
      await steps.waitForNetworkIdle();

      // Should be redirected to home and see authenticated navigation
      await steps.verifyPresence('Sidebar', 'navCart');
      await steps.verifyPresence('Sidebar', 'logoutBtn');
    });
  });

  test.describe('Signup Page', () => {
    test('should display signup form', async ({ steps }) => {
      await steps.navigateTo('/signup');
      await steps.verifyPresence('SignupPage', 'container');
      await steps.verifyPresence('SignupPage', 'usernameInput');
      await steps.verifyPresence('SignupPage', 'emailInput');
      await steps.verifyPresence('SignupPage', 'passwordInput');
      await steps.verifyPresence('SignupPage', 'submitBtn');
    });

    test('should display "Create an account" title', async ({ steps }) => {
      await steps.navigateTo('/signup');
      await steps.verifyText('SignupPage', 'title', 'Create an account');
    });

    test('should have link to login page', async ({ steps }) => {
      await steps.navigateTo('/signup');
      await steps.verifyPresence('SignupPage', 'loginLink');
      await steps.click('SignupPage', 'loginLink');
      await steps.verifyUrlContains('/login');
    });

    test('should signup successfully with valid data', async ({ steps }) => {
      const timestamp = Date.now();
      await steps.navigateTo('/signup');
      await steps.fill('SignupPage', 'usernameInput', `newuser${timestamp}`);
      await steps.fill('SignupPage', 'emailInput', `newuser${timestamp}@test.com`);
      await steps.fill('SignupPage', 'passwordInput', 'password123');
      await steps.click('SignupPage', 'submitBtn');
      await steps.waitForNetworkIdle();

      // Should be redirected to home and see authenticated navigation
      await steps.verifyPresence('Sidebar', 'navCart');
      await steps.verifyPresence('Sidebar', 'logoutBtn');
    });

    test('should show error for duplicate email', async ({ steps }) => {
      const timestamp = Date.now();
      const email = `duplicate${timestamp}@test.com`;

      // First signup
      await steps.navigateTo('/signup');
      await steps.fill('SignupPage', 'usernameInput', `duplicate${timestamp}`);
      await steps.fill('SignupPage', 'emailInput', email);
      await steps.fill('SignupPage', 'passwordInput', 'password123');
      await steps.click('SignupPage', 'submitBtn');
      await steps.waitForNetworkIdle();

      // Logout
      await steps.click('Sidebar', 'logoutBtn');
      await steps.waitForNetworkIdle();

      // Try to signup with same email
      await steps.navigateTo('/signup');
      await steps.fill('SignupPage', 'usernameInput', `duplicate2${timestamp}`);
      await steps.fill('SignupPage', 'emailInput', email);
      await steps.fill('SignupPage', 'passwordInput', 'password123');
      await steps.click('SignupPage', 'submitBtn');
      await steps.waitForState('SignupPage', 'errorMessage', 'visible');
      await steps.verifyPresence('SignupPage', 'errorMessage');
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ steps }) => {
      const timestamp = Date.now();

      // Create account and login
      await steps.navigateTo('/signup');
      await steps.fill('SignupPage', 'usernameInput', `logouttest${timestamp}`);
      await steps.fill('SignupPage', 'emailInput', `logouttest${timestamp}@test.com`);
      await steps.fill('SignupPage', 'passwordInput', 'password123');
      await steps.click('SignupPage', 'submitBtn');
      await steps.waitForNetworkIdle();

      // Verify logged in
      await steps.verifyPresence('Sidebar', 'logoutBtn');

      // Logout
      await steps.click('Sidebar', 'logoutBtn');
      await steps.waitForNetworkIdle();

      // Verify logged out - should see login link
      await steps.verifyPresence('Sidebar', 'navLogin');
      await steps.verifyAbsence('Sidebar', 'logoutBtn');
    });
  });
});
