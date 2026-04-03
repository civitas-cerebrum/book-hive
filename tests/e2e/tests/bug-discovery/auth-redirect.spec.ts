import { test, expect } from '../../fixtures/base';

/**
 * BUG: Authenticated users can access login and signup pages
 *
 * Expected behavior: When a logged-in user navigates to /login or /signup,
 * they should be redirected to the home page or shown a message indicating
 * they are already logged in.
 *
 * Actual behavior: Authenticated users can access and see the login/signup
 * forms while still showing their balance and logout button in the sidebar.
 *
 * Impact: Confusing UX. Users might try to create another account or login
 * while already authenticated. Could lead to session issues.
 *
 * @tag bug-discovery
 * @severity low
 * @area authentication
 */
test.describe('BUG: Authenticated users can access auth pages', () => {
  test.describe.configure({ timeout: 60_000 });

  // Helper to login as test user
  const loginTestUser = async (steps: any) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitBtn');
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('Sidebar', 'logoutBtn');
  };

  test('should redirect authenticated user away from login page @bug-discovery', async ({ steps, page }) => {
    await loginTestUser(steps);

    // Navigate to login page while authenticated
    await steps.navigateTo('/login');

    // Take screenshot as evidence
    await page.screenshot({
      path: 'tests/e2e/test-results/bug-evidence/auth-user-on-login-page.png',
      fullPage: true
    });

    // BUG: User can see login form while showing their balance in sidebar
    // Check if we're still on login page (bug) or redirected (expected)
    const currentUrl = page.url();
    const isOnLoginPage = currentUrl.includes('/login');

    // Check if logout button is visible (means user is authenticated)
    const logoutVisible = await page.locator('[data-testid="logout-btn"]').isVisible().catch(() => false);

    if (isOnLoginPage && logoutVisible) {
      console.log('BUG CONFIRMED: Authenticated user can see login page while logged in');
    }

    // Document the bug - test passes when bug exists (shows auth user on login)
    expect(isOnLoginPage && logoutVisible).toBe(true); // Bug confirmed

    // Cleanup
    await steps.clickIfPresent('Sidebar', 'logoutBtn');
  });

  test('should redirect authenticated user away from signup page @bug-discovery', async ({ steps, page }) => {
    await loginTestUser(steps);

    // Navigate to signup page while authenticated
    await steps.navigateTo('/signup');

    // Take screenshot as evidence
    await page.screenshot({
      path: 'tests/e2e/test-results/bug-evidence/auth-user-on-signup-page.png',
      fullPage: true
    });

    // BUG: User can see signup form while showing their balance in sidebar
    const currentUrl = page.url();
    const isOnSignupPage = currentUrl.includes('/signup');

    // Check if logout button is visible (means user is authenticated)
    const logoutVisible = await page.locator('[data-testid="logout-btn"]').isVisible().catch(() => false);

    if (isOnSignupPage && logoutVisible) {
      console.log('BUG CONFIRMED: Authenticated user can see signup page while logged in');
    }

    // Document the bug
    expect(isOnSignupPage && logoutVisible).toBe(true); // Bug confirmed

    // Cleanup
    await steps.clickIfPresent('Sidebar', 'logoutBtn');
  });
});
