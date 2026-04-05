import { test, expect } from '../fixtures/base';

test.describe('Bug Discovery — Flow Probing', () => {
  test.describe.configure({ timeout: 60_000 });

  /**
   * @bug BUG-004
   * @severity Medium
   * @phase 1a
   * @steps
   * 1. Login as testuser1
   * 2. Add a book to cart and checkout
   * 3. On the order detail page, check the cart badge in sidebar
   * 4. Observe that the cart badge still shows "1" even though cart was emptied by checkout
   */
  test('@bug-discovery cart badge shows stale count after successful checkout', async ({ steps, page }) => {
    await page.request.post('http://localhost:8080/api/reset');

    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Clear cart
    await steps.navigateTo('/cart');
    const cleared = await steps.clickIfPresent('CartPage', 'cartClear');
    if (cleared) await steps.waitForNetworkIdle();

    // Add item and checkout
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Should be on order detail page now
    await steps.verifyUrlContains('/orders/');

    // CORRECT BEHAVIOR: Cart badge should disappear (cart is empty after checkout)
    // BUG: Cart badge still shows "1" on the order detail page
    const cartBadgeVisible = await page.locator('[data-testid="cart-badge"]').isVisible().catch(() => false);
    expect(cartBadgeVisible).toBe(false);
  });

  /**
   * @bug BUG-008
   * @severity Medium
   * @phase 1b
   * @steps
   * 1. Navigate to /?query=Dune
   * 2. Verify search results show Dune book
   * 3. Check the search input value
   * 4. Observe the search input is empty even though results are filtered
   */
  test('@bug-discovery search input does not reflect URL query parameter', async ({ steps, page }) => {
    await steps.navigateTo('/?query=Dune');
    await steps.waitForNetworkIdle();

    // Verify Dune is in the results (filtering works)
    const bookGrid = page.locator('[data-testid="book-grid"]');
    const gridText = await bookGrid.textContent();
    expect(gridText).toContain('Dune');

    // CORRECT BEHAVIOR: Search input should show "Dune" to reflect the active query
    // BUG: Search input is empty even though URL has ?query=Dune and results are filtered
    const searchInput = page.locator('[data-testid="search-input"]');
    const inputValue = await searchInput.inputValue();
    expect(inputValue).toBe('Dune');
  });

  /**
   * @bug BUG-009
   * @severity Medium
   * @phase 4
   * @steps
   * 1. Navigate to /?genre=Fiction
   * 2. Click a book card to go to book detail page
   * 3. Click browser back
   * 4. Observe genre filter is preserved in URL but genre chip highlight state is lost
   * 5. The search input does not show the active filter context
   */
  test('@bug-discovery app-context documents condition values EXCELLENT/GOOD/FAIR but actual UI shows NEW/LIKE_NEW/GOOD/FAIR', async ({ steps, page }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace/sell');
    await steps.waitForNetworkIdle();

    // Get all condition options from the dropdown
    const options = await page.locator('[data-testid="listing-condition"] option').allTextContents();

    // CORRECT BEHAVIOR per app-context.md: Conditions should be EXCELLENT, GOOD, FAIR
    // ACTUAL: Conditions are NEW, LIKE NEW, GOOD, FAIR — docs are incorrect/outdated
    // This test validates the documented behavior matches the actual UI
    expect(options).toContain('EXCELLENT');
  });
});
