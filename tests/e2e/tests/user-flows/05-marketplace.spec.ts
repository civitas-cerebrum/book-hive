import { test, expect } from '../../fixtures/base';

test.describe('Marketplace', () => {
  test.describe.configure({ timeout: 60_000 });

  // Helper to signup a new user (no balance)
  const signupNewUser = async (steps: any) => {
    const timestamp = Date.now();
    const email = `mpuser${timestamp}@example.com`;
    const username = `mpuser${timestamp}`;

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', username);
    await steps.fill('SignupPage', 'emailInput', email);
    await steps.fill('SignupPage', 'passwordInput', 'Password123!');
    await steps.click('SignupPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('HomePage', 'container');
  };

  test('should display marketplace page', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'container');
  });

  test('should display marketplace with listings or empty state', async ({ steps, page }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'container');
    // Either listings or empty message should be visible
    const hasListings = await page.locator('[data-testid^="listing-card-"]').first().isVisible({ timeout: 3000 }).catch(() => false);
    const hasEmptyMessage = await page.locator('[data-testid="no-listings"]').isVisible({ timeout: 3000 }).catch(() => false);
    // One of them must be true
    if (!hasListings && !hasEmptyMessage) {
      // Check for text "No listings available" as fallback
      await page.locator('text=No listings available').waitFor({ state: 'visible', timeout: 5000 });
    }
  });

  test('should navigate to sell page when logged in', async ({ steps }) => {
    await signupNewUser(steps);
    await steps.click('Sidebar', 'sellLink');
    await steps.verifyPresence('CreateListingPage', 'container');
  });

  test('should display create listing form', async ({ steps }) => {
    await signupNewUser(steps);
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'container');
    await steps.verifyPresence('CreateListingPage', 'bookSelect');
    await steps.verifyPresence('CreateListingPage', 'conditionSelect');
    await steps.verifyPresence('CreateListingPage', 'priceInput');
    await steps.verifyPresence('CreateListingPage', 'createButton');
  });

  test('should navigate to profile page', async ({ steps }) => {
    await signupNewUser(steps);
    await steps.click('Sidebar', 'profileLink');
    await steps.verifyPresence('ProfilePage', 'container');
  });

  test('should display profile information', async ({ steps }) => {
    await signupNewUser(steps);
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'container');
    await steps.verifyPresence('ProfilePage', 'username');
    await steps.verifyPresence('ProfilePage', 'email');
    await steps.verifyPresence('ProfilePage', 'balance');
  });
});
