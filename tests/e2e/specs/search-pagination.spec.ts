import { test, expect } from '../fixtures/base';

/**
 * Stage 8: Search + Pagination Interaction
 * Tests how pagination interacts with search queries and genre filters,
 * including page reset on new search, multi-page search results, and
 * pagination state across filter changes.
 */
test.describe('Search & Filter — Pagination Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  // ─── Pagination Basics (Catalog) ───────────────────────────────

  test('@pagination full catalog has 5 pages of 12 books', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'pagination');
    await steps.verifyTextContains('HomePage', 'pagination', '1 / 5');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 12 });
  });

  test('@pagination previous button disabled on first page', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyState('HomePage', 'prevPage', 'disabled');
  });

  test('@pagination next button disabled on last page', async ({ steps, page }) => {
    await steps.navigateTo('/');

    // Navigate to page 5 (last page)
    for (let i = 0; i < 4; i++) {
      await steps.click('HomePage', 'nextPage');
      await page.waitForTimeout(300);
    }
    await steps.verifyTextContains('HomePage', 'pagination', '5 / 5');
    await steps.verifyState('HomePage', 'nextPage', 'disabled');
  });

  test('@pagination last page shows remaining books (less than 12)', async ({ steps, page }) => {
    await steps.navigateTo('/');

    // Navigate to last page (page 5)
    for (let i = 0; i < 4; i++) {
      await steps.click('HomePage', 'nextPage');
      await page.waitForTimeout(300);
    }
    await steps.verifyTextContains('HomePage', 'pagination', '5 / 5');
    // 50 books total, 4 full pages of 12 = 48, last page = 2
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 2 });
  });

  // ─── Search Resets Pagination ──────────────────────────────────

  test('@pagination search resets to page 1', async ({ steps, page }) => {
    await steps.navigateTo('/');

    // Navigate to page 3
    await steps.click('HomePage', 'nextPage');
    await page.waitForTimeout(300);
    await steps.click('HomePage', 'nextPage');
    await page.waitForTimeout(300);
    await steps.verifyTextContains('HomePage', 'pagination', '3 / 5');

    // Now search — should reset to page 1
    await steps.fill('HomePage', 'searchInput', 'the');
    await steps.pressKey('Enter');
    await page.waitForTimeout(500);

    // "the" has 28 results = 3 pages. Should be on page 1.
    await steps.verifyTextContains('HomePage', 'pagination', '1 / 3');
  });

  test('@pagination BUG: sidebar genre NavLink does NOT reset page state', async ({ steps, page }) => {
    // BUG DOCUMENTED: Sidebar genre links use <NavLink to="/?genre=Fiction"> which navigates
    // via React Router without calling handleGenre(). The page state (from useState) is NOT
    // reset to 0, so if the user was on page 2 of all-books, clicking a genre sidebar link
    // fetches genre books at page 1 (0-indexed), which may be empty for small genre sets.
    // The fix would be to either: (a) add a useEffect that resets page to 0 when genre changes,
    // or (b) use onClick handlers on genre NavLinks instead of direct navigation.
    await steps.navigateTo('/');

    // Navigate to page 2
    await steps.click('HomePage', 'nextPage');
    await page.waitForTimeout(300);
    await steps.verifyTextContains('HomePage', 'pagination', '2 / 5');

    // Apply genre filter via sidebar — page state carries over (BUG)
    await steps.click('Navigation', 'genreFilterFiction');
    await steps.verifyUrlContains('genre=Fiction');
    await page.waitForTimeout(500);

    // Fiction has 8 books (all on page 0). Since page state is still 1,
    // the API returns page 1 of Fiction = empty → "No books found"
    await steps.verifyPresence('HomePage', 'noBooks');
  });

  test('@pagination genre filter resets when navigating from page 1 (no stale page)', async ({ steps, page }) => {
    // When the user is on page 1 (page state = 0), the genre filter works correctly
    await steps.navigateTo('/');
    await steps.verifyTextContains('HomePage', 'pagination', '1 / 5');

    // Apply genre filter from page 1 — works because page state is already 0
    await steps.click('Navigation', 'genreFilterFiction');
    await steps.verifyUrlContains('genre=Fiction');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 8 });
    await steps.verifyAbsence('HomePage', 'pagination');
  });

  // ─── Multi-page Search Results ─────────────────────────────────

  test('@pagination search with multi-page results shows correct pagination', async ({ steps, page }) => {
    // "the" matches 28 books = 3 pages
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'the');
    await steps.pressKey('Enter');
    await page.waitForTimeout(500);

    await steps.verifyPresence('HomePage', 'pagination');
    await steps.verifyTextContains('HomePage', 'pagination', '1 / 3');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 12 });
  });

  test('@pagination can navigate through multi-page search results', async ({ steps, page }) => {
    await steps.navigateTo('/?query=the');
    await page.waitForTimeout(500);

    // Page 1
    await steps.verifyTextContains('HomePage', 'pagination', '1 / 3');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 12 });

    // Page 2
    await steps.click('HomePage', 'nextPage');
    await page.waitForTimeout(500);
    await steps.verifyTextContains('HomePage', 'pagination', '2 / 3');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 12 });

    // Page 3 (last page — 28 - 24 = 4 books)
    await steps.click('HomePage', 'nextPage');
    await page.waitForTimeout(500);
    await steps.verifyTextContains('HomePage', 'pagination', '3 / 3');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 4 });
    await steps.verifyState('HomePage', 'nextPage', 'disabled');
  });

  // ─── Pagination State Preserved in URL? ────────────────────────

  test('@pagination page number is NOT in URL (maintained in React state)', async ({ steps, page }) => {
    await steps.navigateTo('/');

    // Navigate to page 2
    await steps.click('HomePage', 'nextPage');
    await page.waitForTimeout(300);
    await steps.verifyTextContains('HomePage', 'pagination', '2 / 5');

    // The page number is stored in React state, not URL params
    const url = page.url();
    expect(url).not.toContain('page=');
  });

  test('@pagination page refresh resets to page 1 (state not in URL)', async ({ steps, page }) => {
    await steps.navigateTo('/');

    // Navigate to page 3
    await steps.click('HomePage', 'nextPage');
    await page.waitForTimeout(300);
    await steps.click('HomePage', 'nextPage');
    await page.waitForTimeout(300);
    await steps.verifyTextContains('HomePage', 'pagination', '3 / 5');

    // Refresh resets React state → back to page 1
    await steps.refresh();
    await page.waitForTimeout(500);
    await steps.verifyTextContains('HomePage', 'pagination', '1 / 5');
  });

  // ─── Single Result — No Pagination ─────────────────────────────

  test('@pagination single result search hides pagination', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');

    await steps.verifyCount('HomePage', 'bookCard', { exactly: 1 });
    // Only 1 result = totalPages: 1 → pagination hidden (totalPages > 1 check)
    await steps.verifyAbsence('HomePage', 'pagination');
  });

  // ─── No Results — No Pagination ────────────────────────────────

  test('@pagination no-result search hides pagination', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'xyznonexistent');
    await steps.pressKey('Enter');

    await steps.verifyPresence('HomePage', 'noBooks');
    await steps.verifyAbsence('HomePage', 'pagination');
  });

  // ─── New Search from Paginated Results ─────────────────────────

  test('@pagination new search from page 2 resets back to page 1 of new results', async ({ steps, page }) => {
    // Start with multi-page search
    await steps.navigateTo('/?query=the');
    await page.waitForTimeout(500);

    // Navigate to page 2
    await steps.click('HomePage', 'nextPage');
    await page.waitForTimeout(300);
    await steps.verifyTextContains('HomePage', 'pagination', '2 / 3');

    // New search overrides
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await page.waitForTimeout(500);

    // Should be on page 1 of new results
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 1 });
    await steps.verifyAbsence('HomePage', 'pagination');
  });
});
