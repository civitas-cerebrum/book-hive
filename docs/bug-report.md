# Bug Discovery Report

**Date:** 2026-04-03
**App:** http://localhost:7547 (BookHive)
**Total findings:** 4
**New bugs:** 4 | **Regression candidates:** 0 | **Undocumented quirks:** 0 | **Known but untested:** 0

## Summary by Severity

| Severity | Count | Categories |
|----------|-------|------------|
| Critical | 1     | Missing error handling |
| High     | 2     | Missing error handling, Stale state |
| Medium   | 1     | UI feedback |
| Low      | 0     | — |

---

## Findings

### [BUG-001] Login with invalid credentials shows no error message

**Severity:** High
**Category:** Missing error handling
**Phase discovered:** 1a (Element Probing)
**Page:** LoginPage — `/login`
**Reproduction test:** `tests/bug-discovery/element-bugs.spec.ts` — `@bug-discovery BUG-001`

**Steps:**
1. Navigate to `/login`
2. Enter invalid email and password (`invalid@example.com` / `wrongpassword`)
3. Click "Sign In"
4. Observe: no error message appears

**Expected:** A visible error message (e.g., "Invalid email or password") should be displayed to inform the user that login failed.

**Actual:** The login form stays inert. No error message, no visual feedback. The user has no idea the login attempt failed.

**Root cause:** The global Axios 401 interceptor in `frontend/src/services/api.js` catches ALL 401 responses (including the login endpoint's 401) and redirects to `/login`. Since the user is already on `/login`, this effectively swallows the error before the LoginPage component's catch block can set the error state. The `data-testid="login-error"` element exists in the JSX but never gets populated.

**Screenshot:** ![BUG-001](../tests/e2e/screenshots/BUG-001-login-no-error.png)

---

### [BUG-002] Checkout with insufficient balance fails silently

**Severity:** Critical
**Category:** Missing error handling
**Phase discovered:** 1a (Element Probing)
**Page:** CartPage — `/cart`
**Reproduction test:** `tests/bug-discovery/flow-bugs.spec.ts` — `@bug-discovery BUG-002`

**Steps:**
1. Login as any user
2. Add items to cart until total exceeds user balance (e.g., Dune x7 = $118.93 > $100 balance)
3. Click "Checkout"
4. Observe: nothing happens — no error message, stays on cart page

**Expected:** An error message should be displayed (e.g., "Insufficient balance. Please remove items or add funds.") and the checkout button should remain enabled for the user to adjust their cart.

**Actual:** The checkout button briefly shows loading state, then returns to normal. The server returns a 400 error with "Insufficient balance" but the frontend completely ignores it. The AxiosError appears only in the browser console.

**Root cause:** `CartPage.jsx`'s `handleCheckout` function has a `try/finally` block with NO `catch` block. The 400 error from `api.post('/orders')` is unhandled — it falls through to `finally` which just resets `setChecking(false)`.

**Screenshot:** ![BUG-002](../tests/e2e/screenshots/BUG-002-checkout-silent-fail.png)

---

### [BUG-003] Navbar balance not refreshed after checkout or order return

**Severity:** High
**Category:** Stale state
**Phase discovered:** 1a (Element Probing)
**Page:** Sidebar (navbar) — visible on all authenticated pages
**Reproduction tests:**
- `tests/bug-discovery/flow-bugs.spec.ts` — `@bug-discovery BUG-003`
- `tests/bug-discovery/flow-bugs.spec.ts` — `@bug-discovery BUG-003b`

**Steps:**
1. Login (balance shows $100.00)
2. Add item to cart (e.g., "Of Mice and Men" $8.99)
3. Checkout successfully — redirected to order detail page
4. Observe navbar balance: still shows $100.00 (should be $91.01)
5. Click "Return Order"
6. Observe navbar balance: still shows $100.00

**Expected:** The navbar balance should update immediately after any transaction that changes the user's balance (checkout, return, marketplace buy).

**Actual:** The navbar balance remains at the value fetched during login for the entire session. Only a full page reload (F5) fetches the updated balance from the server.

**Root cause:** `AuthContext.jsx` exposes a `refreshUser()` function that calls `GET /api/auth/me` to update user state. However, neither `CartPage.jsx` (`handleCheckout`) nor `OrderDetailPage.jsx` (`handleReturn`) call `refreshUser()` after their respective API calls complete. The user state (including balance) is never updated in React context.

**Screenshot:** ![BUG-003](../tests/e2e/screenshots/BUG-003-stale-balance-after-checkout.png)

---

### [BUG-004] Cart quantity + button not disabled at maximum stock

**Severity:** Medium
**Category:** UI feedback
**Phase discovered:** 1a (Element Probing)
**Page:** CartPage — `/cart`
**Reproduction test:** `tests/bug-discovery/element-bugs.spec.ts` — `@bug-discovery BUG-004`

**Steps:**
1. Login and add a book to cart (e.g., "To Kill a Mockingbird" with 15 in stock)
2. Navigate to cart
3. Click the "+" button 14 times to reach quantity 15 (max stock)
4. Observe: the "+" button is still enabled and clickable
5. Click "+" again — generates a 400 error in the console

**Expected:** The "+" button should be disabled when the cart quantity equals the available stock for that book. This prevents the user from attempting to add more than available.

**Actual:** The "+" button remains enabled at max stock. Each additional click sends a PATCH request to the server which returns a 400 error ("Cannot exceed stock"). The error is silently swallowed — no message is shown to the user.

**Screenshot:** ![BUG-004](../tests/e2e/screenshots/BUG-004-plus-btn-not-disabled-at-max.png)

---

## Coverage Notes

- **Pages probed:** 10/10 (HomePage, LoginPage, SignupPage, BookDetailPage, CartPage, OrdersPage, OrderDetailPage, MarketplacePage, CreateListingPage, ProfilePage)
- **Flows tested:** 8 (login, signup, browse, add-to-cart, checkout, return, marketplace buy/sell)
- **Categories covered:** Boundary inputs, state transitions, race conditions, permission/access, data edge cases, cross-feature
- **Areas not probed:** Mobile viewport (responsive), multi-tab concurrent state, WebSocket/real-time (not applicable)
