import { test, expect, TEST_USER_1, API_BASE_URL } from './fixtures/base';
import pageRepository from './data/page-repository.json';

test.describe('Homepage', () => {
  test.beforeEach(async ({ request }) => {
    // Reset the app to known state before each test
    await request.post(`${API_BASE_URL}/api/reset`);
  });

  test('should display homepage with book grid', async ({ page }) => {
    await test.step('Given the user navigates to the homepage', async () => {
      await page.goto('/');
    });

    await test.step('Then the homepage should be displayed', async () => {
      await expect(page.locator(pageRepository.HomePage.container)).toBeVisible();
    });

    await test.step('And the book grid should be visible with books', async () => {
      await expect(page.locator(pageRepository.HomePage.bookGrid)).toBeVisible();
      // Check that at least some books are displayed
      const bookCards = page.locator('[data-testid^="book-card-"]');
      await expect(bookCards.first()).toBeVisible();
    });
  });

  test('should search for books', async ({ page }) => {
    await test.step('Given the user is on the homepage', async () => {
      await page.goto('/');
      await expect(page.locator(pageRepository.HomePage.bookGrid)).toBeVisible();
    });

    await test.step('When the user searches for "Mockingbird"', async () => {
      await page.locator(pageRepository.HomePage.searchInput).fill('Mockingbird');
      await page.locator(pageRepository.HomePage.searchInput).press('Enter');
    });

    await test.step('Then books matching the search query should be displayed', async () => {
      // Wait for search results to load
      await page.waitForTimeout(500);
      const bookCards = page.locator('[data-testid^="book-card-"]');
      const count = await bookCards.count();
      expect(count).toBeGreaterThan(0);
      // Check that the first result contains the search term
      const firstBookTitle = page.locator('[data-testid^="book-title-"]').first();
      await expect(firstBookTitle).toContainText(/mockingbird/i);
    });
  });

  test('should filter books by genre', async ({ page }) => {
    await test.step('Given the user is on the homepage', async () => {
      await page.goto('/');
      await expect(page.locator(pageRepository.HomePage.bookGrid)).toBeVisible();
    });

    await test.step('When the user clicks on the Fiction genre filter', async () => {
      // Use sidebar genre filter (visible on desktop) instead of genre chips (mobile only)
      await page.locator(pageRepository.GenreFilter.sidebarFiction).click();
    });

    await test.step('Then only Fiction books should be displayed', async () => {
      await page.waitForTimeout(500);
      const genreBadges = page.locator('[data-testid^="book-genre-"]');
      const count = await genreBadges.count();
      expect(count).toBeGreaterThan(0);
      // Verify all displayed books are Fiction
      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(genreBadges.nth(i)).toHaveText('Fiction');
      }
    });
  });

  test('should navigate through pagination', async ({ page }) => {
    await test.step('Given the user is on the homepage with books', async () => {
      await page.goto('/');
      await expect(page.locator(pageRepository.HomePage.bookGrid)).toBeVisible();
    });

    await test.step('And pagination is available', async () => {
      await expect(page.locator(pageRepository.HomePage.pagination)).toBeVisible();
    });

    await test.step('When the user clicks next page', async () => {
      // Get first book title before pagination
      const firstBookBefore = await page.locator('[data-testid^="book-title-"]').first().textContent();

      await page.locator(pageRepository.HomePage.nextPage).click();

      // Wait for new page to load
      await page.waitForTimeout(500);

      // Get first book title after pagination
      const firstBookAfter = await page.locator('[data-testid^="book-title-"]').first().textContent();

      // The books should be different after pagination
      expect(firstBookAfter).not.toBe(firstBookBefore);
    });

    await test.step('And when the user clicks previous page', async () => {
      await page.locator(pageRepository.HomePage.prevPage).click();
      await page.waitForTimeout(500);
      await expect(page.locator(pageRepository.HomePage.bookGrid)).toBeVisible();
    });
  });

  test('should display book cards with correct information', async ({ page }) => {
    await test.step('Given the user is on the homepage', async () => {
      await page.goto('/');
      await expect(page.locator(pageRepository.HomePage.bookGrid)).toBeVisible();
    });

    await test.step('Then each book card should display title, author, price, and genre', async () => {
      const firstBookCard = page.locator('[data-testid^="book-card-"]').first();
      await expect(firstBookCard).toBeVisible();

      // Check for title
      const titleElement = page.locator('[data-testid^="book-title-"]').first();
      await expect(titleElement).toBeVisible();
      const title = await titleElement.textContent();
      expect(title?.length).toBeGreaterThan(0);

      // Check for author
      const authorElement = page.locator('[data-testid^="book-author-"]').first();
      await expect(authorElement).toBeVisible();

      // Check for price
      const priceElement = page.locator('[data-testid^="book-price-"]').first();
      await expect(priceElement).toBeVisible();
      const price = await priceElement.textContent();
      expect(price).toMatch(/\$\d+\.\d{2}/);

      // Check for genre
      const genreElement = page.locator('[data-testid^="book-genre-"]').first();
      await expect(genreElement).toBeVisible();
    });
  });

  test('should navigate to book detail page when clicking on a book card', async ({ page }) => {
    await test.step('Given the user is on the homepage', async () => {
      await page.goto('/');
      await expect(page.locator(pageRepository.HomePage.bookGrid)).toBeVisible();
    });

    await test.step('When the user clicks on a book card', async () => {
      const firstBookCard = page.locator('[data-testid^="book-card-"]').first();
      await firstBookCard.click();
    });

    await test.step('Then the book detail page should be displayed', async () => {
      await expect(page).toHaveURL(/\/books\//);
      await expect(page.locator(pageRepository.BookDetail.container)).toBeVisible();
    });
  });
});
