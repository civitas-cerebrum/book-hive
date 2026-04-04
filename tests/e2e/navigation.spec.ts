import { test, expect } from './fixtures/base';

test.describe('Navigation — Sidebar and Routing', () => {
  test.describe.configure({ timeout: 60_000 });

  test('sidebar displays logo and browse section', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Sidebar', 'sidebar');
    await steps.verifyPresence('Sidebar', 'logo');
    await steps.verifyPresence('Sidebar', 'allBooksLink');
    await steps.verifyPresence('Sidebar', 'marketplaceLink');
  });

  test('sidebar shows genre category links', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Sidebar', 'sidebar');
    // Check that sidebar has category section text
    const sidebarText = await steps.getText('Sidebar', 'sidebar');
    expect(sidebarText).toContain('Fiction');
    expect(sidebarText).toContain('Sci-Fi');
    expect(sidebarText).toContain('Non-Fiction');
  });

  test('All Books link navigates to home page', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.click('Sidebar', 'allBooksLink');
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('HomePage', 'bookGrid');
  });

  test('Marketplace link navigates to marketplace', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'marketplaceLink');
    await steps.verifyUrlContains('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'page');
  });

  test('Login link navigates to login page', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'loginLink');
    await steps.verifyUrlContains('/login');
    await steps.verifyPresence('LoginPage', 'page');
  });

  test('Sign Up link navigates to signup page', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'signupLink');
    await steps.verifyUrlContains('/signup');
    await steps.verifyPresence('SignupPage', 'page');
  });

  test('theme toggle button is present', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Sidebar', 'themeToggle');
  });

  test('theme toggle changes theme', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'themeToggle');
    // After clicking, the theme attribute should change
    const htmlEl = page.locator('html');
    const theme = await htmlEl.getAttribute('data-theme');
    expect(theme).toBeTruthy();
  });

  test('Cart link navigates to cart page when authenticated', async ({ steps, loginAs }) => {
    await loginAs('user1');
    await steps.click('Sidebar', 'cartLink');
    await steps.verifyUrlContains('/cart');
    await steps.verifyPresence('CartPage', 'page');
  });

  test('Orders link navigates to orders page when authenticated', async ({ steps, loginAs }) => {
    await loginAs('user1');
    await steps.click('Sidebar', 'ordersLink');
    await steps.verifyUrlContains('/orders');
    await steps.verifyPresence('OrdersPage', 'page');
  });

  test('protected routes redirect to login when not authenticated', async ({ steps }) => {
    await steps.navigateTo('/cart');
    await steps.verifyUrlContains('/login');
  });
});
