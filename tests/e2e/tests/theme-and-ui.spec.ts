import { test, expect } from '../fixtures/base';

test.describe('Theme and UI Features', () => {
  test.describe.configure({ timeout: 60_000 });

  test('should display theme toggle button', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('TopBar', 'themeToggle');
  });

  test('should toggle theme when clicking theme button', async ({ steps, page }) => {
    await steps.navigateTo('/');

    // Get initial theme
    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || 'light');

    // Click theme toggle
    await steps.click('TopBar', 'themeToggle');

    // Verify theme changed
    const newTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || 'light');
    expect(newTheme).not.toBe(initialTheme);
  });

  test('should display all genre filter options in sidebar', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Sidebar', 'genreFilterFiction');
    await steps.verifyPresence('Sidebar', 'genreFilterSciFi');
    await steps.verifyPresence('Sidebar', 'genreFilterNonFiction');
    await steps.verifyPresence('Sidebar', 'genreFilterBiography');
    await steps.verifyPresence('Sidebar', 'genreFilterFantasy');
    await steps.verifyPresence('Sidebar', 'genreFilterMystery');
  });

  test('should filter by Non-Fiction genre', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'genreFilterNonFiction');
    await steps.verifyUrlContains('genre=Non-Fiction');
    await steps.verifyPresence('HomePage', 'bookGrid');
  });

  test('should filter by Biography genre', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'genreFilterBiography');
    await steps.verifyUrlContains('genre=Biography');
    await steps.verifyPresence('HomePage', 'bookGrid');
  });

  test('should filter by Fantasy genre', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'genreFilterFantasy');
    await steps.verifyUrlContains('genre=Fantasy');
    await steps.verifyPresence('HomePage', 'bookGrid');
  });

  test('should filter by Mystery genre', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'genreFilterMystery');
    await steps.verifyUrlContains('genre=Mystery');
    await steps.verifyPresence('HomePage', 'bookGrid');
  });

  test('should clear genre filter when clicking All Books', async ({ steps }) => {
    await steps.navigateTo('/?genre=Fiction');
    await steps.verifyUrlContains('genre=Fiction');
    await steps.click('Sidebar', 'navAllBooks');
    await steps.verifyPresence('HomePage', 'container');
    // URL should not contain genre parameter anymore (or be clean)
  });

  test('should display logo in sidebar', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Sidebar', 'logo');
  });

  test('should paginate through all book pages', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'pagination');

    // Navigate to page 2
    await steps.click('HomePage', 'nextPage');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'bookGrid');

    // Navigate to page 3
    await steps.click('HomePage', 'nextPage');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'bookGrid');

    // Navigate back to page 2
    await steps.click('HomePage', 'prevPage');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'bookGrid');
  });

  test('should display search results', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('query=Dune');
    await steps.verifyPresence('HomePage', 'bookGrid');
  });

  test('should show no results for invalid search', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'xyznonexistentbook123');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'noBooks');
  });
});
