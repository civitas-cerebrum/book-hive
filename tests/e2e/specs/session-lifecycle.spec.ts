import { test, expect } from '../fixtures/base';

/*
 * Session Lifecycle Tests — 4-State Cycle
 *
 * For each protected route, test the full lifecycle:
 *   State 1: No auth → redirect to /login
 *   State 2: Authenticated → full content loads
 *   State 3: Logout → session cleared, redirect restored
 *   State 4: Re-auth → fresh session, no ghost state
 */

test.describe('@session lifecycle: protected route full 4-state cycles', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@session lifecycle: /cart full 4-state cycle', async ({ steps, page }) => {
    // State 1: No auth — navigate to /cart without session
    await steps.navigateTo('/cart');
    await steps.verifyUrlContains('/login');
    await steps.verifyPresence('LoginPage', 'loginForm');

    // State 2: Authenticated — log in and navigate to /cart
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'cartPage');
    // Cart is empty but page loads correctly
    await steps.verifyPresence('CartPage', 'cartEmpty');

    // State 3: Logout — session is destroyed, UI reflects logged-out state
    await steps.click('Navigation', 'logoutBtn');
    // Verify sidebar shows login/signup (session cleared)
    await steps.verifyPresence('Navigation', 'navLogin');
    await steps.verifyPresence('Navigation', 'navSignup');
    // Navigate back to /cart — should redirect to login again
    await steps.navigateTo('/cart');
    await steps.verifyUrlContains('/login');
    await steps.verifyPresence('LoginPage', 'loginForm');

    // State 4: Re-auth — fresh session, no ghost state
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'cartPage');
    // Verify clean state — no ghost items from previous session
    await steps.verifyPresence('CartPage', 'cartEmpty');
  });

  test('@session lifecycle: /orders full 4-state cycle', async ({ steps, page }) => {
    // State 1: No auth
    await steps.navigateTo('/orders');
    await steps.verifyUrlContains('/login');
    await steps.verifyPresence('LoginPage', 'loginForm');

    // State 2: Authenticated
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'ordersPage');

    // State 3: Logout
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');
    await steps.navigateTo('/orders');
    await steps.verifyUrlContains('/login');

    // State 4: Re-auth — fresh session
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'ordersPage');
  });

  test('@session lifecycle: /marketplace/sell full 4-state cycle', async ({ steps, page }) => {
    // State 1: No auth
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyUrlContains('/login');
    await steps.verifyPresence('LoginPage', 'loginForm');

    // State 2: Authenticated
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'createListingPage');
    // Verify form elements are functional
    await steps.verifyPresence('CreateListingPage', 'listingBookSelect');
    await steps.verifyPresence('CreateListingPage', 'listingCondition');
    await steps.verifyPresence('CreateListingPage', 'listingPrice');

    // State 3: Logout
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyUrlContains('/login');

    // State 4: Re-auth
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'createListingPage');
  });

  test('@session lifecycle: /profile full 4-state cycle', async ({ steps, page }) => {
    // State 1: No auth
    await steps.navigateTo('/profile');
    await steps.verifyUrlContains('/login');
    await steps.verifyPresence('LoginPage', 'loginForm');

    // State 2: Authenticated
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'profilePage');
    // Verify correct user data loaded
    await steps.verifyText('ProfilePage', 'profileEmail', 'testuser1@bookhive.test');
    await steps.verifyText('ProfilePage', 'profileBalance', undefined, { notEmpty: true });

    // State 3: Logout
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');
    await steps.navigateTo('/profile');
    await steps.verifyUrlContains('/login');

    // State 4: Re-auth
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'profilePage');
    await steps.verifyText('ProfilePage', 'profileEmail', 'testuser1@bookhive.test');
  });

  test('@session lifecycle: /orders/:id full 4-state cycle', async ({ steps, page }) => {
    // First create an order to get a valid order ID
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Quick purchase to get an order
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');

    // Capture the order URL
    const orderUrl = new URL(page.url());
    const orderPath = orderUrl.pathname; // e.g., /orders/abc123

    // Logout for State 1 test
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');

    // State 1: No auth — navigate to order detail without session
    await steps.navigateTo(orderPath);
    await page.waitForTimeout(1000);
    await steps.verifyUrlContains('/login');

    // State 2: Authenticated — log in and navigate to the order
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.navigateTo(orderPath);
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'COMPLETED');

    // State 3: Logout
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');
    await steps.navigateTo(orderPath);
    await page.waitForTimeout(1000);
    await steps.verifyUrlContains('/login');

    // State 4: Re-auth — same order still accessible
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.navigateTo(orderPath);
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'COMPLETED');
  });

  test('@session lifecycle: different user sees own data after re-auth (no user bleed)', async ({ steps, page }) => {
    // Login as user 1, create an order
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

    // Logout
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');

    // Login as user 2
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // User 2 should see their own orders (none after reset), not user 1's
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'ordersPage');
    await steps.verifyPresence('OrdersPage', 'noOrders');

    // User 2's profile should show their email, not user 1's
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'profilePage');
    await steps.verifyText('ProfilePage', 'profileEmail', 'testuser2@bookhive.test');

    // User 2's cart should be empty (user 1's cart was used for checkout)
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'cartEmpty');
  });
});
