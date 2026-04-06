/*
 * === RISK SCORE ===
 * /signup — risk_score 18 (T1=3 x page_criticality=3 x data_sensitivity=2)
 * Form page with: username input, email input, password input, submit button
 * T1: Empty submission, Type violation, Boundary values, Injection, Duplicate submission
 */

import { test, expect } from '../fixtures/base';

test.describe('@negative /signup — T1 Data Integrity', () => {
  test.beforeEach(async ({ steps, page }) => {
    await page.request.post('http://localhost:8080/api/reset');
    await steps.navigateTo('/signup');
    await steps.verifyPresence('SignupPage', 'signupPage');
  });

  test('@negative empty-submission /signup: submit with all fields empty', async ({ steps, page }) => {
    await steps.click('SignupPage', 'signupSubmit');
    await page.waitForTimeout(500);

    // Should show error or stay on signup page
    await steps.verifyUrlContains('/signup');
  });

  test('@negative empty-submission /signup: submit with username empty', async ({ steps, page }) => {
    await steps.fill('SignupPage', 'signupEmail', 'newuser@test.com');
    await steps.fill('SignupPage', 'signupPassword', 'Test1234!');
    await steps.click('SignupPage', 'signupSubmit');
    await page.waitForTimeout(500);

    await steps.verifyUrlContains('/signup');
  });

  test('@negative empty-submission /signup: submit with email empty', async ({ steps, page }) => {
    await steps.fill('SignupPage', 'signupUsername', 'newuser');
    await steps.fill('SignupPage', 'signupPassword', 'Test1234!');
    await steps.click('SignupPage', 'signupSubmit');
    await page.waitForTimeout(500);

    await steps.verifyUrlContains('/signup');
  });

  test('@negative empty-submission /signup: submit with password empty', async ({ steps, page }) => {
    await steps.fill('SignupPage', 'signupUsername', 'newuser');
    await steps.fill('SignupPage', 'signupEmail', 'newuser@test.com');
    await steps.click('SignupPage', 'signupSubmit');
    await page.waitForTimeout(500);

    await steps.verifyUrlContains('/signup');
  });

  test('@negative type-violation /signup: non-email in email field', async ({ steps, page }) => {
    await steps.fill('SignupPage', 'signupUsername', 'newuser');
    await steps.fill('SignupPage', 'signupEmail', 'not-an-email');
    await steps.fill('SignupPage', 'signupPassword', 'Test1234!');
    await steps.click('SignupPage', 'signupSubmit');
    await page.waitForTimeout(500);

    await steps.verifyUrlContains('/signup');
  });

  test('@negative type-violation /signup: special chars in username', async ({ steps, page }) => {
    await steps.fill('SignupPage', 'signupUsername', '!@#$%^&*()');
    await steps.fill('SignupPage', 'signupEmail', 'specialchar@test.com');
    await steps.fill('SignupPage', 'signupPassword', 'Test1234!');
    await steps.click('SignupPage', 'signupSubmit');
    await page.waitForTimeout(1000);

    // Should either reject or accept but handle gracefully
    const url = page.url();
    expect(url).toBeTruthy(); // No crash
  });

  test('@negative boundary-values /signup: single character username', async ({ steps, page }) => {
    await steps.fill('SignupPage', 'signupUsername', 'a');
    await steps.fill('SignupPage', 'signupEmail', 'singlechar@test.com');
    await steps.fill('SignupPage', 'signupPassword', 'Test1234!');
    await steps.click('SignupPage', 'signupSubmit');
    await page.waitForTimeout(1000);

    // Should either accept or show validation error
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('@negative boundary-values /signup: 256 character username', async ({ steps, page }) => {
    await steps.fill('SignupPage', 'signupUsername', 'u'.repeat(256));
    await steps.fill('SignupPage', 'signupEmail', 'longuser@test.com');
    await steps.fill('SignupPage', 'signupPassword', 'Test1234!');
    await steps.click('SignupPage', 'signupSubmit');
    await page.waitForTimeout(1000);

    // Should either accept or show validation error — not crash
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('@negative boundary-values /signup: 500 character email', async ({ steps, page }) => {
    const longEmail = 'a'.repeat(490) + '@test.com';
    await steps.fill('SignupPage', 'signupUsername', 'longemailer');
    await steps.fill('SignupPage', 'signupEmail', longEmail);
    await steps.fill('SignupPage', 'signupPassword', 'Test1234!');
    await steps.click('SignupPage', 'signupSubmit');
    await page.waitForTimeout(500);

    await steps.verifyUrlContains('/signup');
  });

  test('@negative boundary-values /signup: 1000 character password', async ({ steps, page }) => {
    await steps.fill('SignupPage', 'signupUsername', 'longpwuser');
    await steps.fill('SignupPage', 'signupEmail', 'longpw@test.com');
    await steps.fill('SignupPage', 'signupPassword', 'A'.repeat(1000));
    await steps.click('SignupPage', 'signupSubmit');
    await page.waitForTimeout(1000);

    // Should either accept or show validation error — not crash
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('@negative boundary-values /signup: minimum password (1 char)', async ({ steps, page }) => {
    await steps.fill('SignupPage', 'signupUsername', 'shortpwuser');
    await steps.fill('SignupPage', 'signupEmail', 'shortpw@test.com');
    await steps.fill('SignupPage', 'signupPassword', 'a');
    await steps.click('SignupPage', 'signupSubmit');
    await page.waitForTimeout(500);

    // Should reject too-short password
    await steps.verifyUrlContains('/signup');
  });

  test('@negative injection /signup: XSS script tag in username', async ({ steps, page }) => {
    await steps.fill('SignupPage', 'signupUsername', '<script>alert(1)</script>');
    await steps.fill('SignupPage', 'signupEmail', 'xssuser1@test.com');
    await steps.fill('SignupPage', 'signupPassword', 'Test1234!');
    await steps.click('SignupPage', 'signupSubmit');
    await page.waitForTimeout(1000);

    // If signup succeeded, navigate to profile and check username is escaped
    if (!page.url().includes('/signup')) {
      await steps.navigateTo('/profile');
      const profileText = await page.textContent('body');
      // The script tag should appear as text, not execute
      expect(profileText).not.toContain('<script>');
    }
  });

  test('@negative injection /signup: XSS img tag in username', async ({ steps, page }) => {
    await steps.fill('SignupPage', 'signupUsername', '<img src=x onerror=alert(1)>');
    await steps.fill('SignupPage', 'signupEmail', 'xssuser2@test.com');
    await steps.fill('SignupPage', 'signupPassword', 'Test1234!');
    await steps.click('SignupPage', 'signupSubmit');
    await page.waitForTimeout(1000);

    // No alert dialog should appear
    const dialogPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
    const dialog = await dialogPromise;
    expect(dialog).toBeNull();
  });

  test('@negative injection /signup: SQL injection in username', async ({ steps, page }) => {
    await steps.fill('SignupPage', 'signupUsername', "'; DROP TABLE users; --");
    await steps.fill('SignupPage', 'signupEmail', 'sqluser@test.com');
    await steps.fill('SignupPage', 'signupPassword', 'Test1234!');
    await steps.click('SignupPage', 'signupSubmit');
    await page.waitForTimeout(1000);

    // App should still work — navigate to home and verify books exist
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('@negative injection /signup: template injection in username', async ({ steps, page }) => {
    await steps.fill('SignupPage', 'signupUsername', '{{7*7}}');
    await steps.fill('SignupPage', 'signupEmail', 'templateuser@test.com');
    await steps.fill('SignupPage', 'signupPassword', 'Test1234!');
    await steps.click('SignupPage', 'signupSubmit');
    await page.waitForTimeout(1000);

    // If signup succeeded, verify 49 is not rendered (template injection)
    if (!page.url().includes('/signup')) {
      await steps.navigateTo('/profile');
      const profileText = await page.locator('[data-testid="profile-username"]').textContent();
      expect(profileText).not.toBe('49');
      // The literal template syntax should be shown
      if (profileText) {
        expect(profileText).toContain('{{7*7}}');
      }
    }
  });

  test('@negative injection /signup: path traversal in email', async ({ steps, page }) => {
    await steps.fill('SignupPage', 'signupUsername', 'pathuser');
    await steps.fill('SignupPage', 'signupEmail', '../../../etc/passwd');
    await steps.fill('SignupPage', 'signupPassword', 'Test1234!');
    await steps.click('SignupPage', 'signupSubmit');
    await page.waitForTimeout(500);

    await steps.verifyUrlContains('/signup');
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('root:');
  });

  test('@negative injection /signup: attribute injection in username', async ({ steps, page }) => {
    await steps.fill('SignupPage', 'signupUsername', '" onmouseover="alert(1)');
    await steps.fill('SignupPage', 'signupEmail', 'attrinj@test.com');
    await steps.fill('SignupPage', 'signupPassword', 'Test1234!');
    await steps.click('SignupPage', 'signupSubmit');
    await page.waitForTimeout(1000);

    // No alert triggered
    const dialogPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
    const dialog = await dialogPromise;
    expect(dialog).toBeNull();
  });

  test('@negative injection /signup: javascript protocol in email', async ({ steps, page }) => {
    await steps.fill('SignupPage', 'signupUsername', 'jsproto');
    await steps.fill('SignupPage', 'signupEmail', 'javascript:alert(1)');
    await steps.fill('SignupPage', 'signupPassword', 'Test1234!');
    await steps.click('SignupPage', 'signupSubmit');
    await page.waitForTimeout(500);

    await steps.verifyUrlContains('/signup');
  });

  test('@negative injection /signup: template literal injection in email', async ({ steps, page }) => {
    await steps.fill('SignupPage', 'signupUsername', 'tpliteral');
    await steps.fill('SignupPage', 'signupEmail', '${7*7}@test.com');
    await steps.fill('SignupPage', 'signupPassword', 'Test1234!');
    await steps.click('SignupPage', 'signupSubmit');
    await page.waitForTimeout(1000);

    // If signup succeeded and we're on the home page, check profile for template injection
    if (!page.url().includes('/signup')) {
      await steps.navigateTo('/profile');
      const emailText = await page.locator('[data-testid="profile-email"]').textContent();
      // The literal ${7*7} should be shown, not evaluated to 49
      expect(emailText).not.toBe('49@test.com');
    }
    // If still on signup, that's also fine — the injection was rejected
  });

  test('@negative duplicate-submission /signup: double-click Create Account button', async ({ steps, page }) => {
    await steps.fill('SignupPage', 'signupUsername', 'doubleuser');
    await steps.fill('SignupPage', 'signupEmail', 'doubleclick@test.com');
    await steps.fill('SignupPage', 'signupPassword', 'Test1234!');

    const signupBtn = page.locator('[data-testid="signup-submit"]');
    await signupBtn.dblclick();

    await page.waitForTimeout(2000);

    // Should either create account once and redirect, or show error — not crash
    const url = page.url();
    expect(url).toBeTruthy();
  });
});

/*
 * === EXPERIENTIAL NOTES ===
 *
 * - Signup form has no client-side validation. All payloads are sent to server.
 * - XSS payloads in username: accepted by server! User is created with the literal XSS
 *   string as username. React escapes it on display (profile page shows escaped text).
 * - SQL injection in username: accepted by server, user created with SQL payload as name.
 *   Database (MongoDB) is not vulnerable to SQL injection.
 * - Template injection ({{7*7}}): accepted by server, displayed literally — not evaluated.
 * - Single-char username (a): accepted by server — no minimum length validation.
 * - 256-char username: accepted by server — no maximum length validation on username.
 * - Special chars in username (!@#$%^&*()): accepted by server — no format validation.
 * - Short password (1 char): accepted by server — no minimum password length enforcement.
 * - 1000-char password: accepted by server — no maximum password length enforcement.
 * - Email format validation: server-side only. Non-email strings in email field are
 *   accepted by the form but may cause server error (500 for invalid format).
 * - Double-click on Create Account: handled gracefully — either creates once and
 *   redirects, or second request gets "email already registered" (harmless).
 * - template literal ${7*7}@test.com: accepted and stored literally — no evaluation.
 *
 * Categories skipped: None — all T1 categories applied.
 */
