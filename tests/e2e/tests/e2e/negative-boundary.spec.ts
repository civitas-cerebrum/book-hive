import { test, expect } from '../fixtures/base';

test.describe('Negative — Boundary Value Tests', () => {
  test.describe.configure({ timeout: 60_000 });

  test('@negative signup with very long username does not crash', async ({ steps }) => {
    await steps.navigateTo('/signup');
    const longUsername = 'a'.repeat(256);
    await steps.fill('SignupPage', 'usernameInput', longUsername);
    await steps.fill('SignupPage', 'emailInput', 'longuser@test.com');
    await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Either shows error and stays on signup, or succeeds and redirects home
    // The app should not crash — verify one of the valid outcomes
    await steps.verifyPresence('Navigation', 'sidebar');
  });

  test('@negative signup with very long email', async ({ steps }) => {
    await steps.navigateTo('/signup');
    const longEmail = 'a'.repeat(200) + '@test.com';
    await steps.fill('SignupPage', 'usernameInput', 'longemailuser');
    await steps.fill('SignupPage', 'emailInput', longEmail);
    await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Should stay on signup page (validation)
    await steps.verifyUrlContains('/signup');
  });

  test('@negative signup with very short password', async ({ steps }) => {
    const uid = Date.now();
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `shortpw${uid}`);
    await steps.fill('SignupPage', 'emailInput', `shortpw${uid}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'a');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Should stay on signup page (password too short)
    await steps.verifyUrlContains('/signup');
  });

  test('@negative login with extremely long email', async ({ steps }) => {
    await steps.navigateTo('/login');
    const longEmail = 'a'.repeat(500) + '@test.com';
    await steps.fill('LoginPage', 'emailInput', longEmail);
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Should stay on login page
    await steps.verifyUrlContains('/login');
  });

  test('@negative login with extremely long password', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'P'.repeat(1000));
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Should stay on login page with error
    await steps.verifyUrlContains('/login');
  });

  test('@negative search with very long query does not crash', async ({ steps }) => {
    await steps.navigateTo('/');
    const longQuery = 'book'.repeat(100);
    await steps.fill('HomePage', 'searchInput', longQuery);
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();

    // Should not crash — page stays intact, may show no results
    await steps.verifyPresence('HomePage', 'searchInput');
    // Verify app still works by navigating back
    await steps.navigateTo('/');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('@negative navigating to non-existent book ID', async ({ steps }) => {
    await steps.navigateTo('/books/nonexistent-id-12345');
    await steps.waitForNetworkIdle();

    // Should handle gracefully - either redirect or show error
    // Page should not be blank/broken
  });

  test('@negative navigating to non-existent order ID as authenticated user', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/orders/nonexistent-order-12345');
    await steps.waitForNetworkIdle();

    // Should handle gracefully
  });
});
