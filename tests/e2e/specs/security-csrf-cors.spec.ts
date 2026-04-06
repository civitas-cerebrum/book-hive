import { test, expect } from '../fixtures/base';

const API = 'http://localhost:8080';

test.describe('@security CORS: origin validation', () => {
  test('valid localhost origin receives CORS headers', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.fetch(`${API}/api/books?size=1`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:7547',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBe('http://localhost:7547');
    expect(headers['access-control-allow-credentials']).toBe('true');
    await ctx.dispose();
  });

  test('evil origin does NOT receive CORS allow headers', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.fetch(`${API}/api/books?size=1`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://evil.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    const headers = response.headers();
    // Should NOT have Access-Control-Allow-Origin for evil.com
    const allowOrigin = headers['access-control-allow-origin'];
    expect(allowOrigin).not.toBe('http://evil.com');
    await ctx.dispose();
  });

  test('wildcard origin is NOT allowed (credentials require specific origin)', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.fetch(`${API}/api/books?size=1`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:7547',
        'Access-Control-Request-Method': 'GET',
      },
    });
    const headers = response.headers();
    // With credentials=true, origin must be specific, not *
    expect(headers['access-control-allow-origin']).not.toBe('*');
    await ctx.dispose();
  });

  test('CORS allows only specified HTTP methods', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.fetch(`${API}/api/books?size=1`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:7547',
        'Access-Control-Request-Method': 'GET',
      },
    });
    const methods = response.headers()['access-control-allow-methods'] || '';
    expect(methods).toContain('GET');
    expect(methods).toContain('POST');
    expect(methods).toContain('PUT');
    expect(methods).toContain('DELETE');
    await ctx.dispose();
  });

  test('CORS allows Content-Type header', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.fetch(`${API}/api/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:7547',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    const allowHeaders = response.headers()['access-control-allow-headers'] || '';
    expect(allowHeaders.toLowerCase()).toContain('content-type');
    await ctx.dispose();
  });

  test('CORS preflight for protected endpoint with Authorization header', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.fetch(`${API}/api/cart`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:7547',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization',
      },
    });
    // Preflight should succeed with proper CORS headers
    expect(response.status()).toBe(200);
    const allowOrigin = response.headers()['access-control-allow-origin'];
    expect(allowOrigin).toBe('http://localhost:7547');
    await ctx.dispose();
  });

  test('CORS credentials flag is true (required for cookie auth)', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.fetch(`${API}/api/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:7547',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    expect(response.headers()['access-control-allow-credentials']).toBe('true');
    await ctx.dispose();
  });
});

test.describe('@security CSRF: stateless JWT protection', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('CSRF protection via SameSite=Lax cookie attribute', async ({ page }) => {
    // Login to get the cookie
    const loginRes = await page.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });
    expect(loginRes.status()).toBe(200);

    // Verify cookie has SameSite=Lax via Set-Cookie header
    const setCookie = loginRes.headers()['set-cookie'] || '';
    expect(setCookie).toContain('SameSite=Lax');
  });

  test('CSRF: state-changing POST requires authentication cookie', async ({ playwright }) => {
    // Without auth cookie, POST to checkout should fail
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/orders`);
    expect(response.status()).toBe(403);
    await ctx.dispose();
  });

  test('CSRF: state-changing DELETE requires authentication cookie', async ({ playwright }) => {
    // Without auth cookie, DELETE on cart should fail
    const ctx = await playwright.request.newContext();
    const response = await ctx.delete(`${API}/api/cart`);
    expect(response.status()).toBe(403);
    await ctx.dispose();
  });

  test('CSRF: no CSRF token required (stateless JWT architecture)', async ({ page }) => {
    // Login via API
    const loginRes = await page.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });
    expect(loginRes.status()).toBe(200);

    // Make state-changing request without CSRF token - should work (stateless JWT)
    const cartRes = await page.request.get(`${API}/api/cart`);
    expect(cartRes.status()).toBe(200);

    // Checkout (POST) should work without CSRF token too
    const booksRes = await page.request.get(`${API}/api/books?size=1`);
    const books = await booksRes.json();
    if (books.content && books.content.length > 0) {
      const addRes = await page.request.post(`${API}/api/cart/items`, {
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({ bookId: books.content[0].id, quantity: 1 }),
      });
      expect(addRes.status()).toBe(200);
    }
  });

  test('CSRF: cookie is HttpOnly (not accessible via document.cookie)', async ({ steps, page }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Try to read cookie via JavaScript
    const cookies = await page.evaluate(() => document.cookie);
    // HttpOnly cookie should NOT be accessible
    expect(cookies).not.toContain('bookhive_token');
  });
});

test.describe('@security CSRF: cross-origin request blocking', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('cross-origin POST to login from evil origin is blocked by CORS', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    // Simulate a cross-origin request by including evil origin
    const response = await ctx.post(`${API}/api/auth/login`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://evil.com',
      },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });
    // The request might still succeed server-side (CORS is browser-enforced),
    // but the response should NOT include the evil origin in CORS headers
    const allowOrigin = response.headers()['access-control-allow-origin'];
    expect(allowOrigin).not.toBe('http://evil.com');
    await ctx.dispose();
  });

  test('cross-origin POST to cart from evil origin does not get CORS headers', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.fetch(`${API}/api/cart/items`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://evil.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    const allowOrigin = response.headers()['access-control-allow-origin'];
    expect(allowOrigin).not.toBe('http://evil.com');
    await ctx.dispose();
  });
});
