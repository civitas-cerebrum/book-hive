import { test, expect } from '../fixtures/base';

test.describe('Cart Badge & Balance Display', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  test('sidebar shows balance for authenticated user', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.verifyPresence('Navigation', 'balanceDisplay');
    await steps.verifyText('Navigation', 'balanceDisplay', undefined, { notEmpty: true });
  });

  test('sidebar balance contains dollar sign and amount', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    const balanceText = await steps.getText('Navigation', 'balanceDisplay');
    expect(balanceText).toContain('$');
    expect(balanceText).toContain('100.00');
  });

  test('balance decreases after checkout and reflects in profile', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Capture initial balance from profile page
    await steps.navigateTo('/profile');
    const initialBalance = await steps.getText('ProfilePage', 'balance');

    // Add item and checkout
    await steps.navigateTo('/books/book-006');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Check profile balance updated
    await steps.navigateTo('/profile');
    const newBalance = await steps.getText('ProfilePage', 'balance');
    expect(newBalance).not.toEqual(initialBalance);
  });

  test('balance is restored after returning an order', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Record balance before purchase
    await steps.navigateTo('/profile');
    const beforePurchase = await steps.getText('ProfilePage', 'balance');

    // Create and checkout an order
    await steps.navigateTo('/books/book-006');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Record balance after purchase
    await steps.navigateTo('/profile');
    const afterPurchase = await steps.getText('ProfilePage', 'balance');
    expect(afterPurchase).not.toEqual(beforePurchase);

    // Return the order
    await steps.navigateTo('/orders');
    await steps.clickNth('OrdersPage', 'orderCard', 0);
    await steps.click('OrderDetailPage', 'returnButton');
    await steps.waitForNetworkIdle();

    // Verify balance was restored
    await steps.navigateTo('/profile');
    const afterReturn = await steps.getText('ProfilePage', 'balance');
    expect(afterReturn).toEqual(beforePurchase);
  });

  test('unauthenticated user does not see balance', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyAbsence('Navigation', 'balanceDisplay');
  });
});
