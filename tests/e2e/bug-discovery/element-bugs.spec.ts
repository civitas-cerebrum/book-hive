import { test, expect } from '../fixtures/base';

test.describe('Bug Discovery — Element Level', () => {
  test.describe.configure({ timeout: 60_000 });

  /**
   * @bug BUG-001
   * @severity High
   * @phase 1a
   * @steps
   * 1. Navigate to /login
   * 2. Enter invalid email and password
   * 3. Click Sign In
   * 4. Check for error message element
   */
  test('@bug-discovery BUG-001: login form shows no error message after failed login', async ({ steps, page }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'invalid@nonexistent.com');
    await steps.fill('LoginPage', 'passwordInput', 'wrongpassword');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // The login-error element should be visible with an error message
    // BUG: The 401 interceptor in api.js redirects to /login, which re-renders
    // the page and clears the error state before the user sees it
    const errorVisible = await page.locator('[data-testid="login-error"]').isVisible();
    expect(errorVisible).toBe(true);
  });

  /**
   * @bug BUG-002
   * @severity Medium
   * @phase 1a
   * @steps
   * 1. Navigate to / at desktop viewport (1280x720)
   * 2. Check if genre chips container is visible
   */
  test('@bug-discovery BUG-002: genre filter chips hidden at desktop viewport', async ({ steps, page }) => {
    await steps.navigateTo('/');
    // Genre chips should be visible and usable at desktop viewport
    const chipsDisplay = await page.locator('[data-testid="genre-chips"]').evaluate(
      (el) => window.getComputedStyle(el).display
    );
    // BUG: Genre chips have display: none at desktop viewport
    // Users cannot see or interact with genre filter chips
    expect(chipsDisplay).not.toBe('none');
  });
});
