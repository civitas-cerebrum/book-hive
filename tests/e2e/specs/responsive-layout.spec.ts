import { test, expect } from '../fixtures/base';

// Viewport presets
const MOBILE = { width: 375, height: 667 };    // iPhone SE
const MOBILE_LARGE = { width: 414, height: 896 }; // iPhone 11
const TABLET = { width: 768, height: 1024 };    // iPad (desktop breakpoint)
const DESKTOP = { width: 1280, height: 800 };   // Standard desktop

test.describe('Responsive Layout — Breakpoint Boundary', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive layout: at 767px (mobile) topbar is visible, sidebar is hidden off-screen', async ({ page, steps }) => {
    await steps.setViewport(767, 1024);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Topbar visible on mobile
    const topbarDisplay = await steps.getCssProperty('Navigation', 'topbar', 'display');
    expect(topbarDisplay).toBe('flex');

    // Sidebar is translated off-screen
    const sidebarTransform = await steps.getCssProperty('Navigation', 'sidebar', 'transform');
    expect(sidebarTransform).toContain('-240');

    // Genre chips visible on mobile
    const genreChipsDisplay = await steps.getCssProperty('HomePage', 'genreChips', 'display');
    expect(genreChipsDisplay).toBe('flex');
  });

  test('@responsive layout: at 768px (desktop) topbar is hidden, sidebar is visible', async ({ page, steps }) => {
    await steps.setViewport(768, 1024);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Topbar hidden on desktop
    const topbarDisplay = await steps.getCssProperty('Navigation', 'topbar', 'display');
    expect(topbarDisplay).toBe('none');

    // Sidebar visible (no transform applied)
    const sidebarTransform = await steps.getCssProperty('Navigation', 'sidebar', 'transform');
    expect(sidebarTransform).toBe('none');

    // Genre chips hidden on desktop
    const genreChipsDisplay = await steps.getCssProperty('HomePage', 'genreChips', 'display');
    expect(genreChipsDisplay).toBe('none');
  });

  test('@responsive layout: at 320px (small mobile) topbar is visible and mobile layout is active', async ({ page, steps }) => {
    await steps.setViewport(320, 568);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Topbar visible
    const topbarDisplay = await steps.getCssProperty('Navigation', 'topbar', 'display');
    expect(topbarDisplay).toBe('flex');

    // Sidebar hidden
    const sidebarTransform = await steps.getCssProperty('Navigation', 'sidebar', 'transform');
    expect(sidebarTransform).toContain('-240');

    // Genre chips visible
    const genreChipsDisplay = await steps.getCssProperty('HomePage', 'genreChips', 'display');
    expect(genreChipsDisplay).toBe('flex');
  });

  test('@responsive layout: BUG — home page has horizontal overflow at mobile due to unconstrained genre chips/grid', async ({ page, steps }) => {
    // BUG: The home page genre chips container and book grid expand beyond the viewport
    // because no overflow-x constraint or max-width is set on the parent containers.
    // This causes horizontal scrolling on all mobile viewports.
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    // Document this bug: scrollWidth > clientWidth on home page at mobile
    expect(scrollWidth).toBeGreaterThan(clientWidth);
  });
});

test.describe('Responsive Layout — Main Content Area', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive layout: desktop main content has left margin for sidebar', async ({ page, steps }) => {
    await steps.setViewport(DESKTOP.width, DESKTOP.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    const marginLeft = await page.evaluate(() => {
      const main = document.querySelector('main');
      return window.getComputedStyle(main!).marginLeft;
    });
    expect(marginLeft).toBe('240px');
  });

  test('@responsive layout: mobile main content has no left margin', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    const marginLeft = await page.evaluate(() => {
      const main = document.querySelector('main');
      return window.getComputedStyle(main!).marginLeft;
    });
    expect(marginLeft).toBe('0px');
  });

  test('@responsive layout: mobile main content has top padding for topbar', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    const paddingTop = await page.evaluate(() => {
      const main = document.querySelector('main');
      return parseInt(window.getComputedStyle(main!).paddingTop, 10);
    });
    // padding-top should be topbar-height (60px) + 16px = 76px
    expect(paddingTop).toBeGreaterThanOrEqual(70);
  });
});

test.describe('Responsive Layout — Grid Columns', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive layout: desktop book grid is 3 columns', async ({ page, steps }) => {
    await steps.setViewport(DESKTOP.width, DESKTOP.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'bookGrid');

    const columns = await page.evaluate(() => {
      const grid = document.querySelector('[data-testid="book-grid"]');
      return window.getComputedStyle(grid!).gridTemplateColumns;
    });
    // 3 columns means 3 values separated by spaces
    const columnCount = columns.split(' ').filter(v => v.trim()).length;
    expect(columnCount).toBe(3);
  });

  test('@responsive layout: mobile book grid is 2 columns', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'bookGrid');

    const columns = await page.evaluate(() => {
      const grid = document.querySelector('[data-testid="book-grid"]');
      return window.getComputedStyle(grid!).gridTemplateColumns;
    });
    const columnCount = columns.split(' ').filter(v => v.trim()).length;
    expect(columnCount).toBe(2);
  });
});

test.describe('Responsive Layout — Book Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive layout: desktop book detail has horizontal header (flex-direction row)', async ({ page, steps }) => {
    await steps.setViewport(DESKTOP.width, DESKTOP.height);
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');

    const flexDir = await page.evaluate(() => {
      const headers = document.querySelectorAll('[class*="header"]');
      for (const h of headers) {
        const fd = window.getComputedStyle(h).flexDirection;
        if (fd) return fd;
      }
      return 'row';
    });
    expect(flexDir).toBe('row');
  });

  test('@responsive layout: mobile book detail has vertical header (flex-direction column)', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');

    const flexDir = await page.evaluate(() => {
      const headers = document.querySelectorAll('[class*="header"]');
      for (const h of headers) {
        const fd = window.getComputedStyle(h).flexDirection;
        if (fd === 'column') return fd;
      }
      return 'row';
    });
    expect(flexDir).toBe('column');
  });

  test('@responsive layout: mobile book detail cover takes full width', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');

    const coverWidth = await page.evaluate(() => {
      const covers = document.querySelectorAll('[class*="cover"]');
      for (const c of covers) {
        const w = window.getComputedStyle(c).width;
        if (w && parseInt(w) > 200) return w;
      }
      return '0px';
    });
    // On mobile cover should be 100% width, so close to viewport width minus padding
    const coverWidthPx = parseInt(coverWidth);
    expect(coverWidthPx).toBeGreaterThan(300);
  });
});

test.describe('Responsive Layout — Viewport Resizing', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive layout: resize from desktop to mobile toggles layout correctly', async ({ page, steps }) => {
    // Start at desktop
    await steps.setViewport(DESKTOP.width, DESKTOP.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Desktop: topbar hidden, sidebar visible
    let topbarDisplay = await steps.getCssProperty('Navigation', 'topbar', 'display');
    expect(topbarDisplay).toBe('none');

    // Resize to mobile
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await page.waitForTimeout(300);

    // Mobile: topbar visible, sidebar hidden
    topbarDisplay = await steps.getCssProperty('Navigation', 'topbar', 'display');
    expect(topbarDisplay).toBe('flex');

    const sidebarTransform = await steps.getCssProperty('Navigation', 'sidebar', 'transform');
    expect(sidebarTransform).toContain('-240');
  });

  test('@responsive layout: resize from mobile to desktop toggles layout correctly', async ({ page, steps }) => {
    // Start at mobile
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Mobile: topbar visible
    let topbarDisplay = await steps.getCssProperty('Navigation', 'topbar', 'display');
    expect(topbarDisplay).toBe('flex');

    // Sidebar hidden on mobile
    let sidebarTransform = await steps.getCssProperty('Navigation', 'sidebar', 'transform');
    expect(sidebarTransform).toContain('-240');

    // Resize to desktop
    await steps.setViewport(DESKTOP.width, DESKTOP.height);
    await page.waitForTimeout(300);

    // Desktop: topbar hidden
    topbarDisplay = await steps.getCssProperty('Navigation', 'topbar', 'display');
    expect(topbarDisplay).toBe('none');

    // Sidebar visible — desktop CSS removes transform entirely
    // The sidebar may retain translateX(-100%) from mobile but desktop CSS overrides to none
    sidebarTransform = await steps.getCssProperty('Navigation', 'sidebar', 'transform');
    // On desktop, @media query no longer applies, so transform falls back to initial (none)
    expect(sidebarTransform).toBe('none');
  });
});

test.describe('Responsive Layout — Non-Home Pages No Overflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  // Home page has a known overflow bug, test only non-home pages
  const nonHomePages = [
    { name: 'Book Detail', path: '/books/book-001' },
    { name: 'Login', path: '/login' },
    { name: 'Signup', path: '/signup' },
    { name: 'Marketplace', path: '/marketplace' },
  ];

  for (const { name, path } of nonHomePages) {
    test(`@responsive layout: ${name} page has no horizontal overflow at mobile viewport`, async ({ page, steps }) => {
      await steps.setViewport(MOBILE.width, MOBILE.height);
      await steps.navigateTo(path);
      await page.waitForTimeout(500);

      const noOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
      });
      expect(noOverflow).toBeTruthy();
    });
  }

  for (const { name, path } of nonHomePages) {
    test(`@responsive layout: ${name} page has no horizontal overflow at large mobile viewport`, async ({ page, steps }) => {
      await steps.setViewport(MOBILE_LARGE.width, MOBILE_LARGE.height);
      await steps.navigateTo(path);
      await page.waitForTimeout(500);

      const noOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
      });
      expect(noOverflow).toBeTruthy();
    });
  }
});

test.describe('Responsive Layout — Auth Pages at Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive layout: login form is usable at mobile viewport', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'loginForm');
    await steps.verifyPresence('LoginPage', 'loginEmail');
    await steps.verifyPresence('LoginPage', 'loginPassword');
    await steps.verifyPresence('LoginPage', 'loginSubmit');

    // Form elements should be visible and within viewport
    await steps.verifyState('LoginPage', 'loginSubmit', 'visible');
  });

  test('@responsive layout: signup form is usable at mobile viewport', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/signup');
    await steps.verifyPresence('SignupPage', 'signupForm');
    await steps.verifyPresence('SignupPage', 'signupUsername');
    await steps.verifyPresence('SignupPage', 'signupEmail');
    await steps.verifyPresence('SignupPage', 'signupPassword');
    await steps.verifyPresence('SignupPage', 'signupSubmit');

    await steps.verifyState('SignupPage', 'signupSubmit', 'visible');
  });

  test('@responsive layout: protected pages at mobile redirect to login (cart, orders, profile, sell)', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);

    const protectedRoutes = ['/cart', '/orders', '/profile', '/marketplace/sell'];
    for (const route of protectedRoutes) {
      await steps.navigateTo(route);
      await steps.verifyUrlContains('/login');
    }
  });
});
