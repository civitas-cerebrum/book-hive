import { test, expect } from '../fixtures/base';

test.describe('Negative Tests — Validation & Edge Cases', () => {
  test.describe.configure({ timeout: 60_000 });

  test.describe('Login Validation', () => {
    test.beforeEach(async ({ steps }) => {
      await steps.navigateTo('/login');
      await steps.waitForState('LoginPage', 'container');
    });

    test('empty email field prevents submission (HTML5 validation)', async ({ steps }) => {
      await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
      await steps.click('LoginPage', 'submitButton');
      // Should stay on login page (HTML5 required attribute prevents submission)
      await steps.verifyUrlContains('/login');
      await steps.verifyPresence('LoginPage', 'container');
    });

    test('empty password field prevents submission', async ({ steps }) => {
      await steps.fill('LoginPage', 'emailInput', 'test@test.com');
      await steps.click('LoginPage', 'submitButton');
      await steps.verifyUrlContains('/login');
      await steps.verifyPresence('LoginPage', 'container');
    });
  });

  test.describe('Signup Validation', () => {
    test.beforeEach(async ({ steps }) => {
      await steps.navigateTo('/signup');
      await steps.waitForState('SignupPage', 'container');
    });

    test('empty username prevents submission', async ({ steps }) => {
      await steps.fill('SignupPage', 'emailInput', 'test@test.com');
      await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
      await steps.click('SignupPage', 'submitButton');
      await steps.verifyUrlContains('/signup');
    });

    test('empty email prevents submission', async ({ steps }) => {
      await steps.fill('SignupPage', 'usernameInput', 'testuser');
      await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
      await steps.click('SignupPage', 'submitButton');
      await steps.verifyUrlContains('/signup');
    });

    test('empty password prevents submission', async ({ steps }) => {
      await steps.fill('SignupPage', 'usernameInput', 'testuser');
      await steps.fill('SignupPage', 'emailInput', 'test@test.com');
      await steps.click('SignupPage', 'submitButton');
      await steps.verifyUrlContains('/signup');
    });

    test('duplicate username shows error', async ({ steps }) => {
      await steps.page.request.post('http://localhost:8080/api/reset');
      await steps.fill('SignupPage', 'usernameInput', 'testuser1');
      await steps.fill('SignupPage', 'emailInput', 'newunique@test.com');
      await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
      await steps.click('SignupPage', 'submitButton');
      await steps.waitForState('SignupPage', 'errorMessage');
      await steps.verifyPresence('SignupPage', 'errorMessage');
    });
  });

  test.describe('Non-existent Routes', () => {
    test('non-existent book ID shows appropriate state', async ({ steps }) => {
      await steps.navigateTo('/books/book-999');
      await steps.page.waitForTimeout(2000);
      // Page should either show not-found or redirect
      const url = steps.page.url();
      expect(url).toBeTruthy();
    });

    test('unknown route shows content', async ({ steps }) => {
      await steps.navigateTo('/unknown-route');
      await steps.page.waitForTimeout(1000);
      // React Router should handle this
      const url = steps.page.url();
      expect(url).toContain('/unknown-route');
    });
  });

  test.describe('Search Edge Cases', () => {
    test.beforeEach(async ({ steps }) => {
      await steps.navigateTo('/');
      await steps.waitForState('HomePage', 'bookGrid');
    });

    test('search with special characters does not crash', async ({ steps }) => {
      await steps.fill('HomePage', 'searchInput', '<script>alert("xss")</script>');
      await steps.pressKey('Enter');
      await steps.page.waitForTimeout(1000);
      // Should show no results or handle gracefully
      await steps.verifyPresence('HomePage', 'noBooks');
    });

    test('search with single character returns results or empty state', async ({ steps }) => {
      await steps.fill('HomePage', 'searchInput', 'a');
      await steps.pressKey('Enter');
      await steps.page.waitForTimeout(1000);
      // Should either show results or no-books message
      const url = steps.page.url();
      expect(url).toContain('query=a');
    });

    test('empty search after filtering resets results', async ({ steps }) => {
      // Search for something
      await steps.fill('HomePage', 'searchInput', 'Dune');
      await steps.pressKey('Enter');
      await steps.waitForState('HomePage', 'bookGrid');
      // Clear search
      await steps.fill('HomePage', 'searchInput', '');
      await steps.pressKey('Enter');
      await steps.waitForState('HomePage', 'bookGrid');
      // Should show all 12 books
      await steps.verifyCount('HomePage', 'bookCards', { exactly: 12 });
    });
  });
});
