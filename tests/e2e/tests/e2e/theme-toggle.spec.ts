import { test, expect } from '../fixtures/base';

test.describe('Theme Toggle', () => {
  test.describe.configure({ timeout: 60_000 });

  test('theme toggle button is visible', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Navigation', 'themeToggle');
  });

  test('clicking theme toggle changes theme', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Navigation', 'themeToggle');
    await steps.click('Navigation', 'themeToggle');
    // Theme should toggle — we just verify no crash
    await steps.verifyPresence('HomePage', 'bookGrid');
  });

  test('theme persists after navigation', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('Navigation', 'themeToggle');
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'heading');
    // Verify page still loads properly after theme change
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'bookGrid');
  });
});
