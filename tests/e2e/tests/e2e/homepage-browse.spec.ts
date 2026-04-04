import { test, expect } from '../fixtures/base';

test.describe('Homepage — Browse Books', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.navigateTo('/');
  });

  test('displays the book grid with books', async ({ steps }) => {
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('displays book cards with title and price', async ({ steps }) => {
    await steps.verifyPresence('HomePage', 'bookGrid');
    const cards = await steps.getCount('HomePage', 'bookCard');
    expect(cards).toBeGreaterThan(0);
  });

  test('shows pagination controls', async ({ steps }) => {
    await steps.verifyPresence('HomePage', 'pagination');
    await steps.verifyPresence('HomePage', 'nextPage');
  });

  test('can navigate to next page', async ({ steps }) => {
    await steps.click('HomePage', 'nextPage');
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('can navigate to next page and back', async ({ steps }) => {
    await steps.click('HomePage', 'nextPage');
    await steps.verifyPresence('HomePage', 'prevPage');
    await steps.click('HomePage', 'prevPage');
    await steps.verifyPresence('HomePage', 'bookGrid');
  });

  test('search filters books by title', async ({ steps }) => {
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('search with no results shows empty state', async ({ steps }) => {
    await steps.fill('HomePage', 'searchInput', 'xyznonexistent12345');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    await steps.verifyAbsence('HomePage', 'bookCard');
  });

  test('clicking a book card navigates to book detail', async ({ steps }) => {
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.verifyUrlContains('/books/');
    await steps.verifyPresence('BookDetailPage', 'bookTitle');
  });
});
