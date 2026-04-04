import { test, expect } from './fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Marketplace & Listings', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
  });

  test('should create a marketplace listing and see it on marketplace', async ({ steps }) => {
    // Navigate to sell page
    await steps.click('Navigation', 'sellLink');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('CreateListingPage', 'createListingPage');

    // Fill out listing form
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.fill('CreateListingPage', 'priceInput', '9.99');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Should redirect to marketplace or show success
    await steps.navigateTo('/marketplace');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('MarketplacePage', 'listingCards', { greaterThan: 0 });
  });

  test('should show user profile with balance and listings', async ({ steps }) => {
    await steps.click('Navigation', 'profileLink');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('ProfilePage', 'profilePage');
    await steps.verifyText('ProfilePage', 'username', undefined, { notEmpty: true });
    await steps.verifyText('ProfilePage', 'email', undefined, { notEmpty: true });
    await steps.verifyPresence('ProfilePage', 'balance');
  });
});
