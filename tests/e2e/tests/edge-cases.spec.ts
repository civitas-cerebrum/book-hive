import { test, expect } from './fixtures/base';

test.describe('Edge Cases & Negative Paths', () => {
  test.describe.configure({ timeout: 60_000 });

  test('should keep previous page button disabled on first page', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyState('HomePage', 'prevPage', 'disabled');
  });

  test('should handle search form submission via Enter key', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('query=Dune');
    await steps.verifyCount('HomePage', 'bookCards', { greaterThan: 0 });
  });

  test('should handle direct URL access to book detail', async ({ steps }) => {
    await steps.navigateTo('/books/book-003');
    await steps.verifyText('BookDetailPage', 'title', '1984');
    await steps.verifyText('BookDetailPage', 'author', 'George Orwell');
  });

  test('should handle direct URL access to genre filter', async ({ steps }) => {
    await steps.navigateTo('/?genre=Non-Fiction');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('HomePage', 'bookCards', { greaterThan: 0 });
  });

  test('should redirect unauthenticated user from order detail', async ({ steps }) => {
    await steps.navigateTo('/orders/some-order-id');
    await steps.verifyUrlContains('/login');
  });

  test('should show marketplace page accessible without auth', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');
  });

  test('should show book detail page accessible without auth', async ({ steps }) => {
    await steps.navigateTo('/books/book-010');
    await steps.verifyPresence('BookDetailPage', 'title');
    await steps.verifyText('BookDetailPage', 'title', "The Hitchhiker's Guide to the Galaxy");
  });
});
