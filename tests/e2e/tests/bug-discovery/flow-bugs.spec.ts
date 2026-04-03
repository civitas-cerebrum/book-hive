import { test, expect } from '../fixtures/base';

test.describe('Bug Discovery — Flow Bugs', () => {
  test.describe.configure({ timeout: 60_000 });

  /**
   * @bug BUG-001
   * @severity High
   * @phase 1a
   * @steps
   * 1. Navigate to /login
   * 2. Enter invalid credentials (wrong@example.com / WrongPass1!)
   * 3. Click Sign In
   * 4. Expect error message to be displayed on the login page
   */
  test('@bug-discovery login with invalid credentials should show error message but gets redirected', async ({ steps, page }) => {
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'wrong@example.com');
    await steps.fill('LoginPage', 'passwordInput', 'WrongPass1!');
    await steps.click('LoginPage', 'submitButton');
    // Wait for the redirect/error to happen
    await page.waitForTimeout(2000);
    // BUG: The 401 interceptor in api.js redirects to /login instead of letting
    // the catch block in LoginPage show the error message.
    // Expected: error message visible on login page
    // Actual: page redirects to /login with empty fields, no error shown
    await steps.verifyPresence('LoginPage', 'errorMessage');
  });

  /**
   * @bug BUG-002
   * @severity High
   * @phase 1b
   * @steps
   * 1. Login as testuser1
   * 2. Add book to cart
   * 3. Checkout
   * 4. Check sidebar balance — should show reduced amount
   */
  test('@bug-discovery sidebar balance should update after checkout', async ({ steps, request }) => {
    await request.post('http://localhost:8080/api/reset');
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');
    await steps.verifyTextContains('Sidebar', 'userBalance', '$100.00');

    // Add to cart and checkout
    await steps.clickNth('HomePage', 'addToCartButton', 0);
    await steps.waitForState('Sidebar', 'cartBadge');
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.click('CartPage', 'checkoutButton');
    await steps.verifyUrlContains('/orders/');
    await steps.waitForState('OrderDetailPage', 'container');

    // BUG: Sidebar balance should now show $87.01 (100 - 12.99)
    // but it still shows $100.00 because refreshUser() is never called after checkout
    const balance = await steps.getText('Sidebar', 'userBalance');
    expect(balance).toContain('$87.01');
  });

  /**
   * @bug BUG-003
   * @severity Medium
   * @phase 1b
   * @steps
   * 1. Login as testuser1
   * 2. Add book to cart
   * 3. Checkout
   * 4. Check cart badge — should be empty/hidden
   */
  test('@bug-discovery cart badge should clear after checkout', async ({ steps, request }) => {
    await request.post('http://localhost:8080/api/reset');
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');

    // Add to cart
    await steps.clickNth('HomePage', 'addToCartButton', 0);
    await steps.waitForState('Sidebar', 'cartBadge');
    await steps.verifyTextContains('Sidebar', 'cartBadge', '1');

    // Checkout
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.click('CartPage', 'checkoutButton');
    await steps.verifyUrlContains('/orders/');
    await steps.waitForState('OrderDetailPage', 'container');

    // BUG: Cart badge should disappear after checkout since cart is now empty
    // but the CartContext items are not refreshed after checkout
    await steps.verifyAbsence('Sidebar', 'cartBadge');
  });
});
