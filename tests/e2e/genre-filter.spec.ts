import { test, expect } from './fixtures/base';

test.describe('Genre Filtering', () => {
  test.describe.configure({ timeout: 60_000 });

  test('genre chips container exists on homepage', async ({ steps, page }) => {
    await steps.navigateTo('/');
    // Genre chips exist in DOM even if not visible
    await expect(page.locator("[data-testid='genre-chips']")).toBeAttached();
    await expect(page.locator("[data-testid^='genre-chip-']").first()).toBeAttached();
  });

  test('genre chip click filters books via JS dispatch', async ({ steps, page }) => {
    await steps.navigateTo('/');
    // Genre chips may be hidden by layout; click via JS
    await page.locator("[data-testid='genre-chip-fiction']").dispatchEvent('click');
    await steps.waitForNetworkIdle();
    const genres = await steps.getAll('BookCard', 'genre');
    expect(genres.length).toBeGreaterThan(0);
    for (const g of genres) {
      expect(g).toBe('Fiction');
    }
  });

  test('sidebar Fiction link filters to fiction books', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await page.locator("a[href='/?genre=Fiction']").click();
    await steps.waitForNetworkIdle();
    const genres = await steps.getAll('BookCard', 'genre');
    expect(genres.length).toBeGreaterThan(0);
    for (const g of genres) {
      expect(g).toBe('Fiction');
    }
  });

  test('sidebar Sci-Fi link filters to sci-fi books', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await page.locator("a[href='/?genre=Sci-Fi']").click();
    await steps.waitForNetworkIdle();
    const genres = await steps.getAll('BookCard', 'genre');
    expect(genres.length).toBeGreaterThan(0);
    for (const g of genres) {
      expect(g).toBe('Sci-Fi');
    }
  });

  test('All Books link clears genre filter', async ({ steps }) => {
    await steps.navigateTo('/?genre=Fiction');
    await steps.waitForNetworkIdle();
    await steps.click('Sidebar', 'allBooksLink');
    await steps.waitForNetworkIdle();
    const genres = await steps.getAll('BookCard', 'genre');
    const uniqueGenres = new Set(genres);
    expect(uniqueGenres.size).toBeGreaterThan(1);
  });

  test('URL genre parameter filters books correctly', async ({ steps }) => {
    await steps.navigateTo('/?genre=Biography');
    await steps.waitForNetworkIdle();
    const genres = await steps.getAll('BookCard', 'genre');
    expect(genres.length).toBeGreaterThan(0);
    for (const g of genres) {
      expect(g).toBe('Biography');
    }
  });
});
