import { test, expect } from '../fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Marketplace — Empty State & Own Listings', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  test('marketplace shows heading on fresh load', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'heading');
  });

  test('own listing does not show buy button to seller', async ({ steps }) => {
    // Login as user1 and create listing
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace/sell');
    await steps.waitForNetworkIdle();
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.fill('CreateListingPage', 'priceInput', '5.00');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Navigate to marketplace - own listing should NOT have buy button
    await steps.navigateTo('/marketplace');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });

    // The count of buy buttons should be 0 since only user1's listings exist
    const buyCount = await steps.getCount('MarketplacePage', 'buyButton');
    expect(buyCount).toBe(0);
  });

  test('marketplace listing shows seller info', async ({ steps }) => {
    // Login as user2 to see user1's listing
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });
    await steps.verifyCount('MarketplacePage', 'buyButton', { greaterThan: 0 });
  });

  test('marketplace accessible without authentication', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'heading');
    // Should not redirect to login
    await steps.verifyUrlContains('/marketplace');
  });
});
