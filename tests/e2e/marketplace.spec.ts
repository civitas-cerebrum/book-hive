import { test, expect, TEST_USER_1, TEST_USER_2, API_BASE_URL } from './fixtures/base';
import pageRepository from './data/page-repository.json';

test.describe('Marketplace', () => {
  test.beforeEach(async ({ request }) => {
    // Reset the app to known state before each test
    await request.post(`${API_BASE_URL}/api/reset`);
  });

  test.describe('Browse Listings', () => {
    test('should display marketplace page', async ({ page }) => {
      await test.step('When the user navigates to marketplace', async () => {
        await page.goto('/marketplace');
      });

      await test.step('Then the marketplace page should be displayed', async () => {
        await expect(page.locator(pageRepository.MarketplacePage.container)).toBeVisible();
      });
    });

    test('should display no listings message when empty', async ({ page }) => {
      await test.step('Given there are no listings', async () => {
        // Reset should clear all listings
      });

      await test.step('When the user navigates to marketplace', async () => {
        await page.goto('/marketplace');
      });

      await test.step('Then the no listings message should be displayed', async () => {
        await expect(page.locator(pageRepository.MarketplacePage.container)).toBeVisible();
        await expect(page.locator(pageRepository.MarketplacePage.noListings)).toBeVisible();
      });
    });

    test('should display listings when available', async ({ page, request }) => {
      await test.step('Given a user has created a listing', async () => {
        // Login and create a listing via API
        const loginResponse = await request.post(`${API_BASE_URL}/api/auth/login`, {
          data: { email: TEST_USER_1.email, password: TEST_USER_1.password }
        });
        const { token } = await loginResponse.json();

        await request.post(`${API_BASE_URL}/api/marketplace/listings`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { bookId: 'book-001', condition: 'GOOD', price: 9.99 }
        });
      });

      await test.step('When the user navigates to marketplace', async () => {
        await page.goto('/marketplace');
      });

      await test.step('Then the listing should be displayed', async () => {
        await expect(page.locator(pageRepository.MarketplacePage.container)).toBeVisible();
        const listingCard = page.locator('[data-testid^="listing-card-"]');
        await expect(listingCard.first()).toBeVisible();
      });
    });
  });

  test.describe('Create Listing', () => {
    test('should create a new listing', async ({ page }) => {
      await test.step('Given the user is logged in', async () => {
        await page.goto('/login');
        await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
        await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
        await page.locator(pageRepository.LoginPage.submitButton).click();
        await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
      });

      await test.step('When the user navigates to create listing page', async () => {
        await page.locator(pageRepository.Navigation.sellLink).click();
        await expect(page.locator(pageRepository.CreateListingPage.container)).toBeVisible();
      });

      await test.step('And fills in the listing details', async () => {
        await page.locator(pageRepository.CreateListingPage.bookSelect).selectOption({ index: 1 });
        await page.locator(pageRepository.CreateListingPage.conditionSelect).selectOption('GOOD');
        await page.locator(pageRepository.CreateListingPage.priceInput).fill('15.99');
      });

      await test.step('And clicks create listing', async () => {
        await page.locator(pageRepository.CreateListingPage.createButton).click();
        await page.waitForTimeout(1000);
      });

      await test.step('Then the listing should be created', async () => {
        // Should redirect to marketplace or profile
        await page.goto('/marketplace');
        const listingCard = page.locator('[data-testid^="listing-card-"]');
        await expect(listingCard.first()).toBeVisible();
      });
    });

    test('should display listing in profile after creation', async ({ page }) => {
      await test.step('Given the user is logged in and creates a listing', async () => {
        await page.goto('/login');
        await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
        await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
        await page.locator(pageRepository.LoginPage.submitButton).click();
        await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();

        await page.locator(pageRepository.Navigation.sellLink).click();
        await page.locator(pageRepository.CreateListingPage.bookSelect).selectOption({ index: 1 });
        await page.locator(pageRepository.CreateListingPage.conditionSelect).selectOption('LIKE NEW');
        await page.locator(pageRepository.CreateListingPage.priceInput).fill('12.50');
        await page.locator(pageRepository.CreateListingPage.createButton).click();
        await page.waitForTimeout(1000);
      });

      await test.step('When the user goes to their profile', async () => {
        await page.locator(pageRepository.Navigation.profileLink).click();
        await expect(page.locator(pageRepository.ProfilePage.container)).toBeVisible();
      });

      await test.step('Then the listing should be displayed in their profile', async () => {
        const myListing = page.locator('[data-testid^="my-listing-"]');
        await expect(myListing.first()).toBeVisible();
      });
    });

    test('should require authentication to create listing', async ({ page }) => {
      await test.step('Given the user is not logged in', async () => {
        await page.goto('/');
      });

      await test.step('When the user tries to access create listing page', async () => {
        await page.goto('/marketplace/sell');
      });

      await test.step('Then the user should be redirected to login', async () => {
        await expect(page).toHaveURL(/\/login/);
      });
    });
  });

  test.describe('Buy Listing', () => {
    test('should buy a listing from another user', async ({ page, request }) => {
      await test.step('Given user1 has created a listing', async () => {
        const loginResponse = await request.post(`${API_BASE_URL}/api/auth/login`, {
          data: { email: TEST_USER_1.email, password: TEST_USER_1.password }
        });
        const { token } = await loginResponse.json();

        await request.post(`${API_BASE_URL}/api/marketplace/listings`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { bookId: 'book-001', condition: 'GOOD', price: 8.99 }
        });
      });

      await test.step('And user2 is logged in', async () => {
        await page.goto('/login');
        await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_2.email);
        await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_2.password);
        await page.locator(pageRepository.LoginPage.submitButton).click();
        await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
      });

      await test.step('When user2 navigates to marketplace and buys the listing', async () => {
        await page.goto('/marketplace');
        await expect(page.locator(pageRepository.MarketplacePage.container)).toBeVisible();
        const buyButton = page.locator('[data-testid^="listing-buy-"]').first();
        await expect(buyButton).toBeVisible();
        await buyButton.click();
        await page.waitForTimeout(1000);
      });

      await test.step('Then the listing should no longer be available', async () => {
        await page.reload();
        // Either no listings or the specific listing is gone
        const listingCards = page.locator('[data-testid^="listing-card-"]');
        const count = await listingCards.count();
        // The listing was bought, so it should be removed
        expect(count).toBe(0);
      });
    });

    test('should not allow buying own listing', async ({ page }) => {
      await test.step('Given the user is logged in and has created a listing', async () => {
        await page.goto('/login');
        await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
        await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
        await page.locator(pageRepository.LoginPage.submitButton).click();
        await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();

        await page.locator(pageRepository.Navigation.sellLink).click();
        await page.locator(pageRepository.CreateListingPage.bookSelect).selectOption({ index: 1 });
        await page.locator(pageRepository.CreateListingPage.conditionSelect).selectOption('FAIR');
        await page.locator(pageRepository.CreateListingPage.priceInput).fill('5.99');
        await page.locator(pageRepository.CreateListingPage.createButton).click();
        await page.waitForTimeout(1000);
      });

      await test.step('When the user views the marketplace', async () => {
        await page.goto('/marketplace');
        await expect(page.locator(pageRepository.MarketplacePage.container)).toBeVisible();
      });

      await test.step('Then the buy button should not be visible for their own listing', async () => {
        const listingCard = page.locator('[data-testid^="listing-card-"]').first();
        await expect(listingCard).toBeVisible();
        // The buy button should not be present for own listing
        const buyButton = listingCard.locator('[data-testid^="listing-buy-"]');
        await expect(buyButton).not.toBeVisible();
      });
    });
  });

  test.describe('Cancel Listing', () => {
    test('should cancel own listing from profile', async ({ page }) => {
      await test.step('Given the user is logged in and has created a listing', async () => {
        await page.goto('/login');
        await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
        await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
        await page.locator(pageRepository.LoginPage.submitButton).click();
        await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();

        await page.locator(pageRepository.Navigation.sellLink).click();
        await page.locator(pageRepository.CreateListingPage.bookSelect).selectOption({ index: 1 });
        await page.locator(pageRepository.CreateListingPage.conditionSelect).selectOption('GOOD');
        await page.locator(pageRepository.CreateListingPage.priceInput).fill('10.00');
        await page.locator(pageRepository.CreateListingPage.createButton).click();
        await page.waitForTimeout(1000);
      });

      await test.step('When the user goes to profile and cancels the listing', async () => {
        await page.locator(pageRepository.Navigation.profileLink).click();
        await expect(page.locator(pageRepository.ProfilePage.container)).toBeVisible();

        const cancelButton = page.locator('[data-testid^="cancel-listing-"]').first();
        await expect(cancelButton).toBeVisible();
        await cancelButton.click();
        await page.waitForTimeout(1000);
      });

      await test.step('Then the listing should be removed', async () => {
        await page.reload();
        await expect(page.locator(pageRepository.ProfilePage.noListings)).toBeVisible();
      });
    });
  });

  test.describe('Listing Details', () => {
    test('should display listing with condition badge', async ({ page, request }) => {
      await test.step('Given a listing exists', async () => {
        const loginResponse = await request.post(`${API_BASE_URL}/api/auth/login`, {
          data: { email: TEST_USER_1.email, password: TEST_USER_1.password }
        });
        const { token } = await loginResponse.json();

        await request.post(`${API_BASE_URL}/api/marketplace/listings`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { bookId: 'book-001', condition: 'LIKE NEW', price: 14.99 }
        });
      });

      await test.step('When the user views the marketplace', async () => {
        await page.goto('/marketplace');
        await expect(page.locator(pageRepository.MarketplacePage.container)).toBeVisible();
      });

      await test.step('Then the listing should display the condition badge', async () => {
        const conditionBadge = page.locator('[data-testid^="listing-condition-badge-"]').first();
        await expect(conditionBadge).toBeVisible();
        await expect(conditionBadge).toContainText(/NEW|LIKE NEW|GOOD|FAIR/);
      });

      await test.step('And the price should be displayed', async () => {
        const price = page.locator('[data-testid^="listing-price-"]').first();
        await expect(price).toBeVisible();
        const priceText = await price.textContent();
        expect(priceText).toMatch(/\$\d+\.\d{2}/);
      });
    });
  });
});
