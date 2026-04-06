import { test, expect } from '../fixtures/base';

/**
 * Permission Role Boundary Tests
 *
 * This app has no admin role — all authenticated users have equal privilege.
 * Tests focus on horizontal privilege isolation:
 * - User A cannot see User B's orders
 * - User A cannot see User B's cart
 * - User A cannot see User B's profile data
 * - User A cannot access User B's order detail by URL manipulation
 * - Session switch properly isolates data between users
 */

test.describe('@permission role boundary: user isolation and cross-user access prevention', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@permission role: user A cart is isolated from user B', async ({ steps, page }) => {
    // User 1 adds a book to cart
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');

    // Verify cart has items for user 1
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'cartPage');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });

    // Logout user 1
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');

    // Login as user 2
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // User 2's cart should be empty — user 1's items must NOT appear
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'cartPage');
    await steps.verifyPresence('CartPage', 'cartEmpty');
    await steps.verifyAbsence('CartPage', 'cartItem');
  });

  test('@permission role: user A orders are isolated from user B', async ({ steps, page }) => {
    // User 1 creates an order
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');

    // Capture order ID from URL
    const orderPath = new URL(page.url()).pathname;

    // Verify user 1 can see the order in their orders list
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'ordersPage');
    await steps.verifyCount('OrdersPage', 'orderCard', { greaterThan: 0 });

    // Logout user 1
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');

    // Login as user 2
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // User 2 should have no orders — user 1's orders must NOT appear
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'ordersPage');
    await steps.verifyPresence('OrdersPage', 'noOrders');
    await steps.verifyAbsence('OrdersPage', 'orderCard');
  });

  test('@permission role: user B cannot access user A order detail by URL manipulation', async ({ steps, page }) => {
    // User 1 creates an order
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');

    const orderPath = new URL(page.url()).pathname;

    // Logout user 1
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');

    // Login as user 2
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // User 2 tries to access user 1's order by direct URL
    await steps.navigateTo(orderPath);

    // Should get not-found or empty state, NOT user 1's order data
    // The service layer filters by userId, so the order won't be found for user 2
    await steps.verifyPresence('OrderDetailPage', 'notFound');
    // Verify no order data leaks
    await steps.verifyAbsence('OrderDetailPage', 'orderTotal');
    await steps.verifyAbsence('OrderDetailPage', 'returnOrderBtn');
  });

  test('@permission role: user A profile data does not leak to user B', async ({ steps }) => {
    // Login as user 1 and verify profile data
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'profilePage');
    await steps.verifyText('ProfilePage', 'profileEmail', 'testuser1@bookhive.test');

    // Logout user 1
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');

    // Login as user 2
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'profilePage');

    // User 2 sees THEIR OWN email, not user 1's
    await steps.verifyText('ProfilePage', 'profileEmail', 'testuser2@bookhive.test');

    // Balance should be $100 (fresh user, no purchases)
    await steps.verifyText('ProfilePage', 'profileBalance', '$100.00');
  });

  test('@permission role: user A marketplace listings appear on profile, not on user B profile', async ({ steps }) => {
    // User 1 creates a listing
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
    await steps.selectDropdown('CreateListingPage', 'listingCondition', { type: 'index', index: 1 });
    await steps.fill('CreateListingPage', 'listingPrice', '7.99');
    await steps.click('CreateListingPage', 'listingCreate');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');

    // User 1 sees listing on their profile
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'profilePage');
    await steps.verifyCount('ProfilePage', 'myListing', { greaterThan: 0 });

    // Logout user 1
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');

    // Login as user 2
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // User 2's profile should NOT show user 1's listings
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'profilePage');
    await steps.verifyPresence('ProfilePage', 'noListings');
    await steps.verifyAbsence('ProfilePage', 'myListing');
  });

  test('@permission role: balance change from user A purchase does not affect user B balance', async ({ steps }) => {
    // User 1 makes a purchase
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');

    // Logout user 1
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');

    // Login as user 2
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // User 2's balance should still be $100 — unaffected by user 1's purchase
    await steps.navigateTo('/profile');
    await steps.verifyText('ProfilePage', 'profileBalance', '$100.00');
  });

  test('@permission role: session switch clears all previous user state from UI', async ({ steps }) => {
    // Login as user 1
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Verify user 1 nav state
    await steps.verifyPresence('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'userBalance');
    await steps.verifyAbsence('Navigation', 'navLogin');

    // Logout
    await steps.click('Navigation', 'logoutBtn');

    // Verify complete session clearance
    await steps.verifyPresence('Navigation', 'navLogin');
    await steps.verifyPresence('Navigation', 'navSignup');
    await steps.verifyAbsence('Navigation', 'logoutBtn');
    await steps.verifyAbsence('Navigation', 'userBalance');
    await steps.verifyAbsence('Navigation', 'navCart');
    await steps.verifyAbsence('Navigation', 'navOrders');
    await steps.verifyAbsence('Navigation', 'navSell');
    await steps.verifyAbsence('Navigation', 'navProfile');

    // Login as user 2
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Verify user 2 nav state is clean (no user 1 residue)
    await steps.verifyPresence('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'userBalance');
    await steps.verifyPresence('Navigation', 'navCart');
    await steps.verifyPresence('Navigation', 'navOrders');
    await steps.verifyPresence('Navigation', 'navSell');
    await steps.verifyPresence('Navigation', 'navProfile');
    await steps.verifyAbsence('Navigation', 'navLogin');
    await steps.verifyAbsence('Navigation', 'navSignup');
  });
});
