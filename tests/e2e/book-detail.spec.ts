import { test, expect, TEST_USER_1, API_BASE_URL } from './fixtures/base';
import pageRepository from './data/page-repository.json';

test.describe('Book Detail Page', () => {
  test.beforeEach(async ({ request }) => {
    // Reset the app to known state before each test
    await request.post(`${API_BASE_URL}/api/reset`);
  });

  test('should display book details correctly', async ({ page }) => {
    await test.step('Given a book exists with id book-001', async () => {
      // Navigate directly to a known book
      await page.goto('/books/book-001');
    });

    await test.step('Then the book detail page should be displayed', async () => {
      await expect(page.locator(pageRepository.BookDetail.container)).toBeVisible();
    });

    await test.step('And the book title should be visible', async () => {
      await expect(page.locator(pageRepository.BookDetail.title)).toBeVisible();
      const title = await page.locator(pageRepository.BookDetail.title).textContent();
      expect(title?.length).toBeGreaterThan(0);
    });

    await test.step('And the book author should be visible', async () => {
      await expect(page.locator(pageRepository.BookDetail.author)).toBeVisible();
    });

    await test.step('And the book price should be displayed in correct format', async () => {
      await expect(page.locator(pageRepository.BookDetail.price)).toBeVisible();
      const price = await page.locator(pageRepository.BookDetail.price).textContent();
      expect(price).toMatch(/\$\d+\.\d{2}/);
    });

    await test.step('And the book description should be visible', async () => {
      await expect(page.locator(pageRepository.BookDetail.description)).toBeVisible();
    });

    await test.step('And the book genre should be visible', async () => {
      await expect(page.locator(pageRepository.BookDetail.genre)).toBeVisible();
    });

    await test.step('And the stock information should be visible', async () => {
      await expect(page.locator(pageRepository.BookDetail.stock)).toBeVisible();
    });
  });

  test('should display add to cart button for logged in users', async ({ page }) => {
    await test.step('Given the user is logged in', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
    });

    await test.step('When the user navigates to a book detail page', async () => {
      await page.goto('/books/book-001');
      await expect(page.locator(pageRepository.BookDetail.container)).toBeVisible();
    });

    await test.step('Then the add to cart button should be visible', async () => {
      await expect(page.locator(pageRepository.BookDetail.addToCartButton)).toBeVisible();
    });
  });

  test('should add book to cart from detail page', async ({ page }) => {
    await test.step('Given the user is logged in', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
    });

    await test.step('And the user is on a book detail page', async () => {
      await page.goto('/books/book-001');
      await expect(page.locator(pageRepository.BookDetail.container)).toBeVisible();
    });

    await test.step('When the user clicks add to cart', async () => {
      await page.locator(pageRepository.BookDetail.addToCartButton).click();
    });

    await test.step('Then the cart badge should update', async () => {
      await expect(page.locator(pageRepository.Navigation.cartBadge)).toBeVisible();
      const badgeText = await page.locator(pageRepository.Navigation.cartBadge).textContent();
      expect(parseInt(badgeText || '0')).toBeGreaterThan(0);
    });
  });

  test('should show not found for invalid book id', async ({ page }) => {
    await test.step('When the user navigates to a non-existent book', async () => {
      await page.goto('/books/invalid-book-id');
    });

    await test.step('Then a not found message should be displayed', async () => {
      await expect(page.locator(pageRepository.BookDetail.notFound)).toBeVisible();
    });
  });

  test('should navigate back to homepage', async ({ page }) => {
    await test.step('Given the user is on a book detail page', async () => {
      await page.goto('/books/book-001');
      await expect(page.locator(pageRepository.BookDetail.container)).toBeVisible();
    });

    await test.step('When the user clicks on the logo/home link', async () => {
      await page.locator(pageRepository.Navigation.allBooksLink).click();
    });

    await test.step('Then the user should be on the homepage', async () => {
      await expect(page).toHaveURL('/');
      await expect(page.locator(pageRepository.HomePage.container)).toBeVisible();
    });
  });
});
