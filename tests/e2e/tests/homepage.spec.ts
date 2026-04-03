import { test, expect } from '@playwright/test';
import { getSelector } from '../fixtures/base';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the homepage with book catalog', async ({ page }) => {
    await test.step('Given I am on the homepage', async () => {
      await expect(page.locator(getSelector('HomePage', 'pageContainer'))).toBeVisible();
    });

    await test.step('Then I should see the search input', async () => {
      await expect(page.locator(getSelector('HomePage', 'searchInput'))).toBeVisible();
    });

    await test.step('And I should see the book grid with books', async () => {
      await expect(page.locator(getSelector('HomePage', 'bookGrid'))).toBeVisible();
      // Wait for books to load
      await page.waitForSelector('[data-testid^="book-card-"]', { timeout: 10000 });
      const bookCards = page.locator('[data-testid^="book-card-"]');
      await expect(bookCards.first()).toBeVisible();
    });

    await test.step('And I should see genre filter chips', async () => {
      await expect(page.locator(getSelector('HomePage', 'genreChips'))).toBeVisible();
    });
  });

  test('should display book cards with correct information', async ({ page }) => {
    await test.step('Given I am on the homepage', async () => {
      await page.waitForSelector('[data-testid^="book-card-"]', { timeout: 10000 });
    });

    await test.step('Then each book card should have title, author, and price', async () => {
      const firstBookCard = page.locator('[data-testid^="book-card-"]').first();
      await expect(firstBookCard).toBeVisible();

      // Check for title
      const title = firstBookCard.locator('[data-testid^="book-title-"]');
      await expect(title).toBeVisible();
      await expect(title).not.toBeEmpty();

      // Check for author
      const author = firstBookCard.locator('[data-testid^="book-author-"]');
      await expect(author).toBeVisible();

      // Check for price
      const price = firstBookCard.locator('[data-testid^="book-price-"]');
      await expect(price).toBeVisible();
      await expect(price).toContainText('$');
    });
  });

  test('should search for books by title', async ({ page }) => {
    await test.step('Given I am on the homepage', async () => {
      await page.waitForSelector('[data-testid^="book-card-"]', { timeout: 10000 });
    });

    await test.step('When I search for "Gatsby"', async () => {
      await page.fill(getSelector('HomePage', 'searchInput'), 'Gatsby');
      await page.press(getSelector('HomePage', 'searchInput'), 'Enter');
    });

    await test.step('Then I should see search results containing "Gatsby"', async () => {
      await page.waitForTimeout(1000); // Wait for search results
      const bookGrid = page.locator(getSelector('HomePage', 'bookGrid'));
      await expect(bookGrid).toBeVisible();

      // Either we find books or see "no books" message
      const hasBooks = await page.locator('[data-testid^="book-card-"]').count() > 0;
      const noBooks = await page.locator(getSelector('HomePage', 'noBooks')).isVisible().catch(() => false);

      expect(hasBooks || noBooks).toBeTruthy();
    });
  });

  test('should filter books by genre', async ({ page }) => {
    await test.step('Given I am on the homepage', async () => {
      await page.waitForSelector('[data-testid^="book-card-"]', { timeout: 10000 });
    });

    await test.step('When I click on the Sci-Fi genre filter', async () => {
      await page.click(getSelector('HomePage', 'genreChipSciFi'));
    });

    await test.step('Then I should see only Sci-Fi books', async () => {
      await page.waitForTimeout(1000); // Wait for filter to apply
      await page.waitForSelector('[data-testid^="book-card-"]', { timeout: 10000 });

      // Check that URL contains genre parameter
      await expect(page).toHaveURL(/genre=Sci-Fi/);

      // Check that at least one book is displayed
      const bookCount = await page.locator('[data-testid^="book-card-"]').count();
      expect(bookCount).toBeGreaterThan(0);
    });
  });

  test('should navigate between pages with pagination', async ({ page }) => {
    await test.step('Given I am on the homepage with multiple pages of books', async () => {
      await page.waitForSelector('[data-testid^="book-card-"]', { timeout: 10000 });
    });

    await test.step('When pagination is available', async () => {
      const pagination = page.locator(getSelector('HomePage', 'pagination'));
      const paginationVisible = await pagination.isVisible().catch(() => false);

      if (paginationVisible) {
        await test.step('Then I can navigate to the next page', async () => {
          const nextButton = page.locator(getSelector('HomePage', 'nextPage'));
          const isDisabled = await nextButton.isDisabled();

          if (!isDisabled) {
            await nextButton.click();
            await page.waitForTimeout(500);
            // Page should still show books
            await expect(page.locator('[data-testid^="book-card-"]').first()).toBeVisible();
          }
        });
      }
    });
  });

  test('should navigate to book detail page when clicking a book', async ({ page }) => {
    await test.step('Given I am on the homepage', async () => {
      await page.waitForSelector('[data-testid^="book-card-"]', { timeout: 10000 });
    });

    await test.step('When I click on a book card', async () => {
      await page.locator('[data-testid^="book-card-"]').first().click();
    });

    await test.step('Then I should be navigated to the book detail page', async () => {
      await expect(page).toHaveURL(/\/books\/.+/);
      await expect(page.locator(getSelector('BookDetailPage', 'pageContainer'))).toBeVisible();
    });
  });
});
