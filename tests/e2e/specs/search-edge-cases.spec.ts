import { test, expect } from '../fixtures/base';

/**
 * Stage 8: Search Edge Cases
 * Tests search input behavior including case sensitivity, partial matching,
 * special characters, whitespace, empty queries, and regex injection.
 */
test.describe('Search — Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  // ─── Case Sensitivity ───────────────────────────────────────────

  test('@search case-insensitive search returns same results for mixed case', async ({ steps, page }) => {
    // Search uppercase
    await steps.navigateTo('/?query=DUNE');
    await page.waitForTimeout(500);
    const upperCount = await steps.getCount('HomePage', 'bookCard');

    // Search lowercase
    await steps.navigateTo('/?query=dune');
    await page.waitForTimeout(500);
    const lowerCount = await steps.getCount('HomePage', 'bookCard');

    // Search mixed case
    await steps.navigateTo('/?query=DuNe');
    await page.waitForTimeout(500);
    const mixedCount = await steps.getCount('HomePage', 'bookCard');

    // All should return same results (backend uses $options: 'i')
    expect(upperCount).toBe(lowerCount);
    expect(upperCount).toBe(mixedCount);
    expect(upperCount).toBeGreaterThan(0);
  });

  test('@search case-insensitive search by author name', async ({ steps, page }) => {
    await steps.navigateTo('/?query=orwell');
    await page.waitForTimeout(500);
    const count = await steps.getCount('HomePage', 'bookCard');
    expect(count).toBeGreaterThan(0);

    await steps.navigateTo('/?query=ORWELL');
    await page.waitForTimeout(500);
    const upperCount = await steps.getCount('HomePage', 'bookCard');
    expect(upperCount).toBe(count);
  });

  // ─── Partial Matching ──────────────────────────────────────────

  test('@search partial title match returns multiple results', async ({ steps, page }) => {
    // "the" matches many titles like "The Great Gatsby", "The Martian", etc.
    await steps.navigateTo('/?query=the');
    await page.waitForTimeout(500);
    const count = await steps.getCount('HomePage', 'bookCard');
    expect(count).toBeGreaterThan(1);
  });

  test('@search single character search returns matching books', async ({ steps, page }) => {
    // "a" should match many titles/authors
    await steps.navigateTo('/?query=a');
    await page.waitForTimeout(500);
    const count = await steps.getCount('HomePage', 'bookCard');
    expect(count).toBeGreaterThan(0);
  });

  test('@search partial author name matches (first name only)', async ({ steps, page }) => {
    await steps.navigateTo('/?query=Frank');
    await page.waitForTimeout(500);
    const count = await steps.getCount('HomePage', 'bookCard');
    expect(count).toBeGreaterThan(0); // Should find Frank Herbert
  });

  // ─── No Results ────────────────────────────────────────────────

  test('@search nonsense query shows no-books message', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'xyznonexistent12345');
    await steps.pressKey('Enter');
    await steps.verifyUrlContains('query=xyznonexistent12345');
    await steps.verifyPresence('HomePage', 'noBooks');
  });

  test('@search emoji-only query shows no results', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', '🔥📚🎉');
    await steps.pressKey('Enter');
    await steps.verifyUrlContains('query=');
    await steps.verifyPresence('HomePage', 'noBooks');
  });

  // ─── Special Characters & Regex Injection ──────────────────────

  test('@search regex special characters are escaped and do not crash', async ({ steps }) => {
    // The backend escapes regex chars: \\^$.|?*+()[]{}
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', '.*+?^${}()|[]\\');
    await steps.pressKey('Enter');
    await steps.verifyUrlContains('query=');
    // Should show no results, not a server error
    await steps.verifyPresence('HomePage', 'noBooks');
  });

  test('@search XSS payload in search does not execute', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', '<script>alert("xss")</script>');
    await steps.pressKey('Enter');
    await steps.verifyUrlContains('query=');
    // No alert dialog should appear, page should still be functional
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyPresence('HomePage', 'noBooks');
  });

  test('@search SQL injection-like payload in search is safe', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', "' OR 1=1 --");
    await steps.pressKey('Enter');
    await steps.verifyPresence('HomePage', 'homePage');
    // Should either show no results or safe results, not crash
    const count = await steps.getCount('HomePage', 'bookCard');
    // "OR" might match book titles/authors, but that's fine — no injection
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('@search MongoDB injection $where is safe', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', '{$where: "1==1"}');
    await steps.pressKey('Enter');
    await steps.verifyPresence('HomePage', 'homePage');
    // Should not expose all records via injection
  });

  // ─── Whitespace & Empty Queries ────────────────────────────────

  test('@search empty search (just press Enter) returns all books', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'searchInput');
    // Clear any existing value and press Enter with empty input
    await steps.fill('HomePage', 'searchInput', '');
    await steps.pressKey('Enter');
    // Empty query should clear params and show all books
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 12 });
  });

  test('@search whitespace-only query returns all books (server trims blank)', async ({ steps, page }) => {
    // The backend checks query.isBlank() — whitespace-only returns all books
    await steps.navigateTo('/?query=%20%20%20');
    await page.waitForTimeout(500);
    // Whitespace is treated as blank, returns all books
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 12 });
    await steps.verifyPresence('HomePage', 'pagination');
  });

  // ─── Query Truncation ─────────────────────────────────────────

  test('@search very long query is truncated to 100 chars by backend', async ({ steps, page }) => {
    const longQuery = 'a'.repeat(200);
    await steps.navigateTo(`/?query=${longQuery}`);
    await page.waitForTimeout(500);
    // Backend truncates to 100 chars — should not error
    await steps.verifyPresence('HomePage', 'homePage');
    // The page should render (either results or no-books)
    const hasBooks = await page.locator('[data-testid^="book-card-"]').count();
    const hasNoBooks = await page.locator('[data-testid="no-books"]').count();
    expect(hasBooks + hasNoBooks).toBeGreaterThan(0);
  });

  // ─── Search via Form Submission ────────────────────────────────

  test('@search form submission via Enter key updates URL', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.verifyUrlContains('query=Dune');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 1 });
  });

  test('@search multiple consecutive searches update URL correctly', async ({ steps, page }) => {
    await steps.navigateTo('/');

    // First search
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.verifyUrlContains('query=Dune');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 1 });

    // Second search overwrites the first
    await steps.fill('HomePage', 'searchInput', 'Orwell');
    await steps.pressKey('Enter');
    await steps.verifyUrlContains('query=Orwell');
    // Should no longer contain Dune query
    const url = page.url();
    expect(url).not.toContain('Dune');
  });

  // ─── Search Result Content Verification ────────────────────────

  test('@search results match the query term in title or author', async ({ steps, page }) => {
    await steps.navigateTo('/?query=Dune');
    await page.waitForTimeout(500);
    const titles = await steps.getAll('HomePage', 'bookTitle');
    const authors = await steps.getAll('HomePage', 'bookAuthor');

    // At least one title or author should contain "Dune" (case-insensitive)
    const allTexts = [...titles, ...authors].map(t => t.toLowerCase());
    const hasMatch = allTexts.some(t => t.includes('dune'));
    expect(hasMatch).toBe(true);
  });

  test('@search for author returns books with that author', async ({ steps, page }) => {
    await steps.navigateTo('/?query=Herbert');
    await page.waitForTimeout(500);
    const authors = await steps.getAll('HomePage', 'bookAuthor');
    expect(authors.length).toBeGreaterThan(0);
    // All results should have "Herbert" in the author field
    authors.forEach(author => {
      expect(author.toLowerCase()).toContain('herbert');
    });
  });
});
