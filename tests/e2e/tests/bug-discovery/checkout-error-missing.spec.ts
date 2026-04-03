import { test, expect } from '../../fixtures/base';

/**
 * BUG-002: No error message shown after checkout failure with insufficient funds
 *
 * SEVERITY: High
 * AREA: Cart / Checkout / UX
 *
 * DESCRIPTION:
 * When a user attempts to checkout with items in their cart but has
 * insufficient balance ($0.00 for new users), the checkout silently
 * fails without displaying any error message. The user remains on
 * the cart page with no indication of why checkout didn't complete.
 *
 * EXPECTED BEHAVIOR:
 * After a failed checkout attempt due to insufficient funds, an error
 * message should appear informing the user (e.g., "Insufficient balance.
 * Please add funds to your account.").
 *
 * ACTUAL BEHAVIOR:
 * The checkout button is clicked, the API returns an error, but no
 * error message is displayed. The user is left on the cart page
 * without knowing why checkout failed.
 *
 * STEPS TO REPRODUCE:
 * 1. Create a new user account (starts with $0.00 balance)
 * 2. Add any book to the cart
 * 3. Navigate to the cart page
 * 4. Click the Checkout button
 * 5. Observe: No error message appears, checkout silently fails
 *
 * BUSINESS IMPACT:
 * Users may become frustrated and abandon the purchase flow
 * without understanding what action they need to take.
 */

test.describe('@bug-discovery Checkout Error Message Missing', () => {
  test.describe.configure({ timeout: 60_000, mode: 'serial' });

  // Helper to create and login a test user
  const createAndLoginUser = async (steps: any) => {
    const timestamp = Date.now();
    const username = `checkoutbug${timestamp}`;
    const email = `checkoutbug${timestamp}@example.com`;

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', username);
    await steps.fill('SignupPage', 'emailInput', email);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('Sidebar', 'logoutBtn');
  };

  test('BUG-002: should show error message after checkout with insufficient funds - FAILING', async ({ steps, page }) => {
    // Create a new user with $0 balance
    await createAndLoginUser(steps);

    // Add a book to cart
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    // Navigate to cart
    await steps.click('Sidebar', 'navCart');
    await steps.verifyPresence('CartPage', 'container');
    await steps.verifyPresence('CartPage', 'checkoutBtn');

    // Attempt checkout (should fail due to $0 balance)
    await steps.click('CartPage', 'checkoutBtn');
    await steps.waitForNetworkIdle();

    // User should remain on cart page (checkout failed)
    await steps.verifyUrlContains('/cart');

    // BUG: Error message should be displayed but is not
    const errorSelector = '[data-testid="error-message"]';
    const errorVisible = await page.locator(errorSelector).isVisible().catch(() => false);

    // This test documents that error message is NOT shown (bug confirmed)
    expect(errorVisible, 'BUG-002: Checkout error message should be displayed but is missing').toBe(false);
  });

  test('BUG-002: verify cart items remain after failed checkout', async ({ steps, page }) => {
    // Create a new user
    await createAndLoginUser(steps);

    // Add a book to cart
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    // Navigate to cart
    await steps.click('Sidebar', 'navCart');
    await steps.verifyPresence('CartPage', 'container');

    // Verify cart has items
    await steps.verifyAbsence('CartPage', 'emptyMessage');

    // Attempt checkout
    await steps.click('CartPage', 'checkoutBtn');
    await steps.waitForNetworkIdle();

    // Verify cart items are still present (good - they weren't cleared)
    await steps.verifyAbsence('CartPage', 'emptyMessage');
    await steps.verifyPresence('CartPage', 'total');

    console.log('Cart items remain after failed checkout - this is correct behavior');
  });

  // Cleanup
  test.afterEach(async ({ steps }) => {
    await steps.clickIfPresent('Sidebar', 'logoutBtn');
  });
});
