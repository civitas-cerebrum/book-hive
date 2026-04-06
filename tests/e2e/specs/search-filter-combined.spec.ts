import { test, expect } from '../fixtures/base';

/**
 * Stage 8: Combined Filter Tests
 * Tests interactions between search and genre filters — how they override
 * each other, clearing behavior, and navigation flow between filtered states.
 */
test.describe('Search & Filter — Combined & Clearing Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  // ─── Query Overrides Genre ─────────────────────────────────────

  test('@combined query param takes priority over genre param in API', async ({ steps, page }) => {
    // When both query and genre are set, backend's if-else prioritizes query
    // Dune is Sci-Fi, so if genre=Fiction + query=Dune, we should still see Dune
    await steps.navigateTo('/?query=Dune&genre=Fiction');
    await page.waitForTimeout(500);
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 1 });
    const titles = await steps.getAll('HomePage', 'bookTitle');
    expect(titles).toContain('Dune');
  });

  // ─── Switching from Search to Genre Clears Search ──────────────

  test('@combined applying genre after search clears search from URL', async ({ steps, page }) => {
    await steps.navigateTo('/');

    // Search first
    await steps.fill('HomePage', 'searchInput', 'Herbert');
    await steps.pressKey('Enter');
    await steps.verifyUrlContains('query=Herbert');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });

    // Apply genre filter via sidebar
    await steps.click('Navigation', 'genreFilterBiography');
    await page.waitForTimeout(500);

    // URL should only have genre, no query
    const url = page.url();
    expect(url).toContain('genre=Biography');
    expect(url).not.toContain('query=');

    // Results should be biography books only
    const genres = await steps.getAll('HomePage', 'bookGenre');
    genres.forEach(g => expect(g).toBe('Biography'));
  });

  // ─── Switching from Genre to Search Clears Genre ───────────────

  test('@combined searching after genre filter clears genre from URL', async ({ steps, page }) => {
    await steps.navigateTo('/');

    // Apply genre first
    await steps.click('Navigation', 'genreFilterFantasy');
    await steps.verifyUrlContains('genre=Fantasy');

    // Now search
    await steps.fill('HomePage', 'searchInput', 'Orwell');
    await steps.pressKey('Enter');
    await page.waitForTimeout(500);

    // URL should only have query, no genre
    const url = page.url();
    expect(url).toContain('query=Orwell');
    expect(url).not.toContain('genre=');
  });

  // ─── Clearing Search Returns All Books ─────────────────────────

  test('@combined clearing search input and submitting returns all books', async ({ steps, page }) => {
    // Start with a search
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.verifyUrlContains('query=Dune');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 1 });

    // Clear input and submit empty
    await steps.fill('HomePage', 'searchInput', '');
    await steps.pressKey('Enter');
    await page.waitForTimeout(500);

    // Should return all books (empty query = no filter)
    const url = page.url();
    expect(url).not.toContain('query=');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 12 });
    await steps.verifyPresence('HomePage', 'pagination');
  });

  // ─── All Books Link Clears Everything ──────────────────────────

  test('@combined All Books sidebar link clears search query', async ({ steps, page }) => {
    await steps.navigateTo('/?query=Herbert');
    await page.waitForTimeout(500);
    await steps.verifyUrlContains('query=');

    await steps.click('Navigation', 'navAllBooks');
    await page.waitForTimeout(500);

    const url = page.url();
    expect(url).not.toContain('query=');
    expect(url).not.toContain('genre=');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 12 });
  });

  test('@combined All Books sidebar link clears genre filter', async ({ steps, page }) => {
    await steps.navigateTo('/?genre=Mystery');
    await page.waitForTimeout(500);

    await steps.click('Navigation', 'navAllBooks');
    await page.waitForTimeout(500);

    const url = page.url();
    expect(url).not.toContain('genre=');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 12 });
  });

  // ─── Rapid Filter Switching ────────────────────────────────────

  test('@combined rapid genre switching shows correct final results', async ({ steps, page }) => {
    await steps.navigateTo('/');

    // Rapidly switch genres
    await steps.click('Navigation', 'genreFilterFiction');
    await steps.click('Navigation', 'genreFilterSciFi');
    await steps.click('Navigation', 'genreFilterMystery');
    await page.waitForTimeout(800);

    // Final state should be Mystery
    await steps.verifyUrlContains('genre=Mystery');
    const genres = await steps.getAll('HomePage', 'bookGenre');
    genres.forEach(g => expect(g).toBe('Mystery'));
  });

  // ─── Search → Book Detail → Back ──────────────────────────────

  test('@combined search, click book, back returns to search results', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.verifyUrlContains('query=Dune');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 1 });

    // Click the book card to go to detail
    await steps.click('HomePage', 'bookCard');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    await steps.verifyUrlContains('/books/');

    // Go back
    await steps.backOrForward('back');
    await page.waitForTimeout(500);

    // Should restore search results
    await steps.verifyUrlContains('query=Dune');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 1 });
  });

  test('@combined genre filter, click book, back returns to genre results', async ({ steps, page }) => {
    await steps.navigateTo('/?genre=Fantasy');
    await page.waitForTimeout(500);
    const countBefore = await steps.getCount('HomePage', 'bookCard');

    // Click first book card
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');

    // Go back
    await steps.backOrForward('back');
    await page.waitForTimeout(500);

    // Should restore genre filter
    await steps.verifyUrlContains('genre=Fantasy');
    const countAfter = await steps.getCount('HomePage', 'bookCard');
    expect(countAfter).toBe(countBefore);
  });

  // ─── Navigating Away and Back ──────────────────────────────────

  test('@combined search state preserved after navigating to marketplace and back', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.verifyUrlContains('query=Dune');

    // Navigate to marketplace
    await steps.click('Navigation', 'navMarketplace');
    await page.waitForTimeout(300);

    // Go back to search results
    await steps.backOrForward('back');
    await page.waitForTimeout(500);

    // Search results should be restored
    await steps.verifyUrlContains('query=Dune');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 1 });
  });

  // ─── Search While Authenticated ────────────────────────────────

  test('@combined search works identically when logged in', async ({ steps, page }) => {
    // Login first
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await page.waitForTimeout(500);

    // Search
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await page.waitForTimeout(500);
    await steps.verifyUrlContains('query=Dune');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 1 });

    // Authenticated users also see add-to-cart buttons on search results
    await steps.verifyPresence('HomePage', 'addToCartBtn');
  });

  test('@combined genre filter shows add-to-cart buttons for authenticated users', async ({ steps, page }) => {
    // Login first
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await page.waitForTimeout(500);

    // Apply genre filter
    await steps.click('Navigation', 'genreFilterSciFi');
    await page.waitForTimeout(500);
    await steps.verifyUrlContains('genre=Sci-Fi');

    // Verify add-to-cart buttons are visible for authenticated users (multiple elements — use count)
    await steps.verifyCount('HomePage', 'addToCartBtn', { greaterThan: 0 });
    const genres = await steps.getAll('HomePage', 'bookGenre');
    genres.forEach(g => expect(g).toBe('Sci-Fi'));
  });

  // ─── API Error Handling via Route Interception ─────────────────

  test('@combined API failure during search shows empty state', async ({ steps, page }) => {
    // Set up route interception BEFORE navigating to the page
    // The home page fetches books on mount, so we intercept first
    await page.route('**/api/books**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await steps.navigateTo('/');
    await page.waitForTimeout(500);

    // API error — the .then() handler doesn't run, books stays as [] (initial state)
    // Loading finishes via .finally(), and empty books array → shows "No books found"
    await steps.verifyPresence('HomePage', 'noBooks');
  });
});
