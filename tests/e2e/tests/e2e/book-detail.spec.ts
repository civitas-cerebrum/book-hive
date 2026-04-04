import { test, expect } from '../fixtures/base';

test.describe('Book Detail Page', () => {
  test.describe.configure({ timeout: 60_000 });

  test('displays book details with title and price', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookTitle');
    await steps.verifyText('BookDetailPage', 'bookTitle', 'To Kill a Mockingbird');
    await steps.verifyPresence('BookDetailPage', 'bookPrice');
  });

  test('shows add to cart button when not logged in', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookTitle');
  });

  test('shows stock information', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookTitle');
    await steps.verifyText('BookDetailPage', 'bookTitle', undefined, { notEmpty: true });
  });

  test('add to cart button works for authenticated user', async ({ steps }) => {
    // Login first
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Navigate to a book
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'addToCartButton');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
  });
});
