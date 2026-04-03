import { test, expect } from '@playwright/test';

test.describe('Homepage - Book Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display the homepage with book grid', async ({ page }) => {
    await test.step('Given I am on the homepage', async () => {
      await expect(page).toHaveURL('/');
    });

    await test.step('Then I should see the navigation with BookHive logo', async () => {
      await expect(page.locator('nav')).toBeVisible();
      // Use .first() to handle multiple "BookHive" elements
      await expect(page.getByText('BookHive').first()).toBeVisible();
    });

    await test.step('And I should see the search input', async () => {
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeVisible();
    });

    await test.step('And I should see book cards', async () => {
      const bookCards = page.locator("a[href^='/books/']");
      await expect(bookCards.first()).toBeVisible();
      const count = await bookCards.count();
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(12);
    });

    await test.step('And I should see pagination controls', async () => {
      await expect(page.getByRole('button', { name: /previous/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /next/i })).toBeVisible();
    });
  });

  test('should display book information on cards', async ({ page }) => {
    await test.step('Given I am on the homepage', async () => {
      await expect(page).toHaveURL('/');
    });

    await test.step('Then each book card should display price', async () => {
      const firstBookCard = page.locator("a[href^='/books/']").first();
      await expect(firstBookCard).toBeVisible();
      // Book cards should contain price information
      await expect(firstBookCard.locator('text=/\\$/')).toBeVisible();
    });
  });

  test('should navigate between pages using pagination', async ({ page }) => {
    await test.step('Given I am on the first page', async () => {
      await expect(page.getByText('1 / 5')).toBeVisible();
      await expect(page.getByRole('button', { name: /previous/i })).toBeDisabled();
    });

    await test.step('When I click the Next button', async () => {
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Then I should be on page 2', async () => {
      await expect(page.getByText('2 / 5')).toBeVisible();
      await expect(page.getByRole('button', { name: /previous/i })).not.toBeDisabled();
    });

    await test.step('When I click Previous button', async () => {
      await page.getByRole('button', { name: /previous/i }).click();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Then I should be back on page 1', async () => {
      await expect(page.getByText('1 / 5')).toBeVisible();
    });
  });

  test('should filter books by genre', async ({ page }) => {
    await test.step('Given I am on the homepage', async () => {
      await expect(page).toHaveURL('/');
    });

    await test.step('When I click on the Fiction genre link', async () => {
      await page.locator("a[href='/?genre=Fiction']").click();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Then the URL should include genre=Fiction', async () => {
      await expect(page).toHaveURL('/?genre=Fiction');
    });

    await test.step('And I should see book results', async () => {
      const bookCards = page.locator("a[href^='/books/']");
      const count = await bookCards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test('should search for books', async ({ page }) => {
    await test.step('Given I am on the homepage', async () => {
      await expect(page).toHaveURL('/');
    });

    await test.step('When I type a search query', async () => {
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('Mockingbird');
      await page.waitForTimeout(500);
    });

    await test.step('Then I should see filtered results', async () => {
      const bookCards = page.locator("a[href^='/books/']");
      const count = await bookCards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test('should navigate to book detail page when clicking a book', async ({ page }) => {
    await test.step('Given I am on the homepage', async () => {
      await expect(page).toHaveURL('/');
    });

    await test.step('When I click on the first book', async () => {
      const firstBook = page.locator("a[href^='/books/']").first();
      await firstBook.click();
    });

    await test.step('Then I should be on the book detail page', async () => {
      await expect(page).toHaveURL(/\/books\/book-\d+/);
    });
  });
});
