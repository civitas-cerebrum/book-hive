/**
 * Expanded Coverage: Navigation Completeness & Deep-Link Tests
 *
 * Tests direct URL access to all routes, bookmark-ability, page transitions,
 * and navigation element completeness.
 */

import { test, expect } from '../fixtures/base';

test.describe('@coverage Navigation: Direct URL access to all public routes', () => {
  test('@coverage deeplink: direct access to / loads home page', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('@coverage deeplink: direct access to /login shows login form', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'loginPage');
    await steps.verifyPresence('LoginPage', 'loginForm');
    await steps.verifyPresence('LoginPage', 'loginEmail');
    await steps.verifyPresence('LoginPage', 'loginPassword');
    await steps.verifyPresence('LoginPage', 'loginSubmit');
  });

  test('@coverage deeplink: direct access to /signup shows signup form', async ({ steps }) => {
    await steps.navigateTo('/signup');
    await steps.verifyPresence('SignupPage', 'signupPage');
    await steps.verifyPresence('SignupPage', 'signupForm');
    await steps.verifyPresence('SignupPage', 'signupUsername');
    await steps.verifyPresence('SignupPage', 'signupEmail');
    await steps.verifyPresence('SignupPage', 'signupPassword');
    await steps.verifyPresence('SignupPage', 'signupSubmit');
  });

  test('@coverage deeplink: direct access to /marketplace shows marketplace', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');
  });

  test('@coverage deeplink: direct access to /books/book-001 shows book detail', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    await steps.verifyText('BookDetailPage', 'bookDetailTitle', undefined, { notEmpty: true });
    await steps.verifyText('BookDetailPage', 'bookDetailAuthor', undefined, { notEmpty: true });
    await steps.verifyText('BookDetailPage', 'bookDetailPrice', undefined, { notEmpty: true });
  });

  test('@coverage deeplink: direct access to /?query=Dune shows search results', async ({ steps, page }) => {
    await page.goto('http://localhost:7547/?query=Dune');
    await page.waitForTimeout(1000);
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('@coverage deeplink: direct access to /?genre=Fiction shows genre results', async ({ steps, page }) => {
    await page.goto('http://localhost:7547/?genre=Fiction');
    await page.waitForTimeout(1000);
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('@coverage deeplink: direct access to /?genre=Sci-Fi shows sci-fi results', async ({ steps, page }) => {
    await page.goto('http://localhost:7547/?genre=Sci-Fi');
    await page.waitForTimeout(1000);
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });
});

test.describe('@coverage Navigation: Direct URL access to protected routes (authenticated)', () => {
  test.beforeEach(async ({ steps, page, context }) => {
    await page.request.post('http://localhost:8080/api/reset');
    await context.clearCookies();
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
  });

  test('@coverage deeplink: direct access to /cart loads cart page', async ({ steps }) => {
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'cartPage');
  });

  test('@coverage deeplink: direct access to /orders loads orders page', async ({ steps }) => {
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'ordersPage');
  });

  test('@coverage deeplink: direct access to /marketplace/sell loads sell page', async ({ steps }) => {
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'createListingPage');
  });

  test('@coverage deeplink: direct access to /profile loads profile page', async ({ steps }) => {
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'profilePage');
    await steps.verifyText('ProfilePage', 'profileUsername', undefined, { notEmpty: true });
    await steps.verifyText('ProfilePage', 'profileEmail', undefined, { notEmpty: true });
  });
});

test.describe('@coverage Navigation: Sidebar links work correctly', () => {
  test('@coverage navigation: all public sidebar links navigate correctly', async ({ steps, page }) => {
    await steps.navigateTo('/');

    // All Books
    await steps.click('Navigation', 'navAllBooks');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyUrlContains('/');

    // Marketplace
    await steps.click('Navigation', 'navMarketplace');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');
    await steps.verifyUrlContains('/marketplace');
  });

  test('@coverage navigation: all authenticated sidebar links navigate correctly', async ({ steps, page }) => {
    await page.request.post('http://localhost:8080/api/reset');
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Cart
    await steps.click('Navigation', 'navCart');
    await steps.verifyPresence('CartPage', 'cartPage');

    // Orders
    await steps.click('Navigation', 'navOrders');
    await steps.verifyPresence('OrdersPage', 'ordersPage');

    // Sell
    await steps.click('Navigation', 'navSell');
    await steps.verifyPresence('CreateListingPage', 'createListingPage');

    // Profile
    await steps.click('Navigation', 'navProfile');
    await steps.verifyPresence('ProfilePage', 'profilePage');

    // All Books (from authenticated context)
    await steps.click('Navigation', 'navAllBooks');
    await steps.verifyPresence('HomePage', 'homePage');

    // Marketplace
    await steps.click('Navigation', 'navMarketplace');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');
  });

  test('@coverage navigation: genre filter links navigate correctly', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Click Fiction genre
    await steps.click('Navigation', 'genreFilterFiction');
    await page.waitForTimeout(1000);
    await steps.verifyUrlContains('genre=Fiction');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });

    // Click Sci-Fi genre
    await steps.click('Navigation', 'genreFilterSciFi');
    await page.waitForTimeout(1000);
    await steps.verifyUrlContains('genre=Sci-Fi');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });

    // Click Non-Fiction genre
    await steps.click('Navigation', 'genreFilterNonFiction');
    await page.waitForTimeout(1000);
    await steps.verifyUrlContains('genre=Non-Fiction');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });
});

test.describe('@coverage Navigation: Book card navigation', () => {
  test('@coverage navigation: clicking book card from home navigates to detail', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Click first book card
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');

    // URL should contain /books/
    await steps.verifyUrlContains('/books/');

    // Book detail should have content
    await steps.verifyText('BookDetailPage', 'bookDetailTitle', undefined, { notEmpty: true });
    await steps.verifyText('BookDetailPage', 'bookDetailAuthor', undefined, { notEmpty: true });
    await steps.verifyText('BookDetailPage', 'bookDetailGenre', undefined, { notEmpty: true });
    await steps.verifyText('BookDetailPage', 'bookDetailDescription', undefined, { notEmpty: true });
    await steps.verifyText('BookDetailPage', 'bookDetailPrice', undefined, { notEmpty: true });
  });

  test('@coverage navigation: clicking different book cards leads to different detail pages', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Get info from first book card
    await steps.clickNth('HomePage', 'bookCard', 0);
    const title1 = await steps.getText('BookDetailPage', 'bookDetailTitle');
    const url1 = page.url();

    // Go back and click second book
    await steps.click('Navigation', 'navAllBooks');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.clickNth('HomePage', 'bookCard', 1);
    const title2 = await steps.getText('BookDetailPage', 'bookDetailTitle');
    const url2 = page.url();

    // Should be different books
    expect(title1).not.toEqual(title2);
    expect(url1).not.toEqual(url2);
  });
});

test.describe('@coverage Navigation: Login/Signup link navigation', () => {
  test('@coverage navigation: login page has link to signup', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'signupLink');
    await steps.click('LoginPage', 'signupLink');
    await steps.verifyPresence('SignupPage', 'signupPage');
  });

  test('@coverage navigation: signup page has link to login', async ({ steps }) => {
    await steps.navigateTo('/signup');
    await steps.verifyPresence('SignupPage', 'loginLink');
    await steps.click('SignupPage', 'loginLink');
    await steps.verifyPresence('LoginPage', 'loginPage');
  });

  test('@coverage navigation: unauthenticated sidebar shows login and signup links', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Navigation', 'navLogin');
    await steps.verifyPresence('Navigation', 'navSignup');
  });

  test('@coverage navigation: authenticated sidebar hides login/signup, shows user links', async ({ steps, page }) => {
    await page.request.post('http://localhost:8080/api/reset');
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Auth links should be hidden
    await steps.verifyAbsence('Navigation', 'navLogin');
    await steps.verifyAbsence('Navigation', 'navSignup');

    // User links should be visible
    await steps.verifyPresence('Navigation', 'navCart');
    await steps.verifyPresence('Navigation', 'navOrders');
    await steps.verifyPresence('Navigation', 'navSell');
    await steps.verifyPresence('Navigation', 'navProfile');
    await steps.verifyPresence('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'userBalance');
  });
});

test.describe('@coverage Navigation: Browser back/forward', () => {
  test('@coverage navigation: browser back from book detail returns to catalog', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Click a book card
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');

    // Go back
    await page.goBack();
    await page.waitForTimeout(1000);

    // Should be back on home page
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('@coverage navigation: browser forward after back returns to book detail', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');

    await page.goBack();
    await page.waitForTimeout(500);
    await steps.verifyPresence('HomePage', 'homePage');

    await page.goForward();
    await page.waitForTimeout(500);
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
  });

  test('@coverage navigation: browser back from search results returns to unfiltered catalog', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Search. Live search now pushes one history entry per keystroke, so a
    // single goBack() only trims the last character. Use direct URL navigation
    // here to land on a search URL with exactly one history step away from /.
    await steps.navigateTo('/?query=Fiction');
    await page.waitForTimeout(500);
    await steps.verifyUrlContains('query=');

    // Go back
    await page.goBack();
    await page.waitForTimeout(1000);

    // Should be back to unfiltered home
    const url = page.url();
    expect(url).not.toContain('query=');
  });
});

test.describe('@coverage Navigation: Order navigation flow', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ steps, page, context }) => {
    await page.request.post('http://localhost:8080/api/reset');
    await context.clearCookies();
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
  });

  test('@coverage navigation: order card in orders list links to order detail', async ({ steps }) => {
    // Create an order
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');

    // Go to orders list
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'ordersPage');
    await steps.verifyCount('OrdersPage', 'orderCard', { greaterThan: 0 });

    // Click order card
    await steps.clickNth('OrdersPage', 'orderCard', 0);
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
    await steps.verifyUrlContains('/orders/');
  });
});
