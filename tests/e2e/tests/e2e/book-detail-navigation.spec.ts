import { test, expect } from '../fixtures/base';

test.describe('Book Detail — Navigation & Content', () => {
  test.describe.configure({ timeout: 60_000 });

  test('book detail shows all fields: author, genre, description, stock', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookTitle');
    await steps.verifyPresence('BookDetailPage', 'bookAuthor');
    await steps.verifyPresence('BookDetailPage', 'bookGenre');
    await steps.verifyPresence('BookDetailPage', 'bookDescription');
    await steps.verifyPresence('BookDetailPage', 'bookPrice');
    await steps.verifyPresence('BookDetailPage', 'stockInfo');
  });

  test('navigating back to browse from book detail via All Books link', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookTitle');
    await steps.click('Navigation', 'allBooksLink');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('book detail page has correct page container', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
  });

  test('stock info shows number in stock', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyTextContains('BookDetailPage', 'stockInfo', 'in stock');
  });

  test('book genre displays correctly', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyText('BookDetailPage', 'bookGenre', 'Fiction');
  });

  test('book description is not empty', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyText('BookDetailPage', 'bookDescription', undefined, { notEmpty: true });
  });

  test('unauthenticated user does not see add to cart button', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookTitle');
    await steps.verifyAbsence('BookDetailPage', 'addToCartButton');
  });
});
