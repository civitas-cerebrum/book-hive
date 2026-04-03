import { test, expect } from './fixtures/base';

test.describe('Navigation', () => {
  test.describe('Unauthenticated', () => {
    test('should show public nav items', async ({ page, sel }) => {
      await page.goto('/');
      await expect(page.locator(sel('Navigation', 'sidebar'))).toBeVisible();
      await expect(page.locator(sel('Navigation', 'allBooksLink'))).toBeVisible();
      await expect(page.locator(sel('Navigation', 'marketplaceLink'))).toBeVisible();
      await expect(page.locator(sel('Navigation', 'loginLink'))).toBeVisible();
      await expect(page.locator(sel('Navigation', 'signupLink'))).toBeVisible();
    });

    test('should hide auth nav items', async ({ page, sel }) => {
      await page.goto('/');
      await expect(page.locator(sel('Navigation', 'cartLink'))).not.toBeVisible();
      await expect(page.locator(sel('Navigation', 'ordersLink'))).not.toBeVisible();
      await expect(page.locator(sel('Navigation', 'profileLink'))).not.toBeVisible();
    });

    test('should navigate to marketplace', async ({ page, sel }) => {
      await page.goto('/');
      await page.locator(sel('Navigation', 'marketplaceLink')).click();
      await expect(page).toHaveURL('/marketplace');
    });

    test('should navigate to login', async ({ page, sel }) => {
      await page.goto('/');
      await page.locator(sel('Navigation', 'loginLink')).click();
      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Authenticated', () => {
    test('should show auth nav items', async ({ page, sel, loginAsUser1 }) => {
      await loginAsUser1();
      await expect(page.locator(sel('Navigation', 'cartLink'))).toBeVisible();
      await expect(page.locator(sel('Navigation', 'ordersLink'))).toBeVisible();
      await expect(page.locator(sel('Navigation', 'profileLink'))).toBeVisible();
      await expect(page.locator(sel('Navigation', 'logoutButton'))).toBeVisible();
    });

    test('should hide public nav items', async ({ page, sel, loginAsUser1 }) => {
      await loginAsUser1();
      await expect(page.locator(sel('Navigation', 'loginLink'))).not.toBeVisible();
      await expect(page.locator(sel('Navigation', 'signupLink'))).not.toBeVisible();
    });

    test('should navigate to cart', async ({ page, sel, loginAsUser1 }) => {
      await loginAsUser1();
      await page.locator(sel('Navigation', 'cartLink')).click();
      await expect(page).toHaveURL('/cart');
    });

    test('should navigate to orders', async ({ page, sel, loginAsUser1 }) => {
      await loginAsUser1();
      await page.locator(sel('Navigation', 'ordersLink')).click();
      await expect(page).toHaveURL('/orders');
    });

    test('should show cart badge', async ({ page, sel, loginAsUser1 }) => {
      await loginAsUser1();
      await page.goto('/');
      await page.locator('[data-testid="add-to-cart-book-001"]').click();
      await page.waitForTimeout(500);
      await expect(page.locator(sel('Navigation', 'cartBadge'))).toContainText('1');
    });
  });

  test.describe('TopBar', () => {
    test('should display topbar', async ({ page, sel }) => {
      await page.goto('/');
      await expect(page.locator(sel('Navigation', 'topbar'))).toBeVisible();
    });

    test('should display sidebar toggle', async ({ page, sel }) => {
      await page.goto('/');
      await expect(page.locator(sel('Navigation', 'sidebarToggle'))).toBeVisible();
    });
  });

  test.describe('Theme', () => {
    test('should display theme toggle', async ({ page, sel }) => {
      await page.goto('/');
      await expect(page.locator(sel('Navigation', 'themeToggle'))).toBeVisible();
    });

    test('should toggle theme', async ({ page, sel }) => {
      await page.goto('/');
      await page.locator(sel('Navigation', 'themeToggle')).click();
      await expect(page.locator(sel('Navigation', 'themeToggle'))).toBeVisible();
    });
  });

  test('should display logo', async ({ page, sel }) => {
    await page.goto('/');
    await expect(page.locator(sel('Navigation', 'logo'))).toContainText('BookHive');
  });
});
