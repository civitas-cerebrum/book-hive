import { test, expect } from '../fixtures/base';

test.describe('Bug Discovery — Flow Probing', () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeAll(async () => {
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  /**
   * @bug BUG-005
   * @severity High
   * @phase 1b
   * @steps
   * 1. Login as testuser1
   * 2. Add a book to cart
   * 3. Checkout
   * 4. Observe the balance in the sidebar on the order confirmation page
   * 5. Assert the balance has decreased — but it still shows the old pre-checkout value
   */
  test('@bug-discovery balance display is stale on order confirmation page after checkout', async ({ steps, page }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Record initial balance from the sidebar
    const initialBalance = await steps.getText('Navigation', 'balanceDisplay');

    // Add a book to cart and checkout
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Now on order confirmation page — verify balance has updated
    // BUG: The balance in the sidebar still shows the pre-checkout amount.
    // It only updates after a full page navigation. The checkout should
    // refresh the balance display in the navigation bar.
    const postCheckoutBalance = await steps.getText('Navigation', 'balanceDisplay');
    expect(
      postCheckoutBalance,
      `Expected balance to change after checkout, but sidebar still shows ${postCheckoutBalance} (same as initial ${initialBalance})`
    ).not.toEqual(initialBalance);
  });

  /**
   * @bug BUG-006
   * @severity Medium
   * @phase 1b
   * @steps
   * 1. Login as testuser1
   * 2. Add a book to cart (badge shows "Cart1")
   * 3. Checkout
   * 4. Observe the cart badge on the order confirmation page
   * 5. Assert the cart badge no longer shows an item count — but it still shows "Cart1"
   */
  test('@bug-discovery cart badge still shows item count on order confirmation page after checkout', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Ensure cart is empty first
    await steps.navigateTo('/cart');
    await steps.clickIfPresent('CartPage', 'cartClear');
    await steps.waitForNetworkIdle();

    // Add a book and checkout
    await steps.navigateTo('/books/book-003');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Now on order confirmation page — cart badge should show "Cart" with no number
    // BUG: The badge still shows "Cart1" because the cart state is not refreshed
    // after a successful checkout on the order confirmation page.
    const cartText = await steps.getText('Navigation', 'cartLink');
    expect(
      cartText,
      `Expected cart badge to show "Cart" (no count) after checkout, but got "${cartText}"`
    ).toBe('Cart');
  });

  /**
   * @bug BUG-007
   * @severity Medium
   * @phase 1b
   * @steps
   * 1. Login as testuser1
   * 2. Add a book to cart
   * 3. Logout
   * 4. Login again
   * 5. Observe that the cart badge shows "Cart" (no count) even though items are persisted
   * 6. Navigate to /cart to verify the items ARE there
   * 7. Assert the cart badge should show the correct count on login
   */
  test('@bug-discovery cart badge count not loaded on login despite server-side persistence', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Ensure cart is empty, then add an item
    await steps.navigateTo('/cart');
    await steps.clickIfPresent('CartPage', 'cartClear');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/books/book-005');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Verify badge shows Cart1
    const cartBefore = await steps.getText('Navigation', 'cartLink');
    expect(cartBefore).toContain('1');

    // Logout
    await steps.click('Navigation', 'logoutButton');
    await steps.waitForNetworkIdle();

    // Login again
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // BUG: The cart badge shows "Cart" with no count even though the items are
    // persisted server-side. The app does not fetch the cart count on login.
    // The design spec says "Cart survives logout/login" — but the UI doesn't reflect it.
    const cartAfterLogin = await steps.getText('Navigation', 'cartLink');
    expect(
      cartAfterLogin,
      `Expected cart badge to show item count after re-login, but got "${cartAfterLogin}"`
    ).toContain('1');
  });

  /**
   * @bug BUG-008
   * @severity High
   * @phase 1b
   * @steps
   * 1. Register a new user with exactly $100 balance
   * 2. Add items to cart totaling more than $100
   * 3. Click Checkout
   * 4. Observe the page stays on /cart but no error message is displayed
   * 5. Assert an error message should be visible
   */
  test('@bug-discovery no visible error message when checkout fails due to insufficient balance', async ({ steps, page }) => {
    // Register a fresh user to ensure clean $100 balance
    const uid = Date.now();
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `bugtest${uid}`);
    await steps.fill('SignupPage', 'emailInput', `bugtest${uid}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Add expensive items to exceed $100 balance
    // Add book-009 (Dune $16.99) qty 7 = $118.93 > $100
    await steps.navigateTo('/books/book-009');
    for (let i = 0; i < 7; i++) {
      await steps.click('BookDetailPage', 'addToCartButton');
      await steps.waitForNetworkIdle();
    }

    // Go to cart and checkout
    await steps.navigateTo('/cart');
    await steps.waitForNetworkIdle();
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Should stay on cart page
    await steps.verifyUrlContains('/cart');

    // BUG: No error message is shown. The user sees the same cart page with no
    // explanation of why checkout failed. There should be a visible error like
    // "Insufficient balance" or "Not enough funds".
    const pageText = await page.locator('[data-testid="cart-page"]').innerText();
    const hasErrorText = /insufficient|not enough|balance|funds|cannot|error/i.test(pageText);
    expect(
      hasErrorText,
      'Expected an error message about insufficient balance, but no error text found on page'
    ).toBe(true);
  });

  /**
   * @bug BUG-009
   * @severity Medium
   * @phase 1b
   * @steps
   * 1. Login as testuser1
   * 2. Purchase a book
   * 3. Return the order
   * 4. Attempt to return the same order again via API
   * 5. Observe error message says "Return window has expired" instead of "Order already returned"
   */
  test('@bug-discovery misleading error when returning an already-returned order', async ({ steps, page }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Purchase a book via UI
    await steps.navigateTo('/cart');
    await steps.clickIfPresent('CartPage', 'cartClear');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/books/book-008');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // We should now be on the order detail page — return the order via UI
    await steps.click('OrderDetailPage', 'returnButton');
    await steps.waitForNetworkIdle();

    // Now try to return the same order again via API
    // Extract the order ID from the URL
    const orderId = page.url().split('/orders/')[1];
    const result = await page.evaluate(async (id) => {
      const res = await fetch(`/api/orders/${id}/return`, { method: 'POST' });
      const text = await res.text();
      let message = '';
      try { message = JSON.parse(text).message; } catch { message = text; }
      return { status: res.status, message };
    }, orderId);

    // BUG: The error message says "Return window has expired" when it should say something
    // like "Order already returned". The two are different error conditions:
    //   - "Return window has expired" = order is COMPLETED but 10 minutes have passed
    //   - "Order already returned" = order status is already RETURNED
    // The backend conflates these two states.
    expect(result.status).toBe(400);
    expect(
      result.message,
      `Expected error about "already returned" but got "${result.message}"`
    ).toMatch(/already\s*returned/i);
  });
});
