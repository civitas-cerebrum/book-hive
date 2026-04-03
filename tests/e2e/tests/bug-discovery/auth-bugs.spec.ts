import { test, expect, TEST_USERS } from '../../fixtures/base';

/**
 * Bug Discovery Tests for Authentication
 * These tests document confirmed bugs that need to be fixed.
 * Tests assert CORRECT behavior — they fail now, pass when fixed.
 */
test.describe('Bug Discovery — Authentication', () => {
  test.describe.configure({ timeout: 60000 });

  /**
   * @bug BUG-001
   * @severity High
   * @steps
   * 1. Navigate to /login
   * 2. Enter invalid email and password
   * 3. Click Sign In button
   * 4. Observe no error message appears
   * @expected Error message should be displayed to user
   * @actual Form clears, no error feedback provided
   */
  test('@bug-discovery login with invalid credentials should show error message', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'nonexistent@email.com');
    await steps.fill('LoginPage', 'passwordInput', 'wrongpassword123');
    await steps.click('LoginPage', 'submitButton');

    // This test asserts CORRECT behavior — error message should be visible
    // Currently fails because app does not show error on invalid credentials
    await steps.waitForState('LoginPage', 'errorMessage', 'visible');
    await steps.verifyPresence('LoginPage', 'errorMessage');
  });
});
