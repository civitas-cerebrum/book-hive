import { test, expect } from './fixtures/base';

test.describe('HomePage — Browse Books', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.waitForState('HomePage', 'bookGrid');
  });

  test('displays book catalog with cards', async ({ steps }) => {
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { exactly: 12 });
  });

  test('each book card shows title, author, genre and price', async ({ steps }) => {
    await steps.verifyCount('HomePage', 'bookTitle', { greaterThan: 0 });
    await steps.verifyCount('HomePage', 'bookAuthor', { greaterThan: 0 });
    await steps.verifyCount('HomePage', 'bookPrice', { greaterThan: 0 });
    await steps.verifyCount('HomePage', 'bookGenre', { greaterThan: 0 });
  });

  test('first book card displays correct data for To Kill a Mockingbird', async ({ steps }) => {
    await steps.verifyPresence('HomePage', 'firstBookCard');
    const titles = await steps.getAll('HomePage', 'bookTitle');
    expect(titles[0]).toContain('To Kill a Mockingbird');
  });

  test('pagination shows page 1 of 5', async ({ steps }) => {
    await steps.verifyPresence('HomePage', 'pagination');
    await steps.verifyTextContains('HomePage', 'pagination', '1 / 5');
  });

  test('previous button is disabled on first page', async ({ steps }) => {
    await steps.verifyState('HomePage', 'prevButton', 'disabled');
  });

  test('next button navigates to page 2', async ({ steps }) => {
    await steps.click('HomePage', 'nextButton');
    await steps.verifyTextContains('HomePage', 'pagination', '2 / 5');
  });

  test('previous button navigates back from page 2', async ({ steps }) => {
    await steps.click('HomePage', 'nextButton');
    await steps.verifyTextContains('HomePage', 'pagination', '2 / 5');
    await steps.click('HomePage', 'prevButton');
    await steps.verifyTextContains('HomePage', 'pagination', '1 / 5');
  });

  test('search filters books by title', async ({ steps }) => {
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.waitForState('HomePage', 'bookGrid');
    const titles = await steps.getAll('HomePage', 'bookTitle');
    expect(titles.length).toBeGreaterThan(0);
    expect(titles[0]).toContain('Dune');
  });

  test('search filters books by author', async ({ steps }) => {
    await steps.fill('HomePage', 'searchInput', 'Orwell');
    await steps.pressKey('Enter');
    await steps.waitForState('HomePage', 'bookGrid');
    const titles = await steps.getAll('HomePage', 'bookTitle');
    expect(titles.length).toBeGreaterThan(0);
    expect(titles[0]).toContain('1984');
  });

  test('search with no results shows empty state', async ({ steps }) => {
    await steps.fill('HomePage', 'searchInput', 'xyznonexistentbook999');
    await steps.pressKey('Enter');
    await steps.verifyPresence('HomePage', 'noBooks');
  });

  test('clicking book card navigates to detail page', async ({ steps }) => {
    await steps.click('HomePage', 'firstBookCard');
    await steps.verifyUrlContains('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'container');
  });

  test('sidebar shows unauthenticated navigation', async ({ steps }) => {
    await steps.verifyPresence('Sidebar', 'loginLink');
    await steps.verifyPresence('Sidebar', 'signupLink');
    await steps.verifyPresence('Sidebar', 'allBooksLink');
    await steps.verifyPresence('Sidebar', 'marketplaceLink');
  });

  test('theme toggle switches theme', async ({ steps, page }) => {
    const initialTheme = await page.locator('html').getAttribute('data-theme');
    await steps.click('Sidebar', 'themeToggle');
    const newTheme = await page.locator('html').getAttribute('data-theme');
    expect(newTheme).not.toEqual(initialTheme);
  });
});
