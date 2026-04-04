import { test, expect } from '../fixtures/base';

test.describe('Book Detail Page', () => {
  test.describe.configure({ timeout: 60_000 });

  test('displays book details when navigating to book page', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyText('BookDetailPage', 'bookTitle', 'To Kill a Mockingbird');
    await steps.verifyTextContains('BookDetailPage', 'authorName', 'Harper Lee');
    await steps.verifyTextContains('BookDetailPage', 'bookPrice', '$12.99');
    await steps.verifyText('BookDetailPage', 'stockInfo', undefined, { notEmpty: true });
  });

  test('navigates from home to book detail by clicking card', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyPresence('BookDetailPage', 'bookTitle');
    await steps.verifyUrlContains('/books/');
  });
});
