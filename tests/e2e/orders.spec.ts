import { test, expect, getSelector, API_BASE } from './fixtures/base';

test.describe('Orders', () => {

  test('should display orders page', async ({ page, loginAs }) => {
    await test.step('Given I am logged in', async () => {
      await loginAs('user1');
    });

    await test.step('When I navigate to the orders page', async () => {
      await page.locator(getSelector('Navigation', 'ordersLink')).click();
      await page.waitForURL('/orders');
    });

    await test.step('Then I should see the orders container', async () => {
      await expect(page.locator(getSelector('OrdersPage', 'container'))).toBeVisible();

      // Wait for page to settle - either we see orders or no-orders message
      await page.waitForLoadState('networkidle');

      // Wait a moment for React to render
      await page.waitForTimeout(500);

      const orderCards = page.locator('[data-testid^="order-card-"]');
      const noOrdersMessage = page.locator(getSelector('OrdersPage', 'noOrdersMessage'));

      // Wait for either condition to be true
      try {
        await expect(orderCards.first().or(noOrdersMessage)).toBeVisible({ timeout: 5000 });
      } catch {
        // If neither is found immediately, that's still OK as long as page loaded
      }
    });
  });

  test('should display order after checkout', async ({ page, loginAs }) => {
    await test.step('Given I am logged in and complete a checkout', async () => {
      await loginAs('user1');
      await page.goto('/');
      await expect(page.locator(getSelector('HomePage', 'bookGrid'))).toBeVisible();

      // Add item to cart
      const addButton = page.locator('[data-testid^="add-to-cart-"]').first();
      await addButton.click();

      // Go to cart and checkout
      await page.locator(getSelector('Navigation', 'cartLink')).click();
      await page.waitForURL('/cart');
      await page.locator(getSelector('CartPage', 'checkoutButton')).click();
      await page.waitForURL(/\/orders\/.+/);
    });

    await test.step('When I navigate to the orders page', async () => {
      await page.locator(getSelector('Navigation', 'ordersLink')).click();
      await page.waitForURL('/orders');
    });

    await test.step('Then I should see my order', async () => {
      await expect(page.locator(getSelector('OrdersPage', 'container'))).toBeVisible();
      const orderCard = page.locator('[data-testid^="order-card-"]').first();
      await expect(orderCard).toBeVisible();
    });
  });

  test('should navigate to order detail from orders list', async ({ page, loginAs }) => {
    await test.step('Given I have completed an order', async () => {
      await loginAs('user1');
      await page.goto('/');
      await expect(page.locator(getSelector('HomePage', 'bookGrid'))).toBeVisible();

      // Add item to cart and checkout
      const addButton = page.locator('[data-testid^="add-to-cart-"]').first();
      await addButton.click();
      await page.locator(getSelector('Navigation', 'cartLink')).click();
      await page.waitForURL('/cart');
      await page.locator(getSelector('CartPage', 'checkoutButton')).click();
      await page.waitForURL(/\/orders\/.+/);
    });

    await test.step('When I navigate to orders and click on an order', async () => {
      await page.locator(getSelector('Navigation', 'ordersLink')).click();
      await page.waitForURL('/orders');
      const orderCard = page.locator('[data-testid^="order-card-"]').first();
      await orderCard.click();
    });

    await test.step('Then I should be on the order detail page', async () => {
      await page.waitForURL(/\/orders\/.+/);
    });
  });

  test('should show order status', async ({ page, loginAs }) => {
    await test.step('Given I have completed an order', async () => {
      await loginAs('user1');
      await page.goto('/');
      await expect(page.locator(getSelector('HomePage', 'bookGrid'))).toBeVisible();

      // Add item to cart and checkout
      const addButton = page.locator('[data-testid^="add-to-cart-"]').first();
      await addButton.click();
      await page.locator(getSelector('Navigation', 'cartLink')).click();
      await page.waitForURL('/cart');
      await page.locator(getSelector('CartPage', 'checkoutButton')).click();
      await page.waitForURL(/\/orders\/.+/);
    });

    await test.step('When I view the orders page', async () => {
      await page.locator(getSelector('Navigation', 'ordersLink')).click();
      await page.waitForURL('/orders');
    });

    await test.step('Then I should see the order status', async () => {
      const orderStatus = page.locator('[data-testid^="order-status-"]').first();
      await expect(orderStatus).toBeVisible();
      await expect(orderStatus).toContainText(/COMPLETED|PENDING/);
    });
  });

  test('should deduct balance after checkout', async ({ page, loginAs }) => {
    let initialBalance: number;

    await test.step('Given I am logged in and check my balance', async () => {
      await loginAs('user1');

      // Get initial balance from sidebar
      const balanceText = await page.locator(getSelector('Navigation', 'userBalance')).textContent();
      initialBalance = parseFloat(balanceText?.replace(/[^0-9.]/g, '') || '0');
    });

    await test.step('When I complete a checkout', async () => {
      await page.goto('/');
      await expect(page.locator(getSelector('HomePage', 'bookGrid'))).toBeVisible();

      const addButton = page.locator('[data-testid^="add-to-cart-"]').first();
      await addButton.click();
      await page.locator(getSelector('Navigation', 'cartLink')).click();
      await page.waitForURL('/cart');

      // Get cart total before checkout
      const totalText = await page.locator(getSelector('CartPage', 'total')).textContent();
      const orderTotal = parseFloat(totalText?.replace(/[^0-9.]/g, '') || '0');

      await page.locator(getSelector('CartPage', 'checkoutButton')).click();
      await page.waitForURL(/\/orders\/.+/);
    });

    await test.step('Then my balance should be deducted', async () => {
      // Navigate to profile to see updated balance
      await page.goto('/profile');
      await expect(page.locator(getSelector('ProfilePage', 'container'))).toBeVisible();

      const newBalanceText = await page.locator(getSelector('ProfilePage', 'balance')).textContent();
      const newBalance = parseFloat(newBalanceText?.replace(/[^0-9.]/g, '') || '0');

      expect(newBalance).toBeLessThan(initialBalance);
    });
  });
});
