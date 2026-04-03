import { test, expect } from './fixtures/base';

test.describe('BookDetailPage', () => {
  test.describe.configure({ timeout: 60_000 });

  test('displays full book details', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.waitForState('BookDetailPage', 'container');
    await steps.verifyText('BookDetailPage', 'bookTitle', 'To Kill a Mockingbird');
    await steps.verifyText('BookDetailPage', 'bookAuthor', 'Harper Lee');
    await steps.verifyText('BookDetailPage', 'bookGenre', 'Fiction');
    await steps.verifyText('BookDetailPage', 'bookPrice', '$12.99');
    await steps.verifyTextContains('BookDetailPage', 'bookStock', 'in stock');
    await steps.verifyText('BookDetailPage', 'bookDescription', undefined, { notEmpty: true });
  });

  test('shows add to cart button when not logged in but no action', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.waitForState('BookDetailPage', 'container');
    await steps.verifyAbsence('BookDetailPage', 'addToCartButton');
  });

  test('shows not found for invalid book ID', async ({ steps }) => {
    await steps.navigateTo('/books/invalid-id');
    await steps.verifyPresence('BookDetailPage', 'notFound');
  });

  test('navigates back to home from book detail', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.waitForState('BookDetailPage', 'container');
    await steps.click('Sidebar', 'allBooksLink');
    await steps.verifyUrlContains('/');
    await steps.waitForState('HomePage', 'bookGrid');
  });
});
