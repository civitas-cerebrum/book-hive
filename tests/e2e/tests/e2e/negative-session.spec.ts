import { test, expect } from '../fixtures/base';

test.describe('Negative — Session & Permission Tests', () => {
  test.describe.configure({ timeout: 60_000 });

  test('@negative accessing cart without auth redirects to login', async ({ steps }) => {
    await steps.navigateTo('/cart');
    await steps.verifyUrlContains('/login');
  });

  test('@negative accessing orders without auth redirects to login', async ({ steps }) => {
    await steps.navigateTo('/orders');
    await steps.verifyUrlContains('/login');
  });

  test('@negative accessing profile without auth redirects to login', async ({ steps }) => {
    await steps.navigateTo('/profile');
    await steps.verifyUrlContains('/login');
  });

  test('@negative accessing sell page without auth redirects to login', async ({ steps }) => {
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyUrlContains('/login');
  });

  test('@negative accessing order detail without auth redirects to login', async ({ steps }) => {
    await steps.navigateTo('/orders/some-order-id');
    await steps.verifyUrlContains('/login');
  });

  test('@negative after logout, protected pages redirect to login', async ({ steps }) => {
    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Verify access to protected page
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'heading');

    // Logout
    await steps.click('Navigation', 'logoutButton');
    await steps.waitForNetworkIdle();

    // Now protected pages should redirect
    await steps.navigateTo('/cart');
    await steps.verifyUrlContains('/login');
  });

  test('@negative login with empty email and password stays on login', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/login');
  });

  test('@negative signup with empty fields stays on signup', async ({ steps }) => {
    await steps.navigateTo('/signup');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/signup');
  });
});
