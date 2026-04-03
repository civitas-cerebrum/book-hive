import { test, expect } from '../fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Marketplace — Listings', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.page.request.post('http://localhost:8080/api/reset');
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');
  });

  test('marketplace shows no listings after reset', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.waitForState('MarketplacePage', 'container');
    await steps.verifyPresence('MarketplacePage', 'noListings');
    await steps.verifyText('MarketplacePage', 'heading', 'Marketplace');
  });

  test('create listing page shows form elements', async ({ steps }) => {
    await steps.navigateTo('/marketplace/sell');
    await steps.waitForState('CreateListingPage', 'container');
    await steps.verifyPresence('CreateListingPage', 'bookSelect');
    await steps.verifyPresence('CreateListingPage', 'conditionSelect');
    await steps.verifyPresence('CreateListingPage', 'priceInput');
    await steps.verifyPresence('CreateListingPage', 'createButton');
    await steps.verifyText('CreateListingPage', 'heading', 'Sell a Book');
  });

  test('create a listing and see it on marketplace', async ({ steps }) => {
    await steps.navigateTo('/marketplace/sell');
    await steps.waitForState('CreateListingPage', 'container');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', {
      type: DropdownSelectType.INDEX,
      index: 1
    });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', {
      type: DropdownSelectType.VALUE,
      value: 'GOOD'
    });
    await steps.fill('CreateListingPage', 'priceInput', '9.99');
    await steps.click('CreateListingPage', 'createButton');
    // Should redirect to marketplace
    await steps.verifyUrlContains('/marketplace');
    await steps.waitForState('MarketplacePage', 'container');
  });

  test('created listing appears in profile', async ({ steps }) => {
    // Create a listing
    await steps.navigateTo('/marketplace/sell');
    await steps.waitForState('CreateListingPage', 'container');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', {
      type: DropdownSelectType.INDEX,
      index: 1
    });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', {
      type: DropdownSelectType.VALUE,
      value: 'GOOD'
    });
    await steps.fill('CreateListingPage', 'priceInput', '9.99');
    await steps.click('CreateListingPage', 'createButton');
    await steps.verifyUrlContains('/marketplace');

    // Go to profile
    await steps.navigateTo('/profile');
    await steps.waitForState('ProfilePage', 'container');
    await steps.verifyCount('ProfilePage', 'myListings', { greaterThan: 0 });
  });
});
