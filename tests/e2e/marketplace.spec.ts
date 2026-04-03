import { test, expect, resetDatabase } from './fixtures/base';

test.describe('Marketplace', () => {
  test('should display marketplace page', async ({ page, sel }) => {
    await page.goto('/marketplace');
    await expect(page.locator(sel('MarketplacePage', 'page'))).toBeVisible();
  });

  test('should show no listings when empty', async ({ page, sel }) => {
    await resetDatabase();
    await page.goto('/marketplace');
    await expect(page.locator(sel('MarketplacePage', 'noListings'))).toBeVisible();
  });

  test('should be accessible without auth', async ({ page, sel }) => {
    await page.goto('/marketplace');
    await expect(page).toHaveURL('/marketplace');
    await expect(page.locator(sel('MarketplacePage', 'page'))).toBeVisible();
  });

  test('should display create listing page', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/marketplace/sell');
    await expect(page.locator(sel('CreateListingPage', 'page'))).toBeVisible();
    await expect(page.locator(sel('CreateListingPage', 'bookSelect'))).toBeVisible();
    await expect(page.locator(sel('CreateListingPage', 'conditionSelect'))).toBeVisible();
    await expect(page.locator(sel('CreateListingPage', 'priceInput'))).toBeVisible();
  });

  test('should create listing', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/marketplace/sell');
    await page.locator(sel('CreateListingPage', 'bookSelect')).selectOption({ index: 1 });
    await page.locator(sel('CreateListingPage', 'conditionSelect')).selectOption('GOOD');
    await page.locator(sel('CreateListingPage', 'priceInput')).fill('9.99');
    await page.locator(sel('CreateListingPage', 'createButton')).click();
    await expect(page).toHaveURL('/marketplace');
  });

  test('should show listing on marketplace', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/marketplace/sell');
    await page.locator(sel('CreateListingPage', 'bookSelect')).selectOption({ index: 2 });
    await page.locator(sel('CreateListingPage', 'conditionSelect')).selectOption('EXCELLENT');
    await page.locator(sel('CreateListingPage', 'priceInput')).fill('15.99');
    await page.locator(sel('CreateListingPage', 'createButton')).click();
    await expect(page.locator('[data-testid^="listing-card-"]').first()).toBeVisible();
  });

  test('should show listing in profile', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.goto('/marketplace/sell');
    await page.locator(sel('CreateListingPage', 'bookSelect')).selectOption({ index: 3 });
    await page.locator(sel('CreateListingPage', 'conditionSelect')).selectOption('FAIR');
    await page.locator(sel('CreateListingPage', 'priceInput')).fill('5.99');
    await page.locator(sel('CreateListingPage', 'createButton')).click();
    await page.goto('/profile');
    await expect(page.locator('[data-testid^="my-listing-"]').first()).toBeVisible();
  });
});
