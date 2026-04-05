import { test, expect } from '../fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Marketplace — Buy Flow Deep Coverage', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  test('buying a listing redirects to order detail', async ({ steps }) => {
    // User1 creates listing
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

    // Logout, login as user2
    await steps.click('Navigation', 'logoutButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Buy listing
    await steps.navigateTo('/marketplace');
    await steps.verifyCount('MarketplacePage', 'buyButton', { greaterThan: 0 });
    await steps.clickNth('MarketplacePage', 'buyButton', 0);
    await steps.waitForNetworkIdle();

    // Should redirect to order detail
    await steps.verifyUrlContains('/orders/');
  });

  test('bought listing disappears from marketplace', async ({ steps }) => {
    // User1 creates listing
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 7 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'FAIR' });
    await steps.fill('CreateListingPage', 'priceInput', '4.00');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Verify listing exists
    await steps.navigateTo('/marketplace');
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });

    // Logout, login as user2 to buy
    await steps.click('Navigation', 'logoutButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace');
    await steps.clickNth('MarketplacePage', 'buyButton', 0);
    await steps.waitForNetworkIdle();

    // Check marketplace - listing should be gone
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'noListings');
  });

  test('seller balance increases after listing is bought', async ({ steps }) => {
    // User1 creates listing
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Check initial balance
    await steps.navigateTo('/profile');
    const initialBalance = await steps.getText('ProfilePage', 'balance');

    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 8 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.fill('CreateListingPage', 'priceInput', '6.00');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // User2 buys
    await steps.click('Navigation', 'logoutButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace');
    await steps.clickNth('MarketplacePage', 'buyButton', 0);
    await steps.waitForNetworkIdle();

    // Check seller balance increased
    await steps.click('Navigation', 'logoutButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/profile');
    const newBalance = await steps.getText('ProfilePage', 'balance');
    expect(newBalance).not.toEqual(initialBalance);
  });
});
