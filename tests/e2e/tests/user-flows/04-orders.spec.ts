import { test, expect } from '../../fixtures/base';

test.describe('Orders', () => {
  test.describe.configure({ timeout: 60_000 });

  // Helper to signup a new user (no balance)
  const signupNewUser = async (steps: any) => {
    const timestamp = Date.now();
    const email = `orderuser${timestamp}@example.com`;
    const username = `orderuser${timestamp}`;

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', username);
    await steps.fill('SignupPage', 'emailInput', email);
    await steps.fill('SignupPage', 'passwordInput', 'Password123!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'container');
  };

  test('should display orders page', async ({ steps }) => {
    await signupNewUser(steps);
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'container');
  });

  test('should display no orders message for new user', async ({ steps }) => {
    await signupNewUser(steps);
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'noOrdersMessage');
  });

  test('should navigate to orders from sidebar', async ({ steps }) => {
    await signupNewUser(steps);
    await steps.click('Sidebar', 'ordersLink');
    await steps.verifyPresence('OrdersPage', 'container');
  });
});
