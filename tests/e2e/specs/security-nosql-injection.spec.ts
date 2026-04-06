import { test, expect } from '../fixtures/base';

const API = 'http://localhost:8080';

test.describe('@security NoSQL injection: search/filter endpoints', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('$ne operator in search query does not bypass filter', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books`, {
      params: { query: '{$ne:null}' },
    });
    const data = await response.json();
    // Should return 0 results (treated as literal string), not all books
    expect(data.totalElements).toBe(0);
    await ctx.dispose();
  });

  test('$gt operator in search query does not bypass filter', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books`, {
      params: { query: '{$gt:""}' },
    });
    const data = await response.json();
    expect(data.totalElements).toBe(0);
    await ctx.dispose();
  });

  test('$regex operator in search query is treated as literal text', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books`, {
      params: { query: '{$regex:".*"}' },
    });
    const data = await response.json();
    expect(data.totalElements).toBe(0);
    await ctx.dispose();
  });

  test('$or operator in search query does not enable injection', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books`, {
      params: { query: '{"$or":[{"title":{"$ne":""}}]}' },
    });
    const data = await response.json();
    expect(data.totalElements).toBe(0);
    await ctx.dispose();
  });

  test('$ne operator in genre filter does not return all books', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books`, {
      params: { genre: '{$ne:null}' },
    });
    const data = await response.json();
    // Should return 0 results (exact genre match, not operator execution)
    expect(data.totalElements).toBe(0);
    await ctx.dispose();
  });

  test('$exists operator in genre filter does not bypass filter', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books`, {
      params: { genre: '{$exists:true}' },
    });
    const data = await response.json();
    expect(data.totalElements).toBe(0);
    await ctx.dispose();
  });

  test('dot notation field access in search does not expose internal fields', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get(`${API}/api/books`, {
      params: { query: 'password' },
    });
    const data = await response.json();
    // Should search title/author only, never expose password fields
    const content = JSON.stringify(data.content);
    expect(content).not.toContain('password');
    expect(content).not.toContain('$2a$'); // BCrypt hash prefix
    await ctx.dispose();
  });
});

test.describe('@security NoSQL injection: login endpoint', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('$ne operator in email field does not bypass authentication', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: { '$ne': '' }, password: 'anything' }),
    });
    // Should fail (400 or 500) - NOT return 200 with valid token
    expect(response.status()).not.toBe(200);
    const body = await response.text();
    expect(body).not.toContain('"token"');
    await ctx.dispose();
  });

  test('$gt operator in password field does not bypass authentication', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: { '$gt': '' } }),
    });
    expect(response.status()).not.toBe(200);
    const body = await response.text();
    expect(body).not.toContain('"token"');
    await ctx.dispose();
  });

  test('combined NoSQL operators in both fields do not bypass auth', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: { '$gt': '' }, password: { '$gt': '' } }),
    });
    expect(response.status()).not.toBe(200);
    const body = await response.text();
    expect(body).not.toContain('"token"');
    await ctx.dispose();
  });

  test('$regex operator in login does not bypass authentication', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: { '$regex': '.*' }, password: 'anything' }),
    });
    expect(response.status()).not.toBe(200);
    await ctx.dispose();
  });
});

test.describe('@security NoSQL injection: signup endpoint', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('NoSQL operator in signup username does not cause injection', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/auth/signup`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({
        username: '{"$ne":""}',
        email: 'nosql-test@test.com',
        password: 'SecurePass123',
      }),
    });
    // Should either succeed (treated as literal username) or fail
    // Key: should NOT cause database-level injection
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.username).toBe('{"$ne":""}');
    }
    await ctx.dispose();
  });

  test('NoSQL operator in signup email does not cause injection', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post(`${API}/api/auth/signup`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({
        username: 'normaluser',
        email: { '$ne': '' },
        password: 'SecurePass123',
      }),
    });
    // Should be rejected (not a valid email string)
    expect(response.status()).not.toBe(200);
    await ctx.dispose();
  });
});

test.describe('@security NoSQL injection: cart/order endpoints', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('NoSQL operator in cart bookId does not cause injection', async ({ page }) => {
    // Login first
    const loginRes = await page.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });
    expect(loginRes.status()).toBe(200);

    // Try to add item with NoSQL injection in bookId
    const cartRes = await page.request.post(`${API}/api/cart/items`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ bookId: '{"$ne":""}', quantity: 1 }),
    });
    // Should fail (invalid bookId)
    expect(cartRes.status()).not.toBe(200);
  });

  test('NoSQL operator in order ID does not cause injection', async ({ page }) => {
    // Login first
    await page.request.post(`${API}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: 'testuser1@bookhive.test', password: 'Test1234!' }),
    });

    // Try to access order with NoSQL injection in ID
    const orderRes = await page.request.get(`${API}/api/orders/%7B%22%24ne%22%3A%22%22%7D`);
    // Should return 400 or 404, not all orders
    expect(orderRes.status()).not.toBe(200);
  });
});

test.describe('@security NoSQL injection: UI input fields', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post(`${API}/api/reset`);
  });

  test('search bar with MongoDB operator returns no results', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', '{$ne:null}');
    await steps.pressKey('Enter');
    await page.waitForLoadState('networkidle');

    // Should show "No books found", not all books
    await steps.verifyPresence('HomePage', 'noBooks');
  });

  test('search bar with $where operator returns no results', async ({ steps, page }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', '{$where:"this.title.length>0"}');
    await steps.pressKey('Enter');
    await page.waitForLoadState('networkidle');

    await steps.verifyPresence('HomePage', 'noBooks');
  });
});
