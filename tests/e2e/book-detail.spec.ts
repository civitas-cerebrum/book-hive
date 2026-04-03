import { test, expect } from './fixtures/base';

test.describe('Book Detail', () => {
  test('should display book details', async ({ page, sel }) => {
    await page.goto('/books/book-001');
    await expect(page.locator(sel('BookDetailPage', 'page'))).toBeVisible();
    await expect(page.locator(sel('BookDetailPage', 'title'))).toBeVisible();
    await expect(page.locator(sel('BookDetailPage', 'author'))).toBeVisible();
    await expect(page.locator(sel('BookDetailPage', 'price'))).toBeVisible();
    await expect(page.locator(sel('BookDetailPage', 'description'))).toBeVisible();
  });

  test('should show add to cart button', async ({ page, sel }) => {
    await page.goto('/books/book-001');
    await expect(page.locator(sel('BookDetailPage', 'addToCartButton'))).toBeVisible();
  });

  test('should show not found for invalid book', async ({ page, sel }) => {
    await page.goto('/books/invalid-id');
    await expect(page.locator(sel('BookDetailPage', 'notFound'))).toBeVisible();
  });

  test('should add to cart when logged in', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/books/book-001');
    await page.locator(sel('BookDetailPage', 'addToCartButton')).click();
    await expect(page.locator(sel('Navigation', 'cartBadge'))).toBeVisible();
  });

  test('should redirect to login when adding to cart unauthenticated', async ({ page, sel }) => {
    await page.goto('/books/book-001');
    await page.locator(sel('BookDetailPage', 'addToCartButton')).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
