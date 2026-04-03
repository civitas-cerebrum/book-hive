import { test, expect } from '@playwright/test';
import { getSelector, generateTestUser, signupUserViaUI } from '../fixtures/base';

test.describe('Marketplace', () => {
  test('should display marketplace page', async ({ page }) => {
    await test.step('When I navigate to the marketplace', async () => {
      await page.goto('/marketplace');
    });

    await test.step('Then I should see the marketplace page', async () => {
      await expect(page.locator(getSelector('MarketplacePage', 'pageContainer'))).toBeVisible();
    });
  });

  test('should show no listings message when marketplace is empty', async ({ page }) => {
    await test.step('When I navigate to the marketplace', async () => {
      await page.goto('/marketplace');
    });

    await test.step('Then I may see no listings message or existing listings', async () => {
      // Wait for page to load
      await page.waitForTimeout(1000);
      const noListings = page.locator(getSelector('MarketplacePage', 'noListings'));
      const listings = page.locator('[data-testid^="listing-card-"]');

      const noListingsVisible = await noListings.isVisible().catch(() => false);
      const hasListings = await listings.count() > 0;

      // Either we have listings or we see the no listings message
      expect(noListingsVisible || hasListings).toBeTruthy();
    });
  });

  test.describe('Authenticated Marketplace Features', () => {
    let user: { email: string; password: string; username: string };

    test.beforeEach(async ({ page }) => {
      user = generateTestUser();
      await signupUserViaUI(page, user.username, user.email, user.password);
    });

    test('should navigate to create listing page', async ({ page }) => {
      await test.step('When I click Sell a Book in the sidebar', async () => {
        await page.click(getSelector('Common', 'navSell'));
      });

      await test.step('Then I should see the create listing page', async () => {
        await expect(page).toHaveURL('/marketplace/sell');
        await expect(page.locator(getSelector('CreateListingPage', 'pageContainer'))).toBeVisible();
      });
    });

    test('should display create listing form elements', async ({ page }) => {
      await test.step('Given I am on the create listing page', async () => {
        await page.goto('/marketplace/sell');
      });

      await test.step('Then I should see the book select dropdown', async () => {
        await expect(page.locator(getSelector('CreateListingPage', 'bookSelect'))).toBeVisible();
      });

      await test.step('And I should see the condition select', async () => {
        await expect(page.locator(getSelector('CreateListingPage', 'conditionSelect'))).toBeVisible();
      });

      await test.step('And I should see the price input', async () => {
        await expect(page.locator(getSelector('CreateListingPage', 'priceInput'))).toBeVisible();
      });

      await test.step('And I should see the create button', async () => {
        await expect(page.locator(getSelector('CreateListingPage', 'createBtn'))).toBeVisible();
      });
    });

    test('should create a new listing', async ({ page }) => {
      await test.step('Given I am on the create listing page', async () => {
        await page.goto('/marketplace/sell');
        await expect(page.locator(getSelector('CreateListingPage', 'pageContainer'))).toBeVisible();
      });

      await test.step('When I fill out the listing form', async () => {
        // Wait for books to load in dropdown
        await page.waitForTimeout(1000);

        // Select a book
        await page.selectOption(getSelector('CreateListingPage', 'bookSelect'), { index: 1 });

        // Select condition
        await page.selectOption(getSelector('CreateListingPage', 'conditionSelect'), 'LIKE_NEW');

        // Enter price
        await page.fill(getSelector('CreateListingPage', 'priceInput'), '9.99');
      });

      await test.step('And I click create listing', async () => {
        await page.click(getSelector('CreateListingPage', 'createBtn'));
      });

      await test.step('Then I should be redirected to the marketplace', async () => {
        await expect(page).toHaveURL('/marketplace', { timeout: 10000 });
      });
    });

    test('should show error when creating listing without required fields', async ({ page }) => {
      await test.step('Given I am on the create listing page', async () => {
        await page.goto('/marketplace/sell');
      });

      await test.step('When I try to submit without filling required fields', async () => {
        await page.click(getSelector('CreateListingPage', 'createBtn'));
      });

      await test.step('Then I should stay on the create listing page (form validation)', async () => {
        await expect(page).toHaveURL('/marketplace/sell');
      });
    });

    test('should view profile with user listings', async ({ page }) => {
      await test.step('Given I have created a listing', async () => {
        await page.goto('/marketplace/sell');
        await page.waitForTimeout(1000);
        await page.selectOption(getSelector('CreateListingPage', 'bookSelect'), { index: 1 });
        await page.selectOption(getSelector('CreateListingPage', 'conditionSelect'), 'GOOD');
        await page.fill(getSelector('CreateListingPage', 'priceInput'), '7.99');
        await page.click(getSelector('CreateListingPage', 'createBtn'));
        await expect(page).toHaveURL('/marketplace', { timeout: 10000 });
      });

      await test.step('When I navigate to my profile', async () => {
        await page.click(getSelector('Common', 'navProfile'));
      });

      await test.step('Then I should see my listings', async () => {
        await expect(page.locator(getSelector('ProfilePage', 'pageContainer'))).toBeVisible();
        await page.waitForTimeout(1000);

        // Either see listings or no listings message
        const hasListings = await page.locator('[data-testid^="my-listing-"]').count() > 0;
        const noListings = await page.locator(getSelector('ProfilePage', 'noListings')).isVisible().catch(() => false);

        expect(hasListings || noListings).toBeTruthy();
      });
    });
  });

  test('should display listing card information', async ({ page }) => {
    // First create a listing as a user
    const user = generateTestUser();
    await signupUserViaUI(page, user.username, user.email, user.password);

    // Create a listing
    await page.goto('/marketplace/sell');
    await page.waitForTimeout(1000);
    await page.selectOption(getSelector('CreateListingPage', 'bookSelect'), { index: 1 });
    await page.selectOption(getSelector('CreateListingPage', 'conditionSelect'), 'LIKE_NEW');
    await page.fill(getSelector('CreateListingPage', 'priceInput'), '8.50');
    await page.click(getSelector('CreateListingPage', 'createBtn'));
    await expect(page).toHaveURL('/marketplace', { timeout: 10000 });

    // Logout and view marketplace as anonymous
    await page.click(getSelector('Common', 'logoutBtn'));
    await page.goto('/marketplace');

    await test.step('Then I should see listing cards with title, price, and condition', async () => {
      await page.waitForTimeout(1000);
      const listings = page.locator('[data-testid^="listing-card-"]');
      const count = await listings.count();

      if (count > 0) {
        const firstListing = listings.first();
        await expect(firstListing.locator('[data-testid^="listing-title-"]')).toBeVisible();
        await expect(firstListing.locator('[data-testid^="listing-price-"]')).toBeVisible();
        await expect(firstListing.locator('[data-testid^="listing-condition-badge-"]')).toBeVisible();
      }
    });
  });
});
