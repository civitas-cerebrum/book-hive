import { test, expect } from '../fixtures/base';

test.describe('Checkout Interrupted Path', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  // Unique: verifies user can complete checkout after re-login
  // (Cart persistence itself is covered by session-persistence.spec.ts)
  test('@functional checkout-interrupted user can complete checkout after re-login', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Add book to cart
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');

    // Log out then navigate to login
    await steps.click('Navigation', 'logoutBtn');
    await steps.navigateTo('/login');

    // Log back in
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Complete checkout
    await steps.click('Navigation', 'navCart');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });
    await steps.click('CartPage', 'checkoutBtn');

    // Verify order completed
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'COMPLETED');
  });
});
