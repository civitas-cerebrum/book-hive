import { test, expect, TEST_USER_1, API_BASE_URL } from './fixtures/base';
import pageRepository from './data/page-repository.json';

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ request }) => {
    // Reset the app to known state before each test
    await request.post(`${API_BASE_URL}/api/reset`);
  });

  test('should display empty cart message when cart is empty', async ({ page }) => {
    await test.step('Given the user is logged in', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
    });

    await test.step('When the user navigates to the cart page', async () => {
      await page.locator(pageRepository.Navigation.cartLink).click();
    });

    await test.step('Then the empty cart message should be displayed', async () => {
      await expect(page.locator(pageRepository.CartPage.container)).toBeVisible();
      await expect(page.locator(pageRepository.CartPage.emptyMessage)).toBeVisible();
    });
  });

  test('should add item to cart from homepage', async ({ page }) => {
    await test.step('Given the user is logged in', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
    });

    await test.step('And the user is on the homepage', async () => {
      await page.goto('/');
      await expect(page.locator(pageRepository.HomePage.bookGrid)).toBeVisible();
    });

    await test.step('When the user clicks add to cart on a book', async () => {
      const addToCartButton = page.locator('[data-testid="add-to-cart-book-001"]');
      await addToCartButton.click();
    });

    await test.step('Then the cart badge should update', async () => {
      await expect(page.locator(pageRepository.Navigation.cartBadge)).toBeVisible();
    });

    await test.step('And the item should appear in the cart', async () => {
      await page.locator(pageRepository.Navigation.cartLink).click();
      await expect(page.locator(pageRepository.CartPage.container)).toBeVisible();
      const cartItem = page.locator('[data-testid^="cart-item-"]');
      await expect(cartItem.first()).toBeVisible();
    });
  });

  test('should increase item quantity in cart', async ({ page }) => {
    await test.step('Given the user is logged in with an item in cart', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();

      // Add an item to cart
      await page.goto('/');
      await page.locator('[data-testid="add-to-cart-book-001"]').click();
      await page.waitForTimeout(500);
    });

    await test.step('When the user goes to cart and increases quantity', async () => {
      await page.locator(pageRepository.Navigation.cartLink).click();
      await expect(page.locator(pageRepository.CartPage.container)).toBeVisible();

      // Get initial quantity
      const qtyElement = page.locator('[data-testid^="cart-qty-"]').first();
      const initialQty = await qtyElement.textContent();

      // Click plus button
      const plusButton = page.locator('[data-testid^="cart-qty-plus-"]').first();
      await plusButton.click();
      await page.waitForTimeout(500);

      // Verify quantity increased
      const newQty = await qtyElement.textContent();
      expect(parseInt(newQty || '0')).toBe(parseInt(initialQty || '0') + 1);
    });
  });

  test('should decrease item quantity in cart', async ({ page }) => {
    await test.step('Given the user is logged in with an item in cart with quantity > 1', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();

      // Add item and increase quantity
      await page.goto('/');
      await page.locator('[data-testid="add-to-cart-book-001"]').click();
      await page.waitForTimeout(500);

      await page.locator(pageRepository.Navigation.cartLink).click();
      await page.locator('[data-testid^="cart-qty-plus-"]').first().click();
      await page.waitForTimeout(500);
    });

    await test.step('When the user decreases quantity', async () => {
      const qtyElement = page.locator('[data-testid^="cart-qty-"]').first();
      const initialQty = await qtyElement.textContent();

      const minusButton = page.locator('[data-testid^="cart-qty-minus-"]').first();
      await minusButton.click();
      await page.waitForTimeout(500);

      const newQty = await qtyElement.textContent();
      expect(parseInt(newQty || '0')).toBe(parseInt(initialQty || '0') - 1);
    });
  });

  test('should remove item from cart', async ({ page }) => {
    await test.step('Given the user is logged in with an item in cart', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();

      // Add an item to cart
      await page.goto('/');
      await page.locator('[data-testid="add-to-cart-book-001"]').click();
      await page.waitForTimeout(500);
    });

    await test.step('When the user removes the item', async () => {
      await page.locator(pageRepository.Navigation.cartLink).click();
      await expect(page.locator(pageRepository.CartPage.container)).toBeVisible();

      const removeButton = page.locator('[data-testid^="cart-remove-"]').first();
      await removeButton.click();
      await page.waitForTimeout(500);
    });

    await test.step('Then the cart should be empty', async () => {
      await expect(page.locator(pageRepository.CartPage.emptyMessage)).toBeVisible();
    });
  });

  test('should clear entire cart', async ({ page }) => {
    await test.step('Given the user is logged in with items in cart', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();

      // Add multiple items to cart
      await page.goto('/');
      await page.locator('[data-testid="add-to-cart-book-001"]').click();
      await page.waitForTimeout(300);
      await page.locator('[data-testid="add-to-cart-book-002"]').click();
      await page.waitForTimeout(500);
    });

    await test.step('When the user clicks clear cart', async () => {
      await page.locator(pageRepository.Navigation.cartLink).click();
      await expect(page.locator(pageRepository.CartPage.container)).toBeVisible();

      await page.locator(pageRepository.CartPage.clearButton).click();
      await page.waitForTimeout(500);
    });

    await test.step('Then the cart should be empty', async () => {
      await expect(page.locator(pageRepository.CartPage.emptyMessage)).toBeVisible();
    });
  });

  test('should display correct cart total', async ({ page }) => {
    await test.step('Given the user is logged in', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
    });

    await test.step('And the user adds an item to cart', async () => {
      await page.goto('/');
      await page.locator('[data-testid="add-to-cart-book-001"]').click();
      await page.waitForTimeout(500);
    });

    await test.step('Then the cart total should be displayed correctly', async () => {
      await page.locator(pageRepository.Navigation.cartLink).click();
      await expect(page.locator(pageRepository.CartPage.container)).toBeVisible();
      await expect(page.locator(pageRepository.CartPage.total)).toBeVisible();
      const total = await page.locator(pageRepository.CartPage.total).textContent();
      expect(total).toMatch(/\$\d+\.\d{2}/);
    });
  });
});
