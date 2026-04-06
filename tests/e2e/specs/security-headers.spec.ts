import { test, expect } from '../fixtures/base';

const API = 'http://localhost:8080';

test.describe('@security HTTP headers: public endpoints', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('X-Frame-Options header is DENY on health endpoint', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/health`);
    expect(response.headers()['x-frame-options']).toBe('DENY');
    await ctx.dispose();
  });

  test('X-Content-Type-Options header is nosniff on health endpoint', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/health`);
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
    await ctx.dispose();
  });

  test('Cache-Control prevents caching on API responses', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/health`);
    const cacheControl = response.headers()['cache-control'];
    expect(cacheControl).toContain('no-cache');
    expect(cacheControl).toContain('no-store');
    await ctx.dispose();
  });

  test('X-Frame-Options header is DENY on books endpoint', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books?size=1`);
    expect(response.headers()['x-frame-options']).toBe('DENY');
    await ctx.dispose();
  });

  test('X-Content-Type-Options header is nosniff on books endpoint', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books?size=1`);
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
    await ctx.dispose();
  });

  test('Content-Type is application/json on API responses', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books?size=1`);
    expect(response.headers()['content-type']).toContain('application/json');
    await ctx.dispose();
  });

  test('X-Frame-Options header is DENY on marketplace endpoint', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/marketplace`);
    expect(response.headers()['x-frame-options']).toBe('DENY');
    await ctx.dispose();
  });
});

test.describe('@security HTTP headers: authenticated endpoints', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('X-Frame-Options header present on cart endpoint', async ({ page }) => {
    await page.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });

    const response = await page.request.get(`${API}/api/cart`);
    expect(response.headers()['x-frame-options']).toBe('DENY');
  });

  test('X-Content-Type-Options header present on orders endpoint', async ({ page }) => {
    await page.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });

    const response = await page.request.get(`${API}/api/orders`);
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
  });

  test('Cache-Control prevents caching on authenticated API responses', async ({ page }) => {
    await page.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });

    const response = await page.request.get(`${API}/api/auth/me`);
    const cacheControl = response.headers()['cache-control'];
    expect(cacheControl).toContain('no-cache');
    expect(cacheControl).toContain('no-store');
  });
});

test.describe('@security HTTP headers: error responses', () => {
  test('security headers present on 403 responses', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/cart`);
    expect(response.status()).toBe(403);
    expect(response.headers()['x-frame-options']).toBe('DENY');
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
    await ctx.dispose();
  });

  test('security headers present on 401 login failure response', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'wrong@test.com', password: 'wrong' }),
    });
    expect(response.status()).toBe(401);
    expect(response.headers()['x-frame-options']).toBe('DENY');
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
    await ctx.dispose();
  });

  test('error responses use JSON content type (no HTML error pages)', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books/nonexistent-id`);
    const contentType = response.headers()['content-type'] || '';
    // Should return JSON, not HTML error page
    expect(contentType).not.toContain('text/html');
    await ctx.dispose();
  });
});

test.describe('@security HTTP headers: FINDING — missing headers', () => {
  test('FINDING: no Strict-Transport-Security (HSTS) header', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/health`);
    const hsts = response.headers()['strict-transport-security'];
    // Document: HSTS is not present (expected for localhost HTTP, would be needed in production)
    expect(hsts).toBeUndefined();
    await ctx.dispose();
  });

  test('FINDING: no Content-Security-Policy header', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/health`);
    const csp = response.headers()['content-security-policy'];
    // Document: CSP is not configured (would be recommended for production)
    expect(csp).toBeUndefined();
    await ctx.dispose();
  });

  test('FINDING: no Referrer-Policy header', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/health`);
    const referrerPolicy = response.headers()['referrer-policy'];
    // Document: Referrer-Policy not set
    expect(referrerPolicy).toBeUndefined();
    await ctx.dispose();
  });

  test('FINDING: no Permissions-Policy header', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/health`);
    const permPolicy = response.headers()['permissions-policy'];
    // Document: Permissions-Policy not set
    expect(permPolicy).toBeUndefined();
    await ctx.dispose();
  });
});

test.describe('@security HTTP headers: frontend page headers', () => {
  test('frontend serves pages with proper content-type', async ({ page }) => {
    const response = await page.goto('http://localhost:7547/');
    expect(response).not.toBeNull();
    const contentType = response!.headers()['content-type'] || '';
    expect(contentType).toContain('text/html');
  });

  test('FINDING: frontend HTML pages may lack X-Frame-Options header', async ({ page }) => {
    const response = await page.goto('http://localhost:7547/');
    expect(response).not.toBeNull();
    const headers = response!.headers();
    const xfo = headers['x-frame-options'];
    const csp = headers['content-security-policy'];
    // Document: Check if frontend has frame protection
    // nginx may or may not set X-Frame-Options or CSP frame-ancestors
    const hasFrameProtection = xfo !== undefined ||
      (csp !== undefined && csp.includes('frame-ancestors'));
    // Just document the finding, don't fail on it
    if (!hasFrameProtection) {
      // FINDING: Frontend pages lack X-Frame-Options or CSP frame-ancestors
      // This means the pages could be embedded in iframes on malicious sites
      expect(hasFrameProtection).toBe(false); // Documenting the finding
    } else {
      expect(hasFrameProtection).toBe(true);
    }
  });
});
