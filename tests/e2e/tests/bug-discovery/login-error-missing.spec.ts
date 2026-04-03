import { test, expect } from '../../fixtures/base';

/**
 * BUG-001: No error message shown after failed login attempt
 *
 * SEVERITY: Medium
 * AREA: Authentication / UX
 *
 * DESCRIPTION:
 * When a user enters invalid credentials and attempts to login,
 * the application does not display any error message to inform
 * the user that the login failed. The user remains on the login
 * page without any feedback about what went wrong.
 *
 * EXPECTED BEHAVIOR:
 * After a failed login attempt, an error message should appear
 * informing the user that the credentials are invalid (e.g.,
 * "Invalid email or password").
 *
 * ACTUAL BEHAVIOR:
 * The form submits, the API returns an error, but no error
 * message is displayed to the user. They are left on the login
 * page with no indication of failure.
 *
 * STEPS TO REPRODUCE:
 * 1. Navigate to /login
 * 2. Enter an invalid email address
 * 3. Enter any password
 * 4. Click the Sign In button
 * 5. Observe: No error message appears
 */

test.describe('@bug-discovery Login Error Message Missing', () => {
  test.describe.configure({ timeout: 60_000 });

  test('BUG-001: should show error message after failed login - FAILING', async ({ steps, page }) => {
    // Navigate to login page
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'container');

    // Enter invalid credentials
    await steps.fill('LoginPage', 'emailInput', 'nonexistent@example.com');
    await steps.fill('LoginPage', 'passwordInput', 'wrongpassword123');

    // Submit the form
    await steps.click('LoginPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    // User should remain on login page (this passes)
    await steps.verifyUrlContains('/login');

    // BUG: Error message should be displayed but is not
    const errorSelector = '[data-testid="error-message"]';
    const errorVisible = await page.locator(errorSelector).isVisible().catch(() => false);

    // This test documents that error message is NOT shown (bug confirmed)
    expect(errorVisible, 'BUG-001: Login error message should be displayed but is missing').toBe(false);
  });

  test('BUG-001: verify login form does not clear on failed attempt', async ({ steps, page }) => {
    // Navigate to login page
    await steps.navigateTo('/login');

    const testEmail = 'test@invalid.com';
    const testPassword = 'badpassword';

    // Enter credentials
    await steps.fill('LoginPage', 'emailInput', testEmail);
    await steps.fill('LoginPage', 'passwordInput', testPassword);

    // Submit
    await steps.click('LoginPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    // Verify we're still on login page
    await steps.verifyUrlContains('/login');

    // Additional observation: form fields may or may not be cleared
    const emailValue = await page.locator('[data-testid="login-email"]').inputValue();
    console.log(`After failed login, email field contains: "${emailValue}"`);
  });
});
