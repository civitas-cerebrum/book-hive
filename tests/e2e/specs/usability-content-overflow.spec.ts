/**
 * Usability Tests — Content Overflow
 *
 * Verifies that 500+ character inputs, long single words, special characters,
 * and emoji do not break layout (no horizontal scroll, no overlap, proper
 * wrapping/truncation).
 *
 * Text inputs tested:
 *   Search bar (/)
 *   Login email & password (/login)
 *   Signup username, email & password (/signup)
 *   Sell listing price (/marketplace/sell)
 *
 * Display areas tested:
 *   Book titles, author names (via route interception)
 *   Search results with long query in URL
 */

import { test, expect } from '../fixtures/base';

const API = 'http://localhost:8080';

async function login(steps: any, email = 'testuser1@bookhive.test') {
  await steps.navigateTo('/login');
  await steps.fill('LoginPage', 'loginEmail', email);
  await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
  await steps.click('LoginPage', 'loginSubmit');
  await steps.verifyPresence('HomePage', 'homePage');
}

async function verifyNoHorizontalOverflow(page: any) {
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
}

/* ─── Content Overflow ─────────────────────────────────────── */

test.describe('@usability content-overflow: Text input fields', () => {

  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/reset`);
  });

  /* ── Search Bar ─────────────────────────────────────────── */

  test('@usability content-overflow: 500+ character search input does not break layout', async ({ steps, page }) => {
    await test.step('Navigate to home page', async () => {
      await steps.navigateTo('/');
      await steps.verifyPresence('HomePage', 'homePage');
    });

    await test.step('Enter 500+ characters in search input', async () => {
      const longString = 'a'.repeat(600);
      await steps.fill('HomePage', 'searchInput', longString);
    });

    await test.step('Submit search', async () => {
      await steps.pressKey('Enter');
      await page.waitForTimeout(1000);
    });

    await test.step('Verify layout intact — no horizontal overflow', async () => {
      await steps.verifyPresence('HomePage', 'homePage');
      await verifyNoHorizontalOverflow(page);
    });

    await test.step('Verify search input is contained within bounds', async () => {
      const box = await page.locator('[data-testid="search-input"]').boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.width).toBeLessThan(2000);
    });
  });

  test('@usability content-overflow: Long single word in search does not cause horizontal scroll', async ({ steps, page }) => {
    await test.step('Navigate to home page', async () => {
      await steps.navigateTo('/');
    });

    await test.step('Enter a very long single word (no spaces)', async () => {
      const longWord = 'supercalifragilisticexpialidocious'.repeat(20);
      await steps.fill('HomePage', 'searchInput', longWord);
      await steps.pressKey('Enter');
      await page.waitForTimeout(1000);
    });

    await test.step('Verify no horizontal overflow', async () => {
      await verifyNoHorizontalOverflow(page);
    });
  });

  test('@usability content-overflow: Special characters and emoji in search input render safely', async ({ steps, page }) => {
    await test.step('Navigate to home page', async () => {
      await steps.navigateTo('/');
    });

    await test.step('Enter special characters and emoji', async () => {
      const specialChars = '<script>alert("xss")</script> 🔥🚀💯 "quotes" & ampersand <html> {{template}} ${{env.SECRET}}';
      await steps.fill('HomePage', 'searchInput', specialChars);
      await steps.pressKey('Enter');
      await page.waitForTimeout(1000);
    });

    await test.step('Verify page did not crash and layout intact', async () => {
      await steps.verifyPresence('HomePage', 'homePage');
      await verifyNoHorizontalOverflow(page);
    });

    await test.step('Verify no injected scripts executed', async () => {
      // If XSS executed, page would likely navigate or show alert — we check URL is still correct
      expect(page.url()).toContain('localhost:7547');
    });
  });

  /* ── Login Fields ───────────────────────────────────────── */

  test('@usability content-overflow: 500+ characters in login email field', async ({ steps, page }) => {
    await test.step('Navigate to login page', async () => {
      await steps.navigateTo('/login');
    });

    await test.step('Fill email with 500+ characters', async () => {
      const longEmail = 'a'.repeat(500) + '@example.com';
      await steps.fill('LoginPage', 'loginEmail', longEmail);
    });

    await test.step('Verify input field is contained', async () => {
      const box = await page.locator('[data-testid="login-email"]').boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeLessThan(2000);
    });

    await test.step('Verify no horizontal overflow', async () => {
      await verifyNoHorizontalOverflow(page);
    });
  });

  test('@usability content-overflow: 2000+ characters in login password field', async ({ steps, page }) => {
    await test.step('Navigate to login page', async () => {
      await steps.navigateTo('/login');
    });

    await test.step('Fill password with 2000 characters', async () => {
      await steps.fill('LoginPage', 'loginPassword', 'P'.repeat(2000));
    });

    await test.step('Verify input field is contained', async () => {
      const box = await page.locator('[data-testid="login-password"]').boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeLessThan(2000);
    });

    await test.step('Verify no horizontal overflow', async () => {
      await verifyNoHorizontalOverflow(page);
    });
  });

  /* ── Signup Fields ──────────────────────────────────────── */

  test('@usability content-overflow: 500+ characters in signup username field', async ({ steps, page }) => {
    await test.step('Navigate to signup page', async () => {
      await steps.navigateTo('/signup');
    });

    await test.step('Fill username with 500+ characters', async () => {
      await steps.fill('SignupPage', 'signupUsername', 'u'.repeat(500));
    });

    await test.step('Verify input field is contained', async () => {
      const box = await page.locator('[data-testid="signup-username"]').boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeLessThan(2000);
    });

    await test.step('Verify no horizontal overflow', async () => {
      await verifyNoHorizontalOverflow(page);
    });
  });

  test('@usability content-overflow: 500+ characters in signup email field', async ({ steps, page }) => {
    await test.step('Navigate to signup page', async () => {
      await steps.navigateTo('/signup');
    });

    await test.step('Fill email with 500+ characters', async () => {
      await steps.fill('SignupPage', 'signupEmail', 'e'.repeat(500) + '@test.com');
    });

    await test.step('Verify input field is contained', async () => {
      const box = await page.locator('[data-testid="signup-email"]').boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeLessThan(2000);
    });

    await test.step('Verify no horizontal overflow', async () => {
      await verifyNoHorizontalOverflow(page);
    });
  });

  test('@usability content-overflow: Emoji sequence in signup username field', async ({ steps, page }) => {
    await test.step('Navigate to signup page', async () => {
      await steps.navigateTo('/signup');
    });

    await test.step('Fill username with emoji sequence', async () => {
      await steps.fill('SignupPage', 'signupUsername', '🔥🚀💯🎉🌈✨🦄👾🎮🏆'.repeat(20));
    });

    await test.step('Verify input field is contained', async () => {
      const box = await page.locator('[data-testid="signup-username"]').boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeLessThan(2000);
    });

    await test.step('Verify no horizontal overflow', async () => {
      await verifyNoHorizontalOverflow(page);
    });
  });

  /* ── Sell Listing Price ─────────────────────────────────── */

  test('@usability content-overflow: Extreme price value in listing form', async ({ steps, page }) => {
    await test.step('Log in', async () => {
      await login(steps);
    });

    await test.step('Navigate to sell page', async () => {
      await steps.navigateTo('/marketplace/sell');
      await steps.verifyPresence('CreateListingPage', 'createListingPage');
    });

    await test.step('Enter extreme price value', async () => {
      await steps.fill('CreateListingPage', 'listingPrice', '999999999999');
    });

    await test.step('Verify input field is contained', async () => {
      const box = await page.locator('[data-testid="listing-price"]').boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeLessThan(2000);
    });

    await test.step('Verify no horizontal overflow', async () => {
      await verifyNoHorizontalOverflow(page);
    });
  });
});

test.describe('@usability content-overflow: Display areas with long content', () => {

  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/reset`);
  });

  test('@usability content-overflow: Book card with very long title renders within bounds', async ({ steps, page }) => {
    const longTitle = 'The Extremely Long Book Title That Goes On And On '.repeat(10);
    const longAuthor = 'Superlongauthorname'.repeat(15);

    await test.step('Intercept books API with long title and author', async () => {
      await page.route('**/api/books**', route => {
        if (route.request().url().includes('/api/books?') || route.request().url().endsWith('/api/books')) {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              content: [{
                id: 'long-title-book',
                title: longTitle,
                author: longAuthor,
                genre: 'Fiction',
                price: 12.99,
                stock: 10,
                description: 'A book with a very long title.',
              }],
              totalPages: 1,
            }),
          });
        }
        return route.continue();
      });
    });

    await test.step('Navigate to home page', async () => {
      await steps.navigateTo('/');
      await page.waitForTimeout(1000);
    });

    await test.step('Verify page renders without horizontal overflow', async () => {
      await steps.verifyPresence('HomePage', 'homePage');
      await verifyNoHorizontalOverflow(page);
    });

    await test.step('Verify book card is within viewport', async () => {
      const bookCard = page.locator('[data-testid^="book-card-"]').first();
      if (await bookCard.isVisible()) {
        const box = await bookCard.boundingBox();
        expect(box).not.toBeNull();
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        expect(box!.width).toBeLessThanOrEqual(viewportWidth);
      }
    });
  });

  test('@usability content-overflow: Book detail page with very long description renders within bounds', async ({ steps, page }) => {
    const longDescription = 'This is a very long description. '.repeat(100);

    await test.step('Intercept book detail API with long description', async () => {
      await page.route('**/api/books/book-001', route =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'book-001',
            title: 'Test Book',
            author: 'Test Author',
            genre: 'Fiction',
            price: 12.99,
            stock: 10,
            description: longDescription,
          }),
        }),
      );
    });

    await test.step('Navigate to book detail page', async () => {
      await steps.navigateTo('/books/book-001');
      await page.waitForTimeout(1000);
    });

    await test.step('Verify page renders without horizontal overflow', async () => {
      await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
      await verifyNoHorizontalOverflow(page);
    });
  });

  test('@usability content-overflow: Long search query in URL does not break layout', async ({ steps, page }) => {
    await test.step('Navigate with long query parameter', async () => {
      const longQuery = 'x'.repeat(500);
      await steps.navigateTo(`/?query=${longQuery}`);
      await page.waitForTimeout(1000);
    });

    await test.step('Verify page renders without horizontal overflow', async () => {
      await steps.verifyPresence('HomePage', 'homePage');
      await verifyNoHorizontalOverflow(page);
    });
  });

  test('@usability content-overflow: Line breaks in search input do not break layout', async ({ steps, page }) => {
    await test.step('Navigate to home page', async () => {
      await steps.navigateTo('/');
    });

    await test.step('Enter text with line break characters', async () => {
      // Search input is a single-line textbox, line breaks should be ignored or handled
      await page.locator('[data-testid="search-input"]').fill('line1\nline2\nline3');
      await steps.pressKey('Enter');
      await page.waitForTimeout(1000);
    });

    await test.step('Verify page renders without overflow', async () => {
      await steps.verifyPresence('HomePage', 'homePage');
      await verifyNoHorizontalOverflow(page);
    });
  });
});
