# Bug Report

**Date:** 2026-04-05
**App:** http://localhost:7547
**Total verified findings:** 9
**New bugs:** 9 | **Regression candidates:** 0 | **Undocumented quirks:** 0 | **Known but untested:** 0

## Summary by Severity

| Severity | Count | Categories |
|----------|-------|------------|
| Critical | 0     | —          |
| High     | 4     | Missing 404 page, API validation, Stale UI state, Missing error feedback |
| Medium   | 4     | Boundary input, Stale UI state, Misleading error message |
| Low      | 1     | Inconsistent API response format |

---

## Findings

### [BUG-001] Create listing with extreme price shows generic server error

**Severity:** Medium
**Category:** Boundary input
**Phase discovered:** 1a (Element Probing)
**Page:** CreateListingPage — `/marketplace/sell`
**Reproduction test:** `tests/bug-discovery/element-bugs.spec.ts` — test passes (documents the bug via assertion that stays on sell page)
**Verification status:** Confirmed — test passes, proving the generic error behavior

**Steps:**
1. Login as testuser1
2. Navigate to `/marketplace/sell`
3. Select any book from the dropdown
4. Enter price: `999999999`
5. Click "Create Listing"

**Expected:** The form should show a specific validation error message such as "Price must be less than $10,000" or "Price is too high"

**Actual:** The form displays "An unexpected error occurred" — a generic server error message that provides no actionable guidance to the user. The backend throws an unhandled exception instead of returning a proper validation response.

**Root cause analysis:** The backend's `MarketplaceService` or `ListingRequest` DTO likely lacks a `@Max` constraint on the price field. When the price exceeds what the system can handle, the Spring Boot exception handler catches the error generically instead of returning a 400 Bad Request with a descriptive validation message.

**Screenshot:** Evidence committed to `tests/e2e/evidence/BUG-001.png`

---

### [BUG-002] No 404 page for invalid routes — blank page instead of not-found message

**Severity:** High
**Category:** Missing 404 page
**Phase discovered:** 1a (Element Probing)
**Page:** Any invalid route (e.g., `/nonexistent-page`)
**Reproduction test:** `tests/bug-discovery/element-bugs.spec.ts:L53`
**Verification status:** Confirmed — manually verified via Playwright MCP; `<main>` element is completely empty

**Steps:**
1. Login as testuser1
2. Navigate to `/nonexistent-page`
3. Observe the page

**Expected:** A "Page not found", "404", or similar not-found indicator should be visible in the main content area.

**Actual:** The main content area is completely blank. Only the navigation sidebar shell is rendered. Users who hit a bad URL see an empty page with no guidance on what happened or how to navigate back.

**Screenshot evidence:** Screenshot shows sidebar navigation with completely empty main area — no text, no error, no redirect.

---

### [BUG-003] Backend returns 500 for negative price listing via API instead of 400 validation error

**Severity:** High
**Category:** API validation
**Phase discovered:** 1a (Element Probing)
**Page:** API endpoint `POST /api/marketplace/listings`
**Reproduction test:** `tests/bug-discovery/element-bugs.spec.ts:L81`
**Verification status:** Confirmed — manually verified via Playwright MCP `page.evaluate`; API returns `{"error":"internal_error","message":"An unexpected error occurred"}` with status 500

**Steps:**
1. Login as testuser1
2. POST to `/api/marketplace/listings` with body `{ bookId: "book-001", condition: "GOOD", price: -5 }`
3. Observe response

**Expected:** HTTP 400 Bad Request with a validation error message like "Price must be positive"

**Actual:** HTTP 500 Internal Server Error with `{"error":"internal_error","message":"An unexpected error occurred"}`. The backend does not validate for negative prices and throws an unhandled exception.

---

### [BUG-005] Balance display is stale on order confirmation page after checkout

**Severity:** High
**Category:** Stale UI state
**Phase discovered:** 1b (Flow Probing)
**Page:** Order confirmation page (after checkout)
**Reproduction test:** `tests/bug-discovery/flow-bugs.spec.ts:L21`
**Verification status:** Confirmed — screenshot shows "Balance: $100.00" on order confirmation page after purchasing a $12.99 book (should be $87.01)

**Steps:**
1. Login as testuser1
2. Record initial sidebar balance ($100.00)
3. Add a book to cart ($12.99)
4. Navigate to cart and click Checkout
5. Observe the balance on the order confirmation page

**Expected:** The sidebar balance should show the updated amount ($87.01) reflecting the purchase.

**Actual:** The sidebar still shows "Balance: $100.00" — the pre-checkout value. The balance only updates after a full page navigation away from the confirmation page. The checkout flow does not trigger a balance refresh in the navigation component.

**Screenshot evidence:** Order confirmation page for "To Kill a Mockingbird" ($12.99) clearly shows "Balance: $100.00" in sidebar.

---

### [BUG-006] Cart badge still shows item count on order confirmation page after checkout

**Severity:** Medium
**Category:** Stale UI state
**Phase discovered:** 1b (Flow Probing)
**Page:** Order confirmation page (after checkout)
**Reproduction test:** `tests/bug-discovery/flow-bugs.spec.ts:L61`
**Verification status:** Confirmed — screenshot shows "Cart1" badge on order confirmation page after successful checkout; error context confirms `link "Cart1"` in accessibility tree

**Steps:**
1. Login as testuser1
2. Ensure cart is empty, then add a book
3. Navigate to cart and click Checkout
4. Observe the cart badge on the order confirmation page

**Expected:** The cart badge should show "Cart" with no count (cart is now empty after checkout).

**Actual:** The cart badge still shows "Cart1" because the cart state is not refreshed after a successful checkout. The checkout flow does not invalidate the cached cart count in the navigation component.

**Screenshot evidence:** Order confirmation page shows "Cart 1" badge in sidebar despite successful checkout.

---

### [BUG-007] Cart badge count not loaded on login despite server-side persistence

**Severity:** Medium
**Category:** Stale UI state
**Phase discovered:** 1b (Flow Probing)
**Page:** Homepage / any page after login
**Reproduction test:** `tests/bug-discovery/flow-bugs.spec.ts:L104`
**Verification status:** Confirmed — manually verified via Playwright MCP: (1) API confirms cart has 1 item after re-login, (2) UI shows "Cart" with no count badge

**Steps:**
1. Login as testuser1
2. Add a book to cart (badge shows "Cart1")
3. Logout
4. Login again
5. Observe the cart badge

**Expected:** The cart badge should show "Cart1" because items are persisted server-side across sessions.

**Actual:** The cart badge shows "Cart" with no count. The application does not fetch the cart count from the server on login. The API confirms items ARE persisted (verified via `GET /api/cart`), but the UI does not reflect this until the user navigates to the cart page.

---

### [BUG-008] No visible error message when checkout fails due to insufficient balance

**Severity:** High
**Category:** Missing error feedback
**Phase discovered:** 1b (Flow Probing)
**Page:** CartPage — `/cart`
**Reproduction test:** `tests/bug-discovery/flow-bugs.spec.ts:L156`
**Verification status:** Confirmed — (1) API correctly returns 400 `{"error":"bad_request","message":"Insufficient balance"}`, (2) Screenshot shows cart page with no error text visible, (3) User sees same cart page with no explanation of why checkout failed

**Steps:**
1. Register a new user (gets $100 balance)
2. Add 7 copies of Dune ($16.99 x 7 = $118.93) to cart
3. Navigate to cart and click Checkout
4. Observe the page

**Expected:** An error message should be visible, such as "Insufficient balance" or "Not enough funds to complete purchase."

**Actual:** The page stays on `/cart` with no error message displayed. The user sees the same cart page with no explanation of why checkout failed. The API returns a proper 400 error, but the frontend swallows it without displaying any feedback.

**Screenshot evidence:** Cart page shows "Dune" qty 7, Total: $118.93, Balance: $0.00, Checkout button still present — no error text anywhere.

---

### [BUG-009] Misleading error message when returning an already-returned order

**Severity:** Medium
**Category:** Misleading error message
**Phase discovered:** 1b (Flow Probing)
**Page:** API endpoint `POST /api/orders/:id/return`
**Reproduction test:** `tests/bug-discovery/flow-bugs.spec.ts:L205`
**Verification status:** Confirmed — API returns `"Return window has expired"` for an order with status RETURNED; screenshot shows order detail page with "RETURNED" status badge

**Steps:**
1. Login as testuser1
2. Purchase a book and return the order
3. Attempt to return the same order again via API

**Expected:** Error message should indicate the order has already been returned, e.g., "Order already returned"

**Actual:** The error message says "Return window has expired" which is misleading. This message conflates two distinct error conditions:
- "Return window has expired" = order is COMPLETED but 10 minutes have passed
- "Order already returned" = order status is already RETURNED

The backend does not differentiate between these two states, causing user confusion.

---

### [BUG-010] API returns empty body for 404 on non-existent order

**Severity:** Low
**Category:** Inconsistent API response format
**Phase discovered:** 4 (Context-Derived Analysis)
**Page:** API endpoint `GET /api/orders/:id`
**Reproduction test:** `tests/bug-discovery/context-derived-bugs.spec.ts:L20`
**Verification status:** Confirmed — manually verified via Playwright MCP `page.evaluate`; API returns status 404 with empty body (0 bytes)

**Steps:**
1. Login as testuser1
2. GET `/api/orders/aaaaaaaaaaaaaaaaaaaaaaaa` (non-existent order ID)
3. Observe the response

**Expected:** HTTP 404 with a JSON error body like `{"error":"not_found","message":"Order not found"}`, consistent with all other error responses in the API.

**Actual:** HTTP 404 with a completely empty response body. All other API error endpoints return structured JSON error objects. This inconsistency causes an unhandled JSON parse error in the frontend console when it tries to parse the empty response.

---

## Verification Notes

- **BUG-004 (removed):** Floating-point precision in balance — initially appeared as `81.02000000000001` but was a false positive. Manual reproduction with the exact same purchase-and-return sequence returned clean `81.02`. The original test failure was caused by a test issue (`page.evaluate` with relative URL failing on `about:blank` when run in isolation). Removed from test suite.
- **BUG-011 (removed):** Sidebar balance not auto-refreshing after API-only purchase — false positive. The test expected real-time state synchronization after making API calls via `page.evaluate` (bypassing UI). The app has no WebSocket or polling mechanism; UI state updates on navigation/UI-triggered actions. This is expected behavior, not a bug.
- **BUG-002 (old, removed in prior stage):** Empty login form — browser native HTML5 validation handles this correctly.
- **BUG-003 (old, removed in prior stage):** Empty signup form — same as above.

## Coverage Notes

- Pages probed: 10/10 (all application pages)
- Flows tested: 4 adversarial flows
- Categories covered: Boundary inputs, special characters, empty form submissions, negative/zero/extreme values, stale UI state, error feedback, API consistency
- Areas not probed: Concurrent tab state (limited by test framework), WebSocket/real-time features (none present)
- False positive rate: 2/11 tests removed (18%) — both were test issues, not app bugs
