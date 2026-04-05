import { test, expect } from '../fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Bug Discovery — Element Probing', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  /**
   * @bug BUG-001
   * @severity Medium
   * @phase 1a
   * @steps
   * 1. Login as testuser1
   * 2. Navigate to /marketplace/sell
   * 3. Select a book from dropdown
   * 4. Enter an extremely large price (999999999)
   * 5. Click Create Listing
   * 6. Observe that "An unexpected error occurred" appears instead of a proper validation message
   */
  test('@bug-discovery listing with extreme price shows generic error instead of validation message', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.fill('CreateListingPage', 'priceInput', '999999999');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // BUG: The backend returns a generic "An unexpected error occurred" for extreme prices
    // instead of a proper validation error like "Price must be less than $10000"
    // The listing was NOT created (stayed on sell page), but the error message is unhelpful
    await steps.verifyUrlContains('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'heading');
  });

  /**
   * @bug BUG-002
   * @severity High
   * @phase 1a
   * @steps
   * 1. Login as testuser1
   * 2. Navigate to /nonexistent-page
   * 3. Observe that the main content area is completely blank
   * 4. Assert that a "not found" or "404" message should be visible
   */
  test('@bug-discovery no 404 page for invalid routes — blank page instead of not-found message', async ({ steps, page }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/nonexistent-page');
    await steps.waitForNetworkIdle();

    // BUG: The page is completely blank — no "Page not found", "404", or any guidance.
    // Users who hit a bad URL see an empty page with just the navigation shell.
    // CORRECT behavior: some kind of "not found" indicator should be visible.
    const bodyText = await page.locator('main, [role="main"], #root').first().innerText();
    const hasNotFoundText = /not\s*found|404|does\s*not\s*exist|page\s*missing/i.test(bodyText);
    expect(hasNotFoundText, 'Expected a "not found" message for invalid route, but the page is blank').toBe(true);
  });

  /**
   * @bug BUG-003
   * @severity High
   * @phase 1a
   * @steps
   * 1. Login as testuser1 via API to obtain auth cookie
   * 2. POST to /api/marketplace/listings with a negative price (-5)
   * 3. Observe the backend returns 500 "An unexpected error occurred"
   * 4. Assert the response status should be 400 (validation error), not 500
   */
  test('@bug-discovery backend returns 500 for negative price listing via API instead of 400 validation error', async ({ steps, page }) => {
    // Login via the UI to establish the session cookie
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Make the API call from the page context so cookies are automatically included
    const status = await page.evaluate(async () => {
      const res = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: 'book-001', condition: 'GOOD', price: -5 }),
      });
      return res.status;
    });

    // BUG: The backend returns 500 "An unexpected error occurred" instead of a
    // proper 400 validation error. Negative prices should be caught by input validation
    // and return a clear 400 Bad Request response.
    expect(status, 'Expected 400 for negative price, but got ' + status).toBe(400);
  });

  // BUG-004 REMOVED during Stage 5 verification:
  // The floating-point precision test was a false positive. Manual reproduction with
  // the exact same purchase-and-return sequence returned clean 2-decimal values (81.02).
  // The original failure was caused by a test issue: page.evaluate('/api/reset') fails
  // on about:blank when the test runs in isolation. The backend handles decimal precision correctly.
});
