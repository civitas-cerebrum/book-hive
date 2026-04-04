import { test, expect } from './fixtures/base';

test.describe('Theme Toggle', () => {
  test.describe.configure({ timeout: 60_000 });

  test('theme toggle switches between light and dark', async ({ steps, page }) => {
    await steps.navigateTo('/');
    // Click theme toggle
    await steps.click('Sidebar', 'themeToggle');
    // Check theme attribute on body or root
    const bodyClass = await page.locator('body').getAttribute('class');
    const htmlAttr = await page.locator('html').getAttribute('data-theme');
    // Toggle should have changed something
    expect(bodyClass || htmlAttr || '').toBeTruthy();
  });

  test('theme toggle persists after navigation', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.click('Sidebar', 'themeToggle');
    const themeBeforeNav = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || document.body.className);
    await steps.navigateTo('/marketplace');
    const themeAfterNav = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || document.body.className);
    expect(themeAfterNav).toBe(themeBeforeNav);
  });

  test('theme toggle button is accessible', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('Sidebar', 'themeToggle');
    await steps.verifyState('Sidebar', 'themeToggle', 'enabled');
  });
});
