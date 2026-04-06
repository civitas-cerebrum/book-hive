import { test, expect } from '../fixtures/base';

/*
 * Cross-Session Persistence Tests
 *
 * Verify that persistent state (cart contents, orders, marketplace listings,
 * user balance) survives the logout → login cycle.
 *
 * This is distinct from lifecycle tests: lifecycle tests verify the session
 * mechanism works; persistence tests verify that application-level state
 * bound to the user account (not the session) is preserved.
 *
 * Known persistence behavior:
 * - Cart: PERSISTS across logout/login (server-side, tied to user)
 * - Orders: PERSIST (immutable server data)
 * - Marketplace listings: PERSIST (server-side)
 * - User balance: PERSISTS (server-side)
 * - Theme preference: NOT persisted (client-side only, resets on reload)
 */

test.describe('@session persistence: cart preserved across logout/login cycle', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@session persistence: cart items survive logout and re-login', async ({ steps, page }) => {
    // Set state: Login and add item to cart
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Add a specific book to cart
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    const bookTitle = await steps.getText('BookDetailPage', 'bookDetailTitle');
    await steps.click('BookDetailPage', 'addToCartDetail');

    // Verify cart badge shows 1
    await steps.verifyPresence('Navigation', 'cartBadge');
    await steps.verifyText('Navigation', 'cartBadge', '1');

    // Logout
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');

    // Re-login as same user
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Navigate to cart and verify the item is still there (data persisted)
    await steps.click('Navigation', 'navCart');
    await steps.verifyPresence('CartPage', 'cartPage');
    await steps.verifyCount('CartPage', 'cartItem', { exactly: 1 });

    // Note: Cart badge may or may not show on home page immediately after
    // re-login. The badge is populated when the cart data is fetched.
    // The critical assertion is that cart items are present on the cart page.
  });

  test('@session persistence: cart quantity preserved across logout/login', async ({ steps, page }) => {
    // Login and add item with quantity 2
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.verifyPresence('CartPage', 'cartPage');

    // Increment quantity to 2
    await steps.click('CartPage', 'cartQtyPlus');
    await page.waitForTimeout(500);
    await steps.verifyTextContains('CartPage', 'cartQty', '2');

    // Record the total
    const totalBefore = await steps.getText('CartPage', 'cartTotal');

    // Logout and re-login
    await steps.click('Navigation', 'logoutBtn');
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Navigate to cart — quantity should still be 2
    await steps.click('Navigation', 'navCart');
    await steps.verifyPresence('CartPage', 'cartPage');
    await steps.verifyTextContains('CartPage', 'cartQty', '2');

    // Total should match
    const totalAfter = await steps.getText('CartPage', 'cartTotal');
    expect(totalAfter).toEqual(totalBefore);
  });

  test('@session persistence: multiple cart items preserved across logout/login', async ({ steps, page }) => {
    // Login and add two different books
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Add first book
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');

    // Add second book
    await steps.navigateTo('/books/book-002');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.verifyText('Navigation', 'cartBadge', '2');

    // Verify cart has 2 items
    await steps.click('Navigation', 'navCart');
    await steps.verifyCount('CartPage', 'cartItem', { exactly: 2 });
    const totalBefore = await steps.getText('CartPage', 'cartTotal');

    // Logout and re-login
    await steps.click('Navigation', 'logoutBtn');
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Verify cart still has 2 items with same total
    // Note: Cart badge may not show immediately after re-login (stale UI)
    // so we verify items directly on the cart page
    await steps.click('Navigation', 'navCart');
    await steps.verifyCount('CartPage', 'cartItem', { exactly: 2 });
    const totalAfter = await steps.getText('CartPage', 'cartTotal');
    expect(totalAfter).toEqual(totalBefore);
  });
});

test.describe('@session persistence: orders persist across logout/login', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@session persistence: completed orders visible after re-login', async ({ steps, page }) => {
    // Login and create an order
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

    // Get order path for later verification
    const orderPath = new URL(page.url()).pathname;

    // Go to orders list and verify order exists
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'ordersPage');
    await steps.verifyCount('OrdersPage', 'orderCard', { greaterThan: 0 });

    // Logout and re-login
    await steps.click('Navigation', 'logoutBtn');
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Orders should still be there
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'ordersPage');
    await steps.verifyCount('OrdersPage', 'orderCard', { greaterThan: 0 });

    // Specific order detail should be accessible
    await steps.navigateTo(orderPath);
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'COMPLETED');
  });
});

test.describe('@session persistence: user balance persists across logout/login', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@session persistence: balance reflects purchases after re-login', async ({ steps, page }) => {
    // Login and make a purchase
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Verify initial balance
    await steps.verifyTextContains('Navigation', 'userBalance', '$100.00');

    // Purchase a book
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');

    // Logout and re-login
    await steps.click('Navigation', 'logoutBtn');
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Balance should reflect the purchase (less than $100)
    const balance = await steps.getText('Navigation', 'userBalance');
    expect(balance).not.toContain('$100.00');

    // Verify on profile page too
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'profilePage');
    const profileBalance = await steps.getText('ProfilePage', 'profileBalance');
    expect(profileBalance).not.toContain('$100.00');
  });
});

test.describe('@session persistence: marketplace listings persist across logout/login', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@session persistence: created listing visible after re-login', async ({ steps, page }) => {
    // Login and create a listing
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.navigateTo('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'createListingPage');
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { index: 1 });
    await steps.selectDropdown('CreateListingPage', 'listingCondition', { index: 1 });
    await steps.fill('CreateListingPage', 'listingPrice', '7.50');
    await steps.click('CreateListingPage', 'listingCreate');
    await page.waitForTimeout(1000);

    // Should navigate to marketplace
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });

    // Verify listing shows on profile page
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'profilePage');
    await steps.verifyCount('ProfilePage', 'myListing', { greaterThan: 0 });

    // Logout and re-login
    await steps.click('Navigation', 'logoutBtn');
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Marketplace should still show the listing
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });

    // Profile should still show my listing
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'profilePage');
    await steps.verifyCount('ProfilePage', 'myListing', { greaterThan: 0 });
  });
});

test.describe('@session persistence: theme preference persisted via localStorage', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@session persistence: theme preference survives page reload', async ({ steps, page }) => {
    // Navigate to home page
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Get initial theme state
    const initialTheme = await steps.getText('Navigation', 'themeToggle');

    // Toggle theme
    await steps.click('Navigation', 'themeToggle');
    await page.waitForTimeout(300);

    // Theme should have changed
    const toggledTheme = await steps.getText('Navigation', 'themeToggle');
    expect(toggledTheme).not.toEqual(initialTheme);

    // Reload the page
    await steps.refresh();
    await page.waitForTimeout(1000);

    // Theme PERSISTS across reload (stored in localStorage)
    const afterReloadTheme = await steps.getText('Navigation', 'themeToggle');
    expect(afterReloadTheme).toEqual(toggledTheme);
  });
});

// NOTE: "user1 cart does not appear for user2" test removed — covered by permission-role-boundary.spec.ts
