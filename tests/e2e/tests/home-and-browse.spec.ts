import { test, expect } from './fixtures/base';

test.describe('Home Page & Browsing', () => {
  test.describe.configure({ timeout: 60_000 });

  test('should display book catalog with search and pagination', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCards', { greaterThan: 0 });

    // Verify pagination
    await steps.verifyPresence('HomePage', 'pagination');
    await steps.verifyState('HomePage', 'prevPage', 'disabled');

    // Navigate to page 2
    await steps.click('HomePage', 'nextPage');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('HomePage', 'bookCards', { greaterThan: 0 });

    // Search for a book
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('HomePage', 'bookCards', { greaterThan: 0 });
  });

  test('should navigate to book detail page', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'title');
    await steps.verifyText('BookDetailPage', 'title', 'To Kill a Mockingbird');
    await steps.verifyPresence('BookDetailPage', 'price');
    await steps.verifyPresence('BookDetailPage', 'stock');
    await steps.verifyText('BookDetailPage', 'author', 'Harper Lee');
    await steps.verifyPresence('BookDetailPage', 'description');
  });

  test('should filter books by genre category', async ({ steps }) => {
    await steps.navigateTo('/?genre=Sci-Fi');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCards', { greaterThan: 0 });
  });
});
