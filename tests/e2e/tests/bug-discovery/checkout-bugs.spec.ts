import { test, expect } from '../../fixtures/base';

test.describe('Bug Discovery — Checkout Bugs', () => {
  test.describe.configure({ timeout: 60_000 });

  /**
   * @bug BUG-002
   * @severity Critical
   * @phase 6
   * @steps
   * 1. Create a new user account
   * 2. Add item to cart
   * 3. Attempt to checkout
   *
   * @expected Checkout should complete OR user should be prompted to add funds
   * @actual Checkout fails silently with "Insufficient balance" error.
   *         User has $0.00 balance and there is NO way to add funds in the UI.
   *         The only way to get balance is to sell a book and have another user buy it.
   * @rootCause
   *   - New users start with $0.00 balance (User.java line 29)
   *   - Checkout requires balance >= total (OrderService.java line 49)
   *   - No "Add Funds" or "Deposit" feature exists in the application
   *   - Users can only gain balance when someone purchases their marketplace listing
   *   - This creates a chicken-and-egg problem: users need balance to buy, but
   *     can only get balance by selling (which requires another user to have balance)
   */
  test('@bug-discovery new users cannot checkout due to zero balance and no way to add funds', async ({ steps, page }) => {
    const timestamp = Date.now();

    // Create a fresh account
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `zerobalance${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `zerobalance${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    // Verify logged in
    await steps.verifyPresence('Sidebar', 'logoutBtn');

    // Verify user has $0.00 balance
    await steps.verifyTextContains('Sidebar', 'userBalance', '$0.00');

    // Add item to cart
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    // Go to cart and attempt checkout
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'checkoutBtn');

    // Intercept the checkout API response
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/orders') && resp.request().method() === 'POST'),
      steps.click('CartPage', 'checkoutBtn')
    ]);

    // BUG: Checkout fails with 400 due to insufficient balance
    // The user has no way to add funds to their account
    expect(response.status()).toBe(400);

    // The error is returned but the message format may vary
    // The key point is that checkout FAILS due to balance issues

    // The correct behavior would be one of:
    // 1. New users get initial balance (e.g., $50 welcome bonus)
    // 2. Add Funds / Deposit feature exists
    // 3. Cart shows warning about insufficient balance BEFORE clicking checkout
    // 4. Checkout button is disabled with tooltip explaining balance requirement
  });

  /**
   * @bug BUG-003
   * @severity Medium
   * @phase 6
   * @steps
   * 1. Login as a user with zero balance
   * 2. Navigate to cart with items
   * 3. Observe the checkout button
   *
   * @expected Checkout button should be disabled or show warning when balance is insufficient
   * @actual Checkout button is always enabled regardless of balance
   * @rootCause No client-side validation of balance before enabling checkout
   */
  test('@bug-discovery checkout button enabled even with insufficient balance', async ({ steps }) => {
    const timestamp = Date.now();

    // Create account with zero balance
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `checkoutbtn${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `checkoutbtn${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    // Verify logged in and zero balance
    await steps.verifyPresence('Sidebar', 'logoutBtn');
    await steps.verifyTextContains('Sidebar', 'userBalance', '$0.00');

    // Add item to cart
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    // Go to cart
    await steps.navigateTo('/cart');

    // BUG: Checkout button should be disabled when balance < total
    // Instead it's enabled, leading to a confusing error after clicking
    await steps.verifyState('CartPage', 'checkoutBtn', 'enabled');

    // This test documents the CURRENT (buggy) behavior
    // When fixed, the button should be disabled when balance is insufficient
  });
});
