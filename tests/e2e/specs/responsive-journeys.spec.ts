import { test, expect } from '../fixtures/base';

const MOBILE = { width: 375, height: 667 };
const MOBILE_LARGE = { width: 414, height: 896 };

test.describe('Mobile Journeys — Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive journey: login at mobile viewport', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'loginForm');

    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');

    await steps.verifyUrlContains('/');
    await steps.verifyPresence('HomePage', 'homePage');
  });

  test('@responsive journey: signup at mobile viewport', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/signup');
    await steps.verifyPresence('SignupPage', 'signupForm');

    const uniqueEmail = `mobile-test-${Date.now()}@bookhive.test`;
    await steps.fill('SignupPage', 'signupUsername', 'MobileUser');
    await steps.fill('SignupPage', 'signupEmail', uniqueEmail);
    await steps.fill('SignupPage', 'signupPassword', 'Test1234!');
    await steps.click('SignupPage', 'signupSubmit');

    await steps.verifyUrlContains('/');
    await steps.verifyPresence('HomePage', 'homePage');
  });

  test('@responsive journey: login error at mobile viewport', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/login');

    await steps.fill('LoginPage', 'loginEmail', 'wrong@test.com');
    await steps.fill('LoginPage', 'loginPassword', 'wrongpass');
    await steps.click('LoginPage', 'loginSubmit');

    await steps.verifyPresence('LoginPage', 'loginError');
  });
});

test.describe('Mobile Journeys — Browse and Purchase', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive journey: browse catalog → view book detail → add to cart → checkout at mobile', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);

    // Login first
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'loginPage');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Browse catalog — books should be visible
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });

    // Navigate directly to a book detail page
    await steps.navigateTo('/books/book-003');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    await steps.verifyPresence('BookDetailPage', 'bookDetailTitle');

    // Add to cart — scroll into view first (mobile column layout)
    await steps.scrollIntoView('BookDetailPage', 'addToCartDetail');
    await steps.click('BookDetailPage', 'addToCartDetail');
    await page.waitForTimeout(500);

    // Navigate to cart via mobile cart button
    await steps.clickWithoutScrolling('Navigation', 'mobileCartBtn');
    await steps.verifyUrlContains('/cart');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });

    // Checkout
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyUrlContains('/orders/');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
  });

  test('@responsive journey: browse catalog at large mobile (414px)', async ({ page, steps }) => {
    await steps.setViewport(MOBILE_LARGE.width, MOBILE_LARGE.height);

    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });

    // Click first book
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    await steps.verifyPresence('BookDetailPage', 'bookDetailTitle');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPrice');
  });
});

test.describe('Mobile Journeys — Search and Genre Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive journey: search for books at mobile viewport', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Search for a known book
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');

    await steps.verifyUrlContains('query=Dune');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('@responsive journey: genre filter via chips at mobile viewport', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Use genre chips (mobile-only UI)
    await steps.click('HomePage', 'genreChipFantasy');
    await steps.verifyUrlContains('genre=Fantasy');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('@responsive journey: genre filter via sidebar at mobile viewport', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Open sidebar via hamburger
    await steps.clickWithoutScrolling('Navigation', 'sidebarToggle');
    await page.waitForTimeout(400);

    // Click genre filter in sidebar
    await steps.click('Navigation', 'genreFilterBiography');
    await steps.verifyUrlContains('genre=Biography');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('@responsive journey: pagination works at mobile viewport', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Check pagination
    await steps.verifyPresence('HomePage', 'pagination');
    await steps.verifyTextContains('HomePage', 'pagination', '1 / 5');

    // Navigate to next page
    await steps.click('HomePage', 'nextPage');
    await steps.verifyTextContains('HomePage', 'pagination', '2 / 5');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('@responsive journey: search no results at mobile viewport', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');

    await steps.fill('HomePage', 'searchInput', 'xyznonexistentbookzzz');
    await steps.pressKey('Enter');

    await steps.verifyPresence('HomePage', 'noBooks');
  });
});

test.describe('Mobile Journeys — Marketplace', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive journey: create marketplace listing at mobile viewport', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);

    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyUrlContains('/');

    // Navigate to sell page via sidebar
    await steps.clickWithoutScrolling('Navigation', 'sidebarToggle');
    await page.waitForTimeout(400);
    await steps.click('Navigation', 'navSell');
    await steps.verifyUrlContains('/marketplace/sell');

    // Fill listing form
    await steps.verifyPresence('CreateListingPage', 'createListingPage');
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
    await steps.selectDropdown('CreateListingPage', 'listingCondition', { type: 'index', index: 1 });
    await steps.fill('CreateListingPage', 'listingPrice', '12.99');
    await steps.click('CreateListingPage', 'listingCreate');

    await steps.verifyUrlContains('/marketplace');
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });
  });

  test('@responsive journey: view marketplace at mobile viewport', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');

    // No horizontal overflow
    const noOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    expect(noOverflow).toBe(true);
  });
});

test.describe('Mobile Journeys — Cart Operations', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive journey: cart quantity operations at mobile viewport', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);

    // Login
    // Clear browser cookies to ensure clean auth state after reset
    await page.context().clearCookies();

    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'loginPage');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Add a book (cart is empty after reset)
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    await steps.scrollIntoView('BookDetailPage', 'addToCartDetail');
    await steps.click('BookDetailPage', 'addToCartDetail');
    await page.waitForTimeout(500);

    // Go to cart
    await steps.navigateTo('/cart');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });

    // Increment quantity
    await steps.clickNth('CartPage', 'cartQtyPlus', 0);
    await page.waitForTimeout(300);

    // Verify quantity updated
    const qty = await page.locator('[data-testid^="cart-qty-"]:not([data-testid*="minus"]):not([data-testid*="plus"])').first().textContent();
    expect(parseInt(qty!)).toBe(2);

    // Decrement quantity
    await steps.clickNth('CartPage', 'cartQtyMinus', 0);
    await page.waitForTimeout(300);
    const qty2 = await page.locator('[data-testid^="cart-qty-"]:not([data-testid*="minus"]):not([data-testid*="plus"])').first().textContent();
    expect(parseInt(qty2!)).toBe(1);
  });

  test('@responsive journey: empty cart at mobile viewport', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);

    // Login
    await page.context().clearCookies();
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'loginPage');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Go to cart (should be empty after reset)
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'cartEmpty');
  });
});

test.describe('Mobile Journeys — Orders', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive journey: view orders at mobile viewport', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);

    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyUrlContains('/');

    // Navigate to orders via sidebar
    await steps.clickWithoutScrolling('Navigation', 'sidebarToggle');
    await page.waitForTimeout(400);
    await steps.click('Navigation', 'navOrders');
    await steps.verifyUrlContains('/orders');

    // Orders page should render without overflow
    const noOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    expect(noOverflow).toBe(true);
  });

  test('@responsive journey: complete purchase and view order at mobile viewport', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);

    // Clear cookies for clean auth state
    await page.context().clearCookies();

    // Login
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'loginPage');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Add a book (cart is empty after reset)
    await steps.navigateTo('/books/book-005');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    await steps.scrollIntoView('BookDetailPage', 'addToCartDetail');
    await steps.click('BookDetailPage', 'addToCartDetail');
    await page.waitForTimeout(500);

    // Checkout
    await steps.navigateTo('/cart');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });
    await steps.click('CartPage', 'checkoutBtn');

    // Verify order detail page
    await steps.verifyUrlContains('/orders/');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
    await steps.verifyPresence('OrderDetailPage', 'orderTotal');

    // No horizontal overflow on order detail
    const noOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    expect(noOverflow).toBe(true);
  });
});

test.describe('Mobile Journeys — Profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive journey: view profile at mobile viewport', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);

    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyUrlContains('/');

    // Navigate to profile via sidebar
    await steps.clickWithoutScrolling('Navigation', 'sidebarToggle');
    await page.waitForTimeout(400);
    await steps.click('Navigation', 'navProfile');
    await steps.verifyUrlContains('/profile');

    await steps.verifyPresence('ProfilePage', 'profilePage');
    await steps.verifyPresence('ProfilePage', 'profileUsername');
    await steps.verifyPresence('ProfilePage', 'profileEmail');
    await steps.verifyPresence('ProfilePage', 'profileBalance');

    // No overflow
    const noOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    expect(noOverflow).toBe(true);
  });
});

test.describe('Mobile Journeys — Logout', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive journey: logout via sidebar at mobile viewport', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);

    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyUrlContains('/');

    // Open sidebar and click Logout
    await steps.clickWithoutScrolling('Navigation', 'sidebarToggle');
    await page.waitForTimeout(400);
    await steps.click('Navigation', 'logoutBtn');
    await page.waitForTimeout(500);

    // After logout, sidebar should show Login/Signup (not auth links)
    await steps.clickWithoutScrolling('Navigation', 'sidebarToggle');
    await page.waitForTimeout(400);
    await steps.verifyPresence('Navigation', 'navLogin');
    await steps.verifyPresence('Navigation', 'navSignup');
  });
});
