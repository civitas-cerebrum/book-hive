import { test, expect } from './fixtures/base';

test.describe('HomePage — Browse Books', () => {
  test.describe.configure({ timeout: 60_000 });

  test('displays book grid with cards on load', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('BookCard', 'card', { exactly: 12 });
  });

  test('each book card shows title, author, genre and price', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyCount('BookCard', 'title', { greaterThan: 0 });
    await steps.verifyCount('BookCard', 'author', { greaterThan: 0 });
    await steps.verifyCount('BookCard', 'genre', { greaterThan: 0 });
    await steps.verifyCount('BookCard', 'price', { greaterThan: 0 });
  });

  test('first book card has correct data for To Kill a Mockingbird', async ({ steps }) => {
    await steps.navigateTo('/');
    const titles = await steps.getAll('BookCard', 'title');
    expect(titles[0]).toContain('To Kill a Mockingbird');
  });

  test('search filters books by title', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    const titles = await steps.getAll('BookCard', 'title');
    expect(titles.length).toBeGreaterThan(0);
    for (const t of titles) {
      expect(t.toLowerCase()).toContain('dune');
    }
  });

  test('search filters books by author', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Harper Lee');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    const authors = await steps.getAll('BookCard', 'author');
    expect(authors.length).toBeGreaterThan(0);
    for (const a of authors) {
      expect(a.toLowerCase()).toContain('harper lee');
    }
  });

  test('search with no results shows empty state', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'xyznonexistentbook999');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'noBooks');
  });

  test('pagination navigates between pages', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyState('HomePage', 'prevPage', 'disabled');
    await steps.click('HomePage', 'nextPage');
    await steps.waitForNetworkIdle();
    await steps.verifyState('HomePage', 'prevPage', 'enabled');
    const cardCount = await steps.getCount('BookCard', 'card');
    expect(cardCount).toBeGreaterThan(0);
  });

  test('pagination previous button works', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('HomePage', 'nextPage');
    await steps.waitForNetworkIdle();
    await steps.click('HomePage', 'prevPage');
    await steps.waitForNetworkIdle();
    await steps.verifyState('HomePage', 'prevPage', 'disabled');
  });

  test('clicking a book card navigates to detail page', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.clickNth('BookCard', 'card', 0);
    await steps.verifyUrlContains('/books/');
    await steps.verifyPresence('BookDetailPage', 'title');
  });
});
