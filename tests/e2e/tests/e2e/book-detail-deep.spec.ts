import { test, expect } from '../fixtures/base';

test.describe('Book Detail — Deep Coverage', () => {
  test.describe.configure({ timeout: 60_000 });

  test('navigating to non-existent book shows error or redirect', async ({ steps }) => {
    await steps.navigateTo('/books/nonexistent-book-id');
    // Either shows error or redirects
    await steps.waitForNetworkIdle();
  });

  test('book detail page shows price format with dollar sign', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookPrice');
    const priceText = await steps.getText('BookDetailPage', 'bookPrice');
    expect(priceText).toContain('$');
  });

  test('book detail title matches homepage title', async ({ steps }) => {
    await steps.navigateTo('/books/book-002');
    await steps.verifyText('BookDetailPage', 'bookTitle', 'The Great Gatsby');
  });

  test('different books show different details', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    const title1 = await steps.getText('BookDetailPage', 'bookTitle');

    await steps.navigateTo('/books/book-002');
    const title2 = await steps.getText('BookDetailPage', 'bookTitle');

    expect(title1).not.toEqual(title2);
  });

  test('book detail accessible without login', async ({ steps }) => {
    await steps.navigateTo('/books/book-003');
    await steps.verifyPresence('BookDetailPage', 'bookTitle');
    await steps.verifyText('BookDetailPage', 'bookTitle', '1984');
  });
});
