import { test, expect } from '../fixtures/base';

/**
 * Stage 8: Search & Filter URL State
 * Tests URL state management: direct URL navigation, browser back/forward,
 * search input sync with URL, bookmarkability, and query param handling.
 */
test.describe('Search & Filter — URL State', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  // ─── Direct URL Navigation (Bookmarkability) ──────────────────

  test('@url-state direct navigation to /?query=Dune shows search results', async ({ steps, page }) => {
    await steps.navigateTo('/?query=Dune');
    await page.waitForTimeout(500);
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 1 });
  });

  test('@url-state direct navigation to /?genre=Mystery shows genre results', async ({ steps, page }) => {
    await steps.navigateTo('/?genre=Mystery');
    await page.waitForTimeout(500);
    await steps.verifyPresence('HomePage', 'homePage');
    const genres = await steps.getAll('HomePage', 'bookGenre');
    expect(genres.length).toBeGreaterThan(0);
    genres.forEach(g => expect(g).toBe('Mystery'));
  });

  test('@url-state direct navigation to /?query=nonexistent shows no-books', async ({ steps }) => {
    await steps.navigateTo('/?query=zzzzzzzzzzz');
    await steps.verifyPresence('HomePage', 'noBooks');
  });

  // ─── Search Input Syncs from URL ──────────────────────────────

  test('@url-state search input reflects query when navigating directly to /?query=Dune', async ({ steps, page }) => {
    // FIXED: SearchBar now reads from URL search params via useSearchParams
    await steps.navigateTo('/?query=Dune');
    await page.waitForTimeout(500);
    // Results show correctly
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 1 });
    // Search input now reflects the URL query
    const inputValue = await steps.getInputValue('HomePage', 'searchInput');
    expect(inputValue).toBe('Dune');
  });

  // ─── Browser Back/Forward with Search ──────────────────────────

  test('@url-state browser back returns to previous search results', async ({ steps, page }) => {
    // Start at home
    await steps.navigateTo('/');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 12 });

    // Search for Dune
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.verifyUrlContains('query=Dune');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 1 });

    // Go back
    await steps.backOrForward('back');
    await page.waitForTimeout(500);

    // Should return to all books
    const url = page.url();
    expect(url).not.toContain('query=');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 12 });
  });

  test('@url-state browser forward restores search results', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 12 });

    // Search for Dune
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.verifyUrlContains('query=Dune');

    // Go back
    await steps.backOrForward('back');
    await page.waitForTimeout(500);

    // Go forward — should restore search
    await steps.backOrForward('forward');
    await page.waitForTimeout(500);
    await steps.verifyUrlContains('query=Dune');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 1 });
  });

  // ─── Browser Back/Forward with Genre Filter ────────────────────

  test('@url-state browser back returns from genre filter to all books', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 12 });

    // Apply genre filter
    await steps.click('Navigation', 'genreFilterFiction');
    await steps.verifyUrlContains('genre=Fiction');

    // Go back
    await steps.backOrForward('back');
    await page.waitForTimeout(500);

    // Should be back to all books
    const url = page.url();
    expect(url).not.toContain('genre=');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 12 });
  });

  test('@url-state browser back from genre2 → genre1 → all books', async ({ steps, page }) => {
    await steps.navigateTo('/');

    // Apply Fiction filter
    await steps.click('Navigation', 'genreFilterFiction');
    await steps.verifyUrlContains('genre=Fiction');

    // Switch to Mystery
    await steps.click('Navigation', 'genreFilterMystery');
    await steps.verifyUrlContains('genre=Mystery');

    // Back → should return to Fiction
    await steps.backOrForward('back');
    await page.waitForTimeout(500);
    await steps.verifyUrlContains('genre=Fiction');
    const fictionGenres = await steps.getAll('HomePage', 'bookGenre');
    fictionGenres.forEach(g => expect(g).toBe('Fiction'));

    // Back again → should return to all books
    await steps.backOrForward('back');
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url).not.toContain('genre=');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 12 });
  });

  // ─── Search → Genre → Back Transitions ─────────────────────────

  test('@url-state search then genre filter: genre replaces search in URL', async ({ steps, page }) => {
    await steps.navigateTo('/');

    // Search first
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.verifyUrlContains('query=Dune');

    // Now apply genre filter via sidebar
    await steps.click('Navigation', 'genreFilterFiction');
    await steps.verifyUrlContains('genre=Fiction');

    // Search query should be gone (setSearchParams replaces all)
    const url = page.url();
    expect(url).not.toContain('query=');
  });

  test('@url-state genre then search: search replaces genre in URL', async ({ steps, page }) => {
    await steps.navigateTo('/');

    // Apply genre filter first
    await steps.click('Navigation', 'genreFilterMystery');
    await steps.verifyUrlContains('genre=Mystery');

    // Now search
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.verifyUrlContains('query=Dune');

    // Genre should be gone
    const url = page.url();
    expect(url).not.toContain('genre=');
  });

  // ─── Query Parameter Edge Cases ────────────────────────────────

  test('@url-state multiple query params — query takes priority over genre', async ({ steps, page }) => {
    // Backend: if query is present, genre is ignored (if-else chain)
    await steps.navigateTo('/?query=Dune&genre=Fiction');
    await page.waitForTimeout(500);
    // Dune is Sci-Fi, not Fiction. If query takes priority, Dune should appear.
    const titles = await steps.getAll('HomePage', 'bookTitle');
    expect(titles).toContain('Dune');
  });

  test('@url-state unknown query params are ignored', async ({ steps, page }) => {
    await steps.navigateTo('/?foo=bar&baz=123');
    await page.waitForTimeout(500);
    // Should show all books normally (extra params ignored)
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 12 });
    await steps.verifyPresence('HomePage', 'pagination');
  });

  test('@url-state URL with hash fragment still works', async ({ steps, page }) => {
    await steps.navigateTo('/?query=Dune#top');
    await page.waitForTimeout(500);
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 1 });
  });

  // ─── Page Refresh Preserves State ──────────────────────────────

  test('@url-state page refresh preserves search query', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.verifyUrlContains('query=Dune');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 1 });

    // Refresh the page
    await steps.refresh();
    await page.waitForTimeout(500);

    // URL and results should be preserved
    await steps.verifyUrlContains('query=Dune');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 1 });
  });

  test('@url-state page refresh preserves genre filter', async ({ steps, page }) => {
    await steps.navigateTo('/?genre=Biography');
    await page.waitForTimeout(500);
    const countBefore = await steps.getCount('HomePage', 'bookCard');

    await steps.refresh();
    await page.waitForTimeout(500);

    await steps.verifyUrlContains('genre=Biography');
    const countAfter = await steps.getCount('HomePage', 'bookCard');
    expect(countAfter).toBe(countBefore);
  });

  // ─── URL Encoding ─────────────────────────────────────────────

  test('@url-state special characters in query are URL-encoded', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'hello world');
    await steps.pressKey('Enter');
    // The space should be encoded in the URL
    const url = page.url();
    expect(url).toMatch(/query=hello[\+%20]world/);
  });

  test('@url-state URL-encoded search term is decoded and used', async ({ steps, page }) => {
    // Use URL-encoded space
    await steps.navigateTo('/?query=Frank%20Herbert');
    await page.waitForTimeout(500);
    const count = await steps.getCount('HomePage', 'bookCard');
    expect(count).toBeGreaterThan(0);
  });
});
