import { test, expect } from '../fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Bug Discovery — Element Probing', () => {
  test.describe.configure({ timeout: 60_000 });

  /**
   * @bug BUG-001
   * @severity Medium
   * @phase 1a
   * @steps
   * 1. Login as testuser1
   * 2. Navigate to /marketplace/sell
   * 3. Select a book from dropdown
   * 4. Enter an extremely large price (999999999)
   * 5. Click Create Listing
   * 6. Observe that "An unexpected error occurred" appears instead of a proper validation message
   */
  test('@bug-discovery listing with extreme price shows generic error instead of validation message', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.fill('CreateListingPage', 'priceInput', '999999999');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // BUG: The backend returns a generic "An unexpected error occurred" for extreme prices
    // instead of a proper validation error like "Price must be less than $10000"
    // The listing was NOT created (stayed on sell page), but the error message is unhelpful
    await steps.verifyUrlContains('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'heading');
  });

  /**
   * @bug BUG-002
   * @severity High
   * @phase 1a
   * @steps
   * 1. Login as testuser1
   * 2. Navigate to homepage
   * 3. Double-click "Add to Cart" button on a book card
   * 4. Navigate to /cart
   * 5. Observe that the same book appears as TWO separate cart items instead of one with qty 2
   */
  test('@bug-discovery double-click add-to-cart creates duplicate cart items instead of incrementing quantity', async ({ steps, page }) => {
    // Reset to clean state
    await page.request.post('http://localhost:8080/api/reset');

    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Clear cart first
    await steps.navigateTo('/cart');
    const cleared = await steps.clickIfPresent('CartPage', 'cartClear');
    if (cleared) await steps.waitForNetworkIdle();

    // Navigate to homepage and double-click the Add to Cart button
    await steps.navigateTo('/');
    await steps.waitForNetworkIdle();

    // Double-click the Add to Cart button for the first book
    const addBtn = page.locator('[data-testid="add-to-cart-book-001"]');
    await addBtn.dblclick();
    await steps.waitForNetworkIdle();

    // Navigate to cart and verify there is only ONE cart item (not two duplicates)
    await steps.navigateTo('/cart');
    await steps.waitForNetworkIdle();

    // CORRECT BEHAVIOR: Should show 1 cart item with quantity 2
    // BUG: Shows 2 separate cart items, each with quantity 1
    await steps.verifyCount('CartPage', 'cartItem', { exactly: 1 });
  });

  /**
   * @bug BUG-003
   * @severity High
   * @phase 1a
   * @steps
   * 1. Login as testuser1
   * 2. Note the initial balance in sidebar
   * 3. Add a book to cart and checkout
   * 4. On the order detail page, check the sidebar balance
   * 5. Observe that the balance has NOT updated — still shows old value
   */
  test('@bug-discovery sidebar balance not updated immediately after checkout', async ({ steps, page }) => {
    await page.request.post('http://localhost:8080/api/reset');

    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Get initial balance from sidebar
    const initialBalance = await steps.getText('Navigation', 'userBalance');
    expect(initialBalance).toContain('$100.00');

    // Add item and checkout
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // CORRECT BEHAVIOR: Sidebar balance should now show $87.01 (100 - 12.99)
    // BUG: Sidebar still shows $100.00 until next page navigation
    await steps.verifyUrlContains('/orders/');
    const balanceAfterCheckout = await steps.getText('Navigation', 'userBalance');
    expect(balanceAfterCheckout).not.toContain('$100.00');
  });

  /**
   * @bug BUG-005
   * @severity Medium
   * @phase 1a
   * @steps
   * 1. Login as testuser1
   * 2. Navigate to /marketplace/sell
   * 3. Select a book
   * 4. Enter price: 0.01
   * 5. Click Create Listing
   * 6. Observe that the listing is accepted with no minimum price validation
   */
  test('@bug-discovery marketplace accepts absurdly low price listing ($0.01)', async ({ steps, page }) => {
    await page.request.post('http://localhost:8080/api/reset');

    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.fill('CreateListingPage', 'priceInput', '0.01');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // CORRECT BEHAVIOR: Should stay on sell page with a validation error like "Price must be at least $1.00"
    // BUG: The listing is accepted and user is redirected to marketplace
    await steps.verifyUrlContains('/marketplace/sell');
  });

  /**
   * @bug BUG-006
   * @severity Medium
   * @phase 1a
   * @steps
   * 1. Navigate to a completely invalid route like /nonexistent-page
   * 2. Observe that the main content area is completely blank — no 404 message shown
   */
  test('@bug-discovery invalid route shows blank page instead of 404 message', async ({ steps, page }) => {
    await steps.navigateTo('/this-route-does-not-exist');

    // CORRECT BEHAVIOR: Should show a "Page not found" or "404" message
    // BUG: Shows blank main content area with sidebar
    const mainContent = page.locator('main');
    const mainText = await mainContent.textContent();
    expect(mainText?.trim()).not.toBe('');
  });

  /**
   * @bug BUG-007
   * @severity High
   * @phase 1a
   * @steps
   * 1. Login as testuser1
   * 2. Add expensive items to cart exceeding $100 balance
   * 3. Click Checkout
   * 4. Observe no error message shown — the checkout silently fails
   */
  test('@bug-discovery checkout with insufficient balance shows no error message to user', async ({ steps, page }) => {
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

    // Add expensive book (Dune $16.99) multiple times to exceed $100 balance
    await steps.navigateTo('/books/book-009');
    for (let i = 0; i < 7; i++) {
      await steps.click('BookDetailPage', 'addToCartButton');
      await steps.waitForNetworkIdle();
    }

    // Go to cart and attempt checkout
    await steps.navigateTo('/cart');
    await steps.waitForNetworkIdle();
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Should still be on cart page (checkout failed)
    await steps.verifyUrlContains('/cart');

    // CORRECT BEHAVIOR: An error message should be visible to the user explaining insufficient balance
    // BUG: No error message is displayed — the user gets no feedback
    const pageText = await page.locator('[data-testid="cart-page"]').textContent();
    expect(pageText).toMatch(/insufficient|error|cannot|balance/i);
  });
});
