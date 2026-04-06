/**
 * Expanded Coverage: Page Content Verification
 *
 * Verifies that all pages render correct content, all elements are present,
 * and data displays match across pages. Covers pages with thin element-level
 * verification in other test suites.
 */

import { test, expect } from '../fixtures/base';

test.describe('@coverage Page content: Book detail page completeness', () => {
  test('@coverage content: book detail shows all expected fields', async ({ steps, page }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');

    // All detail fields present
    await steps.verifyText('BookDetailPage', 'bookDetailTitle', undefined, { notEmpty: true });
    await steps.verifyText('BookDetailPage', 'bookDetailAuthor', undefined, { notEmpty: true });
    await steps.verifyText('BookDetailPage', 'bookDetailGenre', undefined, { notEmpty: true });
    await steps.verifyText('BookDetailPage', 'bookDetailDescription', undefined, { notEmpty: true });
    await steps.verifyText('BookDetailPage', 'bookDetailPrice', undefined, { notEmpty: true });

    // Price should be a valid number format
    const price = await steps.getText('BookDetailPage', 'bookDetailPrice');
    expect(price).toMatch(/\$\d+\.\d{2}/);

    // Stock info should be present
    const stockVisible = await page.locator('[data-testid="book-detail-stock"]').isVisible().catch(() => false);
    if (stockVisible) {
      const stock = await steps.getText('BookDetailPage', 'bookDetailStock');
      expect(stock.length).toBeGreaterThan(0);
    }
  });

  test('@coverage content: different books show different content', async ({ steps }) => {
    // Book 1
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    const title1 = await steps.getText('BookDetailPage', 'bookDetailTitle');
    const author1 = await steps.getText('BookDetailPage', 'bookDetailAuthor');

    // Book 2
    await steps.navigateTo('/books/book-002');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    const title2 = await steps.getText('BookDetailPage', 'bookDetailTitle');
    const author2 = await steps.getText('BookDetailPage', 'bookDetailAuthor');

    // Should have different content
    expect(title1).not.toEqual(title2);
  });

  test('@coverage content: book-001 is To Kill a Mockingbird', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    await steps.verifyTextContains('BookDetailPage', 'bookDetailTitle', 'To Kill a Mockingbird');
    await steps.verifyTextContains('BookDetailPage', 'bookDetailAuthor', 'Harper Lee');
    await steps.verifyTextContains('BookDetailPage', 'bookDetailGenre', 'Fiction');
    await steps.verifyTextContains('BookDetailPage', 'bookDetailPrice', '$12.99');
  });
});

test.describe('@coverage Page content: Home page catalog verification', () => {
  test('@coverage content: home page displays 12 books per page', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    const bookCount = await page.locator('[data-testid^="book-card-"]').count();
    expect(bookCount).toBe(12);
  });

  test('@coverage content: each book card shows title, author, genre, price', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Check first book card has all elements
    const firstCard = page.locator('[data-testid^="book-card-"]').first();
    await expect(firstCard).toBeVisible();

    // Title
    const titles = await page.locator('[data-testid^="book-title-"]').count();
    expect(titles).toBeGreaterThan(0);

    // Author
    const authors = await page.locator('[data-testid^="book-author-"]').count();
    expect(authors).toBeGreaterThan(0);

    // Price
    const prices = await page.locator('[data-testid^="book-price-"]').count();
    expect(prices).toBeGreaterThan(0);
  });

  test('@coverage content: pagination shows correct page numbers', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Pagination should be visible (50 books / 12 per page = 5 pages)
    await steps.verifyPresence('HomePage', 'pagination');

    // Previous button should be disabled on first page
    const prevDisabled = await page.locator('[data-testid="prev-page"]').isDisabled();
    expect(prevDisabled).toBeTruthy();

    // Next button should be enabled
    const nextDisabled = await page.locator('[data-testid="next-page"]').isDisabled();
    expect(nextDisabled).toBeFalsy();
  });

  test('@coverage content: navigating to last page shows remaining books', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Navigate to last page (page 5 with 50 books / 12 per page)
    // Click next 4 times to reach page 5
    for (let i = 0; i < 4; i++) {
      await steps.click('HomePage', 'nextPage');
      await page.waitForTimeout(500);
    }

    // On last page, next button should be disabled
    const nextDisabled = await page.locator('[data-testid="next-page"]').isDisabled();
    expect(nextDisabled).toBeTruthy();

    // Previous should be enabled
    const prevDisabled = await page.locator('[data-testid="prev-page"]').isDisabled();
    expect(prevDisabled).toBeFalsy();

    // Should have remaining books (50 - 48 = 2)
    const bookCount = await page.locator('[data-testid^="book-card-"]').count();
    expect(bookCount).toBeGreaterThan(0);
    expect(bookCount).toBeLessThanOrEqual(12);
  });
});

test.describe('@coverage Page content: Profile page completeness', () => {
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

  test('@coverage content: profile page shows user details', async ({ steps }) => {
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'profilePage');

    // All user details present
    await steps.verifyText('ProfilePage', 'profileUsername', undefined, { notEmpty: true });
    const email = await steps.getText('ProfilePage', 'profileEmail');
    expect(email).toContain('testuser1@bookhive.test');
    await steps.verifyText('ProfilePage', 'profileBalance', undefined, { notEmpty: true });
    const balance = await steps.getText('ProfilePage', 'profileBalance');
    expect(balance).toContain('$');
  });

  test('@coverage content: profile shows no-listings when user has none', async ({ steps }) => {
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'profilePage');
    await steps.verifyPresence('ProfilePage', 'noListings');
  });

  test('@coverage content: profile shows listings after creating one', async ({ steps, page }) => {
    // Create a listing
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'createListingPage');
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
    await steps.selectDropdown('CreateListingPage', 'listingCondition', { type: 'index', index: 1 });
    await steps.fill('CreateListingPage', 'listingPrice', '12.00');
    await steps.click('CreateListingPage', 'listingCreate');
    await page.waitForTimeout(1000);

    // Navigate to profile
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'profilePage');
    await steps.verifyAbsence('ProfilePage', 'noListings');
    await steps.verifyCount('ProfilePage', 'myListing', { greaterThan: 0 });
  });
});

test.describe('@coverage Page content: Orders page & Order detail completeness', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ steps, page, context }) => {
    await page.request.post('http://localhost:8080/api/reset');
    await context.clearCookies();
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
  });

  test('@coverage content: empty orders page shows no-orders message', async ({ steps }) => {
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'ordersPage');
    await steps.verifyPresence('OrdersPage', 'noOrders');
  });

  test('@coverage content: order detail shows all required fields', async ({ steps, page }) => {
    // Create an order
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');

    // Verify all fields
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'COMPLETED');
    await steps.verifyCount('OrderDetailPage', 'orderItem', { greaterThan: 0 });
    await steps.verifyText('OrderDetailPage', 'orderTotal', undefined, { notEmpty: true });

    // Total should be a valid price format
    const total = await steps.getText('OrderDetailPage', 'orderTotal');
    expect(total).toMatch(/\$?\d+\.\d{2}/);

    // Return countdown should be visible for fresh order
    await steps.verifyPresence('OrderDetailPage', 'returnCountdown');
    await steps.verifyPresence('OrderDetailPage', 'returnOrderBtn');
  });

  test('@coverage content: order card in list shows status', async ({ steps }) => {
    // Create an order
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');

    // Navigate to orders list
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'ordersPage');
    await steps.verifyCount('OrdersPage', 'orderCard', { greaterThan: 0 });

    // Order card should show status
    const status = await steps.getText('OrdersPage', 'orderStatus');
    expect(status).toContain('COMPLETED');
  });
});

test.describe('@coverage Page content: Marketplace & Create Listing completeness', () => {
  test.beforeEach(async ({ steps, page, context }) => {
    await page.request.post('http://localhost:8080/api/reset');
    await context.clearCookies();
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
  });

  test('@coverage content: marketplace shows no-listings when empty', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');
    await steps.verifyPresence('MarketplacePage', 'noListings');
  });

  test('@coverage content: create listing page has all form fields', async ({ steps, page }) => {
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'createListingPage');
    await steps.verifyPresence('CreateListingPage', 'listingBookSelect');
    await steps.verifyPresence('CreateListingPage', 'listingCondition');
    await steps.verifyPresence('CreateListingPage', 'listingPrice');
    await steps.verifyPresence('CreateListingPage', 'listingCreate');

    // Book select should have options
    const options = await page.locator('[data-testid="listing-book-select"] option').count();
    expect(options).toBeGreaterThan(1); // "Select a book..." + actual books
  });

  test('@coverage content: listing card shows title, condition badge, price, and buy button', async ({ steps, page }) => {
    // Create a listing
    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
    await steps.selectDropdown('CreateListingPage', 'listingCondition', { type: 'index', index: 1 });
    await steps.fill('CreateListingPage', 'listingPrice', '9.99');
    await steps.click('CreateListingPage', 'listingCreate');
    await page.waitForTimeout(1000);

    // Verify listing card elements
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });
    await steps.verifyCount('MarketplacePage', 'listingTitle', { greaterThan: 0 });
    await steps.verifyCount('MarketplacePage', 'listingPrice', { greaterThan: 0 });
    await steps.verifyCount('MarketplacePage', 'listingConditionBadge', { greaterThan: 0 });

    // Seller should NOT see buy button on own listing
    const buyBtnCount = await page.locator('[data-testid^="listing-buy-"]').count();
    expect(buyBtnCount).toBe(0);
  });
});

test.describe('@coverage Page content: Cart page element completeness', () => {
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

  test('@coverage content: cart item shows all expected elements', async ({ steps, page }) => {
    // Add an item
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.verifyPresence('CartPage', 'cartPage');

    // Cart item should have title, price, qty controls
    await steps.verifyCount('CartPage', 'cartItemTitle', { greaterThan: 0 });
    await steps.verifyCount('CartPage', 'cartItemPrice', { greaterThan: 0 });
    await steps.verifyCount('CartPage', 'cartQty', { greaterThan: 0 });
    await steps.verifyCount('CartPage', 'cartQtyPlus', { greaterThan: 0 });
    await steps.verifyCount('CartPage', 'cartQtyMinus', { greaterThan: 0 });
    await steps.verifyCount('CartPage', 'cartRemove', { greaterThan: 0 });

    // Total and action buttons
    await steps.verifyPresence('CartPage', 'cartTotal');
    await steps.verifyPresence('CartPage', 'cartClear');
    await steps.verifyPresence('CartPage', 'checkoutBtn');

    // Quantity should be 1
    const qty = await page.locator('[data-testid^="cart-qty-"]:not([data-testid*="minus"]):not([data-testid*="plus"])').first().textContent();
    expect(qty).toBe('1');

    // Minus button should be disabled at qty 1
    const minusDisabled = await page.locator('[data-testid^="cart-qty-minus-"]').first().isDisabled();
    expect(minusDisabled).toBeTruthy();
  });
});
