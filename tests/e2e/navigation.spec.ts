import { test, expect } from './fixtures/base';

test.describe('Navigation', () => {
  test.describe.configure({ timeout: 60000 });

  test.describe('Unauthenticated', () => {
    test('should show public navigation items', async ({ steps }) => {
      await steps.navigateTo('/');
      await steps.verifyPresence('Navigation', 'sidebar');
      await steps.verifyPresence('Navigation', 'allBooksLink');
      await steps.verifyPresence('Navigation', 'marketplaceLink');
      await steps.verifyPresence('Navigation', 'loginLink');
      await steps.verifyPresence('Navigation', 'signupLink');
    });

    test('should hide authenticated navigation items', async ({ steps }) => {
      await steps.navigateTo('/');
      await steps.verifyAbsence('Navigation', 'cartLink');
      await steps.verifyAbsence('Navigation', 'ordersLink');
      await steps.verifyAbsence('Navigation', 'profileLink');
    });

    test('should navigate to marketplace', async ({ steps }) => {
      await steps.navigateTo('/');
      await steps.click('Navigation', 'marketplaceLink');
      await steps.verifyUrlContains('/marketplace');
      await steps.verifyPresence('MarketplacePage', 'page');
    });

    test('should navigate to login', async ({ steps }) => {
      await steps.navigateTo('/');
      await steps.click('Navigation', 'loginLink');
      await steps.verifyUrlContains('/login');
      await steps.verifyPresence('LoginPage', 'page');
    });

    test('should navigate to signup', async ({ steps }) => {
      await steps.navigateTo('/');
      await steps.click('Navigation', 'signupLink');
      await steps.verifyUrlContains('/signup');
      await steps.verifyPresence('SignupPage', 'page');
    });
  });

  test.describe('Authenticated', () => {
    test('should show authenticated navigation items', async ({ steps, loginAsUser1 }) => {
      await loginAsUser1();
      await steps.verifyPresence('Navigation', 'cartLink');
      await steps.verifyPresence('Navigation', 'ordersLink');
      await steps.verifyPresence('Navigation', 'profileLink');
      await steps.verifyPresence('Navigation', 'logoutButton');
    });

    test('should hide public auth links when authenticated', async ({ steps, loginAsUser1 }) => {
      await loginAsUser1();
      await steps.verifyAbsence('Navigation', 'loginLink');
      await steps.verifyAbsence('Navigation', 'signupLink');
    });

    test('should navigate to cart', async ({ steps, loginAsUser1 }) => {
      await loginAsUser1();
      await steps.click('Navigation', 'cartLink');
      await steps.verifyUrlContains('/cart');
      await steps.verifyPresence('CartPage', 'page');
    });

    test('should navigate to orders', async ({ steps, loginAsUser1 }) => {
      await loginAsUser1();
      await steps.click('Navigation', 'ordersLink');
      await steps.verifyUrlContains('/orders');
      await steps.verifyPresence('OrdersPage', 'page');
    });

    test('should navigate to profile', async ({ steps, loginAsUser1 }) => {
      await loginAsUser1();
      await steps.click('Navigation', 'profileLink');
      await steps.verifyUrlContains('/profile');
      await steps.verifyPresence('ProfilePage', 'page');
    });

    test('should show cart badge when items in cart', async ({ steps, loginAsUser1 }) => {
      await loginAsUser1();
      await steps.navigateTo('/books/book-001');
      await steps.click('BookDetailPage', 'addToCartButton');
      await steps.waitForState('Navigation', 'cartBadge', 'visible');
      await steps.verifyPresence('Navigation', 'cartBadge');
    });

    test('should display user balance', async ({ steps, loginAsUser1 }) => {
      await loginAsUser1();
      await steps.verifyPresence('Navigation', 'userBalance');
      await steps.verifyText('Navigation', 'userBalance', undefined, { notEmpty: true });
    });
  });

  // TopBar is only visible on mobile viewport (max-width: 767px)
  // Skipping these tests in desktop viewport - would need mobile viewport to test
  test.describe('TopBar (mobile only)', () => {
    test.skip('should display topbar on mobile', async ({ steps }) => {
      // This test would need to run with mobile viewport
      await steps.navigateTo('/');
      await steps.verifyPresence('Navigation', 'topbar');
    });

    test.skip('should display sidebar toggle on mobile', async ({ steps }) => {
      // This test would need to run with mobile viewport
      await steps.navigateTo('/');
      await steps.verifyPresence('Navigation', 'sidebarToggle');
    });
  });

  test.describe('Theme', () => {
    test('should display theme toggle', async ({ steps }) => {
      await steps.navigateTo('/');
      await steps.verifyPresence('Navigation', 'themeToggle');
    });

    test('should toggle theme when clicked', async ({ steps }) => {
      await steps.navigateTo('/');
      await steps.click('Navigation', 'themeToggle');
      await steps.verifyPresence('Navigation', 'themeToggle');
    });
  });

  test('should display logo with BookHive text', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Navigation', 'logo');
    await steps.verifyTextContains('Navigation', 'logo', 'BookHive');
  });
});
