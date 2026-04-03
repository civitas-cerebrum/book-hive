import { test, expect } from '../../fixtures/base';

test.describe('Browse Books', () => {
  test.describe.configure({ timeout: 60_000 });

  test('should display the home page with book catalog', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'container');
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyPresence('HomePage', 'searchInput');
  });

  test('should display sidebar navigation for unauthenticated user', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Sidebar', 'logo');
    await steps.verifyPresence('Sidebar', 'allBooksLink');
    await steps.verifyPresence('Sidebar', 'marketplaceLink');
    await steps.verifyPresence('Sidebar', 'loginLink');
    await steps.verifyPresence('Sidebar', 'signupLink');
  });

  test('should display pagination when multiple pages exist', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'pagination');
    await steps.verifyPresence('HomePage', 'nextPageButton');
    await steps.verifyState('HomePage', 'prevPageButton', 'disabled');
  });

  test('should navigate to next page and enable previous button', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('HomePage', 'nextPageButton');
    await steps.waitForNetworkIdle();
    await steps.verifyState('HomePage', 'prevPageButton', 'enabled');
  });

  test('should search books by title', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('query=Dune');
  });

  test('should filter books by genre from sidebar', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'genreFilterFiction');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('genre=Fiction');
  });

  test('should navigate to book detail page when clicking a book card', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('HomePage', 'firstBookCard');
    await steps.verifyPresence('BookDetailPage', 'container');
  });

  test('should display book details correctly', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'container');
    await steps.verifyText('BookDetailPage', 'title', 'To Kill a Mockingbird');
    await steps.verifyText('BookDetailPage', 'author', 'Harper Lee');
    await steps.verifyText('BookDetailPage', 'genre', 'Fiction');
    await steps.verifyTextContains('BookDetailPage', 'price', '$12.99');
    await steps.verifyTextContains('BookDetailPage', 'stock', 'in stock');
  });

  test('should not show add to cart button when not logged in', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'container');
    await steps.verifyAbsence('BookDetailPage', 'addToCartButton');
  });

  test('should display marketplace page with listings', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'container');
  });
});
