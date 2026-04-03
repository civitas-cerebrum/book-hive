import { test, expect, getSelector, API_BASE } from './fixtures/base';

test.describe('Shopping Cart', () => {
  // Clear cart for user1 before cart tests to ensure clean state
  test.beforeEach(async ({ request }) => {
    // We'll use a fresh login to ensure cart operations start clean
  });

  test('should display empty cart message when cart is empty', async ({ page, loginAs, request }) => {
    await test.step('Given I am logged in with clean cart', async () => {
      await loginAs('user1');
      // Navigate to cart page
      await page.goto('/cart');
      await expect(page.locator(getSelector('CartPage', 'container'))).toBeVisible();

      // Clear cart if there are items - wait a moment for items to load
      await page.waitForTimeout(500);
      const clearButton = page.locator(getSelector('CartPage', 'clearButton'));
      if (await clearButton.isVisible()) {
        await clearButton.click();
        // Wait for cart to clear
        await expect(page.locator(getSelector('CartPage', 'emptyMessage'))).toBeVisible({ timeout: 5000 });
      }
    });

    await test.step('Then I should see the empty cart message', async () => {
      await expect(page.locator(getSelector('CartPage', 'emptyMessage'))).toBeVisible();
    });
  });

  test('should add item to cart from home page', async ({ page, loginAs }) => {
    await test.step('Given I am logged in', async () => {
      await loginAs('user1');
    });

    await test.step('And I am on the home page', async () => {
      await page.goto('/');
      await expect(page.locator(getSelector('HomePage', 'bookGrid'))).toBeVisible();
    });

    await test.step('When I add a book to cart', async () => {
      const addButton = page.locator('[data-testid^="add-to-cart-"]').first();
      await addButton.click();
    });

    await test.step('Then I should see the cart badge', async () => {
      await expect(page.locator(getSelector('Navigation', 'cartBadge'))).toBeVisible();
    });
  });

  test('should display cart items', async ({ page, loginAs }) => {
    await test.step('Given I am logged in', async () => {
      await loginAs('user1');
    });

    await test.step('And I add a book to cart', async () => {
      await page.goto('/');
      await expect(page.locator(getSelector('HomePage', 'bookGrid'))).toBeVisible();
      const addButton = page.locator('[data-testid^="add-to-cart-"]').first();
      await addButton.click();
      await expect(page.locator(getSelector('Navigation', 'cartBadge'))).toBeVisible();
    });

    await test.step('When I navigate to the cart page', async () => {
      await page.locator(getSelector('Navigation', 'cartLink')).click();
      await page.waitForURL('/cart');
    });

    await test.step('Then I should see the cart item', async () => {
      await expect(page.locator(getSelector('CartPage', 'container'))).toBeVisible();
      const cartItem = page.locator('[data-testid^="cart-item-"]').first();
      await expect(cartItem).toBeVisible();
    });

    await test.step('And I should see the cart total', async () => {
      await expect(page.locator(getSelector('CartPage', 'total'))).toBeVisible();
    });

    await test.step('And I should see the checkout button', async () => {
      await expect(page.locator(getSelector('CartPage', 'checkoutButton'))).toBeVisible();
    });
  });

  test('should update item quantity in cart', async ({ page, loginAs }) => {
    await test.step('Given I have a fresh cart with one item', async () => {
      await loginAs('user1');
      // First clear any existing cart
      await page.goto('/cart');
      const clearButton = page.locator(getSelector('CartPage', 'clearButton'));
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await expect(page.locator(getSelector('CartPage', 'emptyMessage'))).toBeVisible();
      }

      // Now add a single item
      await page.goto('/');
      await expect(page.locator(getSelector('HomePage', 'bookGrid'))).toBeVisible();
      const addButton = page.locator('[data-testid^="add-to-cart-"]').first();
      await addButton.click();
      await page.locator(getSelector('Navigation', 'cartLink')).click();
      await page.waitForURL('/cart');
    });

    await test.step('When I increase the quantity', async () => {
      const plusButton = page.locator('[data-testid^="cart-qty-plus-"]').first();
      await plusButton.click();
    });

    await test.step('Then the quantity should increase', async () => {
      // Wait for update to reflect - look for any quantity > 1
      const qtyDisplay = page.locator('[data-testid^="cart-qty-"]').first();
      await expect(qtyDisplay).not.toContainText('1', { timeout: 5000 });
    });
  });

  test('should remove item from cart', async ({ page, loginAs }) => {
    await test.step('Given I have an item in cart', async () => {
      await loginAs('user1');
      await page.goto('/');
      await expect(page.locator(getSelector('HomePage', 'bookGrid'))).toBeVisible();
      const addButton = page.locator('[data-testid^="add-to-cart-"]').first();
      await addButton.click();
      await page.locator(getSelector('Navigation', 'cartLink')).click();
      await page.waitForURL('/cart');
    });

    await test.step('When I click remove', async () => {
      const removeButton = page.locator('[data-testid^="cart-remove-"]').first();
      await removeButton.click();
    });

    await test.step('Then the cart should be empty', async () => {
      await expect(page.locator(getSelector('CartPage', 'emptyMessage'))).toBeVisible();
    });
  });

  test('should clear entire cart', async ({ page, loginAs }) => {
    await test.step('Given I have items in cart', async () => {
      await loginAs('user1');
      await page.goto('/');
      await expect(page.locator(getSelector('HomePage', 'bookGrid'))).toBeVisible();
      const addButton = page.locator('[data-testid^="add-to-cart-"]').first();
      await addButton.click();
      await page.locator(getSelector('Navigation', 'cartLink')).click();
      await page.waitForURL('/cart');
    });

    await test.step('When I click clear cart', async () => {
      await page.locator(getSelector('CartPage', 'clearButton')).click();
    });

    await test.step('Then the cart should be empty', async () => {
      await expect(page.locator(getSelector('CartPage', 'emptyMessage'))).toBeVisible();
    });
  });

  test('should checkout and create order', async ({ page, loginAs }) => {
    await test.step('Given I have an item in cart', async () => {
      await loginAs('user1');
      await page.goto('/');
      await expect(page.locator(getSelector('HomePage', 'bookGrid'))).toBeVisible();
      const addButton = page.locator('[data-testid^="add-to-cart-"]').first();
      await addButton.click();
      await page.locator(getSelector('Navigation', 'cartLink')).click();
      await page.waitForURL('/cart');
    });

    await test.step('When I click checkout', async () => {
      await page.locator(getSelector('CartPage', 'checkoutButton')).click();
    });

    await test.step('Then I should be redirected to the order detail page', async () => {
      await page.waitForURL(/\/orders\/.+/);
    });
  });
});
