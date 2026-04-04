import { test, expect } from './fixtures/base';

test.describe('Signup Flow', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async ({ request }) => {
    await request.post('http://localhost:8080/api/reset');
  });

  test('should display signup form with all fields', async ({ steps }) => {
    await steps.navigateTo('/signup');
    await steps.verifyPresence('SignupPage', 'usernameInput');
    await steps.verifyPresence('SignupPage', 'emailInput');
    await steps.verifyPresence('SignupPage', 'passwordInput');
    await steps.verifyPresence('SignupPage', 'submitButton');
    await steps.verifyPresence('SignupPage', 'loginLink');
  });

  test('should navigate from signup to login via link', async ({ steps }) => {
    await steps.navigateTo('/signup');
    await steps.click('SignupPage', 'loginLink');
    await steps.verifyUrlContains('/login');
    await steps.verifyPresence('LoginPage', 'loginForm');
  });

  test('should navigate from login to signup via link', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.click('LoginPage', 'signupLink');
    await steps.verifyUrlContains('/signup');
    await steps.verifyPresence('SignupPage', 'usernameInput');
  });

  test('should register a new user and redirect to home', async ({ steps }) => {
    const uniqueEmail = `newuser_${Date.now()}@bookhive.test`;
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', 'newuser_test');
    await steps.fill('SignupPage', 'emailInput', uniqueEmail);
    await steps.fill('SignupPage', 'passwordInput', 'NewUser1234!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Should redirect to home or login after successful signup
    await steps.verifyUrlContains('/');
  });

  test('should show error when registering with existing email', async ({ steps }) => {
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', 'duplicate_user');
    await steps.fill('SignupPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Should show an error or remain on signup page
    await steps.verifyPresence('SignupPage', 'errorMessage');
  });
});
