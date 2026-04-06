import { test, expect } from '../fixtures/base';

test.describe('Marketplace Happy Paths', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@functional marketplace-sell-happy creates a new listing', async ({ steps }) => {
    // Log in as testuser1
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Navigate to sell page
    await steps.click('Navigation', 'navSell');
    await steps.verifyPresence('CreateListingPage', 'createListingPage');

    // Fill the listing form
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
    await steps.selectDropdown('CreateListingPage', 'listingCondition', { type: 'index', index: 1 });
    await steps.fill('CreateListingPage', 'listingPrice', '5.99');
    await steps.click('CreateListingPage', 'listingCreate');

    // Verify redirect to marketplace with the new listing
    await steps.verifyUrlContains('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });
  });

  test('@functional marketplace-buy-happy views marketplace listings', async ({ steps }) => {
    // Log in as testuser1
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Create a listing so there is something to see
    await steps.click('Navigation', 'navSell');
    await steps.verifyPresence('CreateListingPage', 'createListingPage');
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
    await steps.selectDropdown('CreateListingPage', 'listingCondition', { type: 'index', index: 1 });
    await steps.fill('CreateListingPage', 'listingPrice', '5.99');
    await steps.click('CreateListingPage', 'listingCreate');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');

    // Verify listings are displayed with details
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });
    await steps.verifyCount('MarketplacePage', 'listingTitle', { greaterThan: 0 });
    await steps.verifyCount('MarketplacePage', 'listingPrice', { greaterThan: 0 });
  });

  test('@functional marketplace-buy-happy purchases a listing from marketplace', async ({ steps }) => {
    // Log in as testuser1 (seller) and create a listing
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.click('Navigation', 'navSell');
    await steps.verifyPresence('CreateListingPage', 'createListingPage');
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
    await steps.selectDropdown('CreateListingPage', 'listingCondition', { type: 'index', index: 1 });
    await steps.fill('CreateListingPage', 'listingPrice', '3.99');
    await steps.click('CreateListingPage', 'listingCreate');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');

    // Log out then navigate to login as testuser2 (buyer with $100)
    await steps.click('Navigation', 'logoutBtn');
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'loginForm');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Navigate to marketplace and buy the listing
    await steps.click('Navigation', 'navMarketplace');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });

    // Click buy on first available listing
    await steps.clickNth('MarketplacePage', 'listingBuyBtn', 0);
    await steps.waitForNetworkIdle();
  });

  test('@functional marketplace-sell-happy listing appears on profile page', async ({ steps }) => {
    // Log in as testuser1
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Create a listing
    await steps.click('Navigation', 'navSell');
    await steps.verifyPresence('CreateListingPage', 'createListingPage');
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
    await steps.selectDropdown('CreateListingPage', 'listingCondition', { type: 'index', index: 1 });
    await steps.fill('CreateListingPage', 'listingPrice', '7.99');
    await steps.click('CreateListingPage', 'listingCreate');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');

    // Navigate to profile and verify listing appears
    await steps.click('Navigation', 'navProfile');
    await steps.verifyPresence('ProfilePage', 'profilePage');
    await steps.verifyCount('ProfilePage', 'myListing', { greaterThan: 0 });
  });
});
