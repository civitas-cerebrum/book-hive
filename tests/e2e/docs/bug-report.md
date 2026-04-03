# Bug Report — BookHive
**Date:** 2026-04-03
**Application:** http://localhost:7547
**Total findings:** 3
**New bugs:** 3

## Summary by Severity
| Severity | Count | Categories |
|----------|-------|------------|
| High     | 2     | Auth UX, State Management |
| Medium   | 1     | State Management |

## Findings

### [BUG-001] Login error message not shown for invalid credentials
**Severity:** High
**Category:** Auth UX / Error Handling
**Page:** LoginPage — `/login`
**Reproduction test:** `tests/bug-discovery/flow-bugs.spec.ts:16`
**Steps:**
1. Navigate to /login
2. Enter invalid credentials (wrong@example.com / WrongPass1!)
3. Click Sign In
4. Observe that the page redirects to /login with empty fields instead of showing an error

**Expected:** An error message should appear on the login page (e.g., "Invalid credentials")
**Actual:** The axios response interceptor in `services/api.js` catches the 401 response from the login API and triggers `window.location.href = '/login'`, which reloads the login page with empty fields. The LoginPage's catch block never executes because the interceptor fires first.
**Root cause:** The global 401 interceptor in `frontend/src/services/api.js` does not distinguish between auth-required endpoints (which should redirect) and the login endpoint itself (which should show an error).
**Screenshot:** ![BUG-001](screenshots/BUG-001.png)

---

### [BUG-002] Sidebar balance not updated after checkout
**Severity:** High
**Category:** State Management
**Page:** Sidebar (visible on all pages) after checkout flow
**Reproduction test:** `tests/bug-discovery/flow-bugs.spec.ts:41`
**Steps:**
1. Login as testuser1 (balance: $100.00)
2. Add "To Kill a Mockingbird" ($12.99) to cart
3. Navigate to cart and click Checkout
4. Observe sidebar balance — still shows $100.00

**Expected:** Sidebar balance should update to $87.01 after checkout
**Actual:** Balance remains $100.00 in sidebar. The backend correctly deducts the balance, but the frontend's AuthContext user object is stale. The `refreshUser()` method exists but is never called after checkout in CartPage.jsx.
**Root cause:** `CartPage.jsx` calls `api.post('/orders')` and navigates away, but never calls `refreshUser()` from AuthContext to update the user's balance in the sidebar.
**Screenshot:** ![BUG-002](screenshots/BUG-002.png)

---

### [BUG-003] Cart badge not cleared after checkout
**Severity:** Medium
**Category:** State Management
**Page:** Sidebar cart badge after checkout
**Reproduction test:** `tests/bug-discovery/flow-bugs.spec.ts:76`
**Steps:**
1. Login as testuser1
2. Add a book to cart (badge shows "1")
3. Navigate to cart and click Checkout
4. Observe cart badge — still shows "1"

**Expected:** Cart badge should disappear or show "0" after checkout since the cart is empty
**Actual:** The cart badge still shows "1" on the order detail page after checkout. The CartContext items array is not refreshed after checkout.
**Root cause:** `CartPage.jsx` checkout handler calls `api.post('/orders')` and `navigate()` but never calls `fetchCart()` from CartContext. The cart items remain in context until the next page load triggers `fetchCart()`.
**Screenshot:** ![BUG-003](screenshots/BUG-003.png)
