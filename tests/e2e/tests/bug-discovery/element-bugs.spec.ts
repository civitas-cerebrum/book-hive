import { test, expect } from '../fixtures/base';

test.describe('Bug Discovery — Element Bugs', () => {
  test.describe.configure({ timeout: 60_000 });

  /**
   * @bug BUG-001
   * @severity High
   * @phase 1a
   * @steps
   * 1. Navigate to /login
   * 2. Enter invalid email and password
   * 3. Click Sign In
   * 4. Expect error message to be visible
   * @expected An error message like "Invalid credentials" should appear
   * @actual The axios 401 interceptor redirects to /login via window.location.href,
   *         causing a full page reload which destroys the React error state.
   *         No error message is ever shown to the user.
   */
  test('@bug-discovery login with invalid credentials should show error message', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'loginForm');
    await steps.fill('LoginPage', 'emailInput', 'invalid@email.com');
    await steps.fill('LoginPage', 'passwordInput', 'wrongpassword');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // The correct behavior: an error message should be visible
    // BUG: The 401 interceptor in api.js redirects to /login via window.location.href
    // which causes a full page reload, destroying the React state including the error
    await steps.verifyPresence('LoginPage', 'errorMessage');
  });
});
