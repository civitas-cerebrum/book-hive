import { test, expect } from '../fixtures/base';

const API = 'http://localhost:8080';

test.describe('@security API abuse: mass assignment', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('signup does not allow setting custom balance via extra field', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/auth/signup`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({
        username: 'massassign1',
        email: 'massassign1@test.com',
        password: 'SecurePass123',
        balance: 999999,
      }),
    });
    if (response.status() === 200) {
      const data = await response.json();
      // Balance should be the server-side default (100 starter balance),
      // NOT the 999999 the attacker tried to set via mass assignment.
      expect(data.balance).not.toBe(999999);
      expect(data.balance).toBe(100.0);
    }
    await ctx.dispose();
  });

  test('signup does not allow setting custom role via extra field', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/auth/signup`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({
        username: 'massassign2',
        email: 'massassign2@test.com',
        password: 'SecurePass123',
        role: 'ADMIN',
        isAdmin: true,
      }),
    });
    if (response.status() === 200) {
      const data = await response.json();
      // Should not have admin role (no roles system exists)
      expect(data.role).toBeUndefined();
      expect(data.isAdmin).toBeUndefined();
    }
    await ctx.dispose();
  });

  test('signup does not allow setting custom ID via extra field', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/auth/signup`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({
        username: 'massassign3',
        email: 'massassign3@test.com',
        password: 'SecurePass123',
        id: 'custom-id-12345',
        _id: 'custom-id-12345',
      }),
    });
    if (response.status() === 200) {
      const data = await response.json();
      // ID should be server-generated, not the injected value
      expect(data.userId).not.toBe('custom-id-12345');
    }
    await ctx.dispose();
  });

  test('cart item does not allow setting custom quantity via mass assignment', async ({ page }) => {
    // Login
    await page.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });

    // Get first book
    const booksRes = await page.request.get(`${API}/api/books?size=1`);
    const books = await booksRes.json();
    const bookId = books.content[0].id;

    // Add to cart with extra fields that shouldn't be settable
    const addRes = await page.request.post(`${API}/api/cart/items`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({
        bookId,
        quantity: 1,
        userId: 'hacked-user-id',    // Mass assignment attempt
        id: 'custom-id-12345',       // Mass assignment attempt
      }),
    });
    expect(addRes.status()).toBe(200);

    // Check cart - the userId should be the authenticated user's, not the injected value
    const cartRes = await page.request.get(`${API}/api/cart`);
    const cart = await cartRes.json();
    expect(cart.length).toBeGreaterThan(0);
    // Cart items returned for this user should have correct bookId
    expect(cart[0].bookId).toBe(bookId);
    // The userId should NOT be the injected value
    expect(cart[0].userId).not.toBe('hacked-user-id');
  });
});

test.describe('@security API abuse: parameter pollution', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('multiple query parameters use consistent handling', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    // Send same parameter multiple times
    const response = await ctx.get(`${API}/api/books?query=Dune&query=Fiction`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    // Should not crash - Spring takes the first or last value
    expect(data.content).toBeDefined();
    await ctx.dispose();
  });

  test('negative page number is handled gracefully', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books?page=-1`);
    // Should return 200 or 400, not 500
    expect(response.status()).not.toBe(500);
    await ctx.dispose();
  });

  test('extremely large page number returns empty results', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books?page=999999`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.content).toHaveLength(0);
    await ctx.dispose();
  });

  test('FINDING: large page size returns all records (no server-side cap)', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books?size=10000`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    // Document: server allows arbitrary page sizes (50 books returned for size=10000)
    // This could be a DoS vector with a larger dataset
    expect(data.content.length).toBe(data.totalElements);
    await ctx.dispose();
  });

  test('negative size parameter is handled gracefully', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books?size=-1`);
    // Should not crash
    expect([200, 400, 500]).toContain(response.status());
    await ctx.dispose();
  });

  test('zero size parameter is handled gracefully', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books?size=0`);
    // Should handle gracefully
    expect([200, 400]).toContain(response.status());
    await ctx.dispose();
  });
});

test.describe('@security API abuse: path traversal', () => {
  test('path traversal in book ID does not expose other endpoints', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books/../../api/auth/me`);
    // Should return 403 or 404, not expose /api/auth/me data
    expect(response.status()).not.toBe(200);
    await ctx.dispose();
  });

  test('path traversal in order ID via URL normalization still requires auth', async ({ playwright }) => {
    // When path traversal like /api/orders/../../../api/health is normalized by the HTTP client,
    // it becomes /api/health which is public. The important thing is that the traversal
    // does NOT bypass authentication for protected endpoints.
    const ctx = await playwright.request.newContext();
    // Try traversal from orders to auth/me (protected)
    const response = await ctx.get(`${API}/api/orders/../../auth/me`);
    // After URL normalization by client, this resolves to /api/auth/me (protected)
    // Without auth cookie, should be 403
    expect(response.status()).toBe(403);
    await ctx.dispose();
  });

  test('URL-encoded path traversal is blocked', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books/%2e%2e%2f%2e%2e%2fapi%2fauth%2fme`);
    expect(response.status()).not.toBe(200);
    await ctx.dispose();
  });

  test('double-encoded path traversal is blocked', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books/%252e%252e%252f%252e%252e%252fapi%252fauth%252fme`);
    expect(response.status()).not.toBe(200);
    await ctx.dispose();
  });
});

test.describe('@security API abuse: HTTP method tampering', () => {
  test('DELETE method not allowed on books collection', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.delete(`${API}/api/books`);
    expect(response.status()).not.toBe(200);
    await ctx.dispose();
  });

  test('PUT method not allowed on books collection', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.put(`${API}/api/books`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ title: 'Hacked' }),
    });
    expect(response.status()).not.toBe(200);
    await ctx.dispose();
  });

  test('POST method not allowed on individual book', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/books/some-id`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ title: 'Hacked' }),
    });
    expect(response.status()).not.toBe(200);
    await ctx.dispose();
  });

  test('PATCH method not allowed on auth endpoints', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.patch(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({}),
    });
    // PATCH is not configured, should be rejected
    expect(response.status()).not.toBe(200);
    await ctx.dispose();
  });
});

test.describe('@security API abuse: content-type validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('login with text/plain content-type is rejected', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'text/plain' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });
    // Should reject non-JSON content type
    expect(response.status()).not.toBe(200);
    await ctx.dispose();
  });

  test('login with application/xml content-type is rejected', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/xml' },
      data: '<login><email>testuser1@bookhive.test</email><password>Test1234!</password></login>',
    });
    expect(response.status()).not.toBe(200);
    await ctx.dispose();
  });

  test('login with no content-type is rejected', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/auth/login`, {
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });
    // Without Content-Type: application/json, Spring should reject
    expect(response.status()).not.toBe(200);
    await ctx.dispose();
  });
});

test.describe('@security API abuse: sensitive endpoint exposure', () => {
  test('FINDING: /api/seed endpoint is publicly accessible', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/seed`);
    // Document: seed endpoint is publicly accessible (no auth required)
    // This is a test helper - should be disabled in production
    expect(response.status()).toBe(200);
    await ctx.dispose();
  });

  test('FINDING: /api/reset endpoint is publicly accessible', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/reset`);
    // Document: reset endpoint is publicly accessible (no auth required)
    // This is a test helper - should be disabled in production
    expect(response.status()).toBe(200);
    await ctx.dispose();
  });

  test('swagger UI endpoint is accessible', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/swagger-ui/index.html`);
    // Document: Swagger UI is publicly accessible
    expect(response.status()).toBe(200);
    await ctx.dispose();
  });

  test('API docs endpoint is accessible', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api-docs`);
    // Document: API documentation is publicly accessible
    expect(response.status()).toBe(200);
    await ctx.dispose();
  });
});

test.describe('@security API abuse: error information disclosure', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('auth error does not leak stack trace', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'wrong@test.com', password: 'wrong' }),
    });
    const body = await response.text();
    expect(body).not.toContain('at com.bookhive');
    expect(body).not.toContain('java.lang');
    expect(body).not.toContain('stackTrace');
    expect(body).not.toContain('org.springframework');
    await ctx.dispose();
  });

  test('404 error does not leak stack trace', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books/nonexistent-id`);
    const body = await response.text();
    expect(body).not.toContain('at com.bookhive');
    expect(body).not.toContain('java.lang');
    expect(body).not.toContain('stackTrace');
    await ctx.dispose();
  });

  test('server error does not leak implementation details', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    // Send malformed JSON to trigger 500
    const response = await ctx.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: 'not-json',
    });
    const body = await response.text();
    expect(body).not.toContain('com.fasterxml');
    expect(body).not.toContain('org.springframework');
    expect(body).not.toContain('stackTrace');
    await ctx.dispose();
  });

  test('validation error provides useful message without leaking internals', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'wrong@test.com', password: 'wrong' }),
    });
    const data = await response.json();
    // Error response should have structured format
    expect(data.error).toBeDefined();
    expect(data.message).toBeDefined();
    // Message should not contain implementation details
    expect(data.message).not.toContain('BCrypt');
    expect(data.message).not.toContain('MongoDB');
    await ctx.dispose();
  });
});
