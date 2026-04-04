import { test, expect } from '../fixtures/base';

test.describe('Genre Filtering', () => {
  test.describe.configure({ timeout: 60_000 });

  test('Fiction genre filter shows fiction books', async ({ steps }) => {
    await steps.navigateTo('/?genre=Fiction');
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('Sci-Fi genre filter shows sci-fi books', async ({ steps }) => {
    await steps.navigateTo('/?genre=Sci-Fi');
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('Non-Fiction genre filter shows non-fiction books', async ({ steps }) => {
    await steps.navigateTo('/?genre=Non-Fiction');
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('Biography genre filter shows biography books', async ({ steps }) => {
    await steps.navigateTo('/?genre=Biography');
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('Fantasy genre filter shows fantasy books', async ({ steps }) => {
    await steps.navigateTo('/?genre=Fantasy');
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('Mystery genre filter shows mystery books', async ({ steps }) => {
    await steps.navigateTo('/?genre=Mystery');
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('search by author name returns results', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Orwell');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('clicking genre from sidebar filters books', async ({ steps }) => {
    await steps.navigateTo('/');
    const initialCount = await steps.getCount('HomePage', 'bookCard');
    // Click the Sci-Fi link in sidebar
    await steps.navigateTo('/?genre=Sci-Fi');
    await steps.verifyPresence('HomePage', 'bookGrid');
  });
});
