import { test, expect } from '../../fixtures/base';

test.describe('Cart & Checkout', () => {
  test.describe.configure({ timeout: 60_000 });

  // Helper to signup a new user (no balance)
  const signupNewUser = async (steps: any) => {
    const timestamp = Date.now();
    const email = `cartuser${timestamp}@example.com`;
    const username = `cartuser${timestamp}`;

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', username);
    await steps.fill('SignupPage', 'emailInput', email);
    await steps.fill('SignupPage', 'passwordInput', 'Password123!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'container');
  };

  // Helper to login with pre-seeded test user (has $100 balance)
  const loginTestUser = async (steps: any, userNumber: 1 | 2 = 1) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', `testuser${userNumber}@bookhive.test`);
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'container');
  };

  test('should show add to cart button when logged in', async ({ steps }) => {
    await signupNewUser(steps);
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'addToCartButton');
  });

  test('should add book to cart from detail page', async ({ steps }) => {
    await signupNewUser(steps);
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Cart badge should appear in sidebar
    await steps.verifyPresence('Sidebar', 'cartBadge');
  });

  test('should display cart with added items', async ({ steps }) => {
    await signupNewUser(steps);

    // Add a book to cart
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Navigate to cart
    await steps.click('Sidebar', 'cartLink');
    await steps.verifyPresence('CartPage', 'container');
    await steps.verifyPresence('CartPage', 'checkoutButton');
    await steps.verifyPresence('CartPage', 'total');
  });

  test('should display empty cart message when cart is empty', async ({ steps }) => {
    await signupNewUser(steps);
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'emptyMessage');
  });

  test('should clear cart when clicking clear button', async ({ steps }) => {
    await signupNewUser(steps);

    // Add a book to cart
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Navigate to cart and clear
    await steps.click('Sidebar', 'cartLink');
    await steps.verifyPresence('CartPage', 'clearButton');
    await steps.click('CartPage', 'clearButton');
    await steps.waitForNetworkIdle();

    // Should show empty cart message
    await steps.verifyPresence('CartPage', 'emptyMessage');
  });

  test('should complete checkout flow with test user (has balance)', async ({ steps, page }) => {
    // Use pre-seeded test user with $100 balance
    await loginTestUser(steps, 1);

    // Clear any existing cart items first
    await steps.navigateTo('/cart');
    // If cart has items, clear it
    const clearBtn = page.locator('[data-testid="cart-clear"]');
    if (await clearBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await clearBtn.click();
      await steps.waitForNetworkIdle();
    }

    // Add a book to cart
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Navigate to cart
    await steps.click('Sidebar', 'cartLink');
    await steps.verifyPresence('CartPage', 'checkoutButton');

    // Checkout
    await steps.click('CartPage', 'checkoutButton');
    await steps.waitForNetworkIdle();

    // Should redirect to order detail page
    await steps.verifyPresence('OrderDetailPage', 'container');
    await steps.verifyPresence('OrderDetailPage', 'orderTotal');
  });

  test('should add multiple books to cart', async ({ steps }) => {
    await signupNewUser(steps);

    // Add first book
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Add second book
    await steps.navigateTo('/books/book-002');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Navigate to cart and verify multiple items
    await steps.click('Sidebar', 'cartLink');
    await steps.verifyPresence('CartPage', 'container');
    await steps.verifyPresence('CartPage', 'total');
  });
});
