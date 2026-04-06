import { test, expect } from '../fixtures/base';

test.describe('Branching Path Tests', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ steps, page }) => {
    await page.request.post('http://localhost:8080/api/reset');
    // Log in as testuser2 (reset gives $100 balance, clean cart)
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
  });

  test('@functional browse-to-buy-branching home page offers both catalog and marketplace branches', async ({ steps }) => {
    // Verify catalog branch: book cards are clickable
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });

    // Verify marketplace branch: marketplace link is available
    await steps.verifyPresence('Navigation', 'navMarketplace');
  });

  test('@functional browse-to-buy-branch-catalog completes purchase via catalog route', async ({ steps }) => {
    // Take the catalog branch: click book card
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');

    // Add to cart
    await steps.click('BookDetailPage', 'addToCartDetail');

    // Navigate to cart
    await steps.click('Navigation', 'navCart');
    await steps.verifyPresence('CartPage', 'cartPage');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });

    // Checkout
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'COMPLETED');
  });

  test('@functional browse-to-buy-branch-marketplace completes purchase via marketplace route', async ({ steps }) => {
    // Create a listing as testuser1 (seller) — logout then navigate to login
    await steps.click('Navigation', 'logoutBtn');
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.click('Navigation', 'navSell');
    await steps.verifyPresence('CreateListingPage', 'createListingPage');
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
    await steps.selectDropdown('CreateListingPage', 'listingCondition', { type: 'index', index: 1 });
    await steps.fill('CreateListingPage', 'listingPrice', '4.99');
    await steps.click('CreateListingPage', 'listingCreate');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');

    // Switch to testuser2 (buyer with $100) — logout then navigate to login
    await steps.click('Navigation', 'logoutBtn');
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Take the marketplace branch from home
    await steps.click('Navigation', 'navMarketplace');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });

    // Buy a listing
    await steps.clickNth('MarketplacePage', 'listingBuyBtn', 0);
    await steps.waitForNetworkIdle();
  });

  test('@functional order-view-branching order detail allows return for fresh order', async ({ steps }) => {
    // Create a fresh order
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'COMPLETED');

    // Fresh order should have return option available
    await steps.verifyPresence('OrderDetailPage', 'returnCountdown');
    await steps.verifyPresence('OrderDetailPage', 'returnOrderBtn');
  });

  test('@functional order-view-branching choosing return branch changes order to RETURNED', async ({ steps }) => {
    // Create a fresh order
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');

    // Choose the return branch
    await steps.click('OrderDetailPage', 'returnOrderBtn');
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'RETURNED');

    // After returning, the return option should no longer be available
    await steps.verifyAbsence('OrderDetailPage', 'returnOrderBtn');
  });

  test('@functional browse-to-buy-branch-catalog and marketplace branches are independently accessible', async ({ steps }) => {
    // Access catalog branch
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');

    // Go back to home
    await steps.click('Navigation', 'navAllBooks');
    await steps.verifyPresence('HomePage', 'homePage');

    // Access marketplace branch
    await steps.click('Navigation', 'navMarketplace');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');

    // Go back to home again — both branches remain available
    await steps.click('Navigation', 'navAllBooks');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
    await steps.verifyPresence('Navigation', 'navMarketplace');
  });
});
