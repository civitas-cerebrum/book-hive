import { test, expect } from '../fixtures/base';

test.describe('Marketplace', () => {
  test.describe.configure({ timeout: 60_000 });

  test('should display marketplace page', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'container');
    await steps.verifyText('MarketplacePage', 'title', 'Marketplace');
  });

  test('should display no listings message when empty', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'noListings');
  });

  test('should navigate to marketplace from sidebar', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'navMarketplace');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'container');
  });

  test('should display create listing page when logged in', async ({ steps }) => {
    const timestamp = Date.now();

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `seller${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `seller${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'container');
    await steps.verifyText('CreateListingPage', 'title', 'Sell a Book');
  });

  test('should display form elements on create listing page', async ({ steps }) => {
    const timestamp = Date.now();

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `listform${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `listform${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'bookSelect');
    await steps.verifyPresence('CreateListingPage', 'conditionSelect');
    await steps.verifyPresence('CreateListingPage', 'priceInput');
    await steps.verifyPresence('CreateListingPage', 'createBtn');
  });

  test('should navigate to create listing from sidebar', async ({ steps }) => {
    const timestamp = Date.now();

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `sellnav${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `sellnav${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    await steps.click('Sidebar', 'navSell');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'container');
  });
});
