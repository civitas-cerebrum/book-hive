import { test, expect } from '../fixtures/base';

test.describe('Login Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@functional login-happy signs in with valid credentials and redirects to home', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'loginForm');

    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');

    // Verify redirect to home page
    await steps.verifyPresence('HomePage', 'homePage');

    // Verify authenticated state — nav shows user-specific elements
    await steps.verifyPresence('Navigation', 'navCart');
    await steps.verifyPresence('Navigation', 'navOrders');
    await steps.verifyPresence('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'userBalance');
  });

  test('@functional login-happy displays balance after login', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');

    await steps.verifyPresence('HomePage', 'homePage');
    // Balance should be visible and non-empty
    await steps.verifyText('Navigation', 'userBalance', undefined, { notEmpty: true });
  });

  // NOTE: "authenticated user sees add-to-cart buttons" test removed — covered by permission-visibility.spec.ts
});
