import { test, expect } from '../fixtures/base';

test.describe('Genre Filtering', () => {
  test.describe.configure({ timeout: 60_000 });

  test('filters books by Fiction genre', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('NavBar', 'fictionLink');
    await steps.verifyUrlContains('genre=Fiction');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('filters books by Sci-Fi genre', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('NavBar', 'sciFiLink');
    await steps.verifyUrlContains('genre=Sci-Fi');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('returns to all books from genre filter', async ({ steps }) => {
    await steps.navigateTo('/?genre=Fiction');
    await steps.verifyUrlContains('genre=Fiction');
    await steps.click('NavBar', 'allBooksLink');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });
});
