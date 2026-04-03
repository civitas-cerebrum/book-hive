import { test, expect } from './fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Marketplace', () => {
  test.describe.configure({ timeout: 60_000 });

  test.describe('Unauthenticated', () => {
    test('marketplace page shows empty state when no listings', async ({ steps, request }) => {
      await request.post('http://localhost:8080/api/reset');
      await steps.navigateTo('/marketplace');
      await steps.waitForState('MarketplacePage', 'container');
      await steps.verifyPresence('MarketplacePage', 'emptyMessage');
    });

    test('marketplace link in sidebar navigates correctly', async ({ steps }) => {
      await steps.navigateTo('/');
      await steps.waitForState('HomePage', 'bookGrid');
      await steps.click('Sidebar', 'marketplaceLink');
      await steps.verifyUrlContains('/marketplace');
    });
  });

  test.describe('Create Listing', () => {
    test.beforeEach(async ({ steps, request }) => {
      await request.post('http://localhost:8080/api/reset');
      await steps.navigateTo('/login');
      await steps.waitForState('LoginPage', 'container');
      await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
      await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
      await steps.click('LoginPage', 'submitButton');
      await steps.waitForState('HomePage', 'bookGrid');
    });

    test('create listing page shows form elements', async ({ steps }) => {
      await steps.navigateTo('/marketplace/sell');
      await steps.waitForState('CreateListingPage', 'container');
      await steps.verifyPresence('CreateListingPage', 'bookSelect');
      await steps.verifyPresence('CreateListingPage', 'conditionSelect');
      await steps.verifyPresence('CreateListingPage', 'priceInput');
      await steps.verifyPresence('CreateListingPage', 'submitButton');
    });

    test('create listing successfully redirects to marketplace', async ({ steps }) => {
      await steps.navigateTo('/marketplace/sell');
      await steps.waitForState('CreateListingPage', 'container');
      await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
      await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
      await steps.fill('CreateListingPage', 'priceInput', '9.99');
      await steps.click('CreateListingPage', 'submitButton');
      await steps.verifyUrlContains('/marketplace');
      await steps.waitForState('MarketplacePage', 'container');
      await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });
    });

    test('listing appears on marketplace after creation', async ({ steps }) => {
      await steps.navigateTo('/marketplace/sell');
      await steps.waitForState('CreateListingPage', 'container');
      await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
      await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'LIKE_NEW' });
      await steps.fill('CreateListingPage', 'priceInput', '15.00');
      await steps.click('CreateListingPage', 'submitButton');
      await steps.verifyUrlContains('/marketplace');
      await steps.waitForState('MarketplacePage', 'container');
      await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });
      await steps.verifyCount('MarketplacePage', 'listingPrice', { greaterThan: 0 });
    });

    test('listing appears on profile page after creation', async ({ steps }) => {
      await steps.navigateTo('/marketplace/sell');
      await steps.waitForState('CreateListingPage', 'container');
      await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
      await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'NEW' });
      await steps.fill('CreateListingPage', 'priceInput', '20.00');
      await steps.click('CreateListingPage', 'submitButton');
      await steps.verifyUrlContains('/marketplace');
      await steps.navigateTo('/profile');
      await steps.waitForState('ProfilePage', 'container');
      await steps.verifyCount('ProfilePage', 'myListing', { greaterThan: 0 });
    });
  });
});
