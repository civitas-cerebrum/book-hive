import { test, expect } from '../fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('End-to-End User Journeys', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.page.request.post('http://localhost:8080/api/reset');
  });

  test('complete purchase journey: browse → detail → cart → checkout → order', async ({ steps }) => {
    // Login
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');

    // Browse and click a book
    await steps.clickNth('HomePage', 'bookCards', 0);
    await steps.verifyUrlContains('/books/');
    await steps.waitForState('BookDetailPage', 'container');

    // Get book price
    const priceText = await steps.getText('BookDetailPage', 'price');

    // Add to cart
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.page.waitForTimeout(1000);

    // Navigate to cart
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.verifyCount('CartPage', 'cartItems', { greaterThan: 0 });

    // Checkout
    await steps.click('CartPage', 'checkoutBtn');
    await steps.waitForState('OrderDetailPage', 'container');
    await steps.verifyPresence('OrderDetailPage', 'orderTotal');
    await steps.verifyCount('OrderDetailPage', 'orderItems', { greaterThan: 0 });
  });

  test('return order journey: purchase → return → verify status', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');

    // Quick purchase
    await steps.clickNth('HomePage', 'addToCartButtons', 0);
    await steps.page.waitForTimeout(1000);
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.waitForState('OrderDetailPage', 'container');

    // Return the order
    await steps.verifyPresence('OrderDetailPage', 'returnButton');
    await steps.click('OrderDetailPage', 'returnButton');
    await steps.page.waitForTimeout(1000);
    // Verify return button disappears after return
    await steps.verifyAbsence('OrderDetailPage', 'returnButton');
  });

  test('marketplace sell journey: create listing → view on marketplace → cancel', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');

    // Create listing
    await steps.navigateTo('/marketplace/sell');
    await steps.waitForState('CreateListingPage', 'container');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', {
      type: DropdownSelectType.INDEX,
      index: 3
    });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', {
      type: DropdownSelectType.VALUE,
      value: 'LIKE_NEW'
    });
    await steps.fill('CreateListingPage', 'priceInput', '7.99');
    await steps.click('CreateListingPage', 'createButton');
    await steps.verifyUrlContains('/marketplace');
    await steps.waitForState('MarketplacePage', 'container');

    // Verify listing appears (seller can't see buy button on own listing)
    await steps.verifyAbsence('MarketplacePage', 'noListings');
    await steps.verifyCount('MarketplacePage', 'listingCards', { greaterThan: 0 });

    // Cancel from profile
    await steps.navigateTo('/profile');
    await steps.waitForState('ProfilePage', 'container');
    await steps.verifyCount('ProfilePage', 'myListings', { greaterThan: 0 });
    await steps.clickNth('ProfilePage', 'cancelListingBtns', 0);
    await steps.page.waitForTimeout(1000);
    await steps.verifyPresence('ProfilePage', 'noListings');
  });

  test('purchase deducts from balance (seeded user)', async ({ steps }) => {
    // Login as seeded user with $100 balance
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');

    // Verify initial balance
    await steps.navigateTo('/profile');
    await steps.waitForState('ProfilePage', 'container');
    await steps.verifyTextContains('ProfilePage', 'balance', '$100.00');

    // Purchase a book
    await steps.navigateTo('/');
    await steps.waitForState('HomePage', 'bookGrid');
    await steps.clickNth('HomePage', 'addToCartButtons', 0);
    await steps.page.waitForTimeout(1000);
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.waitForState('OrderDetailPage', 'container');

    // Check balance decreased
    await steps.navigateTo('/profile');
    await steps.waitForState('ProfilePage', 'container');
    const balance = await steps.getText('ProfilePage', 'balance');
    expect(balance).not.toContain('$100.00');
  });
});
