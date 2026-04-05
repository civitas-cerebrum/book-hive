import { test, expect } from '../fixtures/base';

test.describe('Navigation — Deep Coverage', () => {
  test.describe.configure({ timeout: 60_000 });

  test('logo or app name is visible in sidebar', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Navigation', 'sidebar');
  });

  test('browse section has All Books and Marketplace links', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Navigation', 'allBooksLink');
    await steps.verifyPresence('Navigation', 'marketplaceLink');
  });

  test('All Books link navigates to homepage', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.click('Navigation', 'allBooksLink');
    await steps.verifyUrlContains('/');
  });

  test('Marketplace link navigates to marketplace', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Navigation', 'marketplaceLink');
    await steps.verifyUrlContains('/marketplace');
  });

  test('category links are visible in sidebar', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Navigation', 'genreFilterFiction');
    await steps.verifyPresence('Navigation', 'genreFilterSciFi');
    await steps.verifyPresence('Navigation', 'genreFilterNonFiction');
    await steps.verifyPresence('Navigation', 'genreFilterBiography');
    await steps.verifyPresence('Navigation', 'genreFilterFantasy');
    await steps.verifyPresence('Navigation', 'genreFilterMystery');
  });

  test('theme toggle is visible on all pages', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Navigation', 'themeToggle');

    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('Navigation', 'themeToggle');

    await steps.navigateTo('/login');
    await steps.verifyPresence('Navigation', 'themeToggle');
  });

  test('unauthenticated navigation shows Login and Sign Up', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Navigation', 'loginLink');
    await steps.verifyPresence('Navigation', 'signupLink');
  });

  test('authenticated user balance is displayed in sidebar', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.verifyPresence('Navigation', 'userBalance');
  });

  test('authenticated navigation persists across page navigation', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Navigate to several pages and verify nav stays consistent
    await steps.navigateTo('/');
    await steps.verifyPresence('Navigation', 'logoutButton');

    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('Navigation', 'logoutButton');

    await steps.navigateTo('/cart');
    await steps.verifyPresence('Navigation', 'logoutButton');

    await steps.navigateTo('/profile');
    await steps.verifyPresence('Navigation', 'logoutButton');
  });
});
