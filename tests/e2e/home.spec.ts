import { test, expect, getSelector, API_BASE } from './fixtures/base';

test.describe('Home Page', () => {

  test('should display the home page with book grid', async ({ page }) => {
    await test.step('Given I navigate to the home page', async () => {
      await page.goto('/');
    });

    await test.step('Then I should see the home page container', async () => {
      await expect(page.locator(getSelector('HomePage', 'container'))).toBeVisible();
    });

    await test.step('And I should see the book grid with books', async () => {
      await expect(page.locator(getSelector('HomePage', 'bookGrid'))).toBeVisible();
      const bookCards = page.locator('[data-testid^="book-card-"]');
      await expect(bookCards.first()).toBeVisible();
      expect(await bookCards.count()).toBeGreaterThan(0);
    });
  });

  test('should display search input', async ({ page }) => {
    await test.step('Given I navigate to the home page', async () => {
      await page.goto('/');
    });

    await test.step('Then I should see the search input', async () => {
      await expect(page.locator(getSelector('HomePage', 'searchInput'))).toBeVisible();
    });
  });

  test('should search for books by title', async ({ page }) => {
    await test.step('Given I navigate to the home page', async () => {
      await page.goto('/');
    });

    await test.step('When I search for "Mockingbird"', async () => {
      await page.locator(getSelector('HomePage', 'searchInput')).fill('Mockingbird');
      await page.locator(getSelector('HomePage', 'searchInput')).press('Enter');
    });

    await test.step('Then I should see search results', async () => {
      // Wait for the search to complete
      await page.waitForURL(/query=Mockingbird/);
      const bookCards = page.locator('[data-testid^="book-card-"]');
      // Should find "To Kill a Mockingbird"
      await expect(bookCards.first()).toBeVisible({ timeout: 10000 });
    });
  });

  test('should navigate using pagination when available', async ({ page }) => {
    await test.step('Given I navigate to the home page', async () => {
      await page.goto('/');
    });

    await test.step('When the pagination is visible', async () => {
      // Wait for books to load
      await expect(page.locator(getSelector('HomePage', 'bookGrid'))).toBeVisible();
    });

    await test.step('Then I should be able to use pagination if there are multiple pages', async () => {
      const pagination = page.locator(getSelector('HomePage', 'pagination'));
      if (await pagination.isVisible()) {
        const nextButton = page.locator(getSelector('HomePage', 'nextPage'));
        if (await nextButton.isEnabled()) {
          await nextButton.click();
          // URL should update with page parameter
          await page.waitForLoadState('networkidle');
        }
      }
    });
  });

  test('should display book cards with correct information', async ({ page }) => {
    await test.step('Given I navigate to the home page', async () => {
      await page.goto('/');
    });

    await test.step('Then each book card should have title, author, and price', async () => {
      await expect(page.locator(getSelector('HomePage', 'bookGrid'))).toBeVisible();

      // Check first book card has required elements
      const firstBookTitle = page.locator('[data-testid^="book-title-"]').first();
      const firstBookAuthor = page.locator('[data-testid^="book-author-"]').first();
      const firstBookPrice = page.locator('[data-testid^="book-price-"]').first();

      await expect(firstBookTitle).toBeVisible();
      await expect(firstBookAuthor).toBeVisible();
      await expect(firstBookPrice).toBeVisible();

      // Price should contain a dollar sign
      await expect(firstBookPrice).toContainText('$');
    });
  });

  test('should filter books by genre through sidebar', async ({ page }) => {
    await test.step('Given I navigate to the home page', async () => {
      await page.goto('/');
    });

    await test.step('When I click on Fiction genre filter', async () => {
      await page.locator(getSelector('Navigation', 'genreFilterFiction')).click();
    });

    await test.step('Then the URL should reflect the genre filter', async () => {
      await page.waitForURL(/genre=Fiction/);
    });

    await test.step('And books displayed should be fiction', async () => {
      const bookGenres = page.locator('[data-testid^="book-genre-"]');
      await expect(bookGenres.first()).toBeVisible();
      // All visible genres should be Fiction
      const genres = await bookGenres.allTextContents();
      for (const genre of genres) {
        expect(genre).toBe('Fiction');
      }
    });
  });
});
