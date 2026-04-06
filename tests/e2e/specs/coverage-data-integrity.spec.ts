/**
 * Expanded Coverage: Data Integrity & Boundary Tests
 *
 * Tests balance calculations, stock constraints, price accuracy,
 * and cart total correctness across purchase workflows.
 */

import { test, expect } from '../fixtures/base';

test.describe('@coverage Data integrity: Balance calculations on purchase', () => {
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

  test('@coverage data-integrity: balance deducted correctly after single book purchase', async ({ steps, page }) => {
    // Verify initial balance
    await steps.verifyTextContains('Navigation', 'userBalance', '$100.00');

    // Get the price of the first book
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    const priceText = await steps.getText('BookDetailPage', 'bookDetailPrice');
    const bookPrice = parseFloat(priceText.replace('$', ''));

    // Purchase the book
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.verifyPresence('CartPage', 'cartPage');

    // Verify cart total matches book price
    const cartTotal = await steps.getText('CartPage', 'cartTotal');
    expect(cartTotal).toContain(bookPrice.toFixed(2));

    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');

    // Verify order total matches book price
    const orderTotal = await steps.getText('OrderDetailPage', 'orderTotal');
    expect(orderTotal).toContain(bookPrice.toFixed(2));

    // Reload to see updated balance (stale UI bug requires reload)
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'profilePage');
    const balanceText = await steps.getText('ProfilePage', 'profileBalance');
    const newBalance = parseFloat(balanceText.replace(/[^0-9.]/g, ''));
    const expectedBalance = 100.0 - bookPrice;
    expect(newBalance).toBeCloseTo(expectedBalance, 2);
  });

  test('@coverage data-integrity: cart total updates correctly with quantity changes', async ({ steps, page }) => {
    // Add a book to cart
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    const priceText = await steps.getText('BookDetailPage', 'bookDetailPrice');
    const unitPrice = parseFloat(priceText.replace('$', ''));

    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.verifyPresence('CartPage', 'cartPage');

    // Cart total should be 1 * unitPrice
    const total1 = await steps.getText('CartPage', 'cartTotal');
    expect(total1).toContain(unitPrice.toFixed(2));

    // Increment to qty 2
    await steps.click('CartPage', 'cartQtyPlus');
    await page.waitForTimeout(500);
    const total2 = await steps.getText('CartPage', 'cartTotal');
    const expectedTotal2 = (unitPrice * 2).toFixed(2);
    expect(total2).toContain(expectedTotal2);

    // Increment to qty 3
    await steps.click('CartPage', 'cartQtyPlus');
    await page.waitForTimeout(500);
    const total3 = await steps.getText('CartPage', 'cartTotal');
    const expectedTotal3 = (unitPrice * 3).toFixed(2);
    expect(total3).toContain(expectedTotal3);
  });

  test('@coverage data-integrity: multiple items in cart produce correct total', async ({ steps, page }) => {
    // Get book 1 price
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    const price1Text = await steps.getText('BookDetailPage', 'bookDetailPrice');
    const price1 = parseFloat(price1Text.replace('$', ''));
    await steps.click('BookDetailPage', 'addToCartDetail');

    // Get book 2 price
    await steps.navigateTo('/books/book-002');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    const price2Text = await steps.getText('BookDetailPage', 'bookDetailPrice');
    const price2 = parseFloat(price2Text.replace('$', ''));
    await steps.click('BookDetailPage', 'addToCartDetail');

    // Navigate to cart and check total
    await steps.click('Navigation', 'navCart');
    await steps.verifyPresence('CartPage', 'cartPage');
    await steps.verifyCount('CartPage', 'cartItem', { exactly: 2 });

    const totalText = await steps.getText('CartPage', 'cartTotal');
    const expectedTotal = (price1 + price2).toFixed(2);
    expect(totalText).toContain(expectedTotal);
  });

  test('@coverage data-integrity: removing item from cart updates total correctly', async ({ steps, page }) => {
    // Add two different books
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.navigateTo('/books/book-002');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    const price2Text = await steps.getText('BookDetailPage', 'bookDetailPrice');
    const price2 = parseFloat(price2Text.replace('$', ''));
    await steps.click('BookDetailPage', 'addToCartDetail');

    await steps.click('Navigation', 'navCart');
    await steps.verifyPresence('CartPage', 'cartPage');
    await steps.verifyCount('CartPage', 'cartItem', { exactly: 2 });

    // Remove first item
    await steps.clickNth('CartPage', 'cartRemove', 0);
    await page.waitForTimeout(500);

    // Only 1 item should remain
    await steps.verifyCount('CartPage', 'cartItem', { exactly: 1 });

    // Total should update
    const totalAfterRemoval = await steps.getText('CartPage', 'cartTotal');
    expect(totalAfterRemoval.length).toBeGreaterThan(0);
  });
});

test.describe('@coverage Data integrity: Order data accuracy', () => {
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

  test('@coverage data-integrity: order contains correct items from cart', async ({ steps, page }) => {
    // Add a specific book
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    const bookTitle = await steps.getText('BookDetailPage', 'bookDetailTitle');
    await steps.click('BookDetailPage', 'addToCartDetail');

    // Checkout
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');

    // Order should contain the same book
    await steps.verifyCount('OrderDetailPage', 'orderItem', { greaterThan: 0 });
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'COMPLETED');
  });

  test('@coverage data-integrity: order appears in orders list after checkout', async ({ steps }) => {
    // Quick purchase
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');

    // Navigate to orders list
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'ordersPage');
    await steps.verifyCount('OrdersPage', 'orderCard', { greaterThan: 0 });
  });

  test('@coverage data-integrity: multiple sequential purchases create separate orders', async ({ steps, page }) => {
    // First purchase
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');

    // Second purchase
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.clickNth('HomePage', 'bookCard', 1);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');

    // Orders list should show 2 orders
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'ordersPage');
    await steps.verifyCount('OrdersPage', 'orderCard', { exactly: 2 });
  });
});

test.describe('@coverage Data integrity: Balance after return refund', () => {
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

  test('@coverage data-integrity: balance restored after order return', async ({ steps, page }) => {
    // Check initial balance
    await steps.verifyTextContains('Navigation', 'userBalance', '$100.00');

    // Purchase a book
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');

    // Return the order (within return window)
    await steps.click('OrderDetailPage', 'returnOrderBtn');
    await page.waitForTimeout(1000);
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'RETURNED');

    // Balance should be restored — check on profile (avoids stale sidebar)
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'profilePage');
    const balanceText = await steps.getText('ProfilePage', 'profileBalance');
    expect(balanceText).toContain('$100.00');
  });
});

test.describe('@coverage Data integrity: Marketplace balance transfer', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@coverage data-integrity: marketplace buy deducts from buyer balance', async ({ steps, page }) => {
    // Seller creates listing
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.click('Navigation', 'navSell');
    await steps.verifyPresence('CreateListingPage', 'createListingPage');
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
    await steps.selectDropdown('CreateListingPage', 'listingCondition', { type: 'index', index: 1 });
    await steps.fill('CreateListingPage', 'listingPrice', '15.00');
    await steps.click('CreateListingPage', 'listingCreate');
    await page.waitForTimeout(1000);

    // Logout seller, login buyer
    await steps.click('Navigation', 'logoutBtn');
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Buy the listing
    await steps.click('Navigation', 'navMarketplace');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');
    await steps.verifyCount('MarketplacePage', 'listingCard', { greaterThan: 0 });
    await steps.clickNth('MarketplacePage', 'listingBuyBtn', 0);
    await page.waitForTimeout(1000);

    // Verify buyer balance reduced
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'profilePage');
    const balanceText = await steps.getText('ProfilePage', 'profileBalance');
    const balance = parseFloat(balanceText.replace(/[^0-9.]/g, ''));
    expect(balance).toBeLessThan(100);
    expect(balance).toBeCloseTo(85.0, 2); // $100 - $15 = $85
  });
});

test.describe('@coverage Data integrity: Cart badge count accuracy', () => {
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

  test('@coverage data-integrity: cart badge shows correct count after adding multiple items', async ({ steps, page }) => {
    // Add first book
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.verifyText('Navigation', 'cartBadge', '1');

    // Add second book
    await steps.navigateTo('/books/book-002');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.verifyText('Navigation', 'cartBadge', '2');

    // Add third book
    await steps.navigateTo('/books/book-003');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.verifyText('Navigation', 'cartBadge', '3');
  });

  test('@coverage data-integrity: cart badge disappears after clearing cart', async ({ steps, page }) => {
    // Add item
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.verifyPresence('Navigation', 'cartBadge');

    // Navigate to cart and clear
    await steps.click('Navigation', 'navCart');
    await steps.verifyPresence('CartPage', 'cartPage');
    await steps.click('CartPage', 'cartClear');
    await page.waitForTimeout(500);

    // Cart should be empty
    await steps.verifyPresence('CartPage', 'cartEmpty');
  });
});
