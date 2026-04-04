import { test, expect } from '../fixtures/base';

test.describe('Home Page — Browse & Search', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.navigateTo('/');
  });

  test('displays book catalog with cards', async ({ steps }) => {
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('displays pagination controls', async ({ steps }) => {
    await steps.verifyPresence('HomePage', 'pagination');
    await steps.verifyPresence('HomePage', 'nextPageButton');
    await steps.verifyPresence('HomePage', 'prevPageButton');
    await steps.verifyTextContains('HomePage', 'pageIndicator', '1 / ');
  });

  test('navigates to next and previous pages', async ({ steps }) => {
    await steps.verifyTextContains('HomePage', 'pageIndicator', '1 / ');
    await steps.click('HomePage', 'nextPageButton');
    await steps.verifyTextContains('HomePage', 'pageIndicator', '2 / ');
    await steps.click('HomePage', 'prevPageButton');
    await steps.verifyTextContains('HomePage', 'pageIndicator', '1 / ');
  });

  test('searches books by title', async ({ steps }) => {
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('displays search icon', async ({ steps }) => {
    await steps.verifyPresence('HomePage', 'searchInput');
  });
});
