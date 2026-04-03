import { test, expect } from '../../fixtures/base';

/**
 * Bug Discovery Tests - Checkout Error Handling
 *
 * These tests document discovered bugs where error messages are not shown to users.
 * @tag bug-discovery
 */
test.describe('Checkout Error Handling Bugs', () => {
  test.describe.configure({ timeout: 90_000 });

  const signupNewUser = async (steps: any) => {
    const timestamp = Date.now();
    const email = `bugtest${timestamp}@example.com`;
    const username = `bugtest${timestamp}`;

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', username);
    await steps.fill('SignupPage', 'emailInput', email);
    await steps.fill('SignupPage', 'passwordInput', 'Password123!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'container');
  };

  test('@bug-discovery: checkout with insufficient funds shows no error message', async ({ steps, page }) => {
    // BUG: When user has $0 balance and tries to checkout, the API returns 400
    // but no error message is displayed to the user. The button just does nothing.

    await signupNewUser(steps);

    // Add a book to cart
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Go to cart
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'container');

    // Verify we have $0 balance (user balance element includes "Balance: $0.00")
    const balanceText = await page.locator('[data-testid="user-balance"]').textContent();
    expect(balanceText).toContain('$0.00');

    // Try to checkout - should fail silently (this is the bug)
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // BUG EVIDENCE: We should still be on cart page with an error message
    // but instead we're on cart page with NO error message shown
    const currentUrl = page.url();
    expect(currentUrl).toContain('/cart'); // We didn't navigate away

    // The bug: There should be an error message visible, but there isn't
    // This test documents the bug - it will fail when the bug is fixed
    const errorVisible = await page.locator('[data-testid="checkout-error"]').isVisible({ timeout: 2000 }).catch(() => false);

    // Bug assertion: Currently no error is shown (errorVisible is false)
    // When fixed, this should show an error message
    expect(errorVisible).toBe(false); // Bug: This SHOULD be true when fixed
  });

  test('@bug-discovery: exceeding stock quantity shows no error message', async ({ steps, page }) => {
    // BUG: When user tries to increase cart quantity beyond available stock,
    // the API returns 400 but no error message is shown. The + button just stops working.

    await signupNewUser(steps);

    // Add a book to cart
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Go to cart
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'container');

    // Try to increase quantity many times (book has ~15 stock)
    const increaseBtn = page.locator('[data-testid^="cart-qty-plus-"]').first();
    await increaseBtn.waitFor({ state: 'visible' });

    // Click 20 times quickly to exceed stock
    for (let i = 0; i < 20; i++) {
      await increaseBtn.click();
      await page.waitForTimeout(50);
    }
    await steps.waitForNetworkIdle();

    // Get the final quantity - should be capped at stock (14 or 15)
    const qtyElement = page.locator('[data-testid^="cart-qty-"]:not([data-testid*="plus"]):not([data-testid*="minus"])').first();
    const qtyText = await qtyElement.textContent();
    const qty = parseInt(qtyText || '0', 10);

    // The quantity is capped correctly
    expect(qty).toBeLessThanOrEqual(15);

    // BUG: No error message is shown explaining why you can't add more
    // The + button just silently fails with 400 errors in console
    const stockErrorVisible = await page.locator('[data-testid="stock-error"]').isVisible({ timeout: 1000 }).catch(() => false);

    // Bug assertion: Currently no error is shown
    expect(stockErrorVisible).toBe(false); // Bug: This SHOULD be true when fixed
  });
});
