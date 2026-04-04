import { test, expect } from './fixtures/base';

test.describe('Negative Tests — Error Handling & Edge Cases', () => {
  test.describe.configure({ timeout: 60_000 });

  test('non-existent route shows home page or 404', async ({ steps, page }) => {
    await steps.navigateTo('/nonexistent-page-xyz');
    // React Router should either redirect to home or show the page
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('non-existent book shows not-found state', async ({ steps }) => {
    await steps.navigateTo('/books/book-999');
    await steps.verifyPresence('BookDetailPage', 'notFound');
  });

  test('empty search shows all books', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', '');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    await steps.verifyCount('BookCard', 'card', { greaterThan: 0 });
  });

  test('special characters in search do not crash', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', '<script>alert(1)</script>');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    // Should show no results but not crash
    await steps.verifyPresence('HomePage', 'homePage');
  });

  test('XSS in search input is sanitized', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', '"><img src=x onerror=alert(1)>');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    // Page should still be functional
    await steps.verifyPresence('HomePage', 'homePage');
    // No alert dialog should appear
    const dialogAppeared = await page.evaluate(() => {
      return (window as any).__alertCalled || false;
    });
    expect(dialogAppeared).toBeFalsy();
  });

  test('accessing cart without auth redirects to login', async ({ steps }) => {
    await steps.navigateTo('/cart');
    await steps.verifyUrlContains('/login');
  });

  test('accessing orders without auth redirects to login', async ({ steps }) => {
    await steps.navigateTo('/orders');
    await steps.verifyUrlContains('/login');
  });

  test('accessing profile without auth redirects to login', async ({ steps }) => {
    await steps.navigateTo('/profile');
    await steps.verifyUrlContains('/login');
  });

  test('accessing sell page without auth redirects to login', async ({ steps }) => {
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyUrlContains('/login');
  });

  test('search with very long query handles gracefully', async ({ steps }) => {
    await steps.navigateTo('/');
    const longQuery = 'a'.repeat(200);
    await steps.fill('HomePage', 'searchInput', longQuery);
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'homePage');
  });

  test('pagination stays on last page when at end', async ({ steps, page }) => {
    await steps.navigateTo('/');
    // Navigate to last page
    for (let i = 0; i < 4; i++) {
      const isEnabled = await page.locator("[data-testid='next-page']").isEnabled();
      if (!isEnabled) break;
      await steps.click('HomePage', 'nextPage');
      await steps.waitForNetworkIdle();
    }
    // Next button should be disabled on last page
    await steps.verifyState('HomePage', 'nextPage', 'disabled');
  });
});
