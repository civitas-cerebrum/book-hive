import { test, expect } from './fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Marketplace — Advanced', () => {
  test.describe.configure({ timeout: 60_000 });

  test('cancel listing removes it from profile', async ({ steps, request }) => {
    await request.post('http://localhost:8080/api/reset');
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');

    // Create a listing
    await steps.navigateTo('/marketplace/sell');
    await steps.waitForState('CreateListingPage', 'container');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.fill('CreateListingPage', 'priceInput', '7.99');
    await steps.click('CreateListingPage', 'submitButton');
    await steps.verifyUrlContains('/marketplace');

    // Go to profile and cancel the listing
    await steps.navigateTo('/profile');
    await steps.waitForState('ProfilePage', 'container');
    await steps.verifyCount('ProfilePage', 'myListing', { greaterThan: 0 });
    await steps.clickNth('ProfilePage', 'cancelListingButton', 0);
    await steps.verifyPresence('ProfilePage', 'noListingsMessage');
  });

  test('buy listing as different user', async ({ steps, request }) => {
    await request.post('http://localhost:8080/api/reset');

    // User 1 creates listing
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');

    await steps.navigateTo('/marketplace/sell');
    await steps.waitForState('CreateListingPage', 'container');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'NEW' });
    await steps.fill('CreateListingPage', 'priceInput', '5.00');
    await steps.click('CreateListingPage', 'submitButton');
    await steps.verifyUrlContains('/marketplace');

    // Logout
    await steps.click('Sidebar', 'logoutButton');
    await steps.verifyPresence('Sidebar', 'loginLink');

    // User 2 buys the listing
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');

    await steps.navigateTo('/marketplace');
    await steps.waitForState('MarketplacePage', 'container');
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });
    await steps.clickNth('MarketplacePage', 'buyButton', 0);

    // After buy, listing should disappear
    await steps.navigateTo('/marketplace');
    await steps.waitForState('MarketplacePage', 'container');
    await steps.verifyPresence('MarketplacePage', 'emptyMessage');
  });

  test('create listing with different conditions', async ({ steps, request }) => {
    await request.post('http://localhost:8080/api/reset');
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');

    await steps.navigateTo('/marketplace/sell');
    await steps.waitForState('CreateListingPage', 'container');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 2 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'FAIR' });
    await steps.fill('CreateListingPage', 'priceInput', '3.50');
    await steps.click('CreateListingPage', 'submitButton');
    await steps.verifyUrlContains('/marketplace');
    await steps.waitForState('MarketplacePage', 'container');
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });
  });

  test('authenticated user sees sidebar sell link', async ({ steps, request }) => {
    await request.post('http://localhost:8080/api/reset');
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');
    await steps.verifyPresence('Sidebar', 'sellBookLink');
    await steps.click('Sidebar', 'sellBookLink');
    await steps.verifyUrlContains('/marketplace/sell');
  });
});
