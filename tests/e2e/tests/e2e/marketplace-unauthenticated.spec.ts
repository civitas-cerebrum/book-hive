import { test, expect } from '../fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Marketplace — Unauthenticated User Behavior', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  test('unauthenticated user can browse marketplace', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'heading');
    await steps.verifyText('MarketplacePage', 'heading', 'Marketplace');
  });

  test('unauthenticated user does not see buy buttons on listings', async ({ steps }) => {
    // First create a listing as authenticated user
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

    // Logout
    await steps.click('Navigation', 'logoutButton');
    await steps.waitForNetworkIdle();

    // Browse marketplace as unauthenticated
    await steps.navigateTo('/marketplace');
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });
    await steps.verifyAbsence('MarketplacePage', 'buyButton');
  });

  test('marketplace listings show title and price for unauthenticated user', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });
    await steps.verifyCount('MarketplacePage', 'listingTitle', { greaterThan: 0 });
    await steps.verifyCount('MarketplacePage', 'listingPrice', { greaterThan: 0 });
  });

  test('marketplace listings show condition badge for unauthenticated user', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyCount('MarketplacePage', 'listingCondition', { greaterThan: 0 });
  });
});
