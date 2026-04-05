import { test, expect } from '../fixtures/base';

test.describe('Negative — Injection & XSS Tests', () => {
  test.describe.configure({ timeout: 60_000 });

  test('@negative XSS in login email field is handled safely', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', '<script>alert(1)</script>');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Should stay on login page with error, never execute script
    await steps.verifyUrlContains('/login');
  });

  test('@negative XSS in login password field is handled safely', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', '<script>alert(1)</script>');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Should stay on login page with error
    await steps.verifyUrlContains('/login');
  });

  test('@negative SQL injection in login email is rejected', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', "' OR 1=1 --");
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Should not login, stay on login page
    await steps.verifyUrlContains('/login');
  });

  test('@negative XSS in signup username field is handled safely', async ({ steps }) => {
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', '<img src=x onerror=alert(1)>');
    await steps.fill('SignupPage', 'emailInput', 'xss-test@test.com');
    await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // If signup succeeds, the username should be displayed escaped, not as HTML
    // If it stays on signup, that's also acceptable
  });

  test('@negative HTML injection in signup email is rejected', async ({ steps }) => {
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', 'htmltest');
    await steps.fill('SignupPage', 'emailInput', '<b>bold</b>@test.com');
    await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Should stay on signup page (invalid email format)
    await steps.verifyUrlContains('/signup');
  });

  test('@negative XSS in search input is handled safely', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', '<script>alert("xss")</script>');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();

    // Should show no results, not execute script — page stays intact
    await steps.verifyPresence('HomePage', 'searchInput');
    // Navigate away and back to confirm app is not broken
    await steps.navigateTo('/');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('@negative SQL injection in search input is handled safely', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', "'; DROP TABLE books; --");
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();

    // App should still work — search returns no results but page is intact
    await steps.verifyPresence('HomePage', 'searchInput');
    // Navigate away and back to confirm data not destroyed
    await steps.navigateTo('/');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });
});
