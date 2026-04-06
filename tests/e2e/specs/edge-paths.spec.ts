import { test, expect } from '../fixtures/base';

test.describe('Edge Path Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  // Unique: verifies user can navigate AWAY from no-results state
  // (The no-results assertion itself is covered by search-edge-cases + usability-empty-states)
  test('@functional search-no-results-edge user can navigate away from no-results', async ({ steps }) => {
    await steps.navigateTo('/');

    await steps.fill('HomePage', 'searchInput', 'xyznonexistentbook999');
    await steps.pressKey('Enter');
    await steps.verifyPresence('HomePage', 'noBooks');

    // Navigate back to all books
    await steps.click('Navigation', 'navAllBooks');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });
});
