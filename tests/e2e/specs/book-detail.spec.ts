import { test, expect } from '../fixtures/base';

test.describe('BookDetailPage — View Book Details', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.waitForState('BookDetailPage', 'container');
  });

  test('displays book title', async ({ steps }) => {
    await steps.verifyText('BookDetailPage', 'title', 'To Kill a Mockingbird');
  });

  test('displays book author', async ({ steps }) => {
    await steps.verifyText('BookDetailPage', 'author', 'Harper Lee');
  });

  test('displays book genre', async ({ steps }) => {
    await steps.verifyText('BookDetailPage', 'genre', 'Fiction');
  });

  test('displays book description', async ({ steps }) => {
    await steps.verifyText('BookDetailPage', 'description', undefined, { notEmpty: true });
  });

  test('displays book price', async ({ steps }) => {
    await steps.verifyTextContains('BookDetailPage', 'price', '$12.99');
  });

  test('displays stock count', async ({ steps }) => {
    await steps.verifyText('BookDetailPage', 'stock', undefined, { notEmpty: true });
  });

  test('does not show add-to-cart button when not logged in', async ({ steps }) => {
    await steps.verifyAbsence('BookDetailPage', 'addToCartBtn');
  });
});
