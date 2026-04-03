import { test, expect } from './fixtures/base';

test.describe('Book Detail', () => {
  test.describe.configure({ timeout: 60000 });

  test('should display book details page', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'page');
    await steps.verifyPresence('BookDetailPage', 'title');
    await steps.verifyPresence('BookDetailPage', 'author');
    await steps.verifyPresence('BookDetailPage', 'price');
    await steps.verifyPresence('BookDetailPage', 'description');
  });

  test('should display book title text', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyText('BookDetailPage', 'title', undefined, { notEmpty: true });
  });

  test('should display book genre', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'genre');
    await steps.verifyText('BookDetailPage', 'genre', undefined, { notEmpty: true });
  });

  test('should display book stock information', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'stock');
  });

  test('should show add to cart button when authenticated', async ({ steps, loginAsUser1 }) => {
    // Add to cart button only shows when logged in
    await loginAsUser1();
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'addToCartButton');
  });

  test('should show not found for invalid book ID', async ({ steps }) => {
    await steps.navigateTo('/books/invalid-book-id');
    await steps.verifyPresence('BookDetailPage', 'notFound');
  });

  test('should add book to cart when logged in', async ({ steps, loginAsUser1 }) => {
    await loginAsUser1();
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForState('Navigation', 'cartBadge', 'visible');
    await steps.verifyPresence('Navigation', 'cartBadge');
  });

  test('should not show add to cart button when not authenticated', async ({ steps }) => {
    // When not logged in, no add to cart button is shown
    await steps.navigateTo('/books/book-001');
    await steps.verifyAbsence('BookDetailPage', 'addToCartButton');
  });

  test('should navigate back to homepage from book detail', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.click('Navigation', 'allBooksLink');
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('HomePage', 'bookGrid');
  });
});
