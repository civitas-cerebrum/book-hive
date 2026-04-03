import { test, expect, TEST_USER_1, API_BASE_URL } from './fixtures/base';
import pageRepository from './data/page-repository.json';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ request }) => {
    // Reset the app to known state before each test
    await request.post(`${API_BASE_URL}/api/reset`);
  });

  test('should complete checkout successfully', async ({ page }) => {
    await test.step('Given the user is logged in', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
    });

    await test.step('And the user has items in cart', async () => {
      await page.goto('/');
      await page.locator('[data-testid="add-to-cart-book-001"]').click();
      await page.waitForTimeout(500);
    });

    await test.step('When the user goes to cart and clicks checkout', async () => {
      await page.locator(pageRepository.Navigation.cartLink).click();
      await expect(page.locator(pageRepository.CartPage.container)).toBeVisible();
      await expect(page.locator(pageRepository.CartPage.checkoutButton)).toBeVisible();

      await page.locator(pageRepository.CartPage.checkoutButton).click();
    });

    await test.step('Then an order should be created', async () => {
      // User should be redirected to orders page or see a success indication
      await page.waitForTimeout(1000);
      // Navigate to orders to verify
      await page.locator(pageRepository.Navigation.ordersLink).click();
      await expect(page.locator(pageRepository.OrdersPage.container)).toBeVisible();
      // Should have at least one order
      const orderCard = page.locator('[data-testid^="order-card-"]');
      await expect(orderCard.first()).toBeVisible();
    });
  });

  test('should deduct balance after checkout', async ({ page }) => {
    let initialBalance: number;

    await test.step('Given the user is logged in', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
    });

    await test.step('And the user notes their current balance', async () => {
      await page.goto('/profile');
      await expect(page.locator(pageRepository.ProfilePage.container)).toBeVisible();
      const balanceText = await page.locator(pageRepository.ProfilePage.balance).textContent();
      initialBalance = parseFloat(balanceText?.replace('$', '') || '0');
      expect(initialBalance).toBeGreaterThan(0);
    });

    await test.step('And the user adds an item to cart', async () => {
      await page.goto('/books/book-001');
      await expect(page.locator(pageRepository.BookDetail.container)).toBeVisible();
      const priceText = await page.locator(pageRepository.BookDetail.price).textContent();
      await page.locator(pageRepository.BookDetail.addToCartButton).click();
      await page.waitForTimeout(500);
    });

    await test.step('When the user completes checkout', async () => {
      await page.locator(pageRepository.Navigation.cartLink).click();
      await expect(page.locator(pageRepository.CartPage.checkoutButton)).toBeVisible();
      await page.locator(pageRepository.CartPage.checkoutButton).click();
      await page.waitForTimeout(1000);
    });

    await test.step('Then the balance should be reduced', async () => {
      await page.goto('/profile');
      await expect(page.locator(pageRepository.ProfilePage.container)).toBeVisible();
      const newBalanceText = await page.locator(pageRepository.ProfilePage.balance).textContent();
      const newBalance = parseFloat(newBalanceText?.replace('$', '') || '0');
      expect(newBalance).toBeLessThan(initialBalance);
    });
  });

  test('should not allow checkout with empty cart', async ({ page }) => {
    await test.step('Given the user is logged in with empty cart', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
    });

    await test.step('When the user navigates to cart', async () => {
      await page.locator(pageRepository.Navigation.cartLink).click();
      await expect(page.locator(pageRepository.CartPage.container)).toBeVisible();
    });

    await test.step('Then the checkout button should not be visible', async () => {
      await expect(page.locator(pageRepository.CartPage.emptyMessage)).toBeVisible();
      await expect(page.locator(pageRepository.CartPage.checkoutButton)).not.toBeVisible();
    });
  });

  test('should clear cart after successful checkout', async ({ page }) => {
    await test.step('Given the user is logged in with items in cart', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();

      await page.goto('/');
      await page.locator('[data-testid="add-to-cart-book-001"]').click();
      await page.waitForTimeout(500);
    });

    await test.step('When the user completes checkout', async () => {
      await page.locator(pageRepository.Navigation.cartLink).click();
      await expect(page.locator(pageRepository.CartPage.checkoutButton)).toBeVisible();
      await page.locator(pageRepository.CartPage.checkoutButton).click();
      await page.waitForTimeout(1000);
    });

    await test.step('Then the cart should be empty', async () => {
      await page.locator(pageRepository.Navigation.cartLink).click();
      await expect(page.locator(pageRepository.CartPage.container)).toBeVisible();
      await expect(page.locator(pageRepository.CartPage.emptyMessage)).toBeVisible();
    });
  });
});
