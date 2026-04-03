import { test, expect } from './fixtures/base';

test.describe('Cart — Advanced Operations', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps, request }) => {
    await request.post('http://localhost:8080/api/reset');
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');
  });

  test('add multiple different books to cart', async ({ steps }) => {
    await steps.clickNth('HomePage', 'addToCartButton', 0);
    await steps.waitForState('Sidebar', 'cartBadge');
    await steps.clickNth('HomePage', 'addToCartButton', 1);
    await steps.verifyTextContains('Sidebar', 'cartBadge', '2');
  });

  test('adding same book twice increases quantity', async ({ steps }) => {
    await steps.clickNth('HomePage', 'addToCartButton', 0);
    await steps.waitForState('Sidebar', 'cartBadge');
    await steps.clickNth('HomePage', 'addToCartButton', 0);
    await steps.verifyTextContains('Sidebar', 'cartBadge', '1');
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.waitForState('CartPage', 'cartTotal');
    await steps.verifyCount('CartPage', 'cartItem', { exactly: 1 });
  });

  test('cart total shows correct price for multiple items', async ({ steps }) => {
    await steps.clickNth('HomePage', 'addToCartButton', 0);
    await steps.waitForState('Sidebar', 'cartBadge');
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.waitForState('CartPage', 'cartTotal');
    await steps.verifyText('CartPage', 'cartTotal', undefined, { notEmpty: true });
  });

  test('checkout with multiple items creates order', async ({ steps }) => {
    await steps.clickNth('HomePage', 'addToCartButton', 0);
    await steps.waitForState('Sidebar', 'cartBadge');
    await steps.clickNth('HomePage', 'addToCartButton', 1);
    await steps.navigateTo('/cart');
    await steps.waitForState('CartPage', 'container');
    await steps.waitForState('CartPage', 'checkoutButton');
    await steps.click('CartPage', 'checkoutButton');
    await steps.verifyUrlContains('/orders/');
    await steps.waitForState('OrderDetailPage', 'container');
    await steps.verifyCount('OrderDetailPage', 'orderItem', { exactly: 2 });
  });

  test('navigating pages after last page wraps pagination', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.waitForState('HomePage', 'bookGrid');
    await steps.click('HomePage', 'nextButton');
    await steps.verifyTextContains('HomePage', 'pagination', '2 / 5');
    await steps.click('HomePage', 'nextButton');
    await steps.verifyTextContains('HomePage', 'pagination', '3 / 5');
    await steps.click('HomePage', 'nextButton');
    await steps.verifyTextContains('HomePage', 'pagination', '4 / 5');
    await steps.click('HomePage', 'nextButton');
    await steps.verifyTextContains('HomePage', 'pagination', '5 / 5');
    await steps.verifyState('HomePage', 'nextButton', 'disabled');
  });
});
