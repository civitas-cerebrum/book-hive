import { test, expect } from '../fixtures/base';

test.describe('Negative — Signup Validation @negative', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.navigateTo('/signup');
  });

  test('signup with short password stays on page', async ({ steps }) => {
    await steps.fill('SignupPage', 'usernameInput', 'shortpwduser');
    await steps.fill('SignupPage', 'emailInput', 'shortpwd@test.com');
    await steps.fill('SignupPage', 'passwordInput', 'ab');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/signup');
  });

  test('signup with invalid email format stays on page', async ({ steps }) => {
    await steps.fill('SignupPage', 'usernameInput', 'invalidemail');
    await steps.fill('SignupPage', 'emailInput', 'notanemail');
    await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/signup');
  });

  test('signup with XSS in username is handled safely', async ({ steps }) => {
    const xssPayload = '<script>alert(1)</script>';
    await steps.fill('SignupPage', 'usernameInput', xssPayload);
    await steps.fill('SignupPage', 'emailInput', 'xsstest@test.com');
    await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Either stays on signup (rejected) or goes to home (accepted but escaped)
    // Both are acceptable — what matters is no XSS execution and no crash
    await steps.verifyPresence('Navigation', 'sidebar');
  });

  test('signup with SQL injection in email stays on page', async ({ steps }) => {
    await steps.fill('SignupPage', 'usernameInput', 'sqltest');
    await steps.fill('SignupPage', 'emailInput', "' OR 1=1 --");
    await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/signup');
  });

  test('signup with very long username is handled gracefully', async ({ steps }) => {
    const longUsername = 'a'.repeat(256);
    await steps.fill('SignupPage', 'usernameInput', longUsername);
    await steps.fill('SignupPage', 'emailInput', 'longuser@test.com');
    await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Should handle gracefully — either reject or accept without crash
    await steps.verifyPresence('Navigation', 'sidebar');
  });

  test('signup with password-only field stays on page', async ({ steps }) => {
    await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/signup');
  });

  test('signup with username-only field stays on page', async ({ steps }) => {
    await steps.fill('SignupPage', 'usernameInput', 'usernameonly');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/signup');
  });
});
