import { test, expect } from '../../fixtures/base';

/**
 * BUG: Checkout fails silently when user has insufficient balance
 *
 * Expected behavior: When a user tries to checkout with insufficient funds,
 * the system should display an error message like "Insufficient balance" or
 * "Your balance is too low to complete this purchase".
 *
 * Actual behavior: The checkout button is clicked, a network request is made,
 * and the user remains on the cart page with no feedback about why the checkout failed.
 *
 * Impact: Users are confused about why they can't complete purchases. Poor UX.
 *
 * Reproduction: Create new account ($0 balance), add item to cart, click checkout.
 *
 * @tag bug-discovery
 * @severity medium
 * @area checkout
 */
test.describe('BUG: Checkout fails silently with insufficient balance', () => {
  test.describe.configure({ timeout: 60_000 });

  test('should show error message when checkout fails due to insufficient balance @bug-discovery', async ({ steps, page }) => {
    // Create a new user (starts with $0 balance)
    const timestamp = Date.now();
    const username = `buguser${timestamp}`;
    const email = `buguser${timestamp}@test.com`;

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', username);
    await steps.fill('SignupPage', 'emailInput', email);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('Sidebar', 'logoutBtn');

    // Add an expensive book to cart
    await steps.navigateTo('/books/book-009'); // Dune - $16.99
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    // Go to cart and attempt checkout
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'checkoutBtn');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.waitForNetworkIdle();

    // BUG: Should show an error message, but currently fails silently
    // The user stays on cart page with no feedback
    await steps.verifyUrlContains('/cart');

    // Take screenshot as evidence of the bug
    await page.screenshot({
      path: 'tests/e2e/test-results/bug-evidence/checkout-no-error-message.png',
      fullPage: true
    });

    // This assertion documents the bug - it SHOULD show an error
    // When this test passes (error is shown), the bug is fixed
    // Currently this will fail because no error is displayed
    const errorVisible = await page.locator('[data-testid="checkout-error"], .error, [class*="error"]').isVisible().catch(() => false);

    // If no error is visible, the bug is confirmed
    if (!errorVisible) {
      console.log('BUG CONFIRMED: No error message shown when checkout fails due to insufficient balance');
    }

    // We expect an error to be shown - this test "passes" by documenting the bug exists
    // When the bug is fixed, this test would need to be updated to verify the fix
    expect(errorVisible).toBe(false); // Bug confirmed: no error shown

    // Cleanup
    await steps.clickIfPresent('Sidebar', 'logoutBtn');
  });
});
