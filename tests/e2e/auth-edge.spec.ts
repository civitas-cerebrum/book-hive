import { test, expect, TEST_USERS } from './fixtures/base';

test.describe('Authentication — Edge Cases', () => {
  test.describe.configure({ timeout: 60_000 });

  test('duplicate signup with existing email shows error', async ({ steps, resetApp }) => {
    await resetApp();
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', 'duplicate');
    await steps.fill('SignupPage', 'emailInput', TEST_USERS.user1.email);
    await steps.fill('SignupPage', 'passwordInput', 'Password123');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();
    // Should show error or stay on page
    await steps.verifyUrlContains('/signup');
  });

  test('signup form has required validation', async ({ steps, page }) => {
    await steps.navigateTo('/signup');
    // Submit empty form
    await steps.click('SignupPage', 'submitButton');
    // HTML5 validation should prevent submission
    await steps.verifyUrlContains('/signup');
    // Check email field has required attribute
    const emailRequired = await page.locator("[data-testid='signup-email']").getAttribute('required');
    expect(emailRequired).not.toBeNull();
  });

  test('login form has required validation', async ({ steps, page }) => {
    await steps.navigateTo('/login');
    await steps.click('LoginPage', 'submitButton');
    await steps.verifyUrlContains('/login');
    const emailRequired = await page.locator("[data-testid='login-email']").getAttribute('required');
    expect(emailRequired).not.toBeNull();
  });

  test('user balance shows $100 for seeded users', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');
    const balance = await steps.getText('Sidebar', 'userBalance');
    expect(balance).toContain('$100.00');
  });

  test('login persists across page navigations', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');
    await steps.navigateTo('/');
    await steps.verifyPresence('Sidebar', 'logoutButton');
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('Sidebar', 'logoutButton');
    await steps.navigateTo('/cart');
    await steps.verifyPresence('Sidebar', 'logoutButton');
  });

  test('signup creates user with zero balance', async ({ steps, resetApp }) => {
    await resetApp();
    const email = `newuser-${Date.now()}@test.com`;
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', 'newuserbalance');
    await steps.fill('SignupPage', 'emailInput', email);
    await steps.fill('SignupPage', 'passwordInput', 'Password123');
    await steps.click('SignupPage', 'submitButton');
    await steps.verifyUrlContains('/');
    const balance = await steps.getText('Sidebar', 'userBalance');
    expect(balance).toContain('$0.00');
  });
});
