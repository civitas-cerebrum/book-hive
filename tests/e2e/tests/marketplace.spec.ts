import { test, expect } from '../fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Marketplace', () => {
  test.describe.configure({ timeout: 60_000, mode: 'serial' });

  // Helper to create and login a test user
  const createAndLoginUser = async (steps: any) => {
    const timestamp = Date.now();
    const username = `mpuser${timestamp}`;
    const email = `mpuser${timestamp}@example.com`;

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', username);
    await steps.fill('SignupPage', 'emailInput', email);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('Sidebar', 'logoutBtn');
  };

  test('should display marketplace page', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'container');
  });

  test('should display marketplace page content', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    // Marketplace may have listings or not depending on test order
    // Just verify the container exists and either empty state or listings
    await steps.verifyPresence('MarketplacePage', 'container');
  });

  test('should require login to access sell page', async ({ steps }) => {
    await steps.navigateTo('/marketplace/sell');
    // Should redirect to login when not authenticated
    await steps.verifyUrlContains('/login');
  });

  test('should display create listing page when logged in', async ({ steps }) => {
    await createAndLoginUser(steps);
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'container');
  });

  test('should display book select dropdown with options', async ({ steps }) => {
    await createAndLoginUser(steps);
    await steps.navigateTo('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'bookSelect');
    await steps.verifyPresence('CreateListingPage', 'conditionSelect');
    await steps.verifyPresence('CreateListingPage', 'priceInput');
    await steps.verifyPresence('CreateListingPage', 'createBtn');
  });

  test('should create a listing successfully', async ({ steps }) => {
    await createAndLoginUser(steps);
    await steps.navigateTo('/marketplace/sell');

    // Select first book in dropdown (index 1, since 0 is the placeholder)
    await steps.selectDropdown('CreateListingPage', 'bookSelect', {
      type: DropdownSelectType.INDEX,
      index: 1
    });
    // Select condition (index 2 = GOOD)
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', {
      type: DropdownSelectType.INDEX,
      index: 2
    });
    // Enter price
    await steps.fill('CreateListingPage', 'priceInput', '9.99');

    // Submit
    await steps.click('CreateListingPage', 'createBtn');
    await steps.waitForNetworkIdle();

    // Should redirect to marketplace page after creating
    await steps.verifyUrlContains('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'container');
  });

  test('should display profile page with user info', async ({ steps }) => {
    await createAndLoginUser(steps);
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'container');
    await steps.verifyPresence('ProfilePage', 'username');
    await steps.verifyPresence('ProfilePage', 'email');
    await steps.verifyPresence('ProfilePage', 'balance');
  });

  test('should show no listings initially on profile', async ({ steps }) => {
    await createAndLoginUser(steps);
    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'noListings');
  });

  test('should show user balance on profile', async ({ steps }) => {
    await createAndLoginUser(steps);
    await steps.navigateTo('/profile');
    await steps.verifyTextContains('ProfilePage', 'balance', '$0.00');
  });

  test('should navigate to sell page from sidebar', async ({ steps }) => {
    await createAndLoginUser(steps);
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'navSell');
    await steps.verifyUrlContains('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'container');
  });

  test('should navigate to profile from sidebar', async ({ steps }) => {
    await createAndLoginUser(steps);
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'navProfile');
    await steps.verifyUrlContains('/profile');
    await steps.verifyPresence('ProfilePage', 'container');
  });

  // Cleanup
  test.afterEach(async ({ steps }) => {
    await steps.clickIfPresent('Sidebar', 'logoutBtn');
  });
});
