import { test, expect, resetDatabase } from './fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Marketplace', () => {
  test.describe.configure({ timeout: 60000 });

  test('should display marketplace page', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'page');
  });

  test('should show no listings when empty after reset', async ({ steps }) => {
    await resetDatabase();
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'noListings');
  });

  test('should be accessible without authentication', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyUrlContains('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'page');
  });

  test('should display create listing page when authenticated', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'page');
    await steps.verifyPresence('CreateListingPage', 'bookSelect');
    await steps.verifyPresence('CreateListingPage', 'conditionSelect');
    await steps.verifyPresence('CreateListingPage', 'priceInput');
    await steps.verifyPresence('CreateListingPage', 'createButton');
  });

  test('should create listing successfully', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.fill('CreateListingPage', 'priceInput', '9.99');
    await steps.click('CreateListingPage', 'createButton');
    await steps.verifyUrlContains('/marketplace');
  });

  test('should show listing on marketplace after creation', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 2 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'EXCELLENT' });
    await steps.fill('CreateListingPage', 'priceInput', '15.99');
    await steps.click('CreateListingPage', 'createButton');
    await steps.verifyUrlContains('/marketplace');
    await steps.verifyCount('MarketplacePage', 'listing', { greaterThan: 0 });
  });

  test('should show listing in profile after creation', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 3 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'FAIR' });
    await steps.fill('CreateListingPage', 'priceInput', '5.99');
    await steps.click('CreateListingPage', 'createButton');
    await steps.verifyUrlContains('/marketplace');
    await steps.navigateTo('/profile');
    await steps.verifyCount('ProfilePage', 'myListing', { greaterThan: 0 });
  });

  test('should redirect to login when creating listing unauthenticated', async ({ steps }) => {
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyUrlContains('/login');
  });

  test('should display condition badges on listings', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 4 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'EXCELLENT' });
    await steps.fill('CreateListingPage', 'priceInput', '12.99');
    await steps.click('CreateListingPage', 'createButton');
    await steps.verifyUrlContains('/marketplace');
    await steps.verifyCount('MarketplacePage', 'listingConditionBadge', { greaterThan: 0 });
  });
});
