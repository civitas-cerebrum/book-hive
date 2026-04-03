import { test, expect } from '../fixtures/base';

test.describe('Genre Filter — Category Browsing', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.waitForState('HomePage', 'bookGrid');
  });

  test('category links in sidebar filter books', async ({ steps }) => {
    // Click Fiction category
    await steps.navigateTo('/?genre=Fiction');
    await steps.waitForState('HomePage', 'bookGrid');
    const genres = await steps.getAll('HomePage', 'bookGenre');
    for (const genre of genres) {
      expect(genre).toBe('Fiction');
    }
  });

  test('Sci-Fi filter shows only Sci-Fi books', async ({ steps }) => {
    await steps.navigateTo('/?genre=Sci-Fi');
    await steps.waitForState('HomePage', 'bookGrid');
    const genres = await steps.getAll('HomePage', 'bookGenre');
    expect(genres.length).toBeGreaterThan(0);
    for (const genre of genres) {
      expect(genre).toBe('Sci-Fi');
    }
  });

  test('Non-Fiction filter shows only Non-Fiction books', async ({ steps }) => {
    await steps.navigateTo('/?genre=Non-Fiction');
    await steps.waitForState('HomePage', 'bookGrid');
    const genres = await steps.getAll('HomePage', 'bookGenre');
    expect(genres.length).toBeGreaterThan(0);
    for (const genre of genres) {
      expect(genre).toBe('Non-Fiction');
    }
  });

  test('Biography filter shows only Biography books', async ({ steps }) => {
    await steps.navigateTo('/?genre=Biography');
    await steps.waitForState('HomePage', 'bookGrid');
    const genres = await steps.getAll('HomePage', 'bookGenre');
    expect(genres.length).toBeGreaterThan(0);
    for (const genre of genres) {
      expect(genre).toBe('Biography');
    }
  });

  test('Fantasy filter shows only Fantasy books', async ({ steps }) => {
    await steps.navigateTo('/?genre=Fantasy');
    await steps.waitForState('HomePage', 'bookGrid');
    const genres = await steps.getAll('HomePage', 'bookGenre');
    expect(genres.length).toBeGreaterThan(0);
    for (const genre of genres) {
      expect(genre).toBe('Fantasy');
    }
  });

  test('Mystery filter shows only Mystery books', async ({ steps }) => {
    await steps.navigateTo('/?genre=Mystery');
    await steps.waitForState('HomePage', 'bookGrid');
    const genres = await steps.getAll('HomePage', 'bookGenre');
    expect(genres.length).toBeGreaterThan(0);
    for (const genre of genres) {
      expect(genre).toBe('Mystery');
    }
  });
});
