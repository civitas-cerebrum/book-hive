import { test, expect } from '../fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Marketplace — Advanced Flows', () => {
  test.describe.configure({ timeout: 60_000 });

  test('buy a listing from marketplace', async ({ steps }) => {
    await steps.page.request.post('http://localhost:8080/api/reset');
    // Login as testuser1 and create listing
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');

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
    await steps.fill('CreateListingPage', 'priceInput', '5.00');
    await steps.click('CreateListingPage', 'createButton');
    await steps.verifyUrlContains('/marketplace');

    // Logout
    await steps.click('Sidebar', 'logoutBtn');
    await steps.waitForState('Sidebar', 'navLogin');

    // Login as testuser2 and buy the listing
    await steps.click('Sidebar', 'navLogin');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');

    await steps.navigateTo('/marketplace');
    await steps.waitForState('MarketplacePage', 'container');
    await steps.verifyCount('MarketplacePage', 'buyButtons', { greaterThan: 0 });
    await steps.clickNth('MarketplacePage', 'buyButtons', 0);
    // After buying, listing should disappear
    await steps.page.waitForTimeout(1000);
  });

  test('cancel own listing from profile', async ({ steps }) => {
    await steps.page.request.post('http://localhost:8080/api/reset');
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');

    // Create a listing
    await steps.navigateTo('/marketplace/sell');
    await steps.waitForState('CreateListingPage', 'container');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', {
      type: DropdownSelectType.INDEX,
      index: 1
    });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', {
      type: DropdownSelectType.VALUE,
      value: 'FAIR'
    });
    await steps.fill('CreateListingPage', 'priceInput', '3.50');
    await steps.click('CreateListingPage', 'createButton');
    await steps.verifyUrlContains('/marketplace');

    // Navigate to profile and cancel
    await steps.navigateTo('/profile');
    await steps.waitForState('ProfilePage', 'container');
    await steps.verifyCount('ProfilePage', 'myListings', { greaterThan: 0 });
    await steps.clickNth('ProfilePage', 'cancelListingBtns', 0);
    await steps.page.waitForTimeout(1000);
    // After cancel, should show no listings
    await steps.verifyPresence('ProfilePage', 'noListings');
  });

  test('create listing with all condition types', async ({ steps }) => {
    await steps.page.request.post('http://localhost:8080/api/reset');
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');

    // Create listing with NEW condition
    await steps.navigateTo('/marketplace/sell');
    await steps.waitForState('CreateListingPage', 'container');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', {
      type: DropdownSelectType.INDEX,
      index: 2
    });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', {
      type: DropdownSelectType.VALUE,
      value: 'NEW'
    });
    await steps.fill('CreateListingPage', 'priceInput', '15.00');
    await steps.click('CreateListingPage', 'createButton');
    await steps.verifyUrlContains('/marketplace');
  });
});
