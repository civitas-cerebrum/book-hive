import { test, expect } from '../fixtures/base';

test.describe('Browse and Purchase Happy Path', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ steps, page }) => {
    await page.request.post('http://localhost:8080/api/reset');
    // Log in as testuser2 (reset gives $100 balance)
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
  });

  test('@functional browse-and-purchase-happy completes full purchase from catalog browse', async ({ steps }) => {
    // Step 1: View book catalog on home page
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });

    // Step 2: Click first book card to view details
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    await steps.verifyText('BookDetailPage', 'bookDetailTitle', undefined, { notEmpty: true });
    await steps.verifyText('BookDetailPage', 'bookDetailPrice', undefined, { notEmpty: true });

    // Step 3: Add book to cart
    await steps.click('BookDetailPage', 'addToCartDetail');

    // Step 4: Navigate to cart via sidebar
    await steps.click('Navigation', 'navCart');
    await steps.verifyPresence('CartPage', 'cartPage');

    // Step 5: Verify item is in cart with correct details
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });
    await steps.verifyText('CartPage', 'cartTotal', undefined, { notEmpty: true });

    // Step 6: Checkout
    await steps.click('CartPage', 'checkoutBtn');

    // Step 7: Verify order confirmation page
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
    await steps.verifyText('OrderDetailPage', 'orderTotal', undefined, { notEmpty: true });
  });

  test('@functional browse-and-purchase-happy cart badge updates after adding item', async ({ steps }) => {
    // Click first book card
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');

    // Add to cart
    await steps.click('BookDetailPage', 'addToCartDetail');

    // Navigate to cart and verify items
    await steps.click('Navigation', 'navCart');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });
  });

  test('@functional browse-and-purchase-happy order shows COMPLETED status', async ({ steps }) => {
    // Quick purchase flow
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');

    // Verify order status is COMPLETED
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
    await steps.verifyTextContains('OrderDetailPage', 'orderStatus', 'COMPLETED');
  });

  test('@functional browse-and-purchase-happy cart is empty after checkout', async ({ steps }) => {
    // Purchase a book
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');

    // Go back to cart and verify it's empty
    await steps.click('Navigation', 'navCart');
    await steps.verifyPresence('CartPage', 'cartEmpty');
  });
});
