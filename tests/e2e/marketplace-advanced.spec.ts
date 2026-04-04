import { test, expect } from './fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Marketplace — Advanced Flows', () => {
  test.describe.configure({ timeout: 60_000 });

  test('buy a listing from another user', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    // User1 creates a listing
    await loginAs('user1');
    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.fill('CreateListingPage', 'priceInput', '8.00');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Logout and login as user2
    await steps.click('Sidebar', 'logoutButton');
    await steps.waitForNetworkIdle();
    await loginAs('user2');

    // Buy the listing
    await steps.navigateTo('/marketplace');
    await steps.verifyCount('ListingCard', 'card', { greaterThan: 0 });
    await steps.clickNth('ListingCard', 'buyButton', 0);
    await steps.waitForNetworkIdle();

    // Verify listing is gone
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'noListings');
  });

  test('cancel own listing from profile page', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');

    // Create a listing
    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'FAIR' });
    await steps.fill('CreateListingPage', 'priceInput', '6.00');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Go to profile and cancel
    await steps.navigateTo('/profile');
    await steps.verifyCount('ProfilePage', 'myListings', { greaterThan: 0 });
    await steps.clickNth('ProfilePage', 'cancelListingButton', 0);
    await steps.waitForNetworkIdle();

    // Verify listing removed
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'noListings');
  });

  test('listing form requires all fields', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');
    await steps.navigateTo('/marketplace/sell');
    // Try to create without filling in anything
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();
    // Should still be on the create page (no redirect)
    await steps.verifyUrlContains('/marketplace/sell');
  });

  test('created listing shows on marketplace page', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');
    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 2 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'NEW' });
    await steps.fill('CreateListingPage', 'priceInput', '15.00');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Go check marketplace
    await steps.navigateTo('/marketplace');
    await steps.verifyCount('ListingCard', 'card', { greaterThan: 0 });
    const prices = await steps.getAll('ListingCard', 'price');
    const priceValues = prices.map(p => p.replace(/[^0-9.]/g, ''));
    expect(priceValues).toContain('15.00');
  });
});
