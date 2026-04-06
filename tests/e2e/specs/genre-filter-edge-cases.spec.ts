import { test, expect } from '../fixtures/base';

/**
 * Stage 8: Genre Filter Edge Cases
 * Tests genre filtering including case sensitivity, invalid genres,
 * switching between genres, clearing filters, and genre result accuracy.
 */
test.describe('Genre Filter — Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  // ─── Genre Case Sensitivity ────────────────────────────────────

  test('@genre genre filter is case-sensitive — lowercase "fiction" returns no results', async ({ steps, page }) => {
    // Backend uses exact match: findByGenre(genre, pageable)
    await steps.navigateTo('/?genre=fiction');
    await page.waitForTimeout(500);
    // Should show no books because genres are stored as "Fiction" (capitalized)
    await steps.verifyPresence('HomePage', 'noBooks');
  });

  test('@genre genre filter is case-sensitive — UPPERCASE "FICTION" returns no results', async ({ steps, page }) => {
    await steps.navigateTo('/?genre=FICTION');
    await page.waitForTimeout(500);
    await steps.verifyPresence('HomePage', 'noBooks');
  });

  test('@genre correct capitalization "Fiction" returns books', async ({ steps, page }) => {
    await steps.navigateTo('/?genre=Fiction');
    await page.waitForTimeout(500);
    const count = await steps.getCount('HomePage', 'bookCard');
    expect(count).toBe(8); // 8 Fiction books in seed data
  });

  // ─── Invalid / Non-existent Genres ─────────────────────────────

  test('@genre non-existent genre "Romance" shows no books', async ({ steps, page }) => {
    await steps.navigateTo('/?genre=Romance');
    await page.waitForTimeout(500);
    await steps.verifyPresence('HomePage', 'noBooks');
  });

  test('@genre empty genre param shows all books', async ({ steps, page }) => {
    await steps.navigateTo('/?genre=');
    await page.waitForTimeout(500);
    // Empty genre treated as blank → returns all books
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 12 });
    await steps.verifyPresence('HomePage', 'pagination');
  });

  test('@genre XSS in genre param is safe', async ({ steps, page }) => {
    await steps.navigateTo('/?genre=<script>alert(1)</script>');
    await page.waitForTimeout(500);
    await steps.verifyPresence('HomePage', 'homePage');
    // No XSS execution, just no matching genre
    await steps.verifyPresence('HomePage', 'noBooks');
  });

  // ─── All Six Genres Return Correct Counts ──────────────────────

  test('@genre all six genres return non-zero results', async ({ steps, page }) => {
    const genres = ['Fiction', 'Sci-Fi', 'Non-Fiction', 'Biography', 'Fantasy', 'Mystery'];

    for (const genre of genres) {
      await steps.navigateTo(`/?genre=${encodeURIComponent(genre)}`);
      await page.waitForTimeout(400);
      const count = await steps.getCount('HomePage', 'bookCard');
      expect(count).toBeGreaterThan(0);
    }
  });

  test('@genre Fiction genre shows only Fiction books', async ({ steps, page }) => {
    await steps.navigateTo('/?genre=Fiction');
    await page.waitForTimeout(500);
    const genres = await steps.getAll('HomePage', 'bookGenre');
    genres.forEach(genre => {
      expect(genre).toBe('Fiction');
    });
  });

  test('@genre Sci-Fi genre shows only Sci-Fi books', async ({ steps, page }) => {
    await steps.navigateTo('/?genre=Sci-Fi');
    await page.waitForTimeout(500);
    const genres = await steps.getAll('HomePage', 'bookGenre');
    genres.forEach(genre => {
      expect(genre).toBe('Sci-Fi');
    });
  });

  // ─── Genre Switching ───────────────────────────────────────────

  test('@genre switching from Fiction to Sci-Fi via sidebar updates URL and results', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Click Fiction
    await steps.click('Navigation', 'genreFilterFiction');
    await steps.verifyUrlContains('genre=Fiction');
    const fictionGenres = await steps.getAll('HomePage', 'bookGenre');
    fictionGenres.forEach(g => expect(g).toBe('Fiction'));

    // Switch to Sci-Fi
    await steps.click('Navigation', 'genreFilterSciFi');
    await steps.verifyUrlContains('genre=Sci-Fi');
    const url = page.url();
    expect(url).not.toContain('Fiction');
    const sciFiGenres = await steps.getAll('HomePage', 'bookGenre');
    sciFiGenres.forEach(g => expect(g).toBe('Sci-Fi'));
  });

  test('@genre clicking All Books clears genre filter', async ({ steps, page }) => {
    // Apply a genre filter first
    await steps.navigateTo('/?genre=Biography');
    await page.waitForTimeout(500);
    await steps.verifyUrlContains('genre=Biography');

    // Click "All Books" in sidebar to clear filter
    await steps.click('Navigation', 'navAllBooks');
    await page.waitForTimeout(500);

    // URL should no longer contain genre param
    const url = page.url();
    expect(url).not.toContain('genre=');

    // Should show all books with pagination
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 12 });
    await steps.verifyPresence('HomePage', 'pagination');
  });

  // ─── Genre Filter + Pagination ─────────────────────────────────

  test('@genre genre with few books has no pagination', async ({ steps, page }) => {
    // Fiction has 8 books, fits in one page (12/page)
    await steps.navigateTo('/?genre=Fiction');
    await page.waitForTimeout(500);
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 8 });
    // No pagination should be shown for single-page results
    await steps.verifyAbsence('HomePage', 'pagination');
  });

  // ─── Sci-Fi Hyphenated Genre ───────────────────────────────────

  test('@genre Sci-Fi genre with hyphen is correctly URL-encoded', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.click('Navigation', 'genreFilterSciFi');
    // Sidebar NavLink uses /?genre=Sci-Fi which may or may not be encoded
    const url = page.url();
    expect(url).toMatch(/genre=Sci-Fi|genre=Sci%2DFi/);
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  // ─── Non-Fiction with Space ────────────────────────────────────

  test('@genre Non-Fiction genre works via sidebar link', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.click('Navigation', 'genreFilterNonFiction');
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url).toMatch(/genre=Non-Fiction|genre=Non%2DFiction/);
    const genres = await steps.getAll('HomePage', 'bookGenre');
    expect(genres.length).toBeGreaterThan(0);
    genres.forEach(g => expect(g).toBe('Non-Fiction'));
  });
});
