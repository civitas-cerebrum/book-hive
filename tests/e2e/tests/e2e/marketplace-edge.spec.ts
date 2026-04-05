import { test, expect } from '../fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Marketplace — Edge Cases', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  test('marketplace shows no listings when none exist', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'heading');
    await steps.verifyPresence('MarketplacePage', 'noListings');
  });

  test('marketplace heading displays correctly', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyText('MarketplacePage', 'heading', 'Marketplace');
  });

  test('listing owner cannot see buy button on own listing', async ({ steps }) => {
    // Login and create a listing
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.fill('CreateListingPage', 'priceInput', '5.99');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Verify listing is visible but buy button is not (own listing)
    await steps.navigateTo('/marketplace');
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });
    await steps.verifyAbsence('MarketplacePage', 'buyButton');
  });

  test('listing shows title, condition, and price', async ({ steps }) => {
    // Login — listing already exists from previous test
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace');
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });
    await steps.verifyCount('MarketplacePage', 'listingTitle', { greaterThan: 0 });
    await steps.verifyCount('MarketplacePage', 'listingCondition', { greaterThan: 0 });
    await steps.verifyCount('MarketplacePage', 'listingPrice', { greaterThan: 0 });
  });
});
