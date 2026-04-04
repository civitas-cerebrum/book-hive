import { test, expect } from './fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Full User Journeys — End to End', () => {
  test.describe.configure({ timeout: 60_000 });

  test('complete shopping flow: browse, add, checkout, view order', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');

    // Browse and find a book
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'bookGrid');

    // Go to book detail
    await steps.navigateTo('/books/book-001');
    await steps.verifyText('BookDetailPage', 'title', 'To Kill a Mockingbird');

    // Add to cart
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Go to cart
    await steps.navigateTo('/cart');
    await steps.verifyAbsence('CartPage', 'emptyMessage');

    // Checkout
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Verify order exists
    await steps.navigateTo('/orders');
    await steps.verifyCount('OrderCard', 'card', { greaterThan: 0 });
  });

  test('marketplace flow: create listing, verify, cancel', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');

    // Create a listing
    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.fill('CreateListingPage', 'priceInput', '7.50');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Verify on marketplace
    await steps.navigateTo('/marketplace');
    await steps.verifyCount('ListingCard', 'card', { greaterThan: 0 });

    // Verify on profile
    await steps.navigateTo('/profile');
    await steps.verifyCount('ProfilePage', 'myListings', { greaterThan: 0 });

    // Cancel listing
    await steps.clickNth('ProfilePage', 'cancelListingButton', 0);
    await steps.waitForNetworkIdle();

    // Verify marketplace is empty
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'noListings');
  });

  test('search, view detail, go back flow', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();

    // View detail
    await steps.clickNth('BookCard', 'card', 0);
    await steps.verifyText('BookDetailPage', 'title', 'Dune');

    // Go back
    await steps.backOrForward('back');
    await steps.verifyPresence('HomePage', 'bookGrid');
  });

  test('balance updates after marketplace purchase', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    // User1 creates a listing
    await loginAs('user1');
    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.fill('CreateListingPage', 'priceInput', '5.00');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Logout and login as user2
    await steps.click('Sidebar', 'logoutButton');
    await steps.waitForNetworkIdle();
    await loginAs('user2');

    // Get initial balance
    const balanceBefore = await steps.getText('Sidebar', 'userBalance');

    // Buy the listing
    await steps.navigateTo('/marketplace');
    await steps.clickNth('ListingCard', 'buyButton', 0);
    await steps.waitForNetworkIdle();

    // Check balance changed
    await steps.navigateTo('/profile');
    const balanceAfter = await steps.getText('ProfilePage', 'balance');
    const beforeVal = parseFloat(balanceBefore.replace(/[^0-9.]/g, ''));
    const afterVal = parseFloat(balanceAfter.replace(/[^0-9.]/g, ''));
    expect(afterVal).toBeLessThan(beforeVal);
  });
});
