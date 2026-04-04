import { test, expect } from './fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Marketplace — Extended', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps, page }) => {
    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Clean up existing listings
    const listings = await page.request.get('http://localhost:8080/api/marketplace');
    const listingsData = await listings.json();
    for (const listing of listingsData) {
      await page.request.delete(`http://localhost:8080/api/marketplace/listings/${listing.id}`).catch(() => {});
    }
  });

  test('should show no listings message when marketplace is empty', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('MarketplacePage', 'noListings');
  });

  test('should create listing and verify it appears on marketplace', async ({ steps }) => {
    // Navigate to sell page and create listing
    await steps.click('Navigation', 'sellLink');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('CreateListingPage', 'createListingPage');

    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'NEW' });
    await steps.fill('CreateListingPage', 'priceInput', '15.99');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Verify listing on marketplace
    await steps.navigateTo('/marketplace');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('MarketplacePage', 'listingCards', { greaterThan: 0 });
  });

  test('should show listing on profile after creating it', async ({ steps }) => {
    // Create listing
    await steps.click('Navigation', 'sellLink');
    await steps.waitForNetworkIdle();
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 2 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'FAIR' });
    await steps.fill('CreateListingPage', 'priceInput', '5.00');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Check profile page
    await steps.click('Navigation', 'profileLink');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('ProfilePage', 'myListings', { greaterThan: 0 });
  });
});
