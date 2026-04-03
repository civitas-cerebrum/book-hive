import { test, expect, TEST_USER_1, API_BASE_URL } from './fixtures/base';
import pageRepository from './data/page-repository.json';

test.describe('Orders', () => {
  test.beforeEach(async ({ request }) => {
    // Reset the app to known state before each test
    await request.post(`${API_BASE_URL}/api/reset`);
  });

  test('should display no orders message when user has no orders', async ({ page }) => {
    await test.step('Given the user is logged in', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
    });

    await test.step('When the user navigates to orders page', async () => {
      await page.locator(pageRepository.Navigation.ordersLink).click();
    });

    await test.step('Then the no orders message should be displayed', async () => {
      await expect(page.locator(pageRepository.OrdersPage.container)).toBeVisible();
      await expect(page.locator(pageRepository.OrdersPage.noOrders)).toBeVisible();
    });
  });

  test('should display orders after purchase', async ({ page }) => {
    await test.step('Given the user is logged in and has made a purchase', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();

      // Make a purchase
      await page.goto('/');
      await page.locator('[data-testid="add-to-cart-book-001"]').click();
      await page.waitForTimeout(500);
      await page.locator(pageRepository.Navigation.cartLink).click();
      await page.locator(pageRepository.CartPage.checkoutButton).click();
      await page.waitForTimeout(1000);
    });

    await test.step('When the user navigates to orders page', async () => {
      await page.locator(pageRepository.Navigation.ordersLink).click();
    });

    await test.step('Then the order should be displayed', async () => {
      await expect(page.locator(pageRepository.OrdersPage.container)).toBeVisible();
      const orderCard = page.locator('[data-testid^="order-card-"]');
      await expect(orderCard.first()).toBeVisible();
    });
  });

  test('should navigate to order detail page', async ({ page }) => {
    await test.step('Given the user is logged in and has an order', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();

      // Make a purchase
      await page.goto('/');
      await page.locator('[data-testid="add-to-cart-book-001"]').click();
      await page.waitForTimeout(500);
      await page.locator(pageRepository.Navigation.cartLink).click();
      await page.locator(pageRepository.CartPage.checkoutButton).click();
      await page.waitForTimeout(1000);
    });

    await test.step('When the user clicks on an order card', async () => {
      await page.locator(pageRepository.Navigation.ordersLink).click();
      await expect(page.locator(pageRepository.OrdersPage.container)).toBeVisible();
      const orderCard = page.locator('[data-testid^="order-card-"]').first();
      await orderCard.click();
    });

    await test.step('Then the order detail page should be displayed', async () => {
      await expect(page).toHaveURL(/\/orders\//);
      await expect(page.locator(pageRepository.OrderDetailPage.container)).toBeVisible();
    });
  });

  test('should display order details correctly', async ({ page }) => {
    await test.step('Given the user is logged in and has an order', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();

      // Make a purchase
      await page.goto('/');
      await page.locator('[data-testid="add-to-cart-book-001"]').click();
      await page.waitForTimeout(500);
      await page.locator(pageRepository.Navigation.cartLink).click();
      await page.locator(pageRepository.CartPage.checkoutButton).click();
      await page.waitForTimeout(1000);
    });

    await test.step('When the user views order details', async () => {
      await page.locator(pageRepository.Navigation.ordersLink).click();
      await page.locator('[data-testid^="order-card-"]').first().click();
      await expect(page.locator(pageRepository.OrderDetailPage.container)).toBeVisible();
    });

    await test.step('Then the order items should be displayed', async () => {
      const orderItem = page.locator('[data-testid^="order-item-"]');
      await expect(orderItem.first()).toBeVisible();
    });

    await test.step('And the order total should be displayed', async () => {
      await expect(page.locator(pageRepository.OrderDetailPage.total)).toBeVisible();
      const total = await page.locator(pageRepository.OrderDetailPage.total).textContent();
      expect(total).toMatch(/\$\d+\.\d{2}/);
    });

    await test.step('And the order status should be displayed', async () => {
      const statusBadge = page.locator('[data-testid^="order-status-"]');
      await expect(statusBadge.first()).toBeVisible();
    });
  });

  test('should display return button for recent order', async ({ page }) => {
    await test.step('Given the user is logged in and has just made a purchase', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();

      // Make a purchase
      await page.goto('/');
      await page.locator('[data-testid="add-to-cart-book-001"]').click();
      await page.waitForTimeout(500);
      await page.locator(pageRepository.Navigation.cartLink).click();
      await page.locator(pageRepository.CartPage.checkoutButton).click();
      await page.waitForTimeout(1000);
    });

    await test.step('When the user views the order detail', async () => {
      await page.locator(pageRepository.Navigation.ordersLink).click();
      await page.locator('[data-testid^="order-card-"]').first().click();
      await expect(page.locator(pageRepository.OrderDetailPage.container)).toBeVisible();
    });

    await test.step('Then the return button should be visible', async () => {
      const returnButton = page.locator('[data-testid^="return-order-"]');
      await expect(returnButton.first()).toBeVisible();
    });

    await test.step('And the return countdown should be displayed', async () => {
      await expect(page.locator(pageRepository.OrderDetailPage.returnCountdown)).toBeVisible();
    });
  });

  test('should return order successfully within window', async ({ page }) => {
    let initialBalance: number;

    await test.step('Given the user is logged in', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
    });

    await test.step('And notes their balance before purchase', async () => {
      await page.goto('/profile');
      const balanceText = await page.locator(pageRepository.ProfilePage.balance).textContent();
      initialBalance = parseFloat(balanceText?.replace('$', '') || '0');
    });

    await test.step('And has made a purchase', async () => {
      await page.goto('/');
      await page.locator('[data-testid="add-to-cart-book-001"]').click();
      await page.waitForTimeout(500);
      await page.locator(pageRepository.Navigation.cartLink).click();
      await page.locator(pageRepository.CartPage.checkoutButton).click();
      await page.waitForTimeout(1000);
    });

    await test.step('When the user returns the order', async () => {
      await page.locator(pageRepository.Navigation.ordersLink).click();
      await page.locator('[data-testid^="order-card-"]').first().click();
      await expect(page.locator(pageRepository.OrderDetailPage.container)).toBeVisible();

      const returnButton = page.locator('[data-testid^="return-order-"]').first();
      await returnButton.click();
      await page.waitForTimeout(1000);
    });

    await test.step('Then the order status should be RETURNED', async () => {
      const statusBadge = page.locator('[data-testid^="order-status-"]').first();
      await expect(statusBadge).toContainText(/returned/i);
    });

    await test.step('And the balance should be restored', async () => {
      await page.goto('/profile');
      const balanceText = await page.locator(pageRepository.ProfilePage.balance).textContent();
      const newBalance = parseFloat(balanceText?.replace('$', '') || '0');
      // Balance should be back to initial (or very close due to rounding)
      expect(newBalance).toBeCloseTo(initialBalance, 1);
    });
  });
});
