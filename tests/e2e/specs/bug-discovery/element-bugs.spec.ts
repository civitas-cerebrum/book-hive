import { test, expect } from '../../fixtures/base';

test.describe('Bug Discovery — Element Bugs', () => {
  test.describe.configure({ timeout: 60_000 });

  /**
   * @bug BUG-001
   * @severity High
   * @phase 1a
   * @steps
   * 1. Navigate to /login
   * 2. Enter invalid credentials
   * 3. Click Sign In
   * 4. Observe that no error message appears
   * @expected An error message should be displayed informing the user of invalid credentials
   * @actual The 401 Axios interceptor redirects to /login silently — no error message is shown
   * @rootcause The global Axios interceptor in api.js catches ALL 401 responses and redirects
   *   to /login, even for the login endpoint itself. The LoginPage catch block never executes
   *   because the interceptor fires first.
   */
  test('@bug-discovery login error message not displayed on invalid credentials', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'wrong@email.com');
    await steps.fill('LoginPage', 'passwordInput', 'wrongpassword');
    await steps.click('LoginPage', 'submitButton');
    // Wait for the response to process
    await steps.page.waitForTimeout(3000);
    // BUG: The error message should appear but it does not
    // The correct behavior would be to show the login-error element
    await steps.verifyPresence('LoginPage', 'errorMessage');
  });

  /**
   * @bug BUG-002
   * @severity High
   * @phase 1a
   * @steps
   * 1. Sign up a new user (starts with $0.00 balance)
   * 2. Add a book to cart
   * 3. Navigate to cart
   * 4. Click Checkout
   * 5. Observe no error message — checkout silently fails
   * @expected An error message should inform the user they have insufficient balance
   * @actual The checkout API returns 400 but the cart page shows no error feedback
   */
  test('@bug-discovery checkout with insufficient balance shows no error message', async ({ steps }) => {
    await steps.page.request.post('http://localhost:8080/api/reset');
    // Sign up a new user with $0 balance
    const uniqueUser = `buguser_${Date.now()}`;
    await steps.navigateTo('/signup');
    await steps.waitForState('SignupPage', 'container');
    await steps.fill('SignupPage', 'usernameInput', uniqueUser);
    await steps.fill('SignupPage', 'emailInput', `${uniqueUser}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'Test1234!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');

    // Add item to cart
    await steps.clickNth('HomePage', 'addToCartButtons', 0);
    await steps.page.waitForTimeout(1000);

    // Go to cart and try checkout
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.verifyCount('CartPage', 'cartItems', { greaterThan: 0 });
    await steps.click('CartPage', 'checkoutBtn');
    await steps.page.waitForTimeout(3000);

    // BUG: Should show an error message, but stays on cart page with no feedback
    // The correct behavior is to show a checkout error element
    // Instead, the user is left on the cart with no indication of what happened
    await steps.verifyUrlContains('/orders/');
  });
});
