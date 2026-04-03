import { test, expect } from '@playwright/test';
import { getSelector } from '../fixtures/base';

test.describe('Book Detail Page', () => {
  test('should display book details when navigating from homepage', async ({ page }) => {
    await test.step('Given I am on the homepage', async () => {
      await page.goto('/');
      await page.waitForSelector('[data-testid^="book-card-"]', { timeout: 10000 });
    });

    await test.step('When I click on a book card', async () => {
      await page.locator('[data-testid^="book-card-"]').first().click();
    });

    await test.step('Then I should see the book detail page', async () => {
      await expect(page.locator(getSelector('BookDetailPage', 'pageContainer'))).toBeVisible();
    });

    await test.step('And I should see the book title', async () => {
      await expect(page.locator(getSelector('BookDetailPage', 'title'))).toBeVisible();
      await expect(page.locator(getSelector('BookDetailPage', 'title'))).not.toBeEmpty();
    });

    await test.step('And I should see the book author', async () => {
      await expect(page.locator(getSelector('BookDetailPage', 'author'))).toBeVisible();
    });

    await test.step('And I should see the book description', async () => {
      await expect(page.locator(getSelector('BookDetailPage', 'description'))).toBeVisible();
    });

    await test.step('And I should see the book price', async () => {
      const price = page.locator(getSelector('BookDetailPage', 'price'));
      await expect(price).toBeVisible();
      await expect(price).toContainText('$');
    });

    await test.step('And I should see the stock status', async () => {
      await expect(page.locator(getSelector('BookDetailPage', 'stock'))).toBeVisible();
    });
  });

  test('should display book details when navigating directly by URL', async ({ page }) => {
    await test.step('Given I navigate directly to a book detail page', async () => {
      await page.goto('/books/book-001');
    });

    await test.step('Then I should see the book detail page', async () => {
      await expect(page.locator(getSelector('BookDetailPage', 'pageContainer'))).toBeVisible();
    });

    await test.step('And I should see "To Kill a Mockingbird"', async () => {
      await expect(page.locator(getSelector('BookDetailPage', 'title'))).toContainText('To Kill a Mockingbird');
    });

    await test.step('And I should see author "Harper Lee"', async () => {
      await expect(page.locator(getSelector('BookDetailPage', 'author'))).toContainText('Harper Lee');
    });
  });

  test('should not show Add to Cart button for unauthenticated users', async ({ page }) => {
    await test.step('Given I am not logged in and viewing a book', async () => {
      await page.goto('/books/book-001');
      await expect(page.locator(getSelector('BookDetailPage', 'pageContainer'))).toBeVisible();
    });

    await test.step('Then the Add to Cart button should not be visible', async () => {
      const addToCartBtn = page.locator(getSelector('BookDetailPage', 'addToCart'));
      await expect(addToCartBtn).not.toBeVisible();
    });
  });

  test('should display genre badge', async ({ page }) => {
    await test.step('Given I am viewing a book detail page', async () => {
      await page.goto('/books/book-001');
      await expect(page.locator(getSelector('BookDetailPage', 'pageContainer'))).toBeVisible();
    });

    await test.step('Then I should see the genre badge', async () => {
      await expect(page.locator(getSelector('BookDetailPage', 'genre'))).toBeVisible();
    });
  });

  test('should show 404 for non-existent book', async ({ page }) => {
    await test.step('Given I navigate to a non-existent book', async () => {
      await page.goto('/books/non-existent-book-id');
    });

    await test.step('Then I should see a not found message', async () => {
      await expect(page.locator(getSelector('BookDetailPage', 'notFound'))).toBeVisible();
    });
  });

  test('should display book with correct price format', async ({ page }) => {
    await test.step('Given I am viewing a book detail page', async () => {
      await page.goto('/books/book-001');
      await expect(page.locator(getSelector('BookDetailPage', 'pageContainer'))).toBeVisible();
    });

    await test.step('Then the price should be formatted correctly with dollar sign', async () => {
      const price = page.locator(getSelector('BookDetailPage', 'price'));
      const priceText = await price.textContent();
      expect(priceText).toMatch(/^\$\d+\.\d{2}$/);
    });
  });

  test('should navigate back to homepage when clicking All Books', async ({ page }) => {
    await test.step('Given I am viewing a book detail page', async () => {
      await page.goto('/books/book-001');
      await expect(page.locator(getSelector('BookDetailPage', 'pageContainer'))).toBeVisible();
    });

    await test.step('When I click on All Books in the sidebar', async () => {
      await page.click(getSelector('Common', 'navAllBooks'));
    });

    await test.step('Then I should be back on the homepage', async () => {
      await expect(page).toHaveURL('/');
      await expect(page.locator(getSelector('HomePage', 'pageContainer'))).toBeVisible();
    });
  });
});
