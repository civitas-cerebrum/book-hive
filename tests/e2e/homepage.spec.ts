import { test, expect } from './fixtures/base';

test.describe('Homepage', () => {
  test.describe.configure({ timeout: 60000 });

  test('should display book grid', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('should display navigation elements', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Navigation', 'sidebar');
    await steps.verifyPresence('Navigation', 'logo');
    await steps.verifyPresence('Navigation', 'loginLink');
    await steps.verifyPresence('Navigation', 'signupLink');
  });

  test('should search books by title', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Mockingbird');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'bookTitleMockingbird');
  });

  test('should navigate to book detail from card', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('HomePage', 'bookCardFirst');
    await steps.verifyUrlContains('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'page');
  });

  test('should display pagination controls', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'pagination');
  });

  test('should paginate to next page', async ({ steps }) => {
    await steps.navigateTo('/');
    // Click next page - will work if there are more pages
    const clicked = await steps.clickIfPresent('HomePage', 'nextPage');
    if (clicked) {
      await steps.waitForNetworkIdle();
      await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
    }
  });

  test('should filter by Fiction genre', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('GenreFilter', 'fiction');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('should filter by Sci-Fi genre', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('GenreFilter', 'sciFi');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('should filter by Mystery genre', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('GenreFilter', 'mystery');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('should display theme toggle', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Navigation', 'themeToggle');
  });

  test('should clear search and show all books', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Mockingbird');
    await steps.waitForNetworkIdle();
    await steps.clearInput('HomePage', 'searchInput');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 1 });
  });
});
