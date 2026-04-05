import { test, expect } from '../fixtures/base';

test.describe('Homepage -- Genre & Search Deep', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.waitForNetworkIdle();
  });

  test('sidebar genre links are visible', async ({ steps }) => {
    await steps.verifyPresence('Navigation', 'genreFilterFiction');
    await steps.verifyPresence('Navigation', 'genreFilterSciFi');
    await steps.verifyPresence('Navigation', 'genreFilterNonFiction');
    await steps.verifyPresence('Navigation', 'genreFilterBiography');
    await steps.verifyPresence('Navigation', 'genreFilterFantasy');
    await steps.verifyPresence('Navigation', 'genreFilterMystery');
  });

  test('clicking sidebar genre link filters books', async ({ steps }) => {
    await steps.click('Navigation', 'genreFilterFiction');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
    await steps.verifyUrlContains('genre=Fiction');
  });

  test('search with no results shows no books message', async ({ steps }) => {
    await steps.fill('HomePage', 'searchInput', 'zzznonexistentbook999');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'noBooks');
  });

  test('search clears when navigating back to all books', async ({ steps }) => {
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });

    await steps.navigateTo('/');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 1 });
  });

  test('page info shows current page number', async ({ steps }) => {
    await steps.verifyPresence('HomePage', 'pageInfo');
    await steps.verifyText('HomePage', 'pageInfo', undefined, { notEmpty: true });
  });
});
