import { test, expect } from '../fixtures/base';

test.describe('Navigation — Deep Coverage', () => {
  test.describe.configure({ timeout: 60_000 });

  test('logo text BookHive is visible', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Navigation', 'logo');
  });

  test('sidebar shows Browse and Categories sections', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Navigation', 'sidebar');
    await steps.verifyPresence('Navigation', 'allBooksLink');
    await steps.verifyPresence('Navigation', 'marketplaceLink');
  });

  test('sidebar shows all genre filter links', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Navigation', 'genreFilterFiction');
    await steps.verifyPresence('Navigation', 'genreFilterSciFi');
    await steps.verifyPresence('Navigation', 'genreFilterNonFiction');
    await steps.verifyPresence('Navigation', 'genreFilterBiography');
    await steps.verifyPresence('Navigation', 'genreFilterFantasy');
    await steps.verifyPresence('Navigation', 'genreFilterMystery');
  });

  test('navigation links change after login', async ({ steps }) => {
    await steps.navigateTo('/');
    // Unauthenticated: shows login + signup
    await steps.verifyPresence('Navigation', 'loginLink');
    await steps.verifyPresence('Navigation', 'signupLink');

    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Authenticated: shows cart, orders, sell, profile, logout
    await steps.verifyPresence('Navigation', 'cartLink');
    await steps.verifyPresence('Navigation', 'ordersLink');
    await steps.verifyPresence('Navigation', 'sellLink');
    await steps.verifyPresence('Navigation', 'profileLink');
    await steps.verifyPresence('Navigation', 'logoutButton');
    await steps.verifyAbsence('Navigation', 'loginLink');
    await steps.verifyAbsence('Navigation', 'signupLink');
  });

  test('navigation links change after logout', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Logout
    await steps.click('Navigation', 'logoutButton');
    await steps.waitForNetworkIdle();

    // Should revert to unauthenticated state
    await steps.verifyPresence('Navigation', 'loginLink');
    await steps.verifyPresence('Navigation', 'signupLink');
    await steps.verifyAbsence('Navigation', 'cartLink');
    await steps.verifyAbsence('Navigation', 'logoutButton');
  });

  test('sidebar persists across page navigation', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Navigation', 'sidebar');

    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('Navigation', 'sidebar');

    await steps.navigateTo('/login');
    await steps.verifyPresence('Navigation', 'sidebar');
  });

  test('theme toggle persists across pages', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Navigation', 'themeToggle');
    await steps.click('Navigation', 'themeToggle');

    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('Navigation', 'themeToggle');

    await steps.navigateTo('/login');
    await steps.verifyPresence('Navigation', 'themeToggle');
  });
});
