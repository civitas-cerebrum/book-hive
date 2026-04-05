import { test, expect } from '../fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Profile — Cancel Listing', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  test('user can cancel own listing from profile', async ({ steps }) => {
    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Create a listing
    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.fill('CreateListingPage', 'priceInput', '4.99');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Go to profile and verify listing is present
    await steps.navigateTo('/profile');
    await steps.verifyCount('ProfilePage', 'cancelListingButton', { greaterThan: 0 });

    // Cancel the listing
    await steps.clickNth('ProfilePage', 'cancelListingButton', 0);
    await steps.waitForNetworkIdle();

    // Verify listing is removed
    await steps.verifyPresence('ProfilePage', 'noListings');
  });

  test('cancelled listing no longer appears on marketplace', async ({ steps }) => {
    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Create a listing
    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 3 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'LIKE_NEW' });
    await steps.fill('CreateListingPage', 'priceInput', '6.99');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Verify listing appears on marketplace
    await steps.navigateTo('/marketplace');
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });

    // Cancel from profile
    await steps.navigateTo('/profile');
    await steps.clickNth('ProfilePage', 'cancelListingButton', 0);
    await steps.waitForNetworkIdle();

    // Verify marketplace is empty
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'noListings');
  });

  test('profile shows my listing details', async ({ steps }) => {
    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Create a listing
    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 4 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'NEW' });
    await steps.fill('CreateListingPage', 'priceInput', '8.00');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Verify profile shows listing
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'myListingsHeading');
    await steps.verifyCount('ProfilePage', 'myListing', { greaterThan: 0 });
    await steps.verifyCount('ProfilePage', 'cancelListingButton', { greaterThan: 0 });
  });
});
