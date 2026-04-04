import { test, expect } from './fixtures/base';

test.describe('Book Detail — Extended', () => {
  test.describe.configure({ timeout: 60_000 });

  test('should show not-found for invalid book ID', async ({ steps }) => {
    await steps.navigateTo('/books/nonexistent-book-id');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('BookDetailPage', 'notFound');
  });

  test('should display all book detail fields for a Sci-Fi book', async ({ steps }) => {
    await steps.navigateTo('/books/book-009');
    await steps.verifyText('BookDetailPage', 'title', 'Dune');
    await steps.verifyText('BookDetailPage', 'author', 'Frank Herbert');
    await steps.verifyPresence('BookDetailPage', 'genre');
    await steps.verifyPresence('BookDetailPage', 'description');
    await steps.verifyPresence('BookDetailPage', 'price');
    await steps.verifyPresence('BookDetailPage', 'stock');
  });

  test('should show add to cart button when logged in', async ({ steps }) => {
    // Login first
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Navigate to book detail
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'addToCartButton');
  });

  test('should not show add to cart button when not logged in', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyAbsence('BookDetailPage', 'addToCartButton');
  });
});
