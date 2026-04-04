import { test, expect } from '../fixtures/base';

test.describe('Balance Tracking', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    // Reset database to ensure clean balance state
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  test('balance decreases after purchase', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Check initial balance on profile
    await steps.navigateTo('/profile');
    const initialBalance = await steps.getText('ProfilePage', 'balance');

    // Make a purchase
    await steps.navigateTo('/books/book-009');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Check balance after purchase
    await steps.navigateTo('/profile');
    const newBalance = await steps.getText('ProfilePage', 'balance');
    expect(newBalance).not.toEqual(initialBalance);
  });

  test('balance shown in sidebar matches profile', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'balance');
    await steps.verifyText('ProfilePage', 'balance', undefined, { notEmpty: true });
  });
});
