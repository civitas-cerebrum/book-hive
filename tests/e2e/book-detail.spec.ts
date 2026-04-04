import { test, expect } from './fixtures/base';

test.describe('BookDetailPage — Book Details', () => {
  test.describe.configure({ timeout: 60_000 });

  test('displays complete book information', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'page');
    await steps.verifyText('BookDetailPage', 'title', 'To Kill a Mockingbird');
    await steps.verifyText('BookDetailPage', 'author', 'Harper Lee');
    await steps.verifyTextContains('BookDetailPage', 'price', '$12.99');
    await steps.verifyText('BookDetailPage', 'description', undefined, { notEmpty: true });
    await steps.verifyText('BookDetailPage', 'stock', undefined, { notEmpty: true });
  });

  test('shows genre badge correctly', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyTextContains('BookDetailPage', 'genre', 'Fiction');
  });

  test('does not show add-to-cart button for unauthenticated users', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyAbsence('BookDetailPage', 'addToCartButton');
  });

  test('navigating to non-existent book shows not-found', async ({ steps }) => {
    await steps.navigateTo('/books/book-999');
    await steps.verifyPresence('BookDetailPage', 'notFound');
  });

  test('different book shows different details', async ({ steps }) => {
    await steps.navigateTo('/books/book-009');
    await steps.verifyPresence('BookDetailPage', 'page');
    await steps.verifyText('BookDetailPage', 'title', 'Dune');
    await steps.verifyText('BookDetailPage', 'author', 'Frank Herbert');
    await steps.verifyTextContains('BookDetailPage', 'genre', 'Sci-Fi');
  });
});
