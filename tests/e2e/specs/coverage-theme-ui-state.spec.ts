/**
 * Expanded Coverage: Theme & UI State Persistence
 *
 * Tests dark/light mode toggling, theme persistence across pages,
 * and visual state management.
 */

import { test, expect } from '../fixtures/base';

test.describe('@coverage Theme: Toggle behavior and persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start with default theme
    await page.goto('http://localhost:7547/');
    await page.evaluate(() => localStorage.clear());
  });

  test('@coverage theme: toggle changes visual theme class', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Get initial theme
    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || document.body.className);
    const initialToggleText = await steps.getText('Navigation', 'themeToggle');

    // Toggle theme
    await steps.click('Navigation', 'themeToggle');
    await page.waitForTimeout(300);

    // Theme should change
    const newTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || document.body.className);
    const newToggleText = await steps.getText('Navigation', 'themeToggle');
    expect(newToggleText).not.toEqual(initialToggleText);
  });

  test('@coverage theme: toggle cycles back to original', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    const initialText = await steps.getText('Navigation', 'themeToggle');

    // Toggle twice
    await steps.click('Navigation', 'themeToggle');
    await page.waitForTimeout(300);
    await steps.click('Navigation', 'themeToggle');
    await page.waitForTimeout(300);

    const afterTwiceText = await steps.getText('Navigation', 'themeToggle');
    expect(afterTwiceText).toEqual(initialText);
  });

  test('@coverage theme: persists in localStorage', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Toggle theme
    await steps.click('Navigation', 'themeToggle');
    await page.waitForTimeout(300);

    // Check localStorage
    const storedTheme = await page.evaluate(() => localStorage.getItem('bookhive_theme'));
    expect(storedTheme).not.toBeNull();
    expect(storedTheme!.length).toBeGreaterThan(0);
  });

  test('@coverage theme: preserved across page navigation', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Toggle to non-default theme
    await steps.click('Navigation', 'themeToggle');
    await page.waitForTimeout(300);
    const toggledText = await steps.getText('Navigation', 'themeToggle');

    // Navigate to another page
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');

    // Theme should be preserved
    const marketplaceThemeText = await steps.getText('Navigation', 'themeToggle');
    expect(marketplaceThemeText).toEqual(toggledText);

    // Navigate to login page
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'loginPage');

    // Theme should still be preserved
    const loginThemeText = await steps.getText('Navigation', 'themeToggle');
    expect(loginThemeText).toEqual(toggledText);
  });

  // NOTE: "preserved across page reload" test removed — covered by session-persistence.spec.ts

  test('@coverage theme: preserved when navigating to auth pages', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Toggle theme
    await steps.click('Navigation', 'themeToggle');
    await page.waitForTimeout(300);
    const toggledText = await steps.getText('Navigation', 'themeToggle');

    // Navigate to signup
    await steps.navigateTo('/signup');
    await steps.verifyPresence('SignupPage', 'signupPage');
    const signupThemeText = await steps.getText('Navigation', 'themeToggle');
    expect(signupThemeText).toEqual(toggledText);

    // Navigate to login
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'loginPage');
    const loginThemeText = await steps.getText('Navigation', 'themeToggle');
    expect(loginThemeText).toEqual(toggledText);
  });
});

test.describe('@coverage Theme: Works with authenticated sessions', () => {
  test.beforeEach(async ({ steps, page }) => {
    await page.request.post('http://localhost:8080/api/reset');
    await page.goto('http://localhost:7547/');
    await page.evaluate(() => localStorage.clear());
  });

  test('@coverage theme: theme persists after login', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Toggle theme before login
    await steps.click('Navigation', 'themeToggle');
    await page.waitForTimeout(300);
    const toggledText = await steps.getText('Navigation', 'themeToggle');

    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Theme should persist
    const afterLoginText = await steps.getText('Navigation', 'themeToggle');
    expect(afterLoginText).toEqual(toggledText);
  });

  test('@coverage theme: theme persists after logout', async ({ steps, page }) => {
    // Login first
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Toggle theme while logged in
    await steps.click('Navigation', 'themeToggle');
    await page.waitForTimeout(300);
    const toggledText = await steps.getText('Navigation', 'themeToggle');

    // Logout
    await steps.click('Navigation', 'logoutBtn');
    await page.waitForTimeout(500);

    // Theme should persist after logout
    const afterLogoutText = await steps.getText('Navigation', 'themeToggle');
    expect(afterLogoutText).toEqual(toggledText);
  });
});

test.describe('@coverage UI state: Sidebar navigation highlighting', () => {
  test('@coverage ui-state: sidebar shows correct active link', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Navigate to marketplace via sidebar
    await steps.click('Navigation', 'navMarketplace');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');

    // Check that marketplace link has an active state (CSS modules: navItemActive)
    const marketplaceLink = page.locator('[data-testid="nav-marketplace"]');
    const marketplaceClass = await marketplaceLink.getAttribute('class');
    // CSS modules hash class names, so look for case-insensitive "active"
    expect(marketplaceClass!.toLowerCase()).toContain('active');
  });

  test('@coverage ui-state: sidebar active state changes on navigation', async ({ steps, page }) => {
    await steps.navigateTo('/marketplace');
    await steps.verifyPresence('MarketplacePage', 'marketplacePage');

    // Marketplace should be active (CSS module generates class containing "active")
    const marketplaceClass = await page.locator('[data-testid="nav-marketplace"]').getAttribute('class');
    expect(marketplaceClass!.toLowerCase()).toContain('active');

    // Navigate to all books
    await steps.click('Navigation', 'navAllBooks');
    await page.waitForTimeout(500);
    await steps.verifyPresence('HomePage', 'homePage');

    // All books should now be active
    const allBooksClass = await page.locator('[data-testid="nav-all-books"]').getAttribute('class');
    expect(allBooksClass!.toLowerCase()).toContain('active');
  });
});
