import { test, expect } from '../fixtures/base';

test.describe('Book Detail — Extended Coverage', () => {
  test.describe.configure({ timeout: 60_000 });

  test('book detail shows author name', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookAuthor');
    await steps.verifyText('BookDetailPage', 'bookAuthor', 'Harper Lee');
  });

  test('book detail shows genre badge', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookGenre');
    await steps.verifyText('BookDetailPage', 'bookGenre', 'Fiction');
  });

  test('book detail shows description text', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookDescription');
    await steps.verifyText('BookDetailPage', 'bookDescription', undefined, { notEmpty: true });
  });

  test('sci-fi book shows correct genre', async ({ steps }) => {
    await steps.navigateTo('/books/book-009');
    await steps.verifyPresence('BookDetailPage', 'bookTitle');
    await steps.verifyText('BookDetailPage', 'bookTitle', 'Dune');
    await steps.verifyPresence('BookDetailPage', 'bookGenre');
    await steps.verifyText('BookDetailPage', 'bookGenre', 'Sci-Fi');
  });

  test('book detail price contains dollar sign', async ({ steps }) => {
    await steps.navigateTo('/books/book-002');
    await steps.verifyPresence('BookDetailPage', 'bookPrice');
    const price = await steps.getText('BookDetailPage', 'bookPrice');
    expect(price).toContain('$');
  });

  test('book detail stock shows numeric value', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'stockInfo');
    const stock = await steps.getText('BookDetailPage', 'stockInfo');
    expect(stock).toMatch(/\d+/);
  });

  test('navigating between different books updates content', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    const title1 = await steps.getText('BookDetailPage', 'bookTitle');

    await steps.navigateTo('/books/book-009');
    const title2 = await steps.getText('BookDetailPage', 'bookTitle');

    expect(title1).not.toEqual(title2);
  });

  test('non-existent book shows not found message', async ({ steps }) => {
    await steps.navigateTo('/books/nonexistent-id');
    await steps.waitForNetworkIdle();
    // App shows "Book not found" text when book ID doesn't exist
    await steps.verifyPresence('BookDetailPage', 'notFound');
  });
});
