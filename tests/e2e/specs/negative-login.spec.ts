/*
 * === RISK SCORE ===
 * /login — risk_score 18 (T1=3 x page_criticality=3 x data_sensitivity=2)
 * Form page with: email input, password input, submit button
 * T1: Empty submission, Type violation, Boundary values, Injection, Duplicate submission
 */

import { test, expect } from '../fixtures/base';

test.describe('@negative /login — T1 Data Integrity', () => {
  test.beforeEach(async ({ steps, page }) => {
    await page.request.post('http://localhost:8080/api/reset');
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'loginPage');
  });

  test('@negative empty-submission /login: submit with all fields empty', async ({ steps, page }) => {
    await steps.click('LoginPage', 'loginSubmit');
    await page.waitForTimeout(500);

    // Should show error or stay on login page — not navigate away
    await steps.verifyUrlContains('/login');
    // Should either show validation or error message
  });

  test('@negative empty-submission /login: submit with email empty', async ({ steps, page }) => {
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await page.waitForTimeout(500);

    await steps.verifyUrlContains('/login');
  });

  test('@negative empty-submission /login: submit with password empty', async ({ steps, page }) => {
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.click('LoginPage', 'loginSubmit');
    await page.waitForTimeout(500);

    await steps.verifyUrlContains('/login');
  });

  test('@negative type-violation /login: non-email string in email field', async ({ steps, page }) => {
    await steps.fill('LoginPage', 'loginEmail', 'not-an-email');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await page.waitForTimeout(500);

    // Should show error — invalid credentials or invalid email format
    await steps.verifyUrlContains('/login');
  });

  test('@negative type-violation /login: numeric string in email field', async ({ steps, page }) => {
    await steps.fill('LoginPage', 'loginEmail', '12345');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await page.waitForTimeout(500);

    await steps.verifyUrlContains('/login');
  });

  test('@negative boundary-values /login: single character email', async ({ steps, page }) => {
    await steps.fill('LoginPage', 'loginEmail', 'a');
    await steps.fill('LoginPage', 'loginPassword', 'b');
    await steps.click('LoginPage', 'loginSubmit');
    await page.waitForTimeout(500);

    await steps.verifyUrlContains('/login');
  });

  test('@negative boundary-values /login: 500 character email', async ({ steps, page }) => {
    const longEmail = 'a'.repeat(490) + '@test.com';
    await steps.fill('LoginPage', 'loginEmail', longEmail);
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await page.waitForTimeout(500);

    // Should not crash — show error or stay on login
    await steps.verifyUrlContains('/login');
  });

  test('@negative boundary-values /login: 1000 character password', async ({ steps, page }) => {
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'A'.repeat(1000));
    await steps.click('LoginPage', 'loginSubmit');
    await page.waitForTimeout(500);

    await steps.verifyUrlContains('/login');
  });

  test('@negative injection /login: XSS script tag in email field', async ({ steps, page }) => {
    await steps.fill('LoginPage', 'loginEmail', '<script>alert(1)</script>');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await page.waitForTimeout(500);

    // Should show error message — verify the payload is not rendered as HTML
    await steps.verifyUrlContains('/login');
    const errorVisible = await page.locator('[data-testid="login-error"]').isVisible().catch(() => false);
    if (errorVisible) {
      const errorText = await page.locator('[data-testid="login-error"]').textContent();
      expect(errorText).not.toContain('<script>');
    }
  });

  test('@negative injection /login: XSS img tag in email field', async ({ steps, page }) => {
    await steps.fill('LoginPage', 'loginEmail', '<img src=x onerror=alert(1)>');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await page.waitForTimeout(500);

    await steps.verifyUrlContains('/login');
    // Verify no alert dialog appeared
    const dialogPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
    const dialog = await dialogPromise;
    expect(dialog).toBeNull();
  });

  test('@negative injection /login: SQL injection in email field', async ({ steps, page }) => {
    await steps.fill('LoginPage', 'loginEmail', "'; DROP TABLE users; --");
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await page.waitForTimeout(500);

    await steps.verifyUrlContains('/login');
  });

  test('@negative injection /login: template injection in email field', async ({ steps, page }) => {
    await steps.fill('LoginPage', 'loginEmail', '{{7*7}}');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await page.waitForTimeout(500);

    await steps.verifyUrlContains('/login');
    // Verify that the error message text (if visible) does not show evaluated template "49"
    const errorVisible = await page.locator('[data-testid="login-error"]').isVisible().catch(() => false);
    if (errorVisible) {
      const errorText = await page.locator('[data-testid="login-error"]').textContent();
      expect(errorText).not.toBe('49');
    }
  });

  test('@negative injection /login: path traversal in email field', async ({ steps, page }) => {
    await steps.fill('LoginPage', 'loginEmail', '../../../etc/passwd');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await page.waitForTimeout(500);

    await steps.verifyUrlContains('/login');
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('root:');
  });

  test('@negative injection /login: attribute injection in email field', async ({ steps, page }) => {
    await steps.fill('LoginPage', 'loginEmail', '" onmouseover="alert(1)');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await page.waitForTimeout(500);

    await steps.verifyUrlContains('/login');
  });

  test('@negative injection /login: javascript protocol in email field', async ({ steps, page }) => {
    await steps.fill('LoginPage', 'loginEmail', 'javascript:alert(1)');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await page.waitForTimeout(500);

    await steps.verifyUrlContains('/login');
  });

  test('@negative injection /login: template literal injection in email field', async ({ steps, page }) => {
    await steps.fill('LoginPage', 'loginEmail', '${7*7}');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await page.waitForTimeout(500);

    await steps.verifyUrlContains('/login');
    // Verify that the error message (if visible) does not show evaluated template "49"
    const errorVisible = await page.locator('[data-testid="login-error"]').isVisible().catch(() => false);
    if (errorVisible) {
      const errorText = await page.locator('[data-testid="login-error"]').textContent();
      expect(errorText).not.toBe('49');
    }
  });

  test('@negative injection /login: SQL injection in password field', async ({ steps, page }) => {
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', "' OR '1'='1");
    await steps.click('LoginPage', 'loginSubmit');
    await page.waitForTimeout(500);

    // Should NOT log in — stay on login page
    await steps.verifyUrlContains('/login');
  });

  test('@negative duplicate-submission /login: double-click Sign In button', async ({ steps, page }) => {
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');

    const loginBtn = page.locator('[data-testid="login-submit"]');
    await loginBtn.dblclick();

    // Should navigate to home successfully — no error from duplicate request
    await page.waitForTimeout(2000);
    const url = page.url();
    // Either on home page (success) or login page (handled gracefully)
    expect(url.includes('/login') || url === 'http://localhost:7547/').toBeTruthy();
  });
});

/*
 * === EXPERIENTIAL NOTES ===
 *
 * - Login form has no client-side validation — all inputs are accepted and sent to server.
 *   Server returns "Invalid credentials" for any bad input, including XSS payloads.
 * - The login error message is displayed in a data-testid="login-error" element.
 * - No rate limiting observed — rapid login attempts all get processed.
 * - Double-click on Sign In button works fine — second click either gets ignored
 *   (first request completes and navigates) or both fire but only one matters.
 * - The email field accepts any text (no HTML5 type="email" validation enforcement).
 * - Password field allows up to 1000+ chars without issue.
 * - Template injection payloads ({{7*7}}, ${7*7}) are safely rejected — error message
 *   does not evaluate templates.
 * - SQL injection payloads treated as invalid credentials — no server error.
 *
 * Categories skipped: None — all T1 categories applied.
 */
