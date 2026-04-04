# Bug Report
**Date:** 2026-04-04
**App:** http://localhost:7547
**Total findings:** 1
**New bugs:** 1 | **Regression candidates:** 0 | **Resolved since last run:** 1

## Summary by Severity
| Severity | Count | Categories |
|----------|-------|------------|
| Critical | 0     | -          |
| High     | 1     | Checkout error handling |
| Medium   | 0     | -          |
| Low      | 0     | -          |

## Active Findings

### [BUG-003] Insufficient balance checkout shows no error message
**Severity:** High
**Category:** Checkout error handling
**Page:** CartPage - `/cart`
**Reproduction test:** `tests/e2e/tests/bug-discovery/validation-bugs.spec.ts`

**Steps:**
1. Login as `testuser1@bookhive.test` (balance: $100.00)
2. Add multiple expensive books to cart (total exceeding $100)
3. Navigate to `/cart`
4. Click the **Checkout** button
5. Observe the page behavior

**Expected:** An error message (e.g., "Insufficient balance") should appear, and the user should remain on the cart page with clear feedback about why checkout failed.

**Actual:** The Checkout button briefly shows "Processing..." then returns to "Checkout". No error message is shown. The user receives zero feedback about why the checkout failed.

**Root Cause Analysis:**
In `frontend/src/pages/CartPage.jsx` (lines 30-38), the `handleCheckout` function has a `try/finally` block but **no `catch` block**:

```javascript
const handleCheckout = async () => {
  setChecking(true);
  try {
    const res = await api.post('/orders');
    navigate(`/orders/${res.data.id}`);
  } finally {
    setChecking(false);
  }
};
```

When the backend returns an error for insufficient balance, the promise rejection propagates past the `try` block. Since there is no `catch`, the error is silently swallowed. The `finally` block resets the button state, leaving the user stuck with no feedback.

**Impact:** Users who attempt to purchase books exceeding their balance get no indication of what went wrong. They may repeatedly click Checkout thinking the app is broken.

**Evidence:** Screenshot committed to `tests/e2e/evidence/BUG-003.png`.
Full visual report with video playback available as Playwright Report CI artifact.

---

## Resolved Findings

### [BUG-001] Login form error message (RESOLVED)
**Previous status:** High - Login with invalid credentials showed no error message
**Current status:** RESOLVED - The error message "Invalid credentials" now displays correctly via `[data-testid="login-error"]`. The reproduction test passes consistently. The axios 401 interceptor correctly skips redirect when already on `/login`.

---

## Coverage Notes
- Pages probed: 10/10 (all routes)
- Flows tested: Login, signup, browse, search, cart, checkout, orders, marketplace listing, profile
- Categories covered: Boundary inputs, state transitions, form validation, empty states, authentication, protected routes, XSS injection, negative values, insufficient balance
- Areas not probed: Return order flow (requires specific time-window), multi-user concurrent scenarios
