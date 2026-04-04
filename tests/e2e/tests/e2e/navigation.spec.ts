import { test, expect } from '../fixtures/base';

test.describe('Navigation', () => {
  test.describe.configure({ timeout: 60_000 });

  test('unauthenticated user sees login and signup links', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Navigation', 'loginLink');
    await steps.verifyPresence('Navigation', 'signupLink');
  });

  test('sidebar has category links', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Navigation', 'allBooksLink');
    await steps.verifyPresence('Navigation', 'marketplaceLink');
  });

  test('genre links filter books', async ({ steps }) => {
    await steps.navigateTo('/?genre=Fiction');
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('authenticated user sees account navigation links', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.verifyPresence('Navigation', 'cartLink');
    await steps.verifyPresence('Navigation', 'ordersLink');
    await steps.verifyPresence('Navigation', 'sellLink');
    await steps.verifyPresence('Navigation', 'profileLink');
    await steps.verifyPresence('Navigation', 'logoutButton');
  });

  test('cart link navigates to cart page', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.click('Navigation', 'cartLink');
    await steps.verifyUrlContains('/cart');
  });

  test('orders link navigates to orders page', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.click('Navigation', 'ordersLink');
    await steps.verifyUrlContains('/orders');
  });

  test('sell link navigates to create listing page', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.click('Navigation', 'sellLink');
    await steps.verifyUrlContains('/marketplace/sell');
  });

  test('profile link navigates to profile page', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.click('Navigation', 'profileLink');
    await steps.verifyUrlContains('/profile');
  });
});
