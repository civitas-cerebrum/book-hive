import { test, expect } from './fixtures/base';

test.describe('Search & Filter Edge Cases', () => {
  test.describe.configure({ timeout: 60_000 });

  test('should show no results for a non-existent search term', async ({ steps }) => {
    // Search submits via form submit (Enter key), not on input change
    await steps.navigateTo('/?query=zzzznonexistentbook99999');
    await steps.waitForNetworkIdle();
    // Should show no books or zero results
    await steps.verifyPresence('HomePage', 'noBooks');
  });

  test('should search by author name', async ({ steps }) => {
    await steps.navigateTo('/?query=Harper%20Lee');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('HomePage', 'bookCards', { greaterThan: 0 });
  });

  test('should clear search and show all books', async ({ steps }) => {
    await steps.navigateTo('/?query=Dune');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('HomePage', 'bookCards', { greaterThan: 0 });

    // Navigate back to home without query to clear search
    await steps.navigateTo('/');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('HomePage', 'bookCards', { greaterThan: 0 });
  });

  test('should filter by Biography genre via nav link', async ({ steps }) => {
    await steps.navigateTo('/?genre=Biography');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCards', { greaterThan: 0 });
  });

  test('should filter by Fantasy genre via nav link', async ({ steps }) => {
    await steps.navigateTo('/?genre=Fantasy');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCards', { greaterThan: 0 });
  });

  test('should filter by Mystery genre via nav link', async ({ steps }) => {
    await steps.navigateTo('/?genre=Mystery');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCards', { greaterThan: 0 });
  });

  test('should paginate through all pages', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'pagination');
    await steps.verifyTextContains('HomePage', 'pageInfo', '1 / ');

    // Go to page 2
    await steps.click('HomePage', 'nextPage');
    await steps.waitForNetworkIdle();
    await steps.verifyTextContains('HomePage', 'pageInfo', '2 / ');

    // Go to page 3
    await steps.click('HomePage', 'nextPage');
    await steps.waitForNetworkIdle();
    await steps.verifyTextContains('HomePage', 'pageInfo', '3 / ');
  });
});
