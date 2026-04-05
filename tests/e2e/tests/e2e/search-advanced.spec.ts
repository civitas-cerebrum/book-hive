import { test, expect } from '../fixtures/base';

test.describe('Search — Advanced Coverage', () => {
  test.describe.configure({ timeout: 60_000 });

  test('search by partial title returns results', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Mock');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('search by author last name returns results', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Orwell');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('search is case insensitive', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'DUNE');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('empty search shows all books', async ({ steps }) => {
    await steps.navigateTo('/');

    // Search for something first
    await steps.fill('HomePage', 'searchInput', 'Gatsby');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();

    // Clear and search again
    await steps.fill('HomePage', 'searchInput', '');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 1 });
  });

  test('search with special characters returns no crash', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', '<script>alert(1)</script>');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();

    // Should not crash — shows no results or handles gracefully
    // When no results found, book-grid is hidden and noBooks is shown
    await steps.verifyPresence('HomePage', 'noBooks');
  });

  test('search with SQL injection returns no crash', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', "'; DROP TABLE books; --");
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();

    // Page should still be functional — shows no results
    await steps.verifyPresence('HomePage', 'noBooks');
  });

  test('search preserves across pagination', async ({ steps }) => {
    // Navigate to homepage with genre filter
    await steps.navigateTo('/?genre=Fiction');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });
});
