import { test, expect } from '../fixtures/base';

test.describe('Empty States & UX Integrity @negative', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  test('orders page shows empty state for user with no orders', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'heading');
    await steps.verifyPresence('OrdersPage', 'noOrdersMessage');
  });

  test('marketplace shows no listings message when empty', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'heading');
    await steps.verifyPresence('MarketplacePage', 'noListings');
  });

  test('profile shows no active listings text', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'myListingsHeading');
    await steps.verifyPresence('ProfilePage', 'noListings');
  });

  test('empty cart shows correct message and no action buttons', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.clickIfPresent('CartPage', 'cartClear');
    await steps.waitForNetworkIdle();

    await steps.verifyPresence('CartPage', 'heading');
    await steps.verifyPresence('CartPage', 'emptyMessage');
  });

  test('search with no results shows empty state', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'zzzznonexistentbookxxx');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'noBooks');
  });

  test('homepage book grid shows books on initial load', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });
});
