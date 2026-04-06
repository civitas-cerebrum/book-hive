import { test, expect } from '../fixtures/base';

/**
 * Permission Visibility Boundary Tests
 *
 * Tests what guests CAN see vs what they CANNOT see on public pages.
 * Then verifies authenticated users see the previously hidden elements.
 *
 * Public pages with auth-gated elements:
 * - / (home): addToCartBtn hidden for guests
 * - /books/:id (book detail): addToCartDetail hidden for guests
 * - /marketplace: listingBuyBtn hidden for guests
 * - Navigation sidebar: Cart/Orders/Sell/Profile/Logout/Balance hidden for guests
 */

test.describe('@permission visibility: guest vs authenticated element boundaries', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  // ---- Home Page Visibility ----

  test('@permission visibility: home page — guest sees public content, no add-to-cart buttons', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // PUBLIC CONTENT — guests CAN see these:
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
    await steps.verifyPresence('HomePage', 'searchInput');
    await steps.verifyPresence('HomePage', 'pagination');
    await steps.verifyPresence('Navigation', 'navAllBooks');
    await steps.verifyPresence('Navigation', 'navMarketplace');

    // AUTH-GATED — guests CANNOT see these:
    await steps.verifyAbsence('HomePage', 'addToCartBtn');
  });

  test('@permission visibility: home page — guest sees Login/Signup nav, not auth nav items', async ({ steps }) => {
    await steps.navigateTo('/');

    // Guest nav — visible
    await steps.verifyPresence('Navigation', 'navLogin');
    await steps.verifyPresence('Navigation', 'navSignup');

    // Auth nav — hidden for guests
    await steps.verifyAbsence('Navigation', 'navCart');
    await steps.verifyAbsence('Navigation', 'navOrders');
    await steps.verifyAbsence('Navigation', 'navSell');
    await steps.verifyAbsence('Navigation', 'navProfile');
    await steps.verifyAbsence('Navigation', 'logoutBtn');
    await steps.verifyAbsence('Navigation', 'userBalance');
  });

  test('@permission visibility: home page — authenticated user sees add-to-cart buttons and auth nav', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Public content still visible
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
    await steps.verifyPresence('HomePage', 'searchInput');
    await steps.verifyPresence('HomePage', 'pagination');

    // Previously hidden elements now visible
    await steps.verifyCount('HomePage', 'addToCartBtn', { greaterThan: 0 });

    // Auth nav items visible
    await steps.verifyPresence('Navigation', 'navCart');
    await steps.verifyPresence('Navigation', 'navOrders');
    await steps.verifyPresence('Navigation', 'navSell');
    await steps.verifyPresence('Navigation', 'navProfile');
    await steps.verifyPresence('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'userBalance');

    // Guest nav items hidden
    await steps.verifyAbsence('Navigation', 'navLogin');
    await steps.verifyAbsence('Navigation', 'navSignup');
  });

  // ---- Book Detail Page Visibility ----

  test('@permission visibility: book detail — guest sees book info, no add-to-cart', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');

    // PUBLIC CONTENT — guests CAN see these:
    await steps.verifyText('BookDetailPage', 'bookDetailTitle', undefined, { notEmpty: true });
    await steps.verifyText('BookDetailPage', 'bookDetailAuthor', undefined, { notEmpty: true });
    await steps.verifyText('BookDetailPage', 'bookDetailGenre', undefined, { notEmpty: true });
    await steps.verifyText('BookDetailPage', 'bookDetailDescription', undefined, { notEmpty: true });
    await steps.verifyText('BookDetailPage', 'bookDetailPrice', undefined, { notEmpty: true });
    await steps.verifyText('BookDetailPage', 'bookDetailStock', undefined, { notEmpty: true });

    // AUTH-GATED — guests CANNOT see:
    await steps.verifyAbsence('BookDetailPage', 'addToCartDetail');
  });

  test('@permission visibility: book detail — authenticated user sees add-to-cart button', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');

    // Public content still visible
    await steps.verifyText('BookDetailPage', 'bookDetailTitle', undefined, { notEmpty: true });
    await steps.verifyText('BookDetailPage', 'bookDetailAuthor', undefined, { notEmpty: true });
    await steps.verifyText('BookDetailPage', 'bookDetailPrice', undefined, { notEmpty: true });

    // Previously hidden add-to-cart now visible
    await steps.verifyPresence('BookDetailPage', 'addToCartDetail');
  });

  // ---- Marketplace Page Visibility ----

  test('@permission visibility: marketplace — guest sees listings but no buy buttons', async ({ steps, page }) => {
    // First log in and create a listing so marketplace has content
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.navigateTo('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'createListingPage');
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
    await steps.selectDropdown('CreateListingPage', 'listingCondition', { type: 'index', index: 1 });
    await steps.fill('CreateListingPage', 'listingPrice', '5.99');
    await steps.click('CreateListingPage', 'listingCreate');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');

    // Now logout to become a guest
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');

    // Navigate to marketplace as guest
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');

    // PUBLIC CONTENT — guests CAN see listing cards
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });

    // AUTH-GATED — guests CANNOT see buy buttons
    await steps.verifyAbsence('MarketplacePage', 'listingBuyBtn');
  });

  test('@permission visibility: marketplace — authenticated user sees buy buttons on other users listings', async ({ steps, page }) => {
    // testuser1 creates a listing
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
    await steps.selectDropdown('CreateListingPage', 'listingCondition', { type: 'index', index: 1 });
    await steps.fill('CreateListingPage', 'listingPrice', '5.99');
    await steps.click('CreateListingPage', 'listingCreate');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');

    // Logout and login as testuser2
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');

    // Authenticated user sees listing cards + buy buttons for other users' listings
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });
    await steps.verifyCount('MarketplacePage', 'listingBuyBtn', { greaterThan: 0 });
  });

  test('@permission visibility: marketplace — seller does NOT see buy button on own listing', async ({ steps, page }) => {
    // testuser1 creates a listing
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
    await steps.selectDropdown('CreateListingPage', 'listingCondition', { type: 'index', index: 1 });
    await steps.fill('CreateListingPage', 'listingPrice', '5.99');
    await steps.click('CreateListingPage', 'listingCreate');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');

    // Seller sees the listing card but NOT the buy button (their own listing)
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });
    await steps.verifyAbsence('MarketplacePage', 'listingBuyBtn');
  });

  // ---- Navigation Sidebar Boundary ----

  test('@permission visibility: sidebar genre filters visible to both guests and auth users', async ({ steps }) => {
    // As guest
    await steps.navigateTo('/');
    await steps.verifyPresence('Navigation', 'genreFilterFiction');
    await steps.verifyPresence('Navigation', 'genreFilterSciFi');
    await steps.verifyPresence('Navigation', 'genreFilterNonFiction');
    await steps.verifyPresence('Navigation', 'genreFilterBiography');
    await steps.verifyPresence('Navigation', 'genreFilterFantasy');
    await steps.verifyPresence('Navigation', 'genreFilterMystery');

    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Genre filters still visible after auth
    await steps.verifyPresence('Navigation', 'genreFilterFiction');
    await steps.verifyPresence('Navigation', 'genreFilterSciFi');
    await steps.verifyPresence('Navigation', 'genreFilterNonFiction');
    await steps.verifyPresence('Navigation', 'genreFilterBiography');
    await steps.verifyPresence('Navigation', 'genreFilterFantasy');
    await steps.verifyPresence('Navigation', 'genreFilterMystery');
  });

  // ---- Search and Genre Filter — public for all ----

  test('@permission visibility: search works for guests without auth elements leaking', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.verifyUrlContains('query=');

    // Search results visible to guest
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });

    // No auth-gated elements leak into search results
    await steps.verifyAbsence('HomePage', 'addToCartBtn');
    await steps.verifyAbsence('Navigation', 'navCart');
    await steps.verifyAbsence('Navigation', 'userBalance');
  });

  test('@permission visibility: genre filter works for guests without auth elements leaking', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Navigation', 'genreFilterFiction');
    await steps.verifyUrlContains('genre=');

    // Genre results visible to guest
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });

    // No auth-gated elements
    await steps.verifyAbsence('HomePage', 'addToCartBtn');
    await steps.verifyAbsence('Navigation', 'navCart');
    await steps.verifyAbsence('Navigation', 'userBalance');
  });
});
