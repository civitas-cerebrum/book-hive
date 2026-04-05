import { test, expect } from '../fixtures/base';

test.describe('Responsive — Mobile Viewport', () => {
  test.describe.configure({ timeout: 60_000 });

  test.use({ viewport: { width: 375, height: 812 } });

  test('homepage loads and shows books on mobile', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('book detail page renders on mobile', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookTitle');
    await steps.verifyPresence('BookDetailPage', 'bookPrice');
    await steps.verifyPresence('BookDetailPage', 'bookAuthor');
  });

  test('login page functional on mobile', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'emailInput');
    await steps.verifyPresence('LoginPage', 'passwordInput');
    await steps.verifyPresence('LoginPage', 'submitButton');

    // Verify login works
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/');
  });

  test('cart page renders on mobile', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'heading');
  });

  test('marketplace page renders on mobile', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'heading');
  });

  test('signup page renders on mobile', async ({ steps }) => {
    await steps.navigateTo('/signup');
    await steps.verifyPresence('SignupPage', 'heading');
    await steps.verifyPresence('SignupPage', 'usernameInput');
    await steps.verifyPresence('SignupPage', 'emailInput');
    await steps.verifyPresence('SignupPage', 'passwordInput');
  });

  test('pagination works on mobile', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'pagination');
    await steps.click('HomePage', 'nextPage');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });
});
