import { test, expect } from '../fixtures/base';

test.describe('Navigation — Sidebar & Routing', () => {
  test.describe.configure({ timeout: 60_000 });

  test.describe('Unauthenticated Navigation', () => {
    test.beforeEach(async ({ steps }) => {
      await steps.navigateTo('/');
      await steps.waitForState('HomePage', 'bookGrid');
    });

    test('sidebar shows login and signup links when not authenticated', async ({ steps }) => {
      await steps.verifyPresence('Sidebar', 'navLogin');
      await steps.verifyPresence('Sidebar', 'navSignup');
    });

    test('sidebar hides cart, orders, sell, profile when not authenticated', async ({ steps }) => {
      await steps.verifyAbsence('Sidebar', 'navCart');
      await steps.verifyAbsence('Sidebar', 'navOrders');
      await steps.verifyAbsence('Sidebar', 'navSell');
      await steps.verifyAbsence('Sidebar', 'navProfile');
    });

    test('All Books link navigates to home', async ({ steps }) => {
      await steps.navigateTo('/marketplace');
      await steps.waitForState('MarketplacePage', 'container');
      await steps.click('Sidebar', 'allBooksLink');
      await steps.waitForState('HomePage', 'bookGrid');
      await steps.verifyUrlContains('/');
    });

    test('Marketplace link navigates to marketplace', async ({ steps }) => {
      await steps.click('Sidebar', 'marketplaceLink');
      await steps.waitForState('MarketplacePage', 'container');
      await steps.verifyUrlContains('/marketplace');
    });

    test('Login link navigates to login page', async ({ steps }) => {
      await steps.click('Sidebar', 'navLogin');
      await steps.verifyUrlContains('/login');
      await steps.verifyPresence('LoginPage', 'container');
    });

    test('Signup link navigates to signup page', async ({ steps }) => {
      await steps.click('Sidebar', 'navSignup');
      await steps.verifyUrlContains('/signup');
      await steps.verifyPresence('SignupPage', 'container');
    });

    test('protected route /cart redirects to login', async ({ steps }) => {
      await steps.navigateTo('/cart');
      await steps.verifyUrlContains('/login');
    });

    test('protected route /orders redirects to login', async ({ steps }) => {
      await steps.navigateTo('/orders');
      await steps.verifyUrlContains('/login');
    });

    test('protected route /profile redirects to login', async ({ steps }) => {
      await steps.navigateTo('/profile');
      await steps.verifyUrlContains('/login');
    });

    test('protected route /marketplace/sell redirects to login', async ({ steps }) => {
      await steps.navigateTo('/marketplace/sell');
      await steps.verifyUrlContains('/login');
    });
  });

  test.describe('Authenticated Navigation', () => {
    test.beforeEach(async ({ steps }) => {
      await steps.page.request.post('http://localhost:8080/api/reset');
      await steps.navigateTo('/login');
      await steps.waitForState('LoginPage', 'container');
      await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
      await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
      await steps.click('LoginPage', 'submitButton');
      await steps.waitForState('HomePage', 'bookGrid');
    });

    test('sidebar shows cart, orders, sell, profile when authenticated', async ({ steps }) => {
      await steps.verifyPresence('Sidebar', 'navCart');
      await steps.verifyPresence('Sidebar', 'navOrders');
      await steps.verifyPresence('Sidebar', 'navSell');
      await steps.verifyPresence('Sidebar', 'navProfile');
    });

    test('sidebar hides login and signup when authenticated', async ({ steps }) => {
      await steps.verifyAbsence('Sidebar', 'navLogin');
      await steps.verifyAbsence('Sidebar', 'navSignup');
    });

    test('Cart link navigates to cart page', async ({ steps }) => {
      await steps.click('Sidebar', 'navCart');
      await steps.verifyUrlContains('/cart');
      await steps.verifyPresence('CartPage', 'container');
    });

    test('Orders link navigates to orders page', async ({ steps }) => {
      await steps.click('Sidebar', 'navOrders');
      await steps.verifyUrlContains('/orders');
      await steps.verifyPresence('OrdersPage', 'container');
    });

    test('Sell a Book link navigates to create listing', async ({ steps }) => {
      await steps.click('Sidebar', 'navSell');
      await steps.verifyUrlContains('/marketplace/sell');
      await steps.verifyPresence('CreateListingPage', 'container');
    });

    test('Profile link navigates to profile page', async ({ steps }) => {
      await steps.click('Sidebar', 'navProfile');
      await steps.verifyUrlContains('/profile');
      await steps.verifyPresence('ProfilePage', 'container');
    });

    test('Logout button logs out and shows login/signup links', async ({ steps }) => {
      await steps.click('Sidebar', 'logoutBtn');
      await steps.waitForState('Sidebar', 'navLogin');
      await steps.verifyPresence('Sidebar', 'navLogin');
      await steps.verifyPresence('Sidebar', 'navSignup');
      await steps.verifyAbsence('Sidebar', 'logoutBtn');
    });

    test('balance is displayed in sidebar', async ({ steps }) => {
      await steps.verifyPresence('Sidebar', 'balanceDisplay');
      await steps.verifyTextContains('Sidebar', 'balanceDisplay', '$100.00');
    });
  });
});
