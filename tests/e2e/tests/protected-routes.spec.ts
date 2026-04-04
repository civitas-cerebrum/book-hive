import { test, expect } from './fixtures/base';

test.describe('Protected Routes', () => {
  test.describe.configure({ timeout: 60_000 });

  test('should redirect unauthenticated users from protected routes to login', async ({ steps }) => {
    // Try accessing cart without auth
    await steps.navigateTo('/cart');
    await steps.verifyUrlContains('/login');
    await steps.verifyPresence('LoginPage', 'loginPage');

    // Try accessing orders without auth
    await steps.navigateTo('/orders');
    await steps.verifyUrlContains('/login');

    // Try accessing profile without auth
    await steps.navigateTo('/profile');
    await steps.verifyUrlContains('/login');

    // Try accessing sell page without auth
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyUrlContains('/login');
  });
});
