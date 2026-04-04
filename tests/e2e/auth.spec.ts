import { test, expect, TEST_USERS } from './fixtures/base';

test.describe('Authentication — Login and Signup', () => {
  test.describe.configure({ timeout: 60_000 });

  test('login page displays form elements', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'page');
    await steps.verifyPresence('LoginPage', 'emailInput');
    await steps.verifyPresence('LoginPage', 'passwordInput');
    await steps.verifyPresence('LoginPage', 'submitButton');
    await steps.verifyPresence('LoginPage', 'signupLink');
  });

  test('signup page displays form elements', async ({ steps }) => {
    await steps.navigateTo('/signup');
    await steps.verifyPresence('SignupPage', 'page');
    await steps.verifyPresence('SignupPage', 'usernameInput');
    await steps.verifyPresence('SignupPage', 'emailInput');
    await steps.verifyPresence('SignupPage', 'passwordInput');
    await steps.verifyPresence('SignupPage', 'submitButton');
    await steps.verifyPresence('SignupPage', 'loginLink');
  });

  test('successful login with valid credentials redirects to home', async ({ steps, resetApp }) => {
    await resetApp();
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', TEST_USERS.user1.email);
    await steps.fill('LoginPage', 'passwordInput', TEST_USERS.user1.password);
    await steps.click('LoginPage', 'submitButton');
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('Sidebar', 'logoutButton');
  });

  test('invalid login stays on login page', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'wrong@email.com');
    await steps.fill('LoginPage', 'passwordInput', 'wrongpassword');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    // After failed login, user should remain on login page
    await steps.verifyUrlContains('/login');
    await steps.verifyPresence('LoginPage', 'page');
  });

  test('signup link navigates to signup page', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.click('LoginPage', 'signupLink');
    await steps.verifyUrlContains('/signup');
    await steps.verifyPresence('SignupPage', 'page');
  });

  test('login link on signup page navigates to login page', async ({ steps }) => {
    await steps.navigateTo('/signup');
    await steps.click('SignupPage', 'loginLink');
    await steps.verifyUrlContains('/login');
    await steps.verifyPresence('LoginPage', 'page');
  });

  test('successful signup redirects to home with authenticated state', async ({ steps, resetApp }) => {
    await resetApp();
    const uniqueEmail = `signup-test-${Date.now()}@test.com`;
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', 'newtestuser');
    await steps.fill('SignupPage', 'emailInput', uniqueEmail);
    await steps.fill('SignupPage', 'passwordInput', 'TestPassword123');
    await steps.click('SignupPage', 'submitButton');
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('Sidebar', 'logoutButton');
  });

  test('logout returns to unauthenticated state', async ({ steps, loginAs }) => {
    await loginAs('user1');
    await steps.verifyPresence('Sidebar', 'logoutButton');
    await steps.click('Sidebar', 'logoutButton');
    await steps.verifyPresence('Sidebar', 'loginLink');
    await steps.verifyAbsence('Sidebar', 'logoutButton');
  });

  test('authenticated sidebar shows cart, orders, sell, profile links', async ({ steps, loginAs }) => {
    await loginAs('user1');
    await steps.verifyPresence('Sidebar', 'cartLink');
    await steps.verifyPresence('Sidebar', 'ordersLink');
    await steps.verifyPresence('Sidebar', 'sellLink');
    await steps.verifyPresence('Sidebar', 'profileLink');
    await steps.verifyPresence('Sidebar', 'userBalance');
  });

  test('unauthenticated sidebar shows login and signup links', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Sidebar', 'loginLink');
    await steps.verifyPresence('Sidebar', 'signupLink');
  });
});
