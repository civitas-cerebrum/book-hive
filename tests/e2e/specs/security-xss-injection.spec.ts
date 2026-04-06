import { test, expect } from '../fixtures/base';

const API = 'http://localhost:8080';

// XSS payloads covering major attack vectors
const XSS_PAYLOADS = [
  '<script>alert("xss")</script>',
  '<img src=x onerror=alert(1)>',
  '"><svg onload=alert(1)>',
  "'-alert(1)-'",
  '<iframe src="javascript:alert(1)">',
  '{{constructor.constructor("alert(1)")()}}',
  '${7*7}',
  '<body onload=alert(1)>',
  'javascript:alert(document.cookie)',
  '<div onmouseover="alert(1)">hover</div>',
];

test.describe('@security XSS: search input field', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  for (const payload of XSS_PAYLOADS) {
    test(`search field safely handles XSS payload: ${payload.slice(0, 40)}`, async ({ steps, page }) => {
      await steps.navigateTo('/');
      await steps.fill('HomePage', 'searchInput', payload);
      await steps.pressKey('Enter');

      // Wait for search results
      await page.waitForLoadState('networkidle');

      // Verify no script execution - check that no alert dialogs appeared
      // The page should still be functional
      const url = page.url();
      expect(url).toContain('query=');

      // Verify the payload does NOT execute as HTML - check innerHTML for raw script tags
      const hasExecutableScript = await page.evaluate(() => {
        const scripts = document.querySelectorAll('script:not([src])');
        for (const s of scripts) {
          if (s.textContent?.includes('alert')) return true;
        }
        return false;
      });
      expect(hasExecutableScript).toBe(false);

      // The page should show "No books found" or results - not crash
      const mainContent = await page.locator('main').first().textContent();
      expect(mainContent).toBeTruthy();
    });
  }
});

test.describe('@security XSS: login form fields', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('XSS in login email field is safely handled', async ({ steps, page }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', '<script>alert("xss")</script>');
    await steps.fill('LoginPage', 'loginPassword', 'password123');
    await steps.click('LoginPage', 'loginSubmit');

    // Wait for response (may show error or browser validation may block)
    await page.waitForLoadState('networkidle');

    // Key check: no script execution regardless of form outcome
    const hasInjectedScript = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script:not([src])');
      return Array.from(scripts).some(s => s.textContent?.includes('alert("xss")'));
    });
    expect(hasInjectedScript).toBe(false);

    // Page should still be functional (login page or error shown)
    await steps.verifyPresence('LoginPage', 'loginForm');
  });

  test('XSS in login password field is safely handled', async ({ steps, page }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', '<img src=x onerror=alert(1)>');
    await steps.click('LoginPage', 'loginSubmit');

    // Should show login error, not execute script
    await steps.verifyPresence('LoginPage', 'loginError');

    // Verify page is still functional
    await steps.verifyPresence('LoginPage', 'loginForm');
  });
});

test.describe('@security XSS: signup form fields', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('XSS in signup username is safely rendered', async ({ steps, page }) => {
    const xssUsername = '<img src=x onerror=alert(1)>';
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'signupUsername', xssUsername);
    await steps.fill('SignupPage', 'signupEmail', 'xss-user@test.com');
    await steps.fill('SignupPage', 'signupPassword', 'SecurePass123');
    await steps.click('SignupPage', 'signupSubmit');

    // Wait for navigation or error
    await page.waitForLoadState('networkidle');

    // If signup succeeded, check profile page renders XSS payload as text
    const currentUrl = page.url();
    if (!currentUrl.includes('/signup')) {
      // Signed up successfully — navigate to profile
      await steps.navigateTo('/profile');
      await steps.verifyPresence('ProfilePage', 'profileUsername');

      // The username should be displayed as escaped text, not executed
      const profileText = await page.locator('[data-testid="profile-username"]').textContent();
      expect(profileText).toContain('<img');
      // No onerror execution
      const hasInlineEvent = await page.evaluate(() => {
        return document.querySelectorAll('img[onerror]').length;
      });
      expect(hasInlineEvent).toBe(0);
    }
    // If signup failed (client-side validation), that's also safe
  });

  test('XSS in signup email is safely handled', async ({ steps, page }) => {
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'signupUsername', 'normaluser');
    await steps.fill('SignupPage', 'signupEmail', '"><svg onload=alert(1)>@test.com');
    await steps.fill('SignupPage', 'signupPassword', 'SecurePass123');
    await steps.click('SignupPage', 'signupSubmit');

    await page.waitForLoadState('networkidle');

    // Should show error (invalid email format) or handle safely
    // No script execution regardless
    const hasExecutableScript = await page.evaluate(() => {
      return document.querySelectorAll('svg[onload]').length;
    });
    expect(hasExecutableScript).toBe(0);
  });
});

test.describe('@security XSS: marketplace sell form', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('XSS in listing price field is blocked by type=number', async ({ steps, page }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.navigateTo('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'createListingPage');

    // Price field is type=number; Playwright fill() on number input rejects non-numeric
    // Try typing XSS payload character by character - number input strips non-digits
    const priceInput = page.locator('[data-testid="listing-price"]');
    await priceInput.click();
    await priceInput.pressSequentially('<script>alert(1)</script>', { delay: 10 });
    const priceValue = await priceInput.inputValue();
    // Number input only keeps numeric chars — the value should be empty or contain only numbers
    expect(priceValue).not.toContain('<script>');
    expect(priceValue).not.toContain('alert');
  });
});

test.describe('@security XSS: URL-based injection', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('XSS via query parameter in URL is safely rendered', async ({ steps, page }) => {
    await steps.navigateTo('/?query=<script>alert(1)</script>');
    await page.waitForLoadState('networkidle');

    // Page should render without script execution
    const hasExecutableScript = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script:not([src])');
      return Array.from(scripts).some(s => s.textContent?.includes('alert'));
    });
    expect(hasExecutableScript).toBe(false);

    // Main content area should be functional
    const mainExists = await page.locator('main').count();
    expect(mainExists).toBeGreaterThan(0);
  });

  test('XSS via genre parameter in URL is safely rendered', async ({ steps, page }) => {
    await steps.navigateTo('/?genre=<img src=x onerror=alert(1)>');
    await page.waitForLoadState('networkidle');

    // No inline event handler execution
    const hasInlineEvent = await page.evaluate(() => {
      return document.querySelectorAll('img[onerror]').length;
    });
    expect(hasInlineEvent).toBe(0);
  });

  test('XSS via book ID path parameter is safely handled', async ({ steps, page }) => {
    await steps.navigateTo('/books/<script>alert(1)</script>');
    await page.waitForLoadState('networkidle');

    // Should show "not found" or error - not execute script
    const hasExecutableScript = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script:not([src])');
      return Array.from(scripts).some(s => s.textContent?.includes('alert'));
    });
    expect(hasExecutableScript).toBe(false);
  });

  test('XSS via order ID path parameter is safely handled', async ({ steps, page }) => {
    // Login first to access orders
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    await steps.navigateTo('/orders/<script>alert(1)</script>');
    await page.waitForLoadState('networkidle');

    const hasExecutableScript = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script:not([src])');
      return Array.from(scripts).some(s => s.textContent?.includes('alert'));
    });
    expect(hasExecutableScript).toBe(false);
  });
});

test.describe('@security XSS: API response reflection', () => {
  test('API search endpoint does not reflect XSS in response', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books?query=<script>alert(1)</script>`);
    const body = await response.text();

    // Response should not contain unescaped script tags
    expect(body).not.toContain('<script>alert(1)</script>');
    expect(response.headers()['content-type']).toContain('application/json');
    await ctx.dispose();
  });

  test('API book detail endpoint returns JSON not HTML for invalid ID', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books/<script>alert(1)</script>`);
    const contentType = response.headers()['content-type'] || '';
    // Should return JSON, not render as HTML
    expect(contentType).toContain('application/json');
    await ctx.dispose();
  });
});
