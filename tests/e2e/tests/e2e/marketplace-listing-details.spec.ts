import { test, expect } from '../fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Marketplace Listing Details', () => {
  test.describe.configure({ timeout: 60_000 });

  test('listing card shows title, price, and condition badge', async ({ steps }) => {
    // Login and create a listing
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace/sell');
    await steps.waitForNetworkIdle();
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.fill('CreateListingPage', 'priceInput', '6.49');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Verify marketplace page shows listing details
    await steps.verifyUrlContains('/marketplace');
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });
    await steps.verifyCount('MarketplacePage', 'listingTitle', { greaterThan: 0 });
    await steps.verifyCount('MarketplacePage', 'listingPrice', { greaterThan: 0 });
    await steps.verifyCount('MarketplacePage', 'listingConditionBadge', { greaterThan: 0 });

    const titles = await steps.getAll('MarketplacePage', 'listingTitle');
    expect(titles[0]).toBeTruthy();
    const prices = await steps.getAll('MarketplacePage', 'listingPrice');
    expect(prices[0]).toContain('$');
  });

  test('listing price shows dollar amount', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace/sell');
    await steps.waitForNetworkIdle();
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 2 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'LIKE_NEW' });
    await steps.fill('CreateListingPage', 'priceInput', '8.25');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    await steps.verifyCount('MarketplacePage', 'listingPrice', { greaterThan: 0 });
    const allPrices = await steps.getAll('MarketplacePage', 'listingPrice');
    expect(allPrices[0]).toContain('$');
  });

  test('create listing page shows error for empty price', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace/sell');
    await steps.waitForNetworkIdle();
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 3 });
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Should stay on sell page (validation prevents submission)
    await steps.verifyUrlContains('/marketplace/sell');
  });

  test('buy button visible for listing from another user', async ({ steps }) => {
    // User 1 creates listing
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace/sell');
    await steps.waitForNetworkIdle();
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 5 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'FAIR' });
    await steps.fill('CreateListingPage', 'priceInput', '3.50');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Logout and login as user 2
    await steps.click('Navigation', 'logoutButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('MarketplacePage', 'buyButton', { greaterThan: 0 });
  });
});
