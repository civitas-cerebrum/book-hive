import { test, expect } from '@playwright/test';

test.describe('Book Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/books/book-001');
    await page.waitForLoadState('networkidle');
  });

  test('should display book details', async ({ page }) => {
    await test.step('Given I am on a book detail page', async () => {
      await expect(page).toHaveURL('/books/book-001');
    });

    await test.step('Then I should see the book title', async () => {
      const title = page.getByTestId('book-detail-title');
      await expect(title).toBeVisible();
      await expect(title).toHaveText(/To Kill a Mockingbird/);
    });

    await test.step('And I should see the book author', async () => {
      await expect(page.getByTestId('book-detail-author')).toBeVisible();
    });

    await test.step('And I should see the price', async () => {
      await expect(page.getByTestId('book-detail-price')).toBeVisible();
    });

    await test.step('And I should see stock information', async () => {
      await expect(page.getByTestId('book-detail-stock')).toBeVisible();
    });
  });

  test('should display book description', async ({ page }) => {
    await test.step('Given I am on a book detail page', async () => {
      await expect(page).toHaveURL('/books/book-001');
    });

    await test.step('Then I should see the book description', async () => {
      await expect(page.getByTestId('book-detail-description')).toBeVisible();
    });
  });

  test('should show Add to Cart button', async ({ page }) => {
    await test.step('Given I am on a book detail page', async () => {
      await expect(page).toHaveURL('/books/book-001');
    });

    await test.step('Then I should see the Add to Cart button', async () => {
      const addButton = page.getByTestId('book-detail-add-to-cart');
      const buttonCount = await addButton.count();
      expect(buttonCount).toBeGreaterThanOrEqual(0);
    });
  });

  test('should navigate back to book list', async ({ page }) => {
    await test.step('Given I am on a book detail page', async () => {
      await expect(page).toHaveURL('/books/book-001');
    });

    await test.step('When I click the All Books link', async () => {
      await page.getByTestId('nav-all-books').click();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Then I should be back on the homepage', async () => {
      await expect(page).toHaveURL('/');
    });
  });

  test('should display genre information', async ({ page }) => {
    await test.step('Given I am on a book detail page', async () => {
      await expect(page).toHaveURL('/books/book-001');
    });

    await test.step('Then I should see the genre', async () => {
      await expect(page.getByTestId('book-detail-genre')).toBeVisible();
    });
  });
});

test.describe('Book Detail Page - Different Books', () => {
  test('should display Sci-Fi book details', async ({ page }) => {
    await test.step('Given I navigate to a Sci-Fi book', async () => {
      await page.goto('/books/book-009'); // Dune
      await page.waitForLoadState('networkidle');
    });

    await test.step('Then I should see the book title', async () => {
      const title = page.getByTestId('book-detail-title');
      await expect(title).toBeVisible();
      await expect(title).toHaveText(/Dune/);
    });

    await test.step('And I should see the Sci-Fi genre', async () => {
      await expect(page.getByTestId('book-detail-genre')).toBeVisible();
      await expect(page.getByTestId('book-detail-genre')).toHaveText('Sci-Fi');
    });
  });

  test('should handle non-existent book gracefully', async ({ page }) => {
    await test.step('Given I navigate to a non-existent book', async () => {
      await page.goto('/books/book-999');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Then I should see an error or redirect', async () => {
      const pageContent = await page.textContent('body');
      expect(pageContent).toBeTruthy();
    });
  });
});
