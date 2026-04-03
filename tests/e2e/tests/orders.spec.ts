import { test, expect } from '@playwright/test';
import { getSelector, generateTestUser, signupUserViaUI } from '../fixtures/base';

test.describe('Orders', () => {
  let user: { email: string; password: string; username: string };

  test.beforeEach(async ({ page }) => {
    // Create and login a test user via UI before each test
    user = generateTestUser();
    await signupUserViaUI(page, user.username, user.email, user.password);
  });

  test('should show empty orders message when no orders exist', async ({ page }) => {
    await test.step('When I navigate to the orders page', async () => {
      await page.click(getSelector('Common', 'navOrders'));
    });

    await test.step('Then I should see the orders page', async () => {
      await expect(page).toHaveURL('/orders');
      await expect(page.locator(getSelector('OrdersPage', 'pageContainer'))).toBeVisible();
    });

    await test.step('And I should see no orders message', async () => {
      await expect(page.locator(getSelector('OrdersPage', 'noOrders'))).toBeVisible();
    });
  });

  test('should display orders after placing an order', async ({ page }) => {
    await test.step('Given I place an order', async () => {
      // Add item to cart
      await page.goto('/books/book-001');
      await page.click(getSelector('BookDetailPage', 'addToCart'));
      await page.click(getSelector('Common', 'navCart'));
      await expect(page.locator('[data-testid^="cart-item-"]').first()).toBeVisible();

      // Checkout
      await page.click(getSelector('CartPage', 'checkoutBtn'));
      await expect(page).toHaveURL(/\/orders\/.+/, { timeout: 10000 });
    });

    await test.step('When I navigate to the orders page', async () => {
      await page.click(getSelector('Common', 'navOrders'));
    });

    await test.step('Then I should see my order in the list', async () => {
      await expect(page.locator(getSelector('OrdersPage', 'pageContainer'))).toBeVisible();
      // Wait for orders to load
      await page.waitForTimeout(1000);
      // Should not show "no orders" message
      const noOrders = page.locator(getSelector('OrdersPage', 'noOrders'));
      await expect(noOrders).not.toBeVisible({ timeout: 5000 });
    });
  });

  test('should show order detail page after checkout', async ({ page }) => {
    await test.step('Given I complete a checkout', async () => {
      await page.goto('/books/book-001');
      await page.click(getSelector('BookDetailPage', 'addToCart'));
      await page.click(getSelector('Common', 'navCart'));
      await page.click(getSelector('CartPage', 'checkoutBtn'));
    });

    await test.step('Then I should see the order detail page', async () => {
      await expect(page.locator(getSelector('OrderDetailPage', 'pageContainer'))).toBeVisible();
    });

    await test.step('And I should see order items', async () => {
      await expect(page.locator('[data-testid^="order-item-"]').first()).toBeVisible();
    });

    await test.step('And I should see order total', async () => {
      await expect(page.locator(getSelector('OrderDetailPage', 'orderTotal'))).toBeVisible();
    });

    await test.step('And I should see order status', async () => {
      await expect(page.locator('[data-testid^="order-status-"]').first()).toBeVisible();
    });
  });

  test('should display order status as COMPLETED after checkout', async ({ page }) => {
    await test.step('Given I complete a checkout', async () => {
      await page.goto('/books/book-001');
      await page.click(getSelector('BookDetailPage', 'addToCart'));
      await page.click(getSelector('Common', 'navCart'));
      await page.click(getSelector('CartPage', 'checkoutBtn'));
      await expect(page.locator(getSelector('OrderDetailPage', 'pageContainer'))).toBeVisible();
    });

    await test.step('Then the order status should be COMPLETED', async () => {
      const status = page.locator('[data-testid^="order-status-"]').first();
      await expect(status).toContainText('COMPLETED');
    });
  });

  test('should show return button for recently completed orders', async ({ page }) => {
    await test.step('Given I have a recently completed order', async () => {
      await page.goto('/books/book-001');
      await page.click(getSelector('BookDetailPage', 'addToCart'));
      await page.click(getSelector('Common', 'navCart'));
      await page.click(getSelector('CartPage', 'checkoutBtn'));
      await expect(page.locator(getSelector('OrderDetailPage', 'pageContainer'))).toBeVisible();
    });

    await test.step('Then I should see the return button', async () => {
      const returnBtn = page.locator('[data-testid^="return-order-"]');
      await expect(returnBtn).toBeVisible({ timeout: 5000 });
    });
  });

  test('should successfully return an order', async ({ page }) => {
    await test.step('Given I have a recently completed order', async () => {
      await page.goto('/books/book-001');
      await page.click(getSelector('BookDetailPage', 'addToCart'));
      await page.click(getSelector('Common', 'navCart'));
      await page.click(getSelector('CartPage', 'checkoutBtn'));
      await expect(page.locator(getSelector('OrderDetailPage', 'pageContainer'))).toBeVisible();
    });

    await test.step('When I click the return button', async () => {
      await page.click('[data-testid^="return-order-"]');
    });

    await test.step('Then the order status should change to RETURNED', async () => {
      await page.waitForTimeout(1000);
      const status = page.locator('[data-testid^="order-status-"]').first();
      await expect(status).toContainText('RETURNED');
    });
  });

  test('should display order total matching cart total', async ({ page }) => {
    await test.step('Given I add a book to cart and note the total', async () => {
      await page.goto('/books/book-001');
      await page.click(getSelector('BookDetailPage', 'addToCart'));
      await page.click(getSelector('Common', 'navCart'));
      await expect(page.locator('[data-testid^="cart-item-"]').first()).toBeVisible();
    });

    await test.step('When I checkout', async () => {
      const cartTotal = await page.locator(getSelector('CartPage', 'total')).textContent();
      await page.click(getSelector('CartPage', 'checkoutBtn'));
      await expect(page.locator(getSelector('OrderDetailPage', 'pageContainer'))).toBeVisible();

      await test.step('Then the order total should match', async () => {
        const orderTotal = await page.locator(getSelector('OrderDetailPage', 'orderTotal')).textContent();
        expect(cartTotal).toBe(orderTotal);
      });
    });
  });

  test('should show 404 for non-existent order', async ({ page }) => {
    await test.step('Given I navigate to a non-existent order', async () => {
      await page.goto('/orders/non-existent-order-id');
    });

    await test.step('Then I should see a not found message', async () => {
      await expect(page.locator(getSelector('OrderDetailPage', 'notFound'))).toBeVisible();
    });
  });

  test('should redirect unauthenticated users from orders page', async ({ page }) => {
    await test.step('Given I am not logged in', async () => {
      // Logout
      await page.click(getSelector('Common', 'logoutBtn'));
      await page.waitForTimeout(500);
    });

    await test.step('When I try to access the orders page directly', async () => {
      await page.goto('/orders');
    });

    await test.step('Then I should be redirected to login', async () => {
      await expect(page).toHaveURL('/login');
    });
  });
});
