import { test, expect } from '../fixtures/base';

test.describe('Protected Routes — Auth Required', () => {
  test.describe.configure({ timeout: 60_000 });

  test('cart page redirects to login when not authenticated', async ({ steps }) => {
    await steps.navigateTo('/cart');
    await steps.verifyUrlContains('/login');
  });

  test('orders page redirects to login when not authenticated', async ({ steps }) => {
    await steps.navigateTo('/orders');
    await steps.verifyUrlContains('/login');
  });

  test('profile page redirects to login when not authenticated', async ({ steps }) => {
    await steps.navigateTo('/profile');
    await steps.verifyUrlContains('/login');
  });

  test('create listing page redirects to login when not authenticated', async ({ steps }) => {
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyUrlContains('/login');
  });

  test('marketplace is accessible without authentication', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'heading');
  });

  test('homepage is accessible without authentication', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'bookGrid');
  });

  test('book detail is accessible without authentication', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookTitle');
  });

  test('login page is accessible', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'heading');
  });

  test('signup page is accessible', async ({ steps }) => {
    await steps.navigateTo('/signup');
    await steps.verifyPresence('SignupPage', 'heading');
  });
});
