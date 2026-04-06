import { test, expect } from '../fixtures/base';

/**
 * Permission API Tests
 *
 * Tests backend API endpoints directly for proper auth enforcement:
 * - Unauthenticated requests to protected endpoints return 403 (Spring Security default)
 * - Cross-user API calls are rejected (user A can't access user B's data)
 * - Public endpoints remain accessible without auth
 *
 * Note: Spring Security returns 403 (not 401) for unauthenticated requests when
 * no explicit AuthenticationEntryPoint is configured. This is the app's actual behavior.
 *
 * For unauthenticated tests we use a fresh Playwright request context (no cookies) to
 * ensure the browser context doesn't carry stale session cookies from previous tests.
 */

test.describe('@permission API: direct endpoint auth enforcement', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  // ---- Unauthenticated API access (fresh context, no cookies) ----

  test('@permission API: GET /api/cart returns 403 without auth', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get('http://localhost:8080/api/cart');
    expect(response.status()).toBe(403);
    await ctx.dispose();
  });

  test('@permission API: POST /api/cart/items returns 403 without auth', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post('http://localhost:8080/api/cart/items', {
      data: { bookId: 'book-001', quantity: 1 },
    });
    expect(response.status()).toBe(403);
    await ctx.dispose();
  });

  test('@permission API: DELETE /api/cart returns 403 without auth', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.delete('http://localhost:8080/api/cart');
    expect(response.status()).toBe(403);
    await ctx.dispose();
  });

  test('@permission API: GET /api/orders returns 403 without auth', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get('http://localhost:8080/api/orders');
    expect(response.status()).toBe(403);
    await ctx.dispose();
  });

  test('@permission API: POST /api/orders (checkout) returns 403 without auth', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post('http://localhost:8080/api/orders');
    expect(response.status()).toBe(403);
    await ctx.dispose();
  });

  test('@permission API: GET /api/orders/fake-id returns 403 without auth', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get('http://localhost:8080/api/orders/fake-id');
    expect(response.status()).toBe(403);
    await ctx.dispose();
  });

  test('@permission API: POST /api/orders/fake-id/return returns 403 without auth', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post('http://localhost:8080/api/orders/fake-id/return');
    expect(response.status()).toBe(403);
    await ctx.dispose();
  });

  test('@permission API: POST /api/marketplace/listings returns 403 without auth', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post('http://localhost:8080/api/marketplace/listings', {
      data: { bookId: 'book-001', condition: 'GOOD', price: 5.99 },
    });
    expect(response.status()).toBe(403);
    await ctx.dispose();
  });

  test('@permission API: POST /api/marketplace/listings/fake-id/buy returns 403 without auth', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post('http://localhost:8080/api/marketplace/listings/fake-id/buy');
    expect(response.status()).toBe(403);
    await ctx.dispose();
  });

  test('@permission API: GET /api/auth/me returns 403 without auth', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.get('http://localhost:8080/api/auth/me');
    expect(response.status()).toBe(403);
    await ctx.dispose();
  });

  // ---- Public endpoints remain accessible ----

  test('@permission API: public endpoints accessible without auth (books, marketplace, health)', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();

    // GET /api/books — public catalog
    const booksResponse = await ctx.get('http://localhost:8080/api/books');
    expect(booksResponse.status()).toBe(200);
    const books = await booksResponse.json();
    expect(books.content.length).toBeGreaterThan(0);

    // GET /api/books/:id — public book detail
    const bookDetailResponse = await ctx.get('http://localhost:8080/api/books/book-001');
    expect(bookDetailResponse.status()).toBe(200);
    const book = await bookDetailResponse.json();
    expect(book.title).toBeTruthy();

    // GET /api/marketplace — public marketplace
    const marketplaceResponse = await ctx.get('http://localhost:8080/api/marketplace');
    expect(marketplaceResponse.status()).toBe(200);

    // GET /api/health — public health check
    const healthResponse = await ctx.get('http://localhost:8080/api/health');
    expect(healthResponse.status()).toBe(200);

    await ctx.dispose();
  });

  // ---- Auth endpoints accept public requests ----

  test('@permission API: login with invalid credentials returns clean error, not 500', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post('http://localhost:8080/api/auth/login', {
      data: { email: 'nonexistent@test.com', password: 'wrong' },
    });
    // Should be a clean auth error, not a server crash
    expect(response.status()).not.toBe(500);
    expect([400, 401, 403].includes(response.status())).toBeTruthy();
    await ctx.dispose();
  });

  test('@permission API: signup endpoint is public', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const response = await ctx.post('http://localhost:8080/api/auth/signup', {
      data: { username: 'permtestuser', email: 'permtest@test.com', password: 'NewPass123!' },
    });
    // Should succeed (new user) or fail with clean error, not 401/403
    expect(response.status()).not.toBe(401);
    expect(response.status()).not.toBe(403);
    expect(response.status()).not.toBe(500);
    await ctx.dispose();
  });

  // ---- Cross-user API access prevention ----

  test('@permission API: user B cannot access user A order via API', async ({ steps, page }) => {
    // Login as user 1 via UI to get a valid session cookie
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Create an order via UI for user 1
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');

    // Capture order ID from URL
    const orderUrl = new URL(page.url());
    const orderId = orderUrl.pathname.split('/').pop();

    // Logout user 1
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');

    // Login as user 2
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // User 2 tries to access user 1's order via API (page.request carries user 2's cookies)
    const response = await page.request.get(`http://localhost:8080/api/orders/${orderId}`);
    // Should get 404 (ownership filter) or 403 — NOT 200 with user 1's data
    expect(response.status()).not.toBe(200);
    expect(response.status()).not.toBe(500);
  });

  test('@permission API: user B cannot return user A order via API', async ({ steps, page }) => {
    // Login as user 1
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Create an order
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');

    const orderId = new URL(page.url()).pathname.split('/').pop();

    // Logout and login as user 2
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // User 2 tries to return user 1's order via API
    const response = await page.request.post(`http://localhost:8080/api/orders/${orderId}/return`);
    // Should be denied — not user 2's order
    expect(response.status()).not.toBe(200);
    expect(response.status()).not.toBe(500);
  });

  test('@permission API: user B cannot modify user A cart items via API', async ({ steps, page }) => {
    // Login as user 1 and add an item to cart
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Add item via API as user 1
    const addResponse = await page.request.post('http://localhost:8080/api/cart/items', {
      data: { bookId: 'book-001', quantity: 1 },
    });
    expect(addResponse.status()).toBe(200);

    // Get cart to find the item ID
    const cartResponse = await page.request.get('http://localhost:8080/api/cart');
    expect(cartResponse.status()).toBe(200);
    const cartData = await cartResponse.json();
    const cartItemId = cartData[0]?.id;
    expect(cartItemId).toBeTruthy();

    // Logout user 1, login as user 2
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // User 2 tries to modify user 1's cart item
    const updateResponse = await page.request.put(`http://localhost:8080/api/cart/items/${cartItemId}`, {
      data: { quantity: 5 },
    });
    // Should be rejected — not user 2's cart item
    expect(updateResponse.status()).not.toBe(200);
    expect(updateResponse.status()).not.toBe(500);

    // User 2 tries to delete user 1's cart item
    const deleteResponse = await page.request.delete(`http://localhost:8080/api/cart/items/${cartItemId}`);
    expect(deleteResponse.status()).not.toBe(200);
    expect(deleteResponse.status()).not.toBe(500);
  });

  // ---- Error response quality ----

  test('@permission API: unauthenticated requests return clean 403, not 500', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();

    // Test all protected endpoints return clean error responses (not server crashes)
    const endpoints = [
      { method: 'GET' as const, url: 'http://localhost:8080/api/cart' },
      { method: 'GET' as const, url: 'http://localhost:8080/api/orders' },
      { method: 'GET' as const, url: 'http://localhost:8080/api/auth/me' },
      { method: 'POST' as const, url: 'http://localhost:8080/api/orders' },
      { method: 'POST' as const, url: 'http://localhost:8080/api/cart/items' },
    ];

    for (const endpoint of endpoints) {
      let response;
      if (endpoint.method === 'GET') {
        response = await ctx.get(endpoint.url);
      } else {
        response = await ctx.post(endpoint.url, { data: {} });
      }

      // Must return 403 (Spring Security auth failure), not 500 (server crash)
      expect(response.status(), `${endpoint.method} ${endpoint.url} should return 403`).toBe(403);
    }

    await ctx.dispose();
  });

  test('@permission API: cross-user access returns clean error, not 500', async ({ steps, page }) => {
    // Login as user 1, create some data
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Create an order for user 1
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.click('BookDetailPage', 'addToCartDetail');
    await steps.click('Navigation', 'navCart');
    await steps.click('CartPage', 'checkoutBtn');
    await steps.verifyPresence('OrderDetailPage', 'orderDetailPage');
    const orderId = new URL(page.url()).pathname.split('/').pop();

    // Switch to user 2
    await steps.click('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'navLogin');
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'loginEmail', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'loginPassword', 'Test1234!');
    await steps.click('LoginPage', 'loginSubmit');
    await steps.verifyPresence('HomePage', 'homePage');

    // Cross-user order access — should return clean error (403 or 404)
    const orderResponse = await page.request.get(`http://localhost:8080/api/orders/${orderId}`);
    expect(orderResponse.status()).not.toBe(500);
    expect(orderResponse.status()).not.toBe(200);

    // Cross-user order return — should return clean error
    const returnResponse = await page.request.post(`http://localhost:8080/api/orders/${orderId}/return`);
    expect(returnResponse.status()).not.toBe(500);
    expect(returnResponse.status()).not.toBe(200);
  });
});
