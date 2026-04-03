import { test, expect } from '../fixtures/base';

test.describe('Orders', () => {
  test.describe.configure({ timeout: 60_000 });

  test('should display empty orders message when no orders exist', async ({ steps }) => {
    const timestamp = Date.now();

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `noorders${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `noorders${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'container');
    await steps.verifyPresence('OrdersPage', 'noOrders');
    await steps.verifyText('OrdersPage', 'noOrders', 'No orders yet');
  });

  test('should navigate to orders from sidebar', async ({ steps }) => {
    const timestamp = Date.now();

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `ordernav${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `ordernav${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    await steps.click('Sidebar', 'navOrders');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/orders');
    await steps.verifyPresence('OrdersPage', 'container');
  });

  test('should display orders page title', async ({ steps }) => {
    const timestamp = Date.now();

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `ordertitle${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `ordertitle${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/orders');
    await steps.verifyText('OrdersPage', 'title', 'Your Orders');
  });
});
