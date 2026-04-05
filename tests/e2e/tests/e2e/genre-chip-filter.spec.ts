import { test, expect } from '../fixtures/base';

test.describe('Sidebar Genre Navigation', () => {
  test.describe.configure({ timeout: 60_000 });

  test('sidebar Fiction genre link filters books', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Navigation', 'genreFilterFiction');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('genre=Fiction');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('sidebar Sci-Fi genre link filters books', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Navigation', 'genreFilterSciFi');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('genre=Sci-Fi');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('sidebar Non-Fiction genre link filters books', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Navigation', 'genreFilterNonFiction');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('genre=Non-Fiction');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('sidebar Fantasy genre link filters books', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Navigation', 'genreFilterFantasy');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('genre=Fantasy');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('sidebar Mystery genre link filters books', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Navigation', 'genreFilterMystery');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('genre=Mystery');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('sidebar Biography genre link filters books', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Navigation', 'genreFilterBiography');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('genre=Biography');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('All Books sidebar link navigates to unfiltered homepage', async ({ steps }) => {
    await steps.navigateTo('/?genre=Fiction');
    await steps.click('Navigation', 'allBooksLink');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('Marketplace sidebar link navigates to marketplace', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Navigation', 'marketplaceLink');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'heading');
  });
});
