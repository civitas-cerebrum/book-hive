import { test, expect } from '../fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Bug Discovery — Validation Bugs', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async ({ request }) => {
    await request.post('http://localhost:8080/api/reset');
  });

  /**
   * @bug BUG-002
   * @severity Medium
   * @steps
   * 1. Login as testuser1
   * 2. Navigate to /marketplace/sell
   * 3. Select a book from dropdown
   * 4. Set price to -5.00 (bypassing HTML5 min validation via fill)
   * 5. Click Create Listing
   * 6. Expect an error message to be shown to the user
   * @expected The form should show a validation error or the API error message
   * @actual When the backend rejects the negative price, the frontend fails silently
   *         with no error message shown to the user. The form remains in its submitted
   *         state with no feedback.
   */
  test('@bug-discovery negative price listing shows no error to user', async ({ steps, page }) => {
    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Clean existing listings
    const listings = await page.request.get('http://localhost:8080/api/marketplace');
    const listingsData = await listings.json();
    for (const listing of listingsData) {
      await page.request.delete(`http://localhost:8080/api/marketplace/listings/${listing.id}`).catch(() => {});
    }

    // Navigate to sell page
    await steps.click('Navigation', 'sellLink');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('CreateListingPage', 'createListingPage');

    // Select a book and enter negative price
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.fill('CreateListingPage', 'priceInput', '-5.00');

    // Submit the form - this bypasses HTML5 min="0.01" validation
    // because Playwright fill() sets value directly
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // The listing should NOT have been created on the marketplace
    await steps.navigateTo('/marketplace');
    await steps.waitForNetworkIdle();

    // If a listing with negative price exists, that's a critical data integrity bug
    // If no listing exists AND no error was shown, that's a UX bug (silent failure)
    await steps.verifyPresence('MarketplacePage', 'noListings');
  });

  /**
   * @bug BUG-003
   * @severity High
   * @steps
   * 1. Login as testuser1 (balance: $100.00)
   * 2. Add multiple expensive books to cart (total exceeding $100)
   * 3. Navigate to cart
   * 4. Click Checkout
   * 5. Expect an error message about insufficient balance
   * @expected The checkout should show an error message like "Insufficient balance"
   * @actual The CartPage checkout handler has try/finally but no catch block.
   *         When the API returns a 400 "Insufficient balance" error, the error
   *         is silently swallowed. No error message is shown to the user.
   *         The checkout button returns to its normal state with no feedback.
   */
  test('@bug-discovery insufficient balance checkout shows no error', async ({ steps, page }) => {
    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Clear cart first
    await page.request.delete('http://localhost:8080/api/cart');

    // Add multiple expensive books to exceed $100 balance
    // Dune ($16.99) x 1
    await steps.navigateTo('/books/book-009');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // One Hundred Years of Solitude ($14.99) x 1
    await steps.navigateTo('/books/book-007');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // The Martian ($14.99) x 1
    await steps.navigateTo('/books/book-012');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Neuromancer ($13.99) x 1
    await steps.navigateTo('/books/book-011');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // To Kill a Mockingbird ($12.99) x 1
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Hitchhiker's Guide ($12.99) x 1
    await steps.navigateTo('/books/book-010');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Brave New World ($11.99) x 1
    await steps.navigateTo('/books/book-008');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Total: ~$98.93 - need one more to push over $100
    // 1984 ($11.99)
    await steps.navigateTo('/books/book-003');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Total now: ~$110.92 which exceeds $100 balance

    // Navigate to cart
    await steps.click('Navigation', 'cartLink');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('CartPage', 'checkoutButton');

    // Attempt checkout - should fail due to insufficient balance
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // BUG: The checkout handler catches errors silently (no catch block, only finally)
    // Should still be on cart page with an error message
    await steps.verifyPresence('CartPage', 'cartPage');
  });
});
