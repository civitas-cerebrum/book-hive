import { test, expect } from '../fixtures/base';

const API = 'http://localhost:8080';

test.describe('@security JWT: token validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('valid JWT token grants access to protected endpoint', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    // Login to get token
    const loginRes = await ctx.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });
    const { token } = await loginRes.json();

    // Use token in Authorization header
    const cartRes = await ctx.get(`${API}/api/cart`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    expect(cartRes.status()).toBe(200);
    await ctx.dispose();
  });

  test('tampered JWT token is rejected (modified payload)', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const loginRes = await ctx.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });
    const { token } = await loginRes.json();

    // Tamper with the token (modify one character in payload)
    const parts = token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    payload.email = 'hacker@evil.com';
    parts[1] = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const tamperedToken = parts.join('.');

    const cartRes = await ctx.get(`${API}/api/cart`, {
      headers: { 'Authorization': `Bearer ${tamperedToken}` },
    });
    expect(cartRes.status()).toBe(403);
    await ctx.dispose();
  });

  test('JWT token with modified signature is rejected', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const loginRes = await ctx.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });
    const { token } = await loginRes.json();

    // Modify the signature
    const tamperedToken = token.slice(0, -5) + 'XXXXX';

    const cartRes = await ctx.get(`${API}/api/cart`, {
      headers: { 'Authorization': `Bearer ${tamperedToken}` },
    });
    expect(cartRes.status()).toBe(403);
    await ctx.dispose();
  });

  test('JWT with "none" algorithm is rejected', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();

    // Craft a JWT with alg:none
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      sub: '69d2f249147a637c4bce2162',
      email: 'testuser1@bookhive.test',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    })).toString('base64url');
    const noneToken = `${header}.${payload}.`;

    const cartRes = await ctx.get(`${API}/api/cart`, {
      headers: { 'Authorization': `Bearer ${noneToken}` },
    });
    expect(cartRes.status()).toBe(403);
    await ctx.dispose();
  });

  test('JWT with empty string is rejected', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const cartRes = await ctx.get(`${API}/api/cart`, {
      headers: { 'Authorization': 'Bearer ' },
    });
    expect(cartRes.status()).toBe(403);
    await ctx.dispose();
  });

  test('JWT with random garbage string is rejected', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const cartRes = await ctx.get(`${API}/api/cart`, {
      headers: { 'Authorization': 'Bearer not-a-real-jwt-token' },
    });
    expect(cartRes.status()).toBe(403);
    await ctx.dispose();
  });

  test('Authorization header with wrong scheme is rejected', async ({ playwright }) => {
    // First get a valid token
    const loginCtx = await playwright.request.newContext();
    const loginRes = await loginCtx.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });
    const { token } = await loginRes.json();
    await loginCtx.dispose();

    // Use a fresh context (no cookies) with "Basic" scheme instead of "Bearer"
    const freshCtx = await playwright.request.newContext();
    const cartRes = await freshCtx.get(`${API}/api/cart`, {
      headers: { 'Authorization': `Basic ${token}` },
    });
    expect(cartRes.status()).toBe(403);
    await freshCtx.dispose();
  });
});

test.describe('@security JWT: cookie-based authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('login sets bookhive_token cookie with correct attributes', async ({ page }) => {
    const loginRes = await page.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });
    expect(loginRes.status()).toBe(200);

    const setCookie = loginRes.headers()['set-cookie'] || '';
    expect(setCookie).toContain('bookhive_token=');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('Path=/');
    expect(setCookie).toContain('Max-Age=86400');
    expect(setCookie).toContain('SameSite=Lax');
  });

  test('logout clears bookhive_token cookie', async ({ page }) => {
    // Login first
    await page.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });

    // Logout
    const logoutRes = await page.request.post(`${API}/api/auth/logout`);
    expect(logoutRes.status()).toBe(200);
    const setCookie = logoutRes.headers()['set-cookie'] || '';
    expect(setCookie).toContain('bookhive_token=');
    expect(setCookie).toContain('Max-Age=0');
  });

  test('cookie auth works for subsequent requests after login', async ({ page }) => {
    // Login (sets cookie in browser context)
    await page.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });

    // Subsequent request should use cookie automatically
    const cartRes = await page.request.get(`${API}/api/cart`);
    expect(cartRes.status()).toBe(200);
  });

  test('after logout, cookie-based auth fails', async ({ page }) => {
    // Login
    await page.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });

    // Logout
    await page.request.post(`${API}/api/auth/logout`);

    // Clear cookies from browser context (logout sets Max-Age=0)
    await page.context().clearCookies();

    // Subsequent request should fail
    const cartRes = await page.request.get(`${API}/api/cart`);
    expect(cartRes.status()).toBe(403);
  });
});

test.describe('@security JWT: token in response body', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('login response includes JWT token in body', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });
    const data = await response.json();
    expect(data.token).toBeTruthy();
    expect(data.token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    await ctx.dispose();
  });

  test('signup response includes JWT token in body', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/auth/signup`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({
        username: 'newuser',
        email: 'newuser@test.com',
        password: 'SecurePass123',
      }),
    });
    const data = await response.json();
    expect(data.token).toBeTruthy();
    expect(data.token.split('.')).toHaveLength(3);
    await ctx.dispose();
  });

  test('/auth/me does NOT expose token', async ({ page }) => {
    await page.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });

    const meRes = await page.request.get(`${API}/api/auth/me`);
    const data = await meRes.json();
    // Token should be null in /me response
    expect(data.token).toBeNull();
    // Should include user info but not sensitive data
    expect(data.email).toBe('testuser1@bookhive.test');
    expect(data.username).toBe('testuser1');
    // Should NOT expose password
    expect(data.password).toBeUndefined();
  });

  test('login response does NOT expose password hash', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });
    const text = await response.text();
    expect(text).not.toContain('$2a$'); // BCrypt hash prefix
    expect(text).not.toContain('password');
    await ctx.dispose();
  });
});

test.describe('@security JWT: session lifecycle via UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('after clearing cookies, protected pages redirect to login', async ({ steps, page }) => {
    // Login
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Clear cookies (simulates session expiration)
    await page.context().clearCookies();

    // Try to access protected page
    await steps.navigateTo('/cart');
    await steps.verifyUrlContains('/login');
  });

  test('different users get different tokens with different data', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();

    // Login as user 1
    const login1 = await ctx.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });
    const data1 = await login1.json();

    // Login as user 2
    const login2 = await ctx.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser2@bookhive.test', password: 'Test1234!' }),
    });
    const data2 = await login2.json();

    // Tokens should be different
    expect(data1.token).not.toBe(data2.token);
    // User IDs should be different
    expect(data1.userId).not.toBe(data2.userId);
    await ctx.dispose();
  });
});
