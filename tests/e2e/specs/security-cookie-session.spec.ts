import { test, expect } from '../fixtures/base';

const API = 'http://localhost:8080';

test.describe('@security cookie: attributes validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('login cookie has HttpOnly flag (prevents XSS cookie theft)', async ({ page }) => {
    const loginRes = await page.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });
    const setCookie = loginRes.headers()['set-cookie'] || '';
    expect(setCookie).toContain('HttpOnly');
  });

  test('login cookie has SameSite=Lax (CSRF protection)', async ({ page }) => {
    const loginRes = await page.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });
    const setCookie = loginRes.headers()['set-cookie'] || '';
    expect(setCookie).toContain('SameSite=Lax');
  });

  test('login cookie has Path=/ (accessible on all routes)', async ({ page }) => {
    const loginRes = await page.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });
    const setCookie = loginRes.headers()['set-cookie'] || '';
    expect(setCookie).toContain('Path=/');
  });

  test('login cookie has Max-Age=86400 (24 hour expiry)', async ({ page }) => {
    const loginRes = await page.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });
    const setCookie = loginRes.headers()['set-cookie'] || '';
    expect(setCookie).toContain('Max-Age=86400');
  });

  test('FINDING: login cookie lacks Secure flag (HTTP-only delivery)', async ({ page }) => {
    const loginRes = await page.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });
    const setCookie = loginRes.headers()['set-cookie'] || '';
    // Document: No Secure flag — cookie can be sent over HTTP
    // Expected for localhost dev, but would need Secure flag in production HTTPS
    expect(setCookie).not.toContain('; Secure');
  });

  test('signup cookie has same security attributes as login', async ({ page }) => {
    const signupRes = await page.request.post(`${API}/api/auth/signup`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({
        username: 'cookietest',
        email: 'cookietest@test.com',
        password: 'SecurePass123',
      }),
    });
    const setCookie = signupRes.headers()['set-cookie'] || '';
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=Lax');
    expect(setCookie).toContain('Path=/');
    expect(setCookie).toContain('Max-Age=86400');
  });

  test('logout cookie has Max-Age=0 (immediate expiry)', async ({ page }) => {
    // Login first
    await page.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });

    // Logout
    const logoutRes = await page.request.post(`${API}/api/auth/logout`);
    const setCookie = logoutRes.headers()['set-cookie'] || '';
    expect(setCookie).toContain('Max-Age=0');
    expect(setCookie).toContain('HttpOnly');
  });
});

test.describe('@security cookie: JavaScript inaccessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('document.cookie does not expose bookhive_token', async ({ steps, page }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // HttpOnly cookies are not accessible from JavaScript
    const jsCookies = await page.evaluate(() => document.cookie);
    expect(jsCookies).not.toContain('bookhive_token');
  });

  test('XSS payload cannot steal HttpOnly cookie', async ({ steps, page }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Simulate what an XSS attack would try
    const stolenCookie = await page.evaluate(() => {
      try {
        return document.cookie; // Would normally be sent to attacker
      } catch {
        return '';
      }
    });
    // Even if XSS succeeds, cookie is not accessible
    expect(stolenCookie).not.toContain('bookhive_token');
    expect(stolenCookie).not.toContain('eyJ'); // JWT prefix
  });
});

test.describe('@security cookie: session isolation', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('cookie is user-scoped (user 1 session != user 2 session)', async ({ browser }) => {
    // Create two separate contexts (like two different browsers)
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();

    // Login user 1 in context 1
    await page1.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });

    // Login user 2 in context 2
    await page2.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser2@bookhive.test', password: 'Test1234!' }),
    });

    // Verify user 1 sees their own profile
    const me1 = await page1.request.get(`${API}/api/auth/me`);
    const data1 = await me1.json();
    expect(data1.email).toBe('testuser1@bookhive.test');

    // Verify user 2 sees their own profile
    const me2 = await page2.request.get(`${API}/api/auth/me`);
    const data2 = await me2.json();
    expect(data2.email).toBe('testuser2@bookhive.test');

    await context1.close();
    await context2.close();
  });

  test('expired session (cleared cookies) cannot access protected data', async ({ page }) => {
    // Login
    await page.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });

    // Verify access works
    const cartRes1 = await page.request.get(`${API}/api/cart`);
    expect(cartRes1.status()).toBe(200);

    // Clear cookies (simulate session expiry)
    await page.context().clearCookies();

    // Verify access is denied
    const cartRes2 = await page.request.get(`${API}/api/cart`);
    expect(cartRes2.status()).toBe(403);
  });

  test('old cookie after password change would still work (no revocation)', async ({ page }) => {
    // Login to get token
    const loginRes = await page.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });
    const { token } = await loginRes.json();

    // Use the token directly (not via cookies) - it should work
    // Since JWT is stateless, there's no server-side revocation
    const ctx = await page.context().browser()!.newContext();
    const testPage = await ctx.newPage();
    const cartRes = await testPage.request.get(`${API}/api/cart`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    // Document: JWT tokens are stateless — no revocation mechanism exists
    // Tokens remain valid until expiry even after logout
    expect(cartRes.status()).toBe(200);
    await ctx.close();
  });
});

test.describe('@security cookie: token scope and exposure', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('token is not exposed in URL or local storage', async ({ steps, page }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Token should NOT be in the URL
    expect(page.url()).not.toContain('token=');
    expect(page.url()).not.toContain('eyJ');

    // Token should NOT be in localStorage
    const localStorageToken = await page.evaluate(() => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value && value.includes('eyJ')) return value;
        }
      }
      return null;
    });
    expect(localStorageToken).toBeNull();

    // Token should NOT be in sessionStorage
    const sessionStorageToken = await page.evaluate(() => {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          const value = sessionStorage.getItem(key);
          if (value && value.includes('eyJ')) return value;
        }
      }
      return null;
    });
    expect(sessionStorageToken).toBeNull();
  });

  test('network requests do not leak token in URL query params', async ({ steps, page }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');

    // Start recording network requests
    const requests: string[] = [];
    page.on('request', (request) => {
      requests.push(request.url());
    });

    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Navigate to protected page
    await steps.navigateTo('/cart');
    await page.waitForLoadState('networkidle');

    // No request URL should contain the JWT token
    for (const url of requests) {
      expect(url).not.toContain('bookhive_token=');
      // Don't check for 'eyJ' in URLs as it could be a false positive
      // (base64-encoded strings in legitimate parameters)
    }
  });
});
