import { test, expect } from '../fixtures/base';

test.describe('Orders Flow', () => {
  test.describe.configure({ timeout: 60_000, mode: 'serial' });

  // Helper to login as test user with balance
  const loginTestUser = async (steps: any) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitBtn');
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('Sidebar', 'logoutBtn');
  };

  test('should complete checkout flow with sufficient balance', async ({ steps }) => {
    await loginTestUser(steps);

    // Clear any existing cart items
    await steps.navigateTo('/cart');
    await steps.clickIfPresent('CartPage', 'clearBtn');
    await steps.waitForNetworkIdle();

    // Add a book to cart
    await steps.navigateTo('/books/book-004'); // Pride and Prejudice - $9.99
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    // Go to cart and checkout
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'checkoutBtn');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.waitForNetworkIdle();

    // Should redirect to orders page after successful checkout
    await steps.verifyUrlContains('/orders');
    await steps.verifyPresence('OrdersPage', 'container');
  });

  test('should display order in orders list after purchase', async ({ steps }) => {
    await loginTestUser(steps);
    await steps.navigateTo('/orders');
    await steps.verifyPresence('OrdersPage', 'container');
    // After previous test, there should be at least one order
    await steps.verifyPresence('OrdersPage', 'orderCard');
  });

  test('should navigate to order detail page', async ({ steps }) => {
    await loginTestUser(steps);
    await steps.navigateTo('/orders');

    // Click on the first order card
    await steps.click('OrdersPage', 'orderCard');
    await steps.verifyUrlContains('/orders/');
    await steps.verifyPresence('OrderDetailPage', 'container');
  });

  test('should display order detail information', async ({ steps }) => {
    await loginTestUser(steps);
    await steps.navigateTo('/orders');
    await steps.click('OrdersPage', 'orderCard');

    await steps.verifyPresence('OrderDetailPage', 'container');
    await steps.verifyPresence('OrderDetailPage', 'status');
    await steps.verifyPresence('OrderDetailPage', 'total');
    await steps.verifyPresence('OrderDetailPage', 'item');
  });

  test('should show return button for recent order', async ({ steps }) => {
    await loginTestUser(steps);
    await steps.navigateTo('/orders');
    await steps.click('OrdersPage', 'orderCard');

    // For recently created orders, return button should be visible (10 min window)
    await steps.verifyPresence('OrderDetailPage', 'returnBtn');
  });

  test('should process return for order within window', async ({ steps }) => {
    await loginTestUser(steps);

    // First create a new order
    await steps.navigateTo('/cart');
    await steps.clickIfPresent('CartPage', 'clearBtn');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/books/book-006'); // Of Mice and Men - $8.99
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.waitForNetworkIdle();

    // Now go to the order detail and return it
    await steps.verifyUrlContains('/orders');
    await steps.click('OrdersPage', 'orderCard');
    await steps.verifyPresence('OrderDetailPage', 'returnBtn');
    await steps.click('OrderDetailPage', 'returnBtn');
    await steps.waitForNetworkIdle();

    // Status should change to RETURNED
    await steps.verifyTextContains('OrderDetailPage', 'status', 'RETURNED');
  });

  // Cleanup
  test.afterEach(async ({ steps }) => {
    await steps.clickIfPresent('Sidebar', 'logoutBtn');
  });
});
