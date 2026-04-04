import { test, expect } from './fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('MarketplacePage — Second-Hand Books', () => {
  test.describe.configure({ timeout: 60_000 });

  test('marketplace page loads with heading', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'page');
  });

  test('empty marketplace shows no-listings message', async ({ steps, resetApp }) => {
    await resetApp();
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'noListings');
  });

  test('marketplace sidebar link navigates correctly', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'marketplaceLink');
    await steps.verifyUrlContains('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'page');
  });

  test('authenticated user can view create listing page', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'page');
    await steps.verifyPresence('CreateListingPage', 'bookSelect');
    await steps.verifyPresence('CreateListingPage', 'conditionSelect');
    await steps.verifyPresence('CreateListingPage', 'priceInput');
    await steps.verifyPresence('CreateListingPage', 'createButton');
  });

  test('sell a book link navigates to create listing page', async ({ steps, loginAs }) => {
    await loginAs('user1');
    await steps.click('Sidebar', 'sellLink');
    await steps.verifyUrlContains('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'page');
  });

  test('create a listing and see it on marketplace', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');
    await steps.navigateTo('/marketplace/sell');

    // Fill in listing form
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.fill('CreateListingPage', 'priceInput', '9.99');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Verify listing appears on marketplace
    await steps.navigateTo('/marketplace');
    await steps.verifyCount('ListingCard', 'card', { greaterThan: 0 });
  });

  test('listing cards show title, condition, and price after creating listing', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');

    // Create a listing first
    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'FAIR' });
    await steps.fill('CreateListingPage', 'priceInput', '5.99');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Check listing details on marketplace
    await steps.navigateTo('/marketplace');
    await steps.verifyCount('ListingCard', 'title', { greaterThan: 0 });
    await steps.verifyCount('ListingCard', 'conditionBadge', { greaterThan: 0 });
    await steps.verifyCount('ListingCard', 'price', { greaterThan: 0 });
  });
});
