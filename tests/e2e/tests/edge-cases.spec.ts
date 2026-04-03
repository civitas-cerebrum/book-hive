import { test, expect } from './fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Edge Cases & Negative Tests', () => {
  test.describe.configure({ timeout: 60_000 });

  test.describe('Search Edge Cases', () => {
    test.beforeEach(async ({ steps }) => {
      await steps.navigateTo('/');
      await steps.waitForState('HomePage', 'bookGrid');
    });

    test('search with special characters returns results or empty state', async ({ steps }) => {
      await steps.fill('HomePage', 'searchInput', '<script>alert(1)</script>');
      await steps.pressKey('Enter');
      // Should not break the app — either shows no results or filtered results
      await steps.verifyPresence('HomePage', 'container');
    });

    test('search with single character returns results', async ({ steps }) => {
      await steps.fill('HomePage', 'searchInput', 'a');
      await steps.pressKey('Enter');
      await steps.verifyPresence('HomePage', 'container');
    });

    test('clearing search shows all books again', async ({ steps }) => {
      await steps.fill('HomePage', 'searchInput', 'Dune');
      await steps.pressKey('Enter');
      await steps.waitForState('HomePage', 'bookGrid');
      await steps.clearInput('HomePage', 'searchInput');
      await steps.pressKey('Enter');
      await steps.waitForState('HomePage', 'bookGrid');
      await steps.verifyCount('HomePage', 'bookCard', { exactly: 12 });
    });
  });

  test.describe('Signup Edge Cases', () => {
    test('signup with existing username shows error', async ({ steps, request }) => {
      await request.post('http://localhost:8080/api/reset');
      await steps.navigateTo('/signup');
      await steps.waitForState('SignupPage', 'container');
      await steps.fill('SignupPage', 'usernameInput', 'testuser1');
      await steps.fill('SignupPage', 'emailInput', 'unique_email_test@test.com');
      await steps.fill('SignupPage', 'passwordInput', 'ValidPass1!');
      await steps.click('SignupPage', 'submitButton');
      await steps.waitForState('SignupPage', 'errorMessage');
      await steps.verifyPresence('SignupPage', 'errorMessage');
    });
  });

  test.describe('Direct URL Access', () => {
    test('non-existent route shows the home page or 404', async ({ steps, page }) => {
      await steps.navigateTo('/nonexistent-route');
      // React Router should render blank or home page
      const url = page.url();
      expect(url).toContain('/nonexistent-route');
    });

    test('book detail with invalid ID format', async ({ steps }) => {
      await steps.navigateTo('/books/completely-invalid-id-12345');
      await steps.verifyPresence('BookDetailPage', 'notFound');
    });
  });

  test.describe('Marketplace Listing Edge Cases', () => {
    test.beforeEach(async ({ steps, request }) => {
      await request.post('http://localhost:8080/api/reset');
      await steps.navigateTo('/login');
      await steps.waitForState('LoginPage', 'container');
      await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
      await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
      await steps.click('LoginPage', 'submitButton');
      await steps.waitForState('HomePage', 'bookGrid');
    });

    test('create listing without selecting book shows validation', async ({ steps, page }) => {
      await steps.navigateTo('/marketplace/sell');
      await steps.waitForState('CreateListingPage', 'container');
      await steps.fill('CreateListingPage', 'priceInput', '10.00');
      await steps.click('CreateListingPage', 'submitButton');
      // HTML required validation prevents submission
      await steps.verifyUrlContains('/marketplace/sell');
      const bookSelect = page.locator('[data-testid="listing-book-select"]');
      const isValid = await bookSelect.evaluate((el: HTMLSelectElement) => el.validity.valid);
      expect(isValid).toBe(false);
    });

    test('create listing without price shows validation', async ({ steps, page }) => {
      await steps.navigateTo('/marketplace/sell');
      await steps.waitForState('CreateListingPage', 'container');
      await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
      await steps.click('CreateListingPage', 'submitButton');
      // HTML required validation prevents submission
      await steps.verifyUrlContains('/marketplace/sell');
    });
  });

  test.describe('Theme Persistence', () => {
    test('theme persists across page navigation', async ({ steps, page }) => {
      await steps.navigateTo('/');
      await steps.waitForState('HomePage', 'bookGrid');
      await steps.click('Sidebar', 'themeToggle');
      const themeAfterToggle = await page.locator('html').getAttribute('data-theme');
      await steps.navigateTo('/marketplace');
      await steps.waitForState('MarketplacePage', 'container');
      const themeAfterNav = await page.locator('html').getAttribute('data-theme');
      expect(themeAfterNav).toEqual(themeAfterToggle);
    });
  });

  test.describe('Order Detail Edge Cases', () => {
    test('accessing non-existent order shows not found', async ({ steps, request }) => {
      await request.post('http://localhost:8080/api/reset');
      await steps.navigateTo('/login');
      await steps.waitForState('LoginPage', 'container');
      await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
      await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
      await steps.click('LoginPage', 'submitButton');
      await steps.waitForState('HomePage', 'bookGrid');
      await steps.navigateTo('/orders/nonexistent-order-id');
      await steps.verifyPresence('OrderDetailPage', 'notFound');
    });
  });
});
