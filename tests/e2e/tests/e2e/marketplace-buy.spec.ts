import { test, expect } from '../fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Marketplace — Buy Listing', () => {
  test.describe.configure({ timeout: 60_000 });

  test('user can buy a listing from another user', async ({ steps }) => {
    // Login as user1 and create a listing
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 2 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.fill('CreateListingPage', 'priceInput', '3.99');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Logout
    await steps.click('Navigation', 'logoutButton');
    await steps.waitForNetworkIdle();

    // Login as user2
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Buy the listing
    await steps.navigateTo('/marketplace');
    await steps.verifyCount('MarketplacePage', 'buyButton', { greaterThan: 0 });
    await steps.clickNth('MarketplacePage', 'buyButton', 0);
    await steps.waitForNetworkIdle();
  });

  test('marketplace listing shows after creation', async ({ steps }) => {
    // Login as user1 and create a listing
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 3 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'FAIR' });
    await steps.fill('CreateListingPage', 'priceInput', '7.50');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Verify listing appears on marketplace
    await steps.navigateTo('/marketplace');
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });
  });

  test('listing appears on user profile', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 4 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'LIKE_NEW' });
    await steps.fill('CreateListingPage', 'priceInput', '9.00');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Check profile for listing
    await steps.navigateTo('/profile');
    await steps.verifyCount('ProfilePage', 'cancelListingButton', { greaterThan: 0 });
  });
});
