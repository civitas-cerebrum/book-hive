import { test, expect, getSelector, API_BASE } from './fixtures/base';

test.describe('Navigation', () => {

  test.describe('Guest Navigation', () => {
    test('should display sidebar', async ({ page }) => {
      await test.step('Given I navigate to the home page', async () => {
        await page.goto('/');
      });

      await test.step('Then I should see the sidebar', async () => {
        await expect(page.locator(getSelector('Navigation', 'sidebar'))).toBeVisible();
      });

      await test.step('And I should see the logo', async () => {
        await expect(page.locator(getSelector('Navigation', 'logo'))).toBeVisible();
        await expect(page.locator(getSelector('Navigation', 'logo'))).toContainText('BookHive');
      });
    });

    test('should show guest navigation items', async ({ page }) => {
      await test.step('Given I am not logged in', async () => {
        await page.goto('/');
      });

      await test.step('Then I should see login and signup links', async () => {
        await expect(page.locator(getSelector('Navigation', 'loginLink'))).toBeVisible();
        await expect(page.locator(getSelector('Navigation', 'signupLink'))).toBeVisible();
      });

      await test.step('And I should see browse links', async () => {
        await expect(page.locator(getSelector('Navigation', 'allBooksLink'))).toBeVisible();
        await expect(page.locator(getSelector('Navigation', 'marketplaceLink'))).toBeVisible();
      });

      await test.step('And I should not see authenticated links', async () => {
        await expect(page.locator(getSelector('Navigation', 'cartLink'))).not.toBeVisible();
        await expect(page.locator(getSelector('Navigation', 'ordersLink'))).not.toBeVisible();
        await expect(page.locator(getSelector('Navigation', 'profileLink'))).not.toBeVisible();
      });
    });

    test('should navigate to All Books', async ({ page }) => {
      await test.step('Given I am on the home page', async () => {
        await page.goto('/');
      });

      await test.step('When I click All Books', async () => {
        await page.locator(getSelector('Navigation', 'allBooksLink')).click();
      });

      await test.step('Then I should be on the home page', async () => {
        await page.waitForURL('/');
        await expect(page.locator(getSelector('HomePage', 'container'))).toBeVisible();
      });
    });

    test('should navigate to Marketplace', async ({ page }) => {
      await test.step('Given I am on the home page', async () => {
        await page.goto('/');
      });

      await test.step('When I click Marketplace', async () => {
        await page.locator(getSelector('Navigation', 'marketplaceLink')).click();
      });

      await test.step('Then I should be on the marketplace page', async () => {
        await page.waitForURL('/marketplace');
        await expect(page.locator(getSelector('MarketplacePage', 'container'))).toBeVisible();
      });
    });

    test('should navigate to Login', async ({ page }) => {
      await test.step('Given I am on the home page', async () => {
        await page.goto('/');
      });

      await test.step('When I click Login', async () => {
        await page.locator(getSelector('Navigation', 'loginLink')).click();
      });

      await test.step('Then I should be on the login page', async () => {
        await page.waitForURL('/login');
        await expect(page.locator(getSelector('LoginPage', 'container'))).toBeVisible();
      });
    });

    test('should navigate to Sign Up', async ({ page }) => {
      await test.step('Given I am on the home page', async () => {
        await page.goto('/');
      });

      await test.step('When I click Sign Up', async () => {
        await page.locator(getSelector('Navigation', 'signupLink')).click();
      });

      await test.step('Then I should be on the signup page', async () => {
        await page.waitForURL('/signup');
        await expect(page.locator(getSelector('SignupPage', 'container'))).toBeVisible();
      });
    });
  });

  test.describe('Authenticated Navigation', () => {
    test('should show authenticated navigation items', async ({ page, loginAs }) => {
      await test.step('Given I am logged in', async () => {
        await loginAs('user1');
      });

      await test.step('Then I should see authenticated links', async () => {
        await expect(page.locator(getSelector('Navigation', 'cartLink'))).toBeVisible();
        await expect(page.locator(getSelector('Navigation', 'ordersLink'))).toBeVisible();
        await expect(page.locator(getSelector('Navigation', 'sellLink'))).toBeVisible();
        await expect(page.locator(getSelector('Navigation', 'profileLink'))).toBeVisible();
        await expect(page.locator(getSelector('Navigation', 'logoutButton'))).toBeVisible();
      });

      await test.step('And I should not see login/signup links', async () => {
        await expect(page.locator(getSelector('Navigation', 'loginLink'))).not.toBeVisible();
        await expect(page.locator(getSelector('Navigation', 'signupLink'))).not.toBeVisible();
      });
    });

    test('should navigate to Cart', async ({ page, loginAs }) => {
      await test.step('Given I am logged in', async () => {
        await loginAs('user1');
      });

      await test.step('When I click Cart', async () => {
        await page.locator(getSelector('Navigation', 'cartLink')).click();
      });

      await test.step('Then I should be on the cart page', async () => {
        await page.waitForURL('/cart');
        await expect(page.locator(getSelector('CartPage', 'container'))).toBeVisible();
      });
    });

    test('should navigate to Orders', async ({ page, loginAs }) => {
      await test.step('Given I am logged in', async () => {
        await loginAs('user1');
      });

      await test.step('When I click Orders', async () => {
        await page.locator(getSelector('Navigation', 'ordersLink')).click();
      });

      await test.step('Then I should be on the orders page', async () => {
        await page.waitForURL('/orders');
        await expect(page.locator(getSelector('OrdersPage', 'container'))).toBeVisible();
      });
    });

    test('should navigate to Sell a Book', async ({ page, loginAs }) => {
      await test.step('Given I am logged in', async () => {
        await loginAs('user1');
      });

      await test.step('When I click Sell a Book', async () => {
        await page.locator(getSelector('Navigation', 'sellLink')).click();
      });

      await test.step('Then I should be on the create listing page', async () => {
        await page.waitForURL('/marketplace/sell');
        await expect(page.locator(getSelector('SellPage', 'container'))).toBeVisible();
      });
    });

    test('should navigate to Profile', async ({ page, loginAs }) => {
      await test.step('Given I am logged in', async () => {
        await loginAs('user1');
      });

      await test.step('When I click Profile', async () => {
        await page.locator(getSelector('Navigation', 'profileLink')).click();
      });

      await test.step('Then I should be on the profile page', async () => {
        await page.waitForURL('/profile');
        await expect(page.locator(getSelector('ProfilePage', 'container'))).toBeVisible();
      });
    });

    test('should display user balance in sidebar', async ({ page, loginAs }) => {
      await test.step('Given I am logged in', async () => {
        await loginAs('user1');
      });

      await test.step('Then I should see my balance in the sidebar', async () => {
        await expect(page.locator(getSelector('Navigation', 'userBalance'))).toBeVisible();
        // Just verify balance format without checking specific amount (may change due to transactions)
        await expect(page.locator(getSelector('Navigation', 'userBalance'))).toContainText('$');
      });
    });
  });

  test.describe('Genre Navigation', () => {
    const genres = [
      { name: 'Fiction', selector: 'genreFilterFiction' },
      { name: 'Sci-Fi', selector: 'genreFilterSciFi' },
      { name: 'Non-Fiction', selector: 'genreFilterNonFiction' },
      { name: 'Biography', selector: 'genreFilterBiography' },
      { name: 'Fantasy', selector: 'genreFilterFantasy' },
      { name: 'Mystery', selector: 'genreFilterMystery' },
    ];

    for (const genre of genres) {
      test(`should filter books by ${genre.name}`, async ({ page }) => {
        await test.step('Given I am on the home page', async () => {
          await page.goto('/');
        });

        await test.step(`When I click on ${genre.name} genre`, async () => {
          await page.locator(getSelector('Navigation', genre.selector)).click();
        });

        await test.step(`Then the URL should have genre=${genre.name}`, async () => {
          await page.waitForURL(new RegExp(`genre=${genre.name}`));
        });
      });
    }
  });
});
