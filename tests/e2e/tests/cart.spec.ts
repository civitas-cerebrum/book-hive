import { test, expect } from '@playwright/test';
import { getSelector, generateTestUser, signupUserViaUI } from '../fixtures/base';

test.describe('Shopping Cart', () => {
  let user: { email: string; password: string; username: string };

  test.beforeEach(async ({ page }) => {
    // Create and login a test user via UI before each test
    user = generateTestUser();
    await signupUserViaUI(page, user.username, user.email, user.password);
  });

  test('should show empty cart message when cart is empty', async ({ page }) => {
    await test.step('When I navigate to the cart page', async () => {
      await page.click(getSelector('Common', 'navCart'));
    });

    await test.step('Then I should see the cart page', async () => {
      await expect(page).toHaveURL('/cart');
      await expect(page.locator(getSelector('CartPage', 'pageContainer'))).toBeVisible();
    });

    await test.step('And I should see empty cart message', async () => {
      await expect(page.locator(getSelector('CartPage', 'empty'))).toBeVisible();
    });
  });

  test('should add book to cart from homepage', async ({ page }) => {
    await test.step('Given I am on the homepage', async () => {
      await page.goto('/');
      await page.waitForSelector('[data-testid^="book-card-"]', { timeout: 10000 });
    });

    await test.step('When I click Add to Cart on a book', async () => {
      await page.click('[data-testid^="add-to-cart-"]');
    });

    await test.step('And I navigate to the cart', async () => {
      await page.click(getSelector('Common', 'navCart'));
    });

    await test.step('Then I should see the item in my cart', async () => {
      await expect(page.locator(getSelector('CartPage', 'pageContainer'))).toBeVisible();
      // Use first() because cart-item, cart-item-title, and cart-item-price all match
      await expect(page.locator('[data-testid^="cart-item-"]').first()).toBeVisible();
    });
  });

  test('should add book to cart from book detail page', async ({ page }) => {
    await test.step('Given I am viewing a book detail page', async () => {
      await page.goto('/books/book-001');
      await expect(page.locator(getSelector('BookDetailPage', 'pageContainer'))).toBeVisible();
    });

    await test.step('When I click Add to Cart', async () => {
      await page.click(getSelector('BookDetailPage', 'addToCart'));
    });

    await test.step('And I navigate to the cart', async () => {
      await page.click(getSelector('Common', 'navCart'));
    });

    await test.step('Then I should see the item in my cart', async () => {
      await expect(page.locator('[data-testid^="cart-item-"]').first()).toBeVisible();
    });
  });

  test('should update cart badge when adding items', async ({ page }) => {
    await test.step('Given I am on the homepage', async () => {
      await page.goto('/');
      await page.waitForSelector('[data-testid^="book-card-"]', { timeout: 10000 });
    });

    await test.step('When I add a book to cart', async () => {
      await page.click('[data-testid^="add-to-cart-"]');
      await page.waitForTimeout(1000); // Wait for cart update
    });

    await test.step('Then the cart badge should show the count', async () => {
      const cartBadge = page.locator(getSelector('Common', 'cartBadge'));
      await expect(cartBadge).toBeVisible({ timeout: 5000 });
    });
  });

  test('should increase item quantity in cart', async ({ page }) => {
    await test.step('Given I have an item in my cart', async () => {
      await page.goto('/books/book-001');
      await page.click(getSelector('BookDetailPage', 'addToCart'));
      await page.click(getSelector('Common', 'navCart'));
      await expect(page.locator('[data-testid^="cart-item-"]').first()).toBeVisible();
    });

    await test.step('When I click the plus button', async () => {
      await page.click('[data-testid^="cart-qty-plus-"]');
    });

    await test.step('Then the quantity should increase', async () => {
      await page.waitForTimeout(500);
      // Get the qty input element that shows the number
      const qtyDisplay = page.locator('[data-testid^="cart-qty-"]').first();
      await expect(qtyDisplay).toHaveText('2');
    });
  });

  test('should decrease item quantity in cart', async ({ page }) => {
    await test.step('Given I have an item with quantity 2 in my cart', async () => {
      await page.goto('/books/book-001');
      await page.click(getSelector('BookDetailPage', 'addToCart'));
      await page.click(getSelector('Common', 'navCart'));
      await page.click('[data-testid^="cart-qty-plus-"]');
      await page.waitForTimeout(500);
    });

    await test.step('When I click the minus button', async () => {
      await page.click('[data-testid^="cart-qty-minus-"]');
    });

    await test.step('Then the quantity should decrease', async () => {
      await page.waitForTimeout(500);
      const qtyDisplay = page.locator('[data-testid^="cart-qty-"]').first();
      await expect(qtyDisplay).toHaveText('1');
    });
  });

  test('should remove item from cart', async ({ page }) => {
    await test.step('Given I have an item in my cart', async () => {
      await page.goto('/books/book-001');
      await page.click(getSelector('BookDetailPage', 'addToCart'));
      await page.click(getSelector('Common', 'navCart'));
      await expect(page.locator('[data-testid^="cart-item-"]').first()).toBeVisible();
    });

    await test.step('When I click the remove button', async () => {
      await page.click('[data-testid^="cart-remove-"]');
    });

    await test.step('Then the cart should be empty', async () => {
      await expect(page.locator(getSelector('CartPage', 'empty'))).toBeVisible({ timeout: 5000 });
    });
  });

  test('should clear entire cart', async ({ page }) => {
    await test.step('Given I have items in my cart', async () => {
      await page.goto('/books/book-001');
      await page.click(getSelector('BookDetailPage', 'addToCart'));
      await page.click(getSelector('Common', 'navCart'));
      await expect(page.locator('[data-testid^="cart-item-"]').first()).toBeVisible();
    });

    await test.step('When I click clear cart', async () => {
      await page.click(getSelector('CartPage', 'clearBtn'));
    });

    await test.step('Then the cart should be empty', async () => {
      await expect(page.locator(getSelector('CartPage', 'empty'))).toBeVisible({ timeout: 5000 });
    });
  });

  test('should display correct total price', async ({ page }) => {
    await test.step('Given I have an item in my cart', async () => {
      await page.goto('/books/book-001');
      await page.click(getSelector('BookDetailPage', 'addToCart'));
      await page.click(getSelector('Common', 'navCart'));
      await expect(page.locator('[data-testid^="cart-item-"]').first()).toBeVisible();
    });

    await test.step('Then I should see the total price', async () => {
      const total = page.locator(getSelector('CartPage', 'total'));
      await expect(total).toBeVisible();
      await expect(total).toContainText('$');
    });
  });

  test('should have checkout button when cart has items', async ({ page }) => {
    await test.step('Given I have an item in my cart', async () => {
      await page.goto('/books/book-001');
      await page.click(getSelector('BookDetailPage', 'addToCart'));
      await page.click(getSelector('Common', 'navCart'));
      await expect(page.locator('[data-testid^="cart-item-"]').first()).toBeVisible();
    });

    await test.step('Then I should see the checkout button', async () => {
      await expect(page.locator(getSelector('CartPage', 'checkoutBtn'))).toBeVisible();
    });
  });

  test('should proceed to checkout and create order', async ({ page }) => {
    await test.step('Given I have an item in my cart', async () => {
      await page.goto('/books/book-001');
      await page.click(getSelector('BookDetailPage', 'addToCart'));
      await page.click(getSelector('Common', 'navCart'));
      await expect(page.locator('[data-testid^="cart-item-"]').first()).toBeVisible();
    });

    await test.step('When I click checkout', async () => {
      await page.click(getSelector('CartPage', 'checkoutBtn'));
    });

    await test.step('Then I should be redirected to the order detail page', async () => {
      await expect(page).toHaveURL(/\/orders\/.+/, { timeout: 10000 });
      await expect(page.locator(getSelector('OrderDetailPage', 'pageContainer'))).toBeVisible();
    });
  });
});
