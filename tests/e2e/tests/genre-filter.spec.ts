import { test, expect } from './fixtures/base';

test.describe('Genre Filtering', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.waitForState('HomePage', 'bookGrid');
  });

  test('fiction genre filter shows only fiction books', async ({ steps }) => {
    await steps.click('Sidebar', 'genreFilterFiction');
    await steps.verifyUrlContains('genre=Fiction');
    await steps.waitForState('HomePage', 'bookGrid');
    const genres = await steps.getAll('HomePage', 'bookGenre');
    for (const genre of genres) {
      expect(genre).toBe('Fiction');
    }
  });

  test('sci-fi genre filter shows only sci-fi books', async ({ steps }) => {
    await steps.click('Sidebar', 'genreFilterSciFi');
    await steps.verifyUrlContains('genre=Sci-Fi');
    await steps.waitForState('HomePage', 'bookGrid');
    const genres = await steps.getAll('HomePage', 'bookGenre');
    for (const genre of genres) {
      expect(genre).toBe('Sci-Fi');
    }
  });

  test('non-fiction genre filter shows only non-fiction books', async ({ steps }) => {
    await steps.click('Sidebar', 'genreFilterNonFiction');
    await steps.verifyUrlContains('genre=Non-Fiction');
    await steps.waitForState('HomePage', 'bookGrid');
    const genres = await steps.getAll('HomePage', 'bookGenre');
    for (const genre of genres) {
      expect(genre).toBe('Non-Fiction');
    }
  });

  test('biography genre filter shows only biography books', async ({ steps }) => {
    await steps.click('Sidebar', 'genreFilterBiography');
    await steps.verifyUrlContains('genre=Biography');
    await steps.waitForState('HomePage', 'bookGrid');
    const genres = await steps.getAll('HomePage', 'bookGenre');
    for (const genre of genres) {
      expect(genre).toBe('Biography');
    }
  });

  test('fantasy genre filter shows only fantasy books', async ({ steps }) => {
    await steps.click('Sidebar', 'genreFilterFantasy');
    await steps.verifyUrlContains('genre=Fantasy');
    await steps.waitForState('HomePage', 'bookGrid');
    const genres = await steps.getAll('HomePage', 'bookGenre');
    for (const genre of genres) {
      expect(genre).toBe('Fantasy');
    }
  });

  test('mystery genre filter shows only mystery books', async ({ steps }) => {
    await steps.click('Sidebar', 'genreFilterMystery');
    await steps.verifyUrlContains('genre=Mystery');
    await steps.waitForState('HomePage', 'bookGrid');
    const genres = await steps.getAll('HomePage', 'bookGenre');
    for (const genre of genres) {
      expect(genre).toBe('Mystery');
    }
  });

  test('All Books link clears genre filter', async ({ steps }) => {
    await steps.click('Sidebar', 'genreFilterFiction');
    await steps.verifyUrlContains('genre=Fiction');
    await steps.click('Sidebar', 'allBooksLink');
    await steps.waitForState('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 12 });
  });
});
