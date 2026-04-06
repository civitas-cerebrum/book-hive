import { test, expect } from '../fixtures/base';

/*
 * Stale UI State Tests
 *
 * Verify that UI updates in-place after mutations WITHOUT page refresh.
 * If the UI does NOT update, that is a real bug (documented in state-session-notes.md).
 * Tests here verify the ACTUAL behavior — both correct updates and stale state.
 *
 * Key findings from manual exploration:
 * - Cart badge updates in-place when adding to cart ✓
 * - Sidebar balance does NOT update after checkout (requires reload) — STALE
 * - Cart badge does NOT clear after checkout (requires reload) — STALE
 */

test.describe('@session stale-ui: cart badge updates', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@session stale-ui: cart badge appears after adding item from book detail', async ({ steps, page }) => {
    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Verify no cart badge initially (just "Cart" text, no badge)
    await steps.verifyAbsence('Navigation', 'cartBadge');

    // Navigate to book detail and add to cart
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    await steps.click('BookDetailPage', 'addToCartDetail');

    // WITHOUT navigating away — cart badge should appear in sidebar
    await steps.verifyPresence('Navigation', 'cartBadge');
    await steps.verifyText('Navigation', 'cartBadge', '1');
  });

  test('@session stale-ui: cart badge increments after adding second item', async ({ steps, page }) => {
    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Add first item
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.verifyPresence('Navigation', 'cartBadge');
    await steps.verifyText('Navigation', 'cartBadge', '1');

    // Navigate to a different book and add
    await steps.navigateTo('/books/book-002');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    await steps.click('BookDetailPage', 'addToCartDetail');

    // Badge should now show 2 (without page reload)
    await steps.verifyText('Navigation', 'cartBadge', '2');
  });

  test('@session stale-ui: cart badge updates when adding from home page button', async ({ steps, page }) => {
    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Verify no cart badge initially
    await steps.verifyAbsence('Navigation', 'cartBadge');

    // Click "Add to Cart" button on home page (not via detail page)
    await steps.clickNth('HomePage', 'addToCartBtn', 0);

    // Cart badge should appear without navigation
    await steps.verifyPresence('Navigation', 'cartBadge');
    await steps.verifyText('Navigation', 'cartBadge', '1');
  });
});

// NOTE: Stale balance/badge after checkout tests moved to bug-stale-ui.spec.ts (canonical bug reproduction file)

test.describe('@session stale-ui: cart page after item removal', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@session stale-ui: cart total updates after removing item', async ({ steps, page }) => {
    // Login and add two items
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.navigateTo('/books/book-002');
    await steps.click('BookDetailPage', 'addToCartDetail');

    // Go to cart
    await steps.click('Navigation', 'navCart');
    await steps.verifyPresence('CartPage', 'cartPage');
    await steps.verifyCount('CartPage', 'cartItem', { exactly: 2 });

    // Record total with 2 items
    const totalBefore = await steps.getText('CartPage', 'cartTotal');

    // Remove first item (without navigating away)
    await steps.clickNth('CartPage', 'cartRemove', 0);
    await page.waitForTimeout(500);

    // Cart should update in-place: 1 item left, total changed
    await steps.verifyCount('CartPage', 'cartItem', { exactly: 1 });
    const totalAfter = await steps.getText('CartPage', 'cartTotal');
    expect(totalAfter).not.toEqual(totalBefore);
  });

  test('@session stale-ui: cart shows empty state after clearing all items', async ({ steps, page }) => {
    // Login and add item
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');

    await steps.click('Navigation', 'navCart');
    await steps.verifyPresence('CartPage', 'cartPage');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });

    // Clear cart — should update in-place to empty state
    await steps.click('CartPage', 'cartClear');
    await page.waitForTimeout(500);

    // Cart should show empty message without navigation
    await steps.verifyPresence('CartPage', 'cartEmpty');
  });

  test('@session stale-ui: cart quantity updates in-place', async ({ steps, page }) => {
    // Login and add item
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');

    await steps.click('Navigation', 'navCart');
    await steps.verifyPresence('CartPage', 'cartPage');

    // Record initial quantity and total
    const qtyBefore = await steps.getText('CartPage', 'cartQty');
    expect(qtyBefore).toContain('1');
    const totalBefore = await steps.getText('CartPage', 'cartTotal');

    // Increment quantity (without navigating)
    await steps.click('CartPage', 'cartQtyPlus');
    await page.waitForTimeout(500);

    // Quantity and total should update in-place
    const qtyAfter = await steps.getText('CartPage', 'cartQty');
    expect(qtyAfter).toContain('2');
    const totalAfter = await steps.getText('CartPage', 'cartTotal');
    expect(totalAfter).not.toEqual(totalBefore);
  });
});

test.describe('@session stale-ui: order status after return', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@session stale-ui: order status updates in-place after return', async ({ steps, page }) => {
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
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'COMPLETED');

    // Click Return Order — status should update in-place without navigation
    await steps.click('OrderDetailPage', 'returnOrderBtn');
    await page.waitForTimeout(1000);

    // Status should change to RETURNED in-place
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'RETURNED');
  });
});

test.describe('@session stale-ui: marketplace after buying a listing', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@session stale-ui: listing disappears from marketplace after purchase', async ({ steps, page }) => {
    // User 1: create a listing
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.navigateTo('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'createListingPage');
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { index: 1 });
    await steps.selectDropdown('CreateListingPage', 'listingCondition', { index: 1 });
    await steps.fill('CreateListingPage', 'listingPrice', '5.00');
    await steps.click('CreateListingPage', 'listingCreate');
    await page.waitForTimeout(1000);

    // Should navigate to marketplace — verify listing exists
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');
    const listingCountBefore = await steps.getCount('MarketplacePage', 'listingCard');
    expect(listingCountBefore).toBeGreaterThan(0);

    // Logout user 1, login user 2 to buy the listing
    await steps.click('Navigation', 'logoutBtn');
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');
    const listingsBefore = await steps.getCount('MarketplacePage', 'listingCard');

    // Buy the listing — should update in-place
    await steps.clickNth('MarketplacePage', 'listingBuyBtn', 0);
    await page.waitForTimeout(1000);

    // Listing count should decrease (listing removed from marketplace)
    const listingsAfter = await steps.getCount('MarketplacePage', 'listingCard');
    expect(listingsAfter).toBeLessThan(listingsBefore);
  });
});

test.describe('@session stale-ui: profile balance after marketplace purchase', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@session stale-ui: profile balance reflects correct amount after reload', async ({ steps, page }) => {
    // Login and make a purchase
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

    // Navigate to profile — balance should be updated
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'profilePage');
    const profileBalance = await steps.getText('ProfilePage', 'profileBalance');
    // Profile page fetches fresh data, so balance should be correct
    expect(profileBalance).not.toContain('$100.00');
  });
});
