import { test, expect, getSelector, API_BASE } from './fixtures/base';

test.describe('Book Detail Page', () => {

  test('should display book details', async ({ page }) => {
    await test.step('Given I navigate to a book detail page', async () => {
      await page.goto('/books/book-001');
    });

    await test.step('Then I should see the book detail container', async () => {
      await expect(page.locator(getSelector('BookDetailPage', 'container'))).toBeVisible();
    });

    await test.step('And I should see the book title', async () => {
      await expect(page.locator(getSelector('BookDetailPage', 'title'))).toBeVisible();
      await expect(page.locator(getSelector('BookDetailPage', 'title'))).toContainText('To Kill a Mockingbird');
    });

    await test.step('And I should see the book author', async () => {
      await expect(page.locator(getSelector('BookDetailPage', 'author'))).toBeVisible();
      await expect(page.locator(getSelector('BookDetailPage', 'author'))).toContainText('Harper Lee');
    });

    await test.step('And I should see the book price', async () => {
      await expect(page.locator(getSelector('BookDetailPage', 'price'))).toBeVisible();
      await expect(page.locator(getSelector('BookDetailPage', 'price'))).toContainText('$');
    });

    await test.step('And I should see the book genre', async () => {
      await expect(page.locator(getSelector('BookDetailPage', 'genre'))).toBeVisible();
    });

    await test.step('And I should see the book description', async () => {
      await expect(page.locator(getSelector('BookDetailPage', 'description'))).toBeVisible();
    });

    await test.step('And I should see stock information', async () => {
      await expect(page.locator(getSelector('BookDetailPage', 'stock'))).toBeVisible();
    });
  });

  test('should not show add to cart button for guest users', async ({ page }) => {
    await test.step('Given I am not logged in', async () => {
      await page.goto('/books/book-001');
    });

    await test.step('Then the add to cart button should not be visible', async () => {
      await expect(page.locator(getSelector('BookDetailPage', 'container'))).toBeVisible();
      await expect(page.locator(getSelector('BookDetailPage', 'addToCartButton'))).not.toBeVisible();
    });
  });

  test('should show add to cart button for logged in users', async ({ page, loginAs }) => {
    await test.step('Given I am logged in', async () => {
      await loginAs('user1');
    });

    await test.step('When I navigate to a book detail page', async () => {
      await page.goto('/books/book-001');
    });

    await test.step('Then I should see the add to cart button', async () => {
      await expect(page.locator(getSelector('BookDetailPage', 'addToCartButton'))).toBeVisible();
    });
  });

  test('should add book to cart from detail page', async ({ page, loginAs }) => {
    await test.step('Given I am logged in', async () => {
      await loginAs('user1');
    });

    await test.step('And I am on a book detail page', async () => {
      await page.goto('/books/book-001');
    });

    await test.step('When I click add to cart', async () => {
      await page.locator(getSelector('BookDetailPage', 'addToCartButton')).click();
    });

    await test.step('Then I should see the cart badge appear', async () => {
      await expect(page.locator(getSelector('Navigation', 'cartBadge'))).toBeVisible();
    });
  });

  test('should navigate to book detail from home page', async ({ page }) => {
    await test.step('Given I am on the home page', async () => {
      await page.goto('/');
    });

    await test.step('When I click on a book card', async () => {
      await expect(page.locator(getSelector('HomePage', 'bookGrid'))).toBeVisible();
      const firstBook = page.locator('[data-testid^="book-card-"]').first();
      await firstBook.click();
    });

    await test.step('Then I should be on the book detail page', async () => {
      await page.waitForURL(/\/books\/.+/);
      await expect(page.locator(getSelector('BookDetailPage', 'container'))).toBeVisible();
    });
  });

  test('should display not found for non-existent book', async ({ page }) => {
    await test.step('Given I navigate to a non-existent book', async () => {
      await page.goto('/books/non-existent-book');
    });

    await test.step('Then I should see not found message', async () => {
      await expect(page.locator(getSelector('BookDetailPage', 'notFound'))).toBeVisible();
    });
  });
});
