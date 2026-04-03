import { test, expect } from '../../fixtures/base';

test.describe('Browse Edge Cases', () => {
  test.describe.configure({ timeout: 60_000 });

  test('should show no results message for non-matching search', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'xyznonexistentbook123');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();

    // Should show no books message or empty grid
    const noBooksMsg = page.locator('[data-testid="no-books"]');
    const hasMessage = await noBooksMsg.isVisible({ timeout: 5000 }).catch(() => false);
    if (!hasMessage) {
      // Check for empty grid (no book cards)
      const bookCards = await page.locator('[data-testid^="book-card-"]').count();
      expect(bookCards).toBe(0);
    }
  });

  test('should filter by Sci-Fi genre', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'genreFilterSciFi');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('genre=Sci-Fi');
  });

  test('should filter by Non-Fiction genre', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'genreFilterNonFiction');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('genre=Non-Fiction');
  });

  test('should filter by Biography genre', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'genreFilterBiography');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('genre=Biography');
  });

  test('should handle non-existent book page', async ({ steps }) => {
    await steps.navigateTo('/books/nonexistent-book-id');
    await steps.verifyPresence('BookDetailPage', 'notFound');
  });

  test('should navigate through multiple pages', async ({ steps }) => {
    await steps.navigateTo('/');

    // Go to page 2
    await steps.click('HomePage', 'nextPageButton');
    await steps.waitForNetworkIdle();
    await steps.verifyState('HomePage', 'prevPageButton', 'enabled');

    // Go to page 3
    await steps.click('HomePage', 'nextPageButton');
    await steps.waitForNetworkIdle();

    // Go back to page 2
    await steps.click('HomePage', 'prevPageButton');
    await steps.waitForNetworkIdle();
  });

  test('should clear search and show all books', async ({ steps, page }) => {
    // Start with a search
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();

    // Clear search by navigating to home without query
    await steps.navigateTo('/');
    await steps.waitForNetworkIdle();

    // Should show books (pagination indicates multiple pages of books)
    // Use firstBookCard to avoid strict mode violation (multiple book cards exist)
    await steps.verifyPresence('HomePage', 'firstBookCard');
    await steps.verifyPresence('HomePage', 'nextPageButton');
  });
});
