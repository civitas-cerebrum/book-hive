import { test, expect } from '../fixtures/base';

test.describe('Search and Genre Filter Happy Paths', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@functional search-filter-happy searches for books by title and shows results', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Search for a known book title
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');

    // Verify URL contains query param
    await steps.verifyUrlContains('query=');

    // Verify search results appear
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('@functional search-filter-happy searches for books by author', async ({ steps }) => {
    await steps.navigateTo('/');

    // Search for a known author
    await steps.fill('HomePage', 'searchInput', 'Orwell');
    await steps.pressKey('Enter');

    await steps.verifyUrlContains('query=');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('@functional genre-filter-happy filters books by Fiction genre via sidebar', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Click Fiction genre in sidebar
    await steps.click('Navigation', 'genreFilterFiction');

    // Verify URL contains genre param
    await steps.verifyUrlContains('genre=Fiction');

    // Verify books are displayed
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('@functional genre-filter-happy filters books by Sci-Fi genre via sidebar', async ({ steps }) => {
    await steps.navigateTo('/');

    await steps.click('Navigation', 'genreFilterSciFi');
    await steps.verifyUrlContains('genre=Sci-Fi');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('@functional genre-filter-happy filters books by Mystery genre via sidebar', async ({ steps }) => {
    await steps.navigateTo('/');

    await steps.click('Navigation', 'genreFilterMystery');
    await steps.verifyUrlContains('genre=Mystery');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('@functional genre-filter-happy filters books by Fantasy genre via sidebar', async ({ steps }) => {
    await steps.navigateTo('/');

    // Genre chips are hidden on desktop (display:none) — use sidebar filter instead
    await steps.click('Navigation', 'genreFilterFantasy');
    await steps.verifyUrlContains('genre=Fantasy');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  // NOTE: Pagination test removed — covered more thoroughly by search-pagination.spec.ts
});
