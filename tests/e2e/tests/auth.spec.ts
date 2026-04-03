import { test, expect } from '../fixtures/base';

test.describe('Authentication', () => {
  test.describe.configure({ timeout: 60_000, mode: 'serial' });

  test('should display login page with all elements', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'container');
    await steps.verifyPresence('LoginPage', 'emailInput');
    await steps.verifyPresence('LoginPage', 'passwordInput');
    await steps.verifyPresence('LoginPage', 'submitBtn');
    await steps.verifyPresence('LoginPage', 'signupLink');
  });

  test('should display signup page with all elements', async ({ steps }) => {
    await steps.navigateTo('/signup');
    await steps.verifyPresence('SignupPage', 'container');
    await steps.verifyPresence('SignupPage', 'usernameInput');
    await steps.verifyPresence('SignupPage', 'emailInput');
    await steps.verifyPresence('SignupPage', 'passwordInput');
    await steps.verifyPresence('SignupPage', 'submitBtn');
    await steps.verifyPresence('SignupPage', 'loginLink');
  });

  test('should navigate from login to signup page', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.click('LoginPage', 'signupLink');
    await steps.verifyUrlContains('/signup');
    await steps.verifyPresence('SignupPage', 'container');
  });

  test('should navigate from signup to login page', async ({ steps }) => {
    await steps.navigateTo('/signup');
    await steps.click('SignupPage', 'loginLink');
    await steps.verifyUrlContains('/login');
    await steps.verifyPresence('LoginPage', 'container');
  });

  test('should remain on login page after invalid login attempt', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'invalid@example.com');
    await steps.fill('LoginPage', 'passwordInput', 'wrongpassword');
    await steps.click('LoginPage', 'submitBtn');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/login');
  });

  test('should show sidebar login/signup links when not authenticated', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Sidebar', 'navLogin');
    await steps.verifyPresence('Sidebar', 'navSignup');
  });

  test('should register a new user successfully', async ({ steps }) => {
    const timestamp = Date.now();
    const username = `testuser${timestamp}`;
    const email = `testuser${timestamp}@example.com`;

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', username);
    await steps.fill('SignupPage', 'emailInput', email);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('Sidebar', 'logoutBtn');
    await steps.verifyPresence('Sidebar', 'navCart');

    // Cleanup: logout
    await steps.click('Sidebar', 'logoutBtn');
  });

  test('should show error when username is taken', async ({ steps }) => {
    const timestamp = Date.now();
    const username = `dupuser${timestamp}`;
    const email = `dupuser${timestamp}@example.com`;

    // First registration
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', username);
    await steps.fill('SignupPage', 'emailInput', email);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.verifyUrlContains('/');
    await steps.click('Sidebar', 'logoutBtn');

    // Try to register with same username
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', username);
    await steps.fill('SignupPage', 'emailInput', `other${timestamp}@example.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    // Should show error or remain on signup page
    await steps.verifyUrlContains('/signup');
  });

  test('should login and logout successfully', async ({ steps }) => {
    const timestamp = Date.now();
    const username = `loginuser${timestamp}`;
    const email = `loginuser${timestamp}@example.com`;

    // Register first
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', username);
    await steps.fill('SignupPage', 'emailInput', email);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.verifyUrlContains('/');

    // Logout
    await steps.click('Sidebar', 'logoutBtn');
    await steps.verifyPresence('Sidebar', 'navLogin');

    // Login again
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', email);
    await steps.fill('LoginPage', 'passwordInput', 'password123');
    await steps.click('LoginPage', 'submitBtn');
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('Sidebar', 'logoutBtn');

    // Final logout
    await steps.click('Sidebar', 'logoutBtn');
    await steps.verifyPresence('Sidebar', 'navLogin');
  });
});
