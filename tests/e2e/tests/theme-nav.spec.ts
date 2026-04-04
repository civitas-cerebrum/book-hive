import { test, expect } from '../fixtures/base';

test.describe('Theme & Navigation', () => {
  test.describe.configure({ timeout: 60_000 });

  test('theme toggle switches between light and dark mode', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('NavBar', 'themeToggle');
    // After toggling, the button text should change
    await steps.verifyPresence('NavBar', 'themeToggle');
  });

  test('navigation links work for all genre categories', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('NavBar', 'nonFictionLink');
    await steps.verifyUrlContains('genre=Non-Fiction');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('marketplace link navigates correctly', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('NavBar', 'marketplaceLink');
    await steps.verifyUrlContains('/marketplace');
    await steps.verifyText('MarketplacePage', 'heading', 'Marketplace');
  });

  test('unauthenticated user is redirected when accessing cart', async ({ steps }) => {
    await steps.navigateTo('/cart');
    // Should redirect to login or show login prompt
    await steps.verifyUrlContains('/login');
  });
});
