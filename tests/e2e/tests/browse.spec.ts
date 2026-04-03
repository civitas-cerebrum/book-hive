import { test, expect } from '../fixtures/base';

test.describe('Browse Books', () => {
  test.describe.configure({ timeout: 60_000 });

  test('should display home page with book grid', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'container');
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyPresence('HomePage', 'bookCardFirst');
  });

  test('should display pagination controls', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'pagination');
    await steps.verifyPresence('HomePage', 'prevPage');
    await steps.verifyPresence('HomePage', 'nextPage');
  });

  test('should navigate to next page', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.click('HomePage', 'nextPage');
    await steps.waitForNetworkIdle();
    // After clicking next, we should still see books
    await steps.verifyPresence('HomePage', 'bookGrid');
  });

  test('should filter books by genre - Fiction', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'genreFilterFiction');
    await steps.verifyUrlContains('genre=Fiction');
    await steps.verifyPresence('HomePage', 'bookGrid');
  });

  test('should filter books by genre - Sci-Fi', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'genreFilterSciFi');
    await steps.verifyUrlContains('genre=Sci-Fi');
    await steps.verifyPresence('HomePage', 'bookGrid');
  });

  test('should search for books', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Mockingbird');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('query=');
    await steps.verifyPresence('HomePage', 'bookGrid');
  });

  test('should navigate to book detail page from card', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'bookCardFirst');
    await steps.click('HomePage', 'bookCardFirst');
    await steps.verifyUrlContains('/books/');
    await steps.verifyPresence('BookDetailPage', 'container');
  });

  test('should display book detail page with all information', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'container');
    await steps.verifyPresence('BookDetailPage', 'title');
    await steps.verifyPresence('BookDetailPage', 'author');
    await steps.verifyPresence('BookDetailPage', 'genre');
    await steps.verifyPresence('BookDetailPage', 'description');
    await steps.verifyPresence('BookDetailPage', 'price');
    await steps.verifyPresence('BookDetailPage', 'stock');
  });

  test('should display correct book details for known book', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyText('BookDetailPage', 'title', 'To Kill a Mockingbird');
    await steps.verifyText('BookDetailPage', 'author', 'Harper Lee');
    await steps.verifyText('BookDetailPage', 'genre', 'Fiction');
    await steps.verifyTextContains('BookDetailPage', 'price', '$12.99');
  });

  test('should show sidebar navigation links', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Sidebar', 'logo');
    await steps.verifyPresence('Sidebar', 'navAllBooks');
    await steps.verifyPresence('Sidebar', 'navMarketplace');
    await steps.verifyPresence('Sidebar', 'genreFilterFiction');
    await steps.verifyPresence('Sidebar', 'genreFilterSciFi');
  });

  test('should navigate to marketplace from sidebar', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'navMarketplace');
    await steps.verifyUrlContains('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'container');
  });

  test('should return to all books from sidebar', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.click('Sidebar', 'navAllBooks');
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('HomePage', 'container');
  });
});
