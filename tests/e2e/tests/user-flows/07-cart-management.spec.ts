import { test, expect } from '../../fixtures/base';

test.describe('Cart Management', () => {
  test.describe.configure({ timeout: 60_000 });

  const signupNewUser = async (steps: any) => {
    const timestamp = Date.now();
    const email = `cartmgmt${timestamp}@example.com`;
    const username = `cartmgmt${timestamp}`;

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', username);
    await steps.fill('SignupPage', 'emailInput', email);
    await steps.fill('SignupPage', 'passwordInput', 'Password123!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'container');
  };

  test('should increase item quantity in cart', async ({ steps, page }) => {
    await signupNewUser(steps);

    // Add a book to cart
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Go to cart
    await steps.click('Sidebar', 'cartLink');
    await steps.verifyPresence('CartPage', 'container');

    // Click increase button directly using page locator (test-id has dynamic ID)
    const increaseBtn = page.locator('[data-testid^="cart-qty-plus-"]').first();
    await increaseBtn.waitFor({ state: 'visible' });
    await increaseBtn.click();
    await steps.waitForNetworkIdle();

    // Wait for quantity to update (API call to update cart)
    await page.waitForTimeout(500);

    // Verify quantity increased - wait for the element to contain '2'
    const qtyElement = page.locator('[data-testid^="cart-qty-"]:not([data-testid*="plus"]):not([data-testid*="minus"])').first();
    await expect(qtyElement).toContainText('2', { timeout: 5000 });
  });

  test('should remove item from cart', async ({ steps }) => {
    await signupNewUser(steps);

    // Add a book to cart
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();

    // Go to cart
    await steps.click('Sidebar', 'cartLink');
    await steps.verifyPresence('CartPage', 'container');

    // Click remove button using Steps API
    await steps.click('CartPage', 'removeItemButton');
    await steps.waitForNetworkIdle();

    // Cart should be empty
    await steps.verifyPresence('CartPage', 'emptyMessage');
  });

  test('should update cart badge when adding items', async ({ steps }) => {
    await signupNewUser(steps);

    // Add first book
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('Sidebar', 'cartBadge');

    // Add second book
    await steps.navigateTo('/books/book-002');
    await steps.click('BookDetailPage', 'addToCartButton');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('Sidebar', 'cartBadge');
  });
});
