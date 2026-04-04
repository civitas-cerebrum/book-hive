import { test, expect } from './fixtures/base';

test.describe('BookDetailPage — Authenticated Features', () => {
  test.describe.configure({ timeout: 60_000 });

  test('shows add-to-cart button when logged in', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'addToCartButton');
  });

  test('add to cart from detail page updates cart badge', async ({ steps, resetApp, loginAs }) => {
    await resetApp();
    await loginAs('user1');
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('Sidebar', 'cartBadge');
  });

  test('book stock count is displayed', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    const stock = await steps.getText('BookDetailPage', 'stock');
    expect(stock).toMatch(/\d+ in stock/);
  });

  test('book description is displayed', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    const desc = await steps.getText('BookDetailPage', 'description');
    expect(desc.length).toBeGreaterThan(10);
  });

  test('book detail page for Fantasy genre', async ({ steps }) => {
    await steps.navigateTo('/books/book-034');
    await steps.verifyPresence('BookDetailPage', 'page');
    await steps.verifyTextContains('BookDetailPage', 'genre', 'Fantasy');
  });

  test('book detail page for Mystery genre', async ({ steps }) => {
    await steps.navigateTo('/books/book-042');
    await steps.verifyPresence('BookDetailPage', 'page');
    await steps.verifyTextContains('BookDetailPage', 'genre', 'Mystery');
  });
});
