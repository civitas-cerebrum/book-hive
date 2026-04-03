import { test, expect } from '../fixtures/base';

test.describe('HomePage — Browse Books', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.waitForState('HomePage', 'bookGrid');
  });

  test('displays book grid with 12 books per page', async ({ steps }) => {
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCards', { exactly: 12 });
  });

  test('each book card shows title, author, genre, and price', async ({ steps }) => {
    await steps.verifyCount('HomePage', 'bookTitle', { greaterThan: 0 });
    await steps.verifyCount('HomePage', 'bookAuthor', { greaterThan: 0 });
    await steps.verifyCount('HomePage', 'bookPrice', { greaterThan: 0 });
    await steps.verifyCount('HomePage', 'bookGenre', { greaterThan: 0 });
  });

  test('displays pagination controls', async ({ steps }) => {
    await steps.verifyPresence('HomePage', 'pagination');
    await steps.verifyPresence('HomePage', 'prevButton');
    await steps.verifyPresence('HomePage', 'nextButton');
    await steps.verifyState('HomePage', 'prevButton', 'disabled');
  });

  test('navigates to next page and back', async ({ steps }) => {
    await steps.click('HomePage', 'nextButton');
    await steps.waitForState('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCards', { greaterThan: 0 });
    await steps.verifyState('HomePage', 'prevButton', 'enabled');
    await steps.click('HomePage', 'prevButton');
    await steps.waitForState('HomePage', 'bookGrid');
    await steps.verifyState('HomePage', 'prevButton', 'disabled');
  });

  test('search filters books by title', async ({ steps }) => {
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.waitForState('HomePage', 'bookGrid');
    const titles = await steps.getAll('HomePage', 'bookTitle');
    expect(titles.length).toBeGreaterThan(0);
    for (const title of titles) {
      expect(title.toLowerCase()).toContain('dune');
    }
  });

  test('search filters books by author', async ({ steps }) => {
    await steps.fill('HomePage', 'searchInput', 'Orwell');
    await steps.pressKey('Enter');
    await steps.waitForState('HomePage', 'bookGrid');
    const authors = await steps.getAll('HomePage', 'bookAuthor');
    expect(authors.length).toBeGreaterThan(0);
    for (const author of authors) {
      expect(author.toLowerCase()).toContain('orwell');
    }
  });

  test('search with no results shows empty state', async ({ steps }) => {
    await steps.fill('HomePage', 'searchInput', 'xyznonexistentbook123');
    await steps.pressKey('Enter');
    await steps.waitForState('HomePage', 'noBooks');
    await steps.verifyPresence('HomePage', 'noBooks');
  });

  test('clicking a book card navigates to book detail', async ({ steps }) => {
    await steps.clickNth('HomePage', 'bookCards', 0);
    await steps.verifyUrlContains('/books/');
    await steps.verifyPresence('BookDetailPage', 'container');
  });
});
