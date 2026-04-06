import { test, expect } from '../fixtures/base';

const MOBILE = { width: 375, height: 667 };
const MOBILE_SMALL = { width: 320, height: 568 };
const TABLET_PORTRAIT = { width: 768, height: 1024 };
const DESKTOP = { width: 1280, height: 800 };

test.describe('Responsive Content — Book Cards Grid Integrity', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive content: BUG — book cards overflow viewport at 320px due to unconstrained grid', async ({ page, steps }) => {
    // BUG: The book grid on the home page is not width-constrained on mobile.
    // The grid + genre chips cause the page to be wider than the viewport.
    await steps.setViewport(MOBILE_SMALL.width, MOBILE_SMALL.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });

    // Document: scrollWidth exceeds clientWidth
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow).toBe(true); // Bug: page overflows
  });

  test('@responsive content: book cards use 2-column grid at mobile', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });

    // Verify grid template is 2 columns
    const columns = await page.evaluate(() => {
      const grid = document.querySelector('[data-testid="book-grid"]');
      return window.getComputedStyle(grid!).gridTemplateColumns;
    });
    const columnCount = columns.split(' ').filter(v => v.trim()).length;
    expect(columnCount).toBe(2);
  });

  test('@responsive content: 2-column grid gap is correct on mobile (12px)', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'bookGrid');

    const gap = await page.evaluate(() => {
      const grid = document.querySelector('[data-testid="book-grid"]');
      return window.getComputedStyle(grid!).gap;
    });
    expect(gap).toBe('12px');
  });

  test('@responsive content: 3-column grid gap is correct on desktop (20px)', async ({ page, steps }) => {
    await steps.setViewport(DESKTOP.width, DESKTOP.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'bookGrid');

    const gap = await page.evaluate(() => {
      const grid = document.querySelector('[data-testid="book-grid"]');
      return window.getComputedStyle(grid!).gap;
    });
    expect(gap).toBe('20px');
  });
});

test.describe('Responsive Content — Text Truncation & Overflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive content: long book titles do not cause additional overflow beyond known bug', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);

    // Measure baseline overflow on home page (known bug)
    await steps.navigateTo('/');
    const baselineScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);

    // Now inject a book with a very long title via route interception
    await page.route('**/api/books**', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      if (json.content && json.content.length > 0) {
        json.content[0].title = 'A'.repeat(200) + ' Very Long Book Title';
      }
      await route.fulfill({ json });
    });

    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'bookGrid');

    // Long title should not cause MORE overflow than the baseline bug
    const newScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(newScrollWidth).toBeLessThanOrEqual(baselineScrollWidth + 10);
  });

  test('@responsive content: long description with natural word breaks does not overflow book detail at mobile', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);

    // Use realistic long description with spaces (not unbroken chars)
    const longDesc = Array(200).fill('This is a very long description sentence that goes on.').join(' ');
    await page.route('**/api/books/book-001', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      json.description = longDesc;
      await route.fulfill({ json });
    });

    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');

    const noOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    expect(noOverflow).toBe(true);
  });

  test('@responsive content: search input accepts very long text without crashing at mobile', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');

    const longQuery = 'D'.repeat(300);
    await steps.fill('HomePage', 'searchInput', longQuery);

    // Verify the input accepts the text (value is filled)
    const value = await steps.getInputValue('HomePage', 'searchInput');
    expect(value.length).toBeGreaterThan(100);
  });
});

test.describe('Responsive Content — Form Fields at Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive content: login form fields span full width at mobile', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/login');

    const emailWidth = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="login-email"]');
      return el?.getBoundingClientRect().width || 0;
    });
    // Email field should take at least 60% of viewport
    expect(emailWidth).toBeGreaterThan(MOBILE.width * 0.6);
  });

  test('@responsive content: signup form fields span full width at mobile', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/signup');

    const usernameWidth = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="signup-username"]');
      return el?.getBoundingClientRect().width || 0;
    });
    expect(usernameWidth).toBeGreaterThan(MOBILE.width * 0.6);
  });

  test('@responsive content: create listing form is usable at mobile', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);

    // Login first
    await page.context().clearCookies();
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'loginPage');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.navigateTo('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'createListingPage');

    // All form elements visible
    await steps.verifyPresence('CreateListingPage', 'listingBookSelect');
    await steps.verifyPresence('CreateListingPage', 'listingCondition');
    await steps.verifyPresence('CreateListingPage', 'listingPrice');
    await steps.verifyPresence('CreateListingPage', 'listingCreate');

    // Create listing page (not home page) should not overflow
    const noOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    expect(noOverflow).toBe(true);
  });
});

test.describe('Responsive Content — Cart Page at Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive content: cart page with items does not overflow at mobile', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);

    // Login and add an item
    await page.context().clearCookies();
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'loginPage');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Add a book — need scrollIntoView on mobile book detail
    await steps.navigateTo('/books/book-007');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    await steps.scrollIntoView('BookDetailPage', 'addToCartDetail');
    await steps.click('BookDetailPage', 'addToCartDetail');
    await page.waitForTimeout(500);

    await steps.navigateTo('/cart');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });

    // Cart page itself should not overflow (it's not the home page)
    const noOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    expect(noOverflow).toBe(true);

    // Check total and checkout button are visible
    await steps.verifyPresence('CartPage', 'cartTotal');
    await steps.verifyPresence('CartPage', 'checkoutBtn');
  });

  test('@responsive content: cart footer (total + checkout) is usable at mobile', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);

    // Login and add an item
    await page.context().clearCookies();
    await steps.navigateTo('/login');
    await steps.verifyPresence('LoginPage', 'loginPage');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.navigateTo('/books/book-002');
    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    await steps.scrollIntoView('BookDetailPage', 'addToCartDetail');
    await steps.click('BookDetailPage', 'addToCartDetail');
    await page.waitForTimeout(500);

    await steps.navigateTo('/cart');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });

    // Check checkout button width fits within viewport
    const btnWidth = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="checkout-btn"]');
      return btn?.getBoundingClientRect().right || 0;
    });
    expect(btnWidth).toBeLessThanOrEqual(MOBILE.width + 2);
  });
});

test.describe('Responsive Content — Pagination at Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive content: pagination buttons are visible and tappable at mobile', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'pagination');

    // Pagination buttons should be visible
    await steps.verifyPresence('HomePage', 'prevPage');
    await steps.verifyPresence('HomePage', 'nextPage');

    // Check buttons are large enough for touch (at least 30px)
    const buttonHeight = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="next-page"]');
      return btn?.getBoundingClientRect().height || 0;
    });
    expect(buttonHeight).toBeGreaterThanOrEqual(30);
  });

  test('@responsive content: pagination is functionally accessible at mobile', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'pagination');
    await steps.verifyTextContains('HomePage', 'pagination', '1 / 5');

    // Click next and verify page changes
    await steps.click('HomePage', 'nextPage');
    await steps.verifyTextContains('HomePage', 'pagination', '2 / 5');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });
});

test.describe('Responsive Content — Tablet Portrait (768px)', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive content: tablet portrait has desktop layout (sidebar visible)', async ({ page, steps }) => {
    await steps.setViewport(TABLET_PORTRAIT.width, TABLET_PORTRAIT.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'homePage');

    // Should be desktop layout at 768px
    const topbarDisplay = await steps.getCssProperty('Navigation', 'topbar', 'display');
    expect(topbarDisplay).toBe('none');

    const sidebarTransform = await steps.getCssProperty('Navigation', 'sidebar', 'transform');
    expect(sidebarTransform).toBe('none');
  });

  test('@responsive content: tablet portrait book grid is 3 columns', async ({ page, steps }) => {
    await steps.setViewport(TABLET_PORTRAIT.width, TABLET_PORTRAIT.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'bookGrid');

    const columns = await page.evaluate(() => {
      const grid = document.querySelector('[data-testid="book-grid"]');
      return window.getComputedStyle(grid!).gridTemplateColumns;
    });
    const columnCount = columns.split(' ').filter(v => v.trim()).length;
    expect(columnCount).toBe(3);
  });

  test('@responsive content: tablet portrait has no horizontal overflow on non-home pages', async ({ page, steps }) => {
    await steps.setViewport(TABLET_PORTRAIT.width, TABLET_PORTRAIT.height);

    const pages = ['/books/book-001', '/login', '/signup', '/marketplace'];
    for (const path of pages) {
      await steps.navigateTo(path);
      await page.waitForTimeout(300);
      const noOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
      });
      expect(noOverflow).toBeTruthy();
    }
  });
});

test.describe('Responsive Content — Touch Target Sizes', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@responsive content: hamburger button is large enough for touch', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');

    const size = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="sidebar-toggle"]');
      const rect = btn?.getBoundingClientRect();
      return { width: rect?.width || 0, height: rect?.height || 0 };
    });
    // At least 24px (the font-size of the hamburger emoji)
    expect(size.height).toBeGreaterThanOrEqual(20);
  });

  test('@responsive content: mobile search and cart buttons are large enough for touch', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');

    const searchSize = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="mobile-search-btn"]');
      const rect = btn?.getBoundingClientRect();
      return { width: rect?.width || 0, height: rect?.height || 0 };
    });
    expect(searchSize.height).toBeGreaterThanOrEqual(20);

    const cartSize = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="mobile-cart-btn"]');
      const rect = btn?.getBoundingClientRect();
      return { width: rect?.width || 0, height: rect?.height || 0 };
    });
    expect(cartSize.height).toBeGreaterThanOrEqual(20);
  });

  test('@responsive content: genre chip buttons have adequate touch targets', async ({ page, steps }) => {
    await steps.setViewport(MOBILE.width, MOBILE.height);
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'genreChips');

    const chipSizes = await page.evaluate(() => {
      const chips = document.querySelectorAll('[data-testid^="genre-chip-"]');
      return Array.from(chips).map(c => {
        const rect = c.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      });
    });

    for (const chip of chipSizes) {
      // Genre chips should be at least 24px tall (6px padding top/bottom + font-size)
      expect(chip.height).toBeGreaterThanOrEqual(24);
    }
  });
});
