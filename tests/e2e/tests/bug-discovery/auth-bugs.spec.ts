import { test, expect } from '../../fixtures/base';

test.describe('Bug Discovery — Authentication Bugs', () => {
  test.describe.configure({ timeout: 60_000 });

  /**
   * @bug BUG-001
   * @severity High
   * @phase 4
   * @steps
   * 1. Navigate to /login (while not logged in)
   * 2. Enter invalid email and password
   * 3. Click Sign In button
   * 4. Observe behavior
   *
   * @expected Error message should appear showing "Invalid credentials" or similar
   * @actual Page reloads/redirects and form is cleared. No error message shown.
   * @rootCause The API interceptor in frontend/src/services/api.js redirects
   *            to /login on ANY 401 response, including login failures.
   *            This causes a page reload which clears the form and prevents
   *            the error message from being displayed.
   */
  test('@bug-discovery login error message never shown due to 401 interceptor', async ({ steps, page }) => {
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'emailInput', 'visible');

    // Fill in invalid credentials
    await steps.fill('LoginPage', 'emailInput', 'notexist@test.com');
    await steps.fill('LoginPage', 'passwordInput', 'wrongpassword');

    // Track if page redirects
    const urlBefore = page.url();

    // Submit the form and wait for response
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/auth/login')),
      steps.click('LoginPage', 'submitBtn')
    ]);

    // Verify API returns 401 (as expected for invalid credentials)
    expect(response.status()).toBe(401);

    // Wait a moment for any state updates
    await page.waitForTimeout(1000);

    // BUG: The page should show an error message, but instead:
    // - The 401 interceptor causes a redirect/reload to /login
    // - This clears the form and no error is shown

    // This assertion tests the CORRECT behavior (which currently fails due to bug)
    // When the bug is fixed, this test will pass
    await steps.verifyPresence('LoginPage', 'errorMessage');
  });
});
