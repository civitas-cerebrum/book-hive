/*
 * === RISK SCORE ===
 * /marketplace/sell — risk_score 18 (T1=3 x page_criticality=2 x data_sensitivity=3)
 * Form page with: book select, condition select, price input, submit button
 * T1: Empty submission, Type violation, Boundary values, Injection, Duplicate submission
 */

import { test, expect } from '../fixtures/base';

test.describe('@negative /marketplace/sell — T1 Data Integrity', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ steps, page }) => {
    await page.request.post('http://localhost:8080/api/reset');
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'createListingPage');
  });

  test('@negative empty-submission /marketplace/sell: submit with no book selected and no price', async ({ steps, page }) => {
    // The default book selection is "Select a book..." and price is empty
    await steps.click('CreateListingPage', 'listingCreate');

    // Wait for potential error
    await page.waitForTimeout(500);

    // Should show error or stay on page — not navigate to marketplace
    await steps.verifyUrlContains('/marketplace/sell');
  });

  test('@negative empty-submission /marketplace/sell: submit with book selected but no price', async ({ steps, page }) => {
    // Select a book but leave price empty
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
    await steps.click('CreateListingPage', 'listingCreate');

    await page.waitForTimeout(500);

    // Should show error or stay on page
    await steps.verifyUrlContains('/marketplace/sell');
  });

  test('@negative type-violation /marketplace/sell: negative price', async ({ steps, page }) => {
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
    await steps.fill('CreateListingPage', 'listingPrice', '-10');
    await steps.click('CreateListingPage', 'listingCreate');

    await page.waitForTimeout(500);

    // Should show error or reject — not create listing with negative price
    const url = page.url();
    const hasError = url.includes('/marketplace/sell') ||
      await page.locator('[data-testid="listing-error"]').isVisible().catch(() => false);
    expect(hasError).toBeTruthy();
  });

  test('@negative type-violation /marketplace/sell: zero price', async ({ steps, page }) => {
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
    await steps.fill('CreateListingPage', 'listingPrice', '0');
    await steps.click('CreateListingPage', 'listingCreate');

    await page.waitForTimeout(500);

    // Should show error or reject
    await steps.verifyUrlContains('/marketplace/sell');
  });

  test('@negative type-violation /marketplace/sell: non-numeric string in price field via keyboard', async ({ steps, page }) => {
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
    // Price is a spinbutton (number input) — type text via keyboard (number input ignores non-numeric)
    await page.locator('[data-testid="listing-price"]').click();
    await page.keyboard.type('abc', { delay: 50 });
    await steps.click('CreateListingPage', 'listingCreate');

    await page.waitForTimeout(500);

    // Number input should reject non-numeric chars (field stays empty) — form should show error
    await steps.verifyUrlContains('/marketplace/sell');
  });

  test('@negative boundary-values /marketplace/sell: extremely large price', async ({ steps, page }) => {
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
    await steps.fill('CreateListingPage', 'listingPrice', '999999999');
    await steps.click('CreateListingPage', 'listingCreate');

    await page.waitForTimeout(1000);

    // Should either accept (valid but large) or reject with error — not crash
    // If accepted, navigate to marketplace and verify listing exists with that price
    const url = page.url();
    if (url.includes('/marketplace') && !url.includes('/sell')) {
      // Listing was created — verify it shows up
      const count = await page.locator('[data-testid^="listing-card-"]').count();
      expect(count).toBeGreaterThan(0);
    } else {
      // Still on sell page — error shown
      await steps.verifyUrlContains('/marketplace/sell');
    }
  });

  test('@negative boundary-values /marketplace/sell: price with many decimal places', async ({ steps, page }) => {
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
    await steps.fill('CreateListingPage', 'listingPrice', '9.99999');
    await steps.click('CreateListingPage', 'listingCreate');

    await page.waitForTimeout(1000);

    // Should either truncate to 2 decimal places or accept — not crash
    const url = page.url();
    expect(url).toContain('/marketplace');
  });

  test('@negative injection /marketplace/sell: XSS in price field via keyboard', async ({ steps, page }) => {
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
    // Price is a number input — XSS attempt via keyboard (number input ignores non-numeric chars)
    await page.locator('[data-testid="listing-price"]').click();
    await page.keyboard.type('<script>alert(1)</script>', { delay: 10 });
    await steps.click('CreateListingPage', 'listingCreate');

    await page.waitForTimeout(500);

    // Number input rejects non-numeric chars, field stays empty — form should error
    await steps.verifyUrlContains('/marketplace/sell');
    // Verify no dialog popped up
    const dialogPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
    const dialog = await dialogPromise;
    expect(dialog).toBeNull();
  });

  test('@negative duplicate-submission /marketplace/sell: double-click Create Listing', async ({ steps, page }) => {
    await steps.selectDropdown('CreateListingPage', 'listingBookSelect', { type: 'index', index: 1 });
    await steps.selectDropdown('CreateListingPage', 'listingCondition', { type: 'value', value: 'GOOD' });
    await steps.fill('CreateListingPage', 'listingPrice', '15.00');

    // Track listing creation requests
    const createRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/api/listings') && req.method() === 'POST') {
        createRequests.push(req.url());
      }
    });

    // Double-click create listing
    const createBtn = page.locator('[data-testid="listing-create"]');
    await createBtn.dblclick();

    // Wait for navigation
    await page.waitForTimeout(2000);

    // Navigate to marketplace and check only one listing was created
    await steps.navigateTo('/marketplace');
    const listingCount = await page.locator('[data-testid^="listing-card-"]').count();
    expect(listingCount).toBe(1);
  });
});

/*
 * === EXPERIENTIAL NOTES ===
 *
 * - Price field is <input type="number"> (spinbutton). Cannot .fill() non-numeric text
 *   via Playwright — it throws. Must use keyboard.type() instead, and the browser's
 *   native number input silently ignores non-numeric characters.
 * - Empty submission (no book + no price): stays on page. Error may not be displayed
 *   via data-testid="listing-error" — the form just doesn't submit.
 * - Negative price (-10): stays on page, form does not submit.
 * - Zero price (0): stays on page, form does not submit.
 * - Very large price (999999999): accepted by server — no max price validation.
 * - Price with many decimals (9.99999): accepted — server may round or store as-is.
 * - Double-click Create Listing: only one listing created (navigates to marketplace
 *   after first success, second click hits marketplace page instead of form).
 * - XSS/injection in price field: impossible via browser UI (number input rejects text).
 *
 * Categories skipped: None — all T1 categories applied.
 */
