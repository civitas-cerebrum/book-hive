import { test, expect } from '../fixtures/base';

test.describe('Bug Discovery — Context-Derived Analysis', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  /**
   * @bug BUG-010
   * @severity Low
   * @phase 4
   * @steps
   * 1. Login as testuser1
   * 2. GET /api/orders/nonexistent-order-id
   * 3. Observe the response has 404 status but an empty body (no JSON)
   * 4. Assert the response should include a JSON error body like {"error":"not_found","message":"Order not found"}
   */
  test('@bug-discovery API returns empty body for 404 on non-existent order', async ({ steps, page }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    const result = await page.evaluate(async () => {
      const res = await fetch('/api/orders/aaaaaaaaaaaaaaaaaaaaaaaa');
      const text = await res.text();
      return { status: res.status, body: text, hasContent: text.length > 0 };
    });

    // BUG: The API returns 404 with an empty body. All other error responses in the
    // application return JSON with an error object. A 404 for a non-existent order
    // should return {"error": "not_found", "message": "Order not found"} so the
    // frontend can display a meaningful error. Currently the empty body causes an
    // unhandled JSON parse error in the frontend console.
    expect(result.status).toBe(404);
    expect(
      result.hasContent,
      `Expected 404 response to include a JSON error body, but body was empty`
    ).toBe(true);

    // Also verify the body is valid JSON if present
    if (result.hasContent) {
      let parsed;
      try {
        parsed = JSON.parse(result.body);
      } catch {
        expect(false, `Response body is not valid JSON: "${result.body}"`).toBe(true);
      }
      if (parsed) {
        expect(parsed).toHaveProperty('error');
      }
    }
  });

  // BUG-011 REMOVED during Stage 5 verification:
  // This test expected the sidebar balance to auto-refresh after an API-only purchase
  // (made via page.evaluate, bypassing UI). The app has no WebSocket or polling mechanism —
  // it updates UI state on navigation/UI-triggered actions only. The design spec phrase
  // "API state changes reflect in UI" refers to eventual consistency on page navigation,
  // not real-time push updates. This is expected behavior, not a bug.
});
