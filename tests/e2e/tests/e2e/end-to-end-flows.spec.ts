import { test, expect } from '../fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('End-to-End User Journeys', () => {
  test.describe.configure({ timeout: 60_000 });

  test('complete purchase flow: login, add to cart, checkout', async ({ steps }) => {
    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Navigate to a cheap book and add to cart
    await steps.navigateTo('/books/book-006');
    await steps.verifyPresence('BookDetailPage', 'bookTitle');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Go to cart and checkout
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'checkoutButton');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Verify redirected to orders
    await steps.verifyUrlContains('/orders');
  });

  test('marketplace flow: create listing, verify on marketplace, buy', async ({ steps }) => {
    // Login as user1
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Create listing
    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 5 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.fill('CreateListingPage', 'priceInput', '4.99');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Verify listing on marketplace
    await steps.navigateTo('/marketplace');
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });

    // Logout and login as user2 to buy
    await steps.click('Navigation', 'logoutButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Buy listing
    await steps.navigateTo('/marketplace');
    await steps.clickNth('MarketplacePage', 'buyButton', 0);
    await steps.waitForNetworkIdle();
  });

  test('search and navigate flow', async ({ steps }) => {
    await steps.navigateTo('/');
    // Search for a specific book
    await steps.fill('HomePage', 'searchInput', 'Gatsby');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });

    // Click on the result
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyUrlContains('/books/');
    await steps.verifyPresence('BookDetailPage', 'bookTitle');
  });

  test('multi-item cart checkout', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Clear existing cart
    await steps.navigateTo('/cart');
    await steps.clickIfPresent('CartPage', 'cartClear');
    await steps.waitForNetworkIdle();

    // Add multiple books
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/books/book-002');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/books/book-003');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Verify cart has multiple items
    await steps.navigateTo('/cart');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 1 });

    // Checkout
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/orders');
  });
});
