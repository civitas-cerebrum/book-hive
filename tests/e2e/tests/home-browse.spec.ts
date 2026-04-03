import { test, expect } from '../fixtures/base';

test.describe('Home Page — Book Browsing', () => {
  test.describe.configure({ timeout: 60_000 });

  test('should display the home page with book grid', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'container');
    await steps.verifyPresence('HomePage', 'bookGrid');
  });

  test('should display book cards with correct information', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('should display pagination controls', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'pagination');
    await steps.verifyPresence('HomePage', 'prevPage');
    await steps.verifyPresence('HomePage', 'nextPage');
  });

  test('should navigate to next page when clicking Next', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyState('HomePage', 'prevPage', 'disabled');
    await steps.click('HomePage', 'nextPage');
    await steps.waitForNetworkIdle();
    await steps.verifyState('HomePage', 'prevPage', 'enabled');
  });

  test('should navigate back when clicking Previous', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('HomePage', 'nextPage');
    await steps.waitForNetworkIdle();
    await steps.verifyState('HomePage', 'prevPage', 'enabled');
    await steps.click('HomePage', 'prevPage');
    await steps.waitForNetworkIdle();
    await steps.verifyState('HomePage', 'prevPage', 'disabled');
  });

  test('should display sidebar navigation', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Sidebar', 'logo');
    await steps.verifyPresence('Sidebar', 'navAllBooks');
    await steps.verifyPresence('Sidebar', 'navMarketplace');
    await steps.verifyPresence('Sidebar', 'navLogin');
    await steps.verifyPresence('Sidebar', 'navSignup');
  });

  test('should display genre filter links in sidebar', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Sidebar', 'genreFilterFiction');
    await steps.verifyPresence('Sidebar', 'genreFilterSciFi');
    await steps.verifyPresence('Sidebar', 'genreFilterFantasy');
    await steps.verifyPresence('Sidebar', 'genreFilterMystery');
  });

  test('should filter books by Fiction genre', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'genreFilterFiction');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('genre=Fiction');
    await steps.verifyPresence('HomePage', 'bookGrid');
  });

  test('should filter books by Sci-Fi genre', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'genreFilterSciFi');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('genre=Sci-Fi');
    await steps.verifyPresence('HomePage', 'bookGrid');
  });

  test('should navigate to book detail page when clicking a book card', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/books/');
    await steps.verifyPresence('BookDetailPage', 'container');
  });
});
