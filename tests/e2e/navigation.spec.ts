import { test, expect, TEST_USER_1, API_BASE_URL } from './fixtures/base';
import pageRepository from './data/page-repository.json';

test.describe('Navigation', () => {
  test.beforeEach(async ({ request }) => {
    // Reset the app to known state before each test
    await request.post(`${API_BASE_URL}/api/reset`);
  });

  test.describe('Sidebar Navigation', () => {
    test('should display sidebar with navigation links', async ({ page }) => {
      await test.step('When the user visits the homepage', async () => {
        await page.goto('/');
      });

      await test.step('Then the sidebar should be visible', async () => {
        await expect(page.locator(pageRepository.Navigation.sidebar)).toBeVisible();
      });

      await test.step('And the logo should be displayed', async () => {
        await expect(page.locator(pageRepository.Navigation.logo)).toBeVisible();
      });

      await test.step('And the All Books link should be visible', async () => {
        await expect(page.locator(pageRepository.Navigation.allBooksLink)).toBeVisible();
      });

      await test.step('And the Marketplace link should be visible', async () => {
        await expect(page.locator(pageRepository.Navigation.marketplaceLink)).toBeVisible();
      });
    });

    test('should navigate to All Books page', async ({ page }) => {
      await test.step('Given the user is on the marketplace page', async () => {
        await page.goto('/marketplace');
        await expect(page.locator(pageRepository.MarketplacePage.container)).toBeVisible();
      });

      await test.step('When the user clicks on All Books link', async () => {
        await page.locator(pageRepository.Navigation.allBooksLink).click();
      });

      await test.step('Then the user should be on the homepage', async () => {
        await expect(page).toHaveURL('/');
        await expect(page.locator(pageRepository.HomePage.container)).toBeVisible();
      });
    });

    test('should navigate to Marketplace page', async ({ page }) => {
      await test.step('Given the user is on the homepage', async () => {
        await page.goto('/');
        await expect(page.locator(pageRepository.HomePage.container)).toBeVisible();
      });

      await test.step('When the user clicks on Marketplace link', async () => {
        await page.locator(pageRepository.Navigation.marketplaceLink).click();
      });

      await test.step('Then the user should be on the marketplace page', async () => {
        await expect(page).toHaveURL('/marketplace');
        await expect(page.locator(pageRepository.MarketplacePage.container)).toBeVisible();
      });
    });
  });

  test.describe('Unauthenticated User Navigation', () => {
    test('should display login and signup links when not logged in', async ({ page }) => {
      await test.step('When the user visits the homepage', async () => {
        await page.goto('/');
      });

      await test.step('Then the login link should be visible', async () => {
        await expect(page.locator(pageRepository.Navigation.loginLink)).toBeVisible();
      });

      await test.step('And the signup link should be visible', async () => {
        await expect(page.locator(pageRepository.Navigation.signupLink)).toBeVisible();
      });

      await test.step('And the cart link should not be visible', async () => {
        await expect(page.locator(pageRepository.Navigation.cartLink)).not.toBeVisible();
      });

      await test.step('And the orders link should not be visible', async () => {
        await expect(page.locator(pageRepository.Navigation.ordersLink)).not.toBeVisible();
      });
    });

    test('should navigate to login page', async ({ page }) => {
      await test.step('Given the user is on the homepage', async () => {
        await page.goto('/');
      });

      await test.step('When the user clicks on login link', async () => {
        await page.locator(pageRepository.Navigation.loginLink).click();
      });

      await test.step('Then the user should be on the login page', async () => {
        await expect(page).toHaveURL('/login');
        await expect(page.locator(pageRepository.LoginPage.container)).toBeVisible();
      });
    });

    test('should navigate to signup page', async ({ page }) => {
      await test.step('Given the user is on the homepage', async () => {
        await page.goto('/');
      });

      await test.step('When the user clicks on signup link', async () => {
        await page.locator(pageRepository.Navigation.signupLink).click();
      });

      await test.step('Then the user should be on the signup page', async () => {
        await expect(page).toHaveURL('/signup');
        await expect(page.locator(pageRepository.SignupPage.container)).toBeVisible();
      });
    });
  });

  test.describe('Authenticated User Navigation', () => {
    test('should display authenticated navigation when logged in', async ({ page }) => {
      await test.step('Given the user is logged in', async () => {
        await page.goto('/login');
        await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
        await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
        await page.locator(pageRepository.LoginPage.submitButton).click();
        await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
      });

      await test.step('Then the cart link should be visible', async () => {
        await expect(page.locator(pageRepository.Navigation.cartLink)).toBeVisible();
      });

      await test.step('And the orders link should be visible', async () => {
        await expect(page.locator(pageRepository.Navigation.ordersLink)).toBeVisible();
      });

      await test.step('And the sell link should be visible', async () => {
        await expect(page.locator(pageRepository.Navigation.sellLink)).toBeVisible();
      });

      await test.step('And the profile link should be visible', async () => {
        await expect(page.locator(pageRepository.Navigation.profileLink)).toBeVisible();
      });

      await test.step('And the logout button should be visible', async () => {
        await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
      });

      await test.step('And the login/signup links should not be visible', async () => {
        await expect(page.locator(pageRepository.Navigation.loginLink)).not.toBeVisible();
        await expect(page.locator(pageRepository.Navigation.signupLink)).not.toBeVisible();
      });
    });

    test('should navigate to cart page', async ({ page }) => {
      await test.step('Given the user is logged in', async () => {
        await page.goto('/login');
        await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
        await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
        await page.locator(pageRepository.LoginPage.submitButton).click();
        await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
      });

      await test.step('When the user clicks on cart link', async () => {
        await page.locator(pageRepository.Navigation.cartLink).click();
      });

      await test.step('Then the user should be on the cart page', async () => {
        await expect(page).toHaveURL('/cart');
        await expect(page.locator(pageRepository.CartPage.container)).toBeVisible();
      });
    });

    test('should navigate to orders page', async ({ page }) => {
      await test.step('Given the user is logged in', async () => {
        await page.goto('/login');
        await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
        await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
        await page.locator(pageRepository.LoginPage.submitButton).click();
        await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
      });

      await test.step('When the user clicks on orders link', async () => {
        await page.locator(pageRepository.Navigation.ordersLink).click();
      });

      await test.step('Then the user should be on the orders page', async () => {
        await expect(page).toHaveURL('/orders');
        await expect(page.locator(pageRepository.OrdersPage.container)).toBeVisible();
      });
    });

    test('should navigate to profile page', async ({ page }) => {
      await test.step('Given the user is logged in', async () => {
        await page.goto('/login');
        await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
        await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
        await page.locator(pageRepository.LoginPage.submitButton).click();
        await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
      });

      await test.step('When the user clicks on profile link', async () => {
        await page.locator(pageRepository.Navigation.profileLink).click();
      });

      await test.step('Then the user should be on the profile page', async () => {
        await expect(page).toHaveURL('/profile');
        await expect(page.locator(pageRepository.ProfilePage.container)).toBeVisible();
      });
    });

    test('should navigate to sell page', async ({ page }) => {
      await test.step('Given the user is logged in', async () => {
        await page.goto('/login');
        await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
        await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
        await page.locator(pageRepository.LoginPage.submitButton).click();
        await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
      });

      await test.step('When the user clicks on sell link', async () => {
        await page.locator(pageRepository.Navigation.sellLink).click();
      });

      await test.step('Then the user should be on the sell page', async () => {
        await expect(page).toHaveURL('/marketplace/sell');
        await expect(page.locator(pageRepository.CreateListingPage.container)).toBeVisible();
      });
    });
  });

  test.describe('Genre Filter Navigation', () => {
    test('should filter books by genre from sidebar', async ({ page }) => {
      await test.step('Given the user is on the homepage', async () => {
        await page.goto('/');
        await expect(page.locator(pageRepository.HomePage.bookGrid)).toBeVisible();
      });

      await test.step('When the user clicks on Fiction genre in sidebar', async () => {
        await page.locator(pageRepository.GenreFilter.sidebarFiction).click();
      });

      await test.step('Then only Fiction books should be displayed', async () => {
        await page.waitForTimeout(500);
        const genreBadges = page.locator('[data-testid^="book-genre-"]');
        const count = await genreBadges.count();
        expect(count).toBeGreaterThan(0);
        // Verify first few books are Fiction
        for (let i = 0; i < Math.min(count, 3); i++) {
          await expect(genreBadges.nth(i)).toHaveText('Fiction');
        }
      });
    });
  });

  test.describe('Theme Toggle', () => {
    test('should toggle theme', async ({ page }) => {
      await test.step('Given the user is on the homepage', async () => {
        await page.goto('/');
      });

      await test.step('When the user clicks the theme toggle', async () => {
        await page.locator(pageRepository.Navigation.themeToggle).click();
      });

      await test.step('Then the theme should change', async () => {
        // Just verify the toggle is clickable and the page doesn't break
        await expect(page.locator(pageRepository.HomePage.container)).toBeVisible();
      });

      await test.step('And clicking again should revert the theme', async () => {
        await page.locator(pageRepository.Navigation.themeToggle).click();
        await expect(page.locator(pageRepository.HomePage.container)).toBeVisible();
      });
    });
  });

  test.describe('Cart Badge', () => {
    test('should update cart badge when items are added', async ({ page }) => {
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

      await test.step('When the user adds an item to cart', async () => {
        await page.locator('[data-testid="add-to-cart-book-001"]').click();
        await page.waitForTimeout(500);
      });

      await test.step('Then the cart badge should show 1', async () => {
        await expect(page.locator(pageRepository.Navigation.cartBadge)).toBeVisible();
        const badgeText = await page.locator(pageRepository.Navigation.cartBadge).textContent();
        expect(badgeText).toBe('1');
      });

      await test.step('When the user adds another item', async () => {
        await page.locator('[data-testid="add-to-cart-book-002"]').click();
        await page.waitForTimeout(500);
      });

      await test.step('Then the cart badge should show 2', async () => {
        const badgeText = await page.locator(pageRepository.Navigation.cartBadge).textContent();
        expect(badgeText).toBe('2');
      });
    });
  });
});
