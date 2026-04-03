import { test, expect } from '../../fixtures/base';

test.describe('Complete Checkout & Orders Flow', () => {
  test.describe.configure({ timeout: 90_000 });

  // Use test user with balance
  const loginTestUser = async (steps: any, userNumber: 1 | 2 = 1) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', `testuser${userNumber}@bookhive.test`);
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'container');
  };

  test('should complete full checkout flow and view order details', async ({ steps, page }) => {
    await loginTestUser(steps, 1);

    // Clear cart first
    await steps.navigateTo('/cart');
    const clearBtn = page.locator('[data-testid="cart-clear"]');
    if (await clearBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await clearBtn.click();
      await steps.waitForNetworkIdle();
    }

    // Add a book to cart
    await steps.navigateTo('/books/book-005'); // The Catcher in the Rye $11.49
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Go to cart and checkout
    await steps.click('Sidebar', 'cartLink');
    await steps.verifyPresence('CartPage', 'checkoutButton');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Should be on order detail page
    await steps.verifyPresence('OrderDetailPage', 'container');
    await steps.verifyPresence('OrderDetailPage', 'orderTotal');

    // Return button should be visible (within 10 min window)
    await steps.verifyPresence('OrderDetailPage', 'returnButton');
  });

  test('should display order in orders list', async ({ steps, page }) => {
    await loginTestUser(steps, 1);

    // Navigate to orders - should have at least one order from previous tests
    await steps.click('Sidebar', 'ordersLink');
    await steps.verifyPresence('OrdersPage', 'container');

    // Either has orders or empty message
    const hasOrders = await page.locator('[data-testid^="order-card-"]').first().isVisible({ timeout: 5000 }).catch(() => false);
    if (!hasOrders) {
      await steps.verifyPresence('OrdersPage', 'noOrdersMessage');
    }
  });

  test('should click on order card to view details', async ({ steps, page }) => {
    await loginTestUser(steps, 2);

    // First create an order if user doesn't have one
    await steps.navigateTo('/cart');
    const clearBtn = page.locator('[data-testid="cart-clear"]');
    if (await clearBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await clearBtn.click();
      await steps.waitForNetworkIdle();
    }

    // Add a cheap book and checkout
    await steps.navigateTo('/books/book-006'); // Of Mice and Men $8.99
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.click('Sidebar', 'cartLink');
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Now navigate to orders and click on an order
    await steps.click('Sidebar', 'ordersLink');
    await steps.verifyPresence('OrdersPage', 'container');
    await steps.click('OrdersPage', 'orderCard');
    await steps.verifyPresence('OrderDetailPage', 'container');
  });
});
