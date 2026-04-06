import { test, expect } from '../fixtures/base';

/**
 * Permission Gate Tests
 *
 * Tests auth gates on all protected routes:
 * - Unauthenticated access redirects to /login
 * - Return URL presence/absence in redirect (documented finding: no return URL)
 * - Post-login redirect behavior (documented finding: always goes to /, not original route)
 * - Authenticated access succeeds with route-specific content
 */

test.describe('@permission auth gate: protected route redirect verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  // ---- /cart gate ----

  test('@permission gate: /cart redirects unauthenticated guest to /login', async ({ steps, page }) => {
    await steps.navigateTo('/cart');
    await steps.verifyUrlContains('/login');
    await steps.verifyPresence('LoginPage', 'loginForm');
    await steps.verifyPresence('LoginPage', 'loginEmail');
    await steps.verifyPresence('LoginPage', 'loginPassword');
    await steps.verifyPresence('LoginPage', 'loginSubmit');
  });

  test('@permission gate: /cart redirect does not include return URL parameter', async ({ steps, page }) => {
    // Navigate to /cart as guest — expect redirect to /login
    await steps.navigateTo('/cart');
    await steps.verifyUrlContains('/login');

    // FINDING: App does NOT encode a return URL in the auth redirect
    // Expected: /login?redirect=/cart or /login?next=/cart
    // Actual: /login (no query parameter)
    const url = page.url();
    const hasReturnUrl = url.includes('redirect=') || url.includes('next=') || url.includes('from=') || url.includes('returnUrl=');
    expect(hasReturnUrl, 'Return URL should not be present (known app behavior — no return URL encoded)').toBe(false);
  });

  test('@permission gate: /cart — after login from gate redirect, user lands on home (not /cart)', async ({ steps, page }) => {
    // Navigate to /cart as guest — gets redirected to /login
    await steps.navigateTo('/cart');
    await steps.verifyUrlContains('/login');

    // Login from the gate redirect
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');

    // FINDING: App does NOT redirect back to originally requested route
    // Post-login always goes to / (home page)
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyUrlContains('/');

    // But user CAN now manually navigate to /cart after login
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'cartPage');
  });

  // ---- /orders gate ----

  test('@permission gate: /orders redirects unauthenticated guest to /login', async ({ steps, page }) => {
    await steps.navigateTo('/orders');
    await steps.verifyUrlContains('/login');
    await steps.verifyPresence('LoginPage', 'loginForm');
    await steps.verifyPresence('LoginPage', 'loginEmail');
    await steps.verifyPresence('LoginPage', 'loginPassword');
  });

  test('@permission gate: /orders redirect does not include return URL parameter', async ({ steps, page }) => {
    await steps.navigateTo('/orders');
    await steps.verifyUrlContains('/login');
    const url = page.url();
    const hasReturnUrl = url.includes('redirect=') || url.includes('next=') || url.includes('from=') || url.includes('returnUrl=');
    expect(hasReturnUrl, 'Return URL should not be present (known app behavior)').toBe(false);
  });

  test('@permission gate: /orders — after login from gate redirect, user lands on home (not /orders)', async ({ steps, page }) => {
    await steps.navigateTo('/orders');
    await steps.verifyUrlContains('/login');

    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');

    await steps.verifyPresence('HomePage', 'homePage');

    // User can now manually access /orders
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'ordersPage');
  });

  // ---- /orders/:id gate ----

  test('@permission gate: /orders/:id redirects unauthenticated guest to /login', async ({ steps, page }) => {
    // First create an order to get a valid ID
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

    // Logout
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');

    // Now test: navigate to specific order as guest
    await steps.navigateTo(orderPath);
    await page.waitForTimeout(1000);
    await steps.verifyUrlContains('/login');
    await steps.verifyPresence('LoginPage', 'loginForm');
  });

  // ---- /marketplace/sell gate ----

  test('@permission gate: /marketplace/sell redirects unauthenticated guest to /login', async ({ steps, page }) => {
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyUrlContains('/login');
    await steps.verifyPresence('LoginPage', 'loginForm');
    await steps.verifyPresence('LoginPage', 'loginEmail');
    await steps.verifyPresence('LoginPage', 'loginPassword');
  });

  test('@permission gate: /marketplace/sell redirect does not include return URL parameter', async ({ steps, page }) => {
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyUrlContains('/login');
    const url = page.url();
    const hasReturnUrl = url.includes('redirect=') || url.includes('next=') || url.includes('from=') || url.includes('returnUrl=');
    expect(hasReturnUrl, 'Return URL should not be present (known app behavior)').toBe(false);
  });

  test('@permission gate: /marketplace/sell — after login from gate redirect, user lands on home', async ({ steps, page }) => {
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyUrlContains('/login');

    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');

    await steps.verifyPresence('HomePage', 'homePage');

    // User can now manually access sell page
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'createListingPage');
  });

  // ---- /profile gate ----

  test('@permission gate: /profile redirects unauthenticated guest to /login', async ({ steps, page }) => {
    await steps.navigateTo('/profile');
    await steps.verifyUrlContains('/login');
    await steps.verifyPresence('LoginPage', 'loginForm');
    await steps.verifyPresence('LoginPage', 'loginEmail');
    await steps.verifyPresence('LoginPage', 'loginPassword');
  });

  test('@permission gate: /profile redirect does not include return URL parameter', async ({ steps, page }) => {
    await steps.navigateTo('/profile');
    await steps.verifyUrlContains('/login');
    const url = page.url();
    const hasReturnUrl = url.includes('redirect=') || url.includes('next=') || url.includes('from=') || url.includes('returnUrl=');
    expect(hasReturnUrl, 'Return URL should not be present (known app behavior)').toBe(false);
  });

  test('@permission gate: /profile — after login from gate redirect, user lands on home', async ({ steps, page }) => {
    await steps.navigateTo('/profile');
    await steps.verifyUrlContains('/login');

    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');

    await steps.verifyPresence('HomePage', 'homePage');

    // User can now manually access profile
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'profilePage');
    await steps.verifyText('ProfilePage', 'profileEmail', 'testuser1@bookhive.test');
  });

  // ---- Public routes remain accessible ----

  test('@permission gate: public routes (/, /books/:id, /marketplace, /login, /signup) do NOT redirect guests', async ({ steps }) => {
    // Home page — accessible
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });

    // Book detail — accessible
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    await steps.verifyText('BookDetailPage', 'bookDetailTitle', undefined, { notEmpty: true });

    // Marketplace — accessible
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');

    // Login page — accessible
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'loginForm');

    // Signup page — accessible
    await steps.navigateTo('/signup');
    await steps.verifyPresence('SignupPage', 'signupForm');
  });
});
