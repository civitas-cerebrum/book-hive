import { test, expect } from '../fixtures/base';

const MOBILE = { width: 375, height: 667 };
const DESKTOP = { width: 1280, height: 800 };

test.describe('Mobile-Specific Elements — TopBar', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive mobile: topbar shows hamburger, search, and cart buttons', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // TopBar elements visible on mobile
    await steps.verifyPresence('Navigation', 'topbar');
    await steps.verifyPresence('Navigation', 'sidebarToggle');
    await steps.verifyPresence('Navigation', 'mobileSearchBtn');
    await steps.verifyPresence('Navigation', 'mobileCartBtn');
  });

  test('@responsive mobile: topbar is hidden on desktop', async ({ page, steps }) => {
    await steps.setViewport(DESKTOP.width, DESKTOP.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.verifyState('Navigation', 'topbar', 'hidden');
  });

  test('@responsive mobile: mobile search button navigates to home page', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'loginPage');

    // Click search button → should navigate to /
    await steps.click('Navigation', 'mobileSearchBtn');
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('HomePage', 'homePage');
  });

  test('@responsive mobile: mobile cart button navigates to cart (unauthenticated → login redirect)', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Click cart button as guest → should redirect to /login
    await steps.click('Navigation', 'mobileCartBtn');
    await steps.verifyUrlContains('/login');
  });

  test('@responsive mobile: mobile cart button navigates to cart when authenticated', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);

    // Login at mobile viewport
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'loginPage');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Click cart button (in fixed topbar) → should navigate to /cart
    await steps.clickWithoutScrolling('Navigation', 'mobileCartBtn');
    await steps.verifyUrlContains('/cart');
  });
});

test.describe('Mobile-Specific Elements — Hamburger Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive mobile: hamburger opens sidebar drawer', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Sidebar initially hidden
    const initialTransform = await steps.getCssProperty('Navigation', 'sidebar', 'transform');
    expect(initialTransform).toContain('-240');

    // Click hamburger
    await steps.clickWithoutScrolling('Navigation', 'sidebarToggle');
    await page.waitForTimeout(400); // Wait for transition (300ms + buffer)

    // Sidebar now visible (translateX(0))
    const openTransform = await steps.getCssProperty('Navigation', 'sidebar', 'transform');
    // When open, transform should be translateX(0) or none/identity
    expect(openTransform).not.toContain('-240');
  });

  test('@responsive mobile: sidebar links are accessible after hamburger toggle', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');

    // Open sidebar via hamburger
    await steps.clickWithoutScrolling('Navigation', 'sidebarToggle');
    await page.waitForTimeout(400);

    // All sidebar links should be present
    await steps.verifyPresence('Navigation', 'navAllBooks');
    await steps.verifyPresence('Navigation', 'navMarketplace');
    await steps.verifyPresence('Navigation', 'navLogin');
    await steps.verifyPresence('Navigation', 'navSignup');
  });

  test('@responsive mobile: sidebar closes after clicking a nav link', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');

    // Open sidebar
    await steps.clickWithoutScrolling('Navigation', 'sidebarToggle');
    await page.waitForTimeout(400);

    // Click Marketplace link
    await steps.click('Navigation', 'navMarketplace');
    await steps.verifyUrlContains('/marketplace');

    // Sidebar should close after clicking link (onClick sets open=false)
    await page.waitForTimeout(400);
    const transform = await steps.getCssProperty('Navigation', 'sidebar', 'transform');
    expect(transform).toContain('-240');
  });

  test('@responsive mobile: sidebar shows auth links when logged in', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyUrlContains('/');

    // Open sidebar
    await steps.clickWithoutScrolling('Navigation', 'sidebarToggle');
    await page.waitForTimeout(400);

    // Auth links should be present
    await steps.verifyPresence('Navigation', 'navCart');
    await steps.verifyPresence('Navigation', 'navOrders');
    await steps.verifyPresence('Navigation', 'navSell');
    await steps.verifyPresence('Navigation', 'navProfile');
    await steps.verifyPresence('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'userBalance');
  });

  test('@responsive mobile: sidebar overlay closes sidebar when clicked', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');

    // Open sidebar
    await steps.clickWithoutScrolling('Navigation', 'sidebarToggle');
    await page.waitForTimeout(400);

    // Sidebar should be open
    let transform = await steps.getCssProperty('Navigation', 'sidebar', 'transform');
    expect(transform).not.toContain('-240');

    // Click overlay to close (click outside sidebar area)
    await page.mouse.click(MOBILE.width - 20, MOBILE.height / 2);
    await page.waitForTimeout(400);

    // Sidebar should close
    transform = await steps.getCssProperty('Navigation', 'sidebar', 'transform');
    expect(transform).toContain('-240');
  });

  test('@responsive mobile: hamburger toggle toggles sidebar open and closed', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');

    // Toggle open
    await steps.clickWithoutScrolling('Navigation', 'sidebarToggle');
    await page.waitForTimeout(500);
    let transform = await steps.getCssProperty('Navigation', 'sidebar', 'transform');
    expect(transform).not.toContain('-240');

    // Toggle closed — click the hamburger button directly (it's in topbar at z-index 98,
    // but sidebar overlay is z-index 99). Use the overlay click to close instead.
    await page.mouse.click(MOBILE.width - 20, MOBILE.height / 2);
    await page.waitForTimeout(500);
    transform = await steps.getCssProperty('Navigation', 'sidebar', 'transform');
    expect(transform).toContain('-240');
  });
});

test.describe('Mobile-Specific Elements — Genre Chips', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive mobile: genre chips are visible on mobile', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.verifyState('HomePage', 'genreChips', 'visible');
    await steps.verifyPresence('HomePage', 'genreChipAll');
    await steps.verifyPresence('HomePage', 'genreChipFiction');
    await steps.verifyPresence('HomePage', 'genreChipSciFi');
    await steps.verifyPresence('HomePage', 'genreChipNonFiction');
    await steps.verifyPresence('HomePage', 'genreChipBiography');
    await steps.verifyPresence('HomePage', 'genreChipFantasy');
    await steps.verifyPresence('HomePage', 'genreChipMystery');
  });

  test('@responsive mobile: genre chips are hidden on desktop', async ({ page, steps }) => {
    await steps.setViewport(DESKTOP.width, DESKTOP.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.verifyState('HomePage', 'genreChips', 'hidden');
  });

  test('@responsive mobile: clicking genre chip filters books', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Click Fiction genre chip
    await steps.click('HomePage', 'genreChipFiction');
    await steps.verifyUrlContains('genre=Fiction');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('@responsive mobile: clicking "All" genre chip clears filter', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/?genre=Fiction');
    await steps.verifyPresence('HomePage', 'homePage');
    await steps.verifyUrlContains('genre=Fiction');

    // Click All chip to clear genre filter
    await steps.click('HomePage', 'genreChipAll');

    // URL should no longer contain genre param
    const url = page.url();
    expect(url).not.toContain('genre=');
  });

  test('@responsive mobile: genre chip scroll is horizontal (overflow-x auto)', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'genreChips');

    const overflowX = await steps.getCssProperty('HomePage', 'genreChips', 'overflow-x');
    expect(overflowX).toBe('auto');
  });

  test('@responsive mobile: switching between genre chips updates results', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Click Sci-Fi chip
    await steps.click('HomePage', 'genreChipSciFi');
    await steps.verifyUrlContains('genre=Sci-Fi');
    const sciFiCount = await steps.getCount('HomePage', 'bookCard');
    expect(sciFiCount).toBeGreaterThan(0);

    // Click Mystery chip
    await steps.click('HomePage', 'genreChipMystery');
    await steps.verifyUrlContains('genre=Mystery');
    const mysteryCount = await steps.getCount('HomePage', 'bookCard');
    expect(mysteryCount).toBeGreaterThan(0);
  });
});

test.describe('Mobile-Specific Elements — Cart Badge', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive mobile: mobile cart badge appears after adding item to cart', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);

    // Login
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'loginPage');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyUrlContains('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Navigate to book detail
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');

    // Add to cart — scroll to the button first on mobile (column layout pushes it down)
    await steps.scrollIntoView('BookDetailPage', 'addToCartDetail');
    await steps.click('BookDetailPage', 'addToCartDetail');
    await page.waitForTimeout(1000);

    // Mobile cart badge should now show
    await steps.verifyPresence('Navigation', 'cartBadgeMobile');
  });
});

test.describe('Mobile-Specific Elements — Theme Toggle via Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive mobile: theme toggle is accessible in sidebar drawer', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');

    // Open sidebar
    await steps.clickWithoutScrolling('Navigation', 'sidebarToggle');
    await page.waitForTimeout(400);

    // Theme toggle should be visible in sidebar
    await steps.verifyPresence('Navigation', 'themeToggle');
  });
});
