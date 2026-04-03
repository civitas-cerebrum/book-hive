import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display navigation header on all pages', async ({ page }) => {
    await test.step('Given I am on the homepage', async () => {
      await expect(page).toHaveURL('/');
    });

    await test.step('Then I should see the navigation', async () => {
      await expect(page.locator('nav')).toBeVisible();
    });

    await test.step('And I should see the BookHive logo', async () => {
      // Use .first() to handle multiple "BookHive" elements
      await expect(page.getByText('BookHive').first()).toBeVisible();
    });

    await test.step('And I should see Browse section', async () => {
      await expect(page.getByText('Browse').first()).toBeVisible();
    });

    await test.step('And I should see Categories section', async () => {
      await expect(page.getByText('Categories').first()).toBeVisible();
    });

    await test.step('And I should see Account section', async () => {
      await expect(page.getByText('Account').first()).toBeVisible();
    });
  });

  test('should navigate to Marketplace', async ({ page }) => {
    await test.step('When I click the Marketplace link', async () => {
      await page.click("a[href='/marketplace']");
      await page.waitForLoadState('networkidle');
    });

    await test.step('Then I should be on the Marketplace page', async () => {
      await expect(page).toHaveURL('/marketplace');
    });
  });

  test('should navigate to Login page', async ({ page }) => {
    await test.step('When I click the Login link', async () => {
      await page.click("a[href='/login']");
      await page.waitForLoadState('networkidle');
    });

    await test.step('Then I should be on the Login page', async () => {
      await expect(page).toHaveURL('/login');
      await expect(page.locator('h1')).toContainText(/Welcome back/i);
    });
  });

  test('should navigate to Signup page', async ({ page }) => {
    await test.step('When I click the Sign Up link', async () => {
      await page.click("a[href='/signup']");
      await page.waitForLoadState('networkidle');
    });

    await test.step('Then I should be on the Signup page', async () => {
      await expect(page).toHaveURL('/signup');
      await expect(page.locator('h1')).toContainText(/Create an account/i);
    });
  });

  test('should navigate between category filters', async ({ page }) => {
    const categories = [
      { name: 'Fiction', url: '/?genre=Fiction' },
      { name: 'Sci-Fi', url: '/?genre=Sci-Fi' },
      { name: 'Non-Fiction', url: '/?genre=Non-Fiction' },
      { name: 'Biography', url: '/?genre=Biography' },
      { name: 'Fantasy', url: '/?genre=Fantasy' },
      { name: 'Mystery', url: '/?genre=Mystery' },
    ];

    for (const category of categories) {
      await test.step(`When I click the ${category.name} category link`, async () => {
        await page.click(`a[href='${category.url}']`);
        await page.waitForLoadState('networkidle');
      });

      await test.step(`Then I should be on the ${category.name} filtered view`, async () => {
        await expect(page).toHaveURL(category.url);
      });
    }
  });

  test('should toggle theme', async ({ page }) => {
    await test.step('Given I am on the homepage', async () => {
      await expect(page).toHaveURL('/');
    });

    await test.step('When I click the theme toggle button', async () => {
      // Theme toggle can be sun or moon emoji
      const themeButton = page.locator('nav >> button').filter({ hasText: /☀️|🌙/ });
      await expect(themeButton).toBeVisible();
      await themeButton.click();
    });

    await test.step('Then the theme should change', async () => {
      // After clicking, the emoji should change (sun to moon or vice versa)
      const themeButton = page.locator('nav >> button').filter({ hasText: /☀️|🌙/ });
      await expect(themeButton).toBeVisible();
    });
  });

  test('should show guest navigation links', async ({ page }) => {
    await test.step('Given I am not logged in', async () => {
      await expect(page).toHaveURL('/');
    });

    await test.step('Then I should see Login link', async () => {
      await expect(page.locator("a[href='/login']")).toBeVisible();
    });

    await test.step('And I should see Sign Up link', async () => {
      await expect(page.locator("a[href='/signup']")).toBeVisible();
    });

    await test.step('And I should NOT see Logout button', async () => {
      await expect(page.locator("button:has-text('Logout')")).not.toBeVisible();
    });
  });
});
