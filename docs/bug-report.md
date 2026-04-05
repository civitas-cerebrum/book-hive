# Bug Report — BookHive E2E Testing

**Date:** 2025-04-05
**Application:** BookHive (http://localhost:7547)
**Test Framework:** Playwright 1.59.1
**Total verified bugs:** 9
**Breakdown:** 4 High | 4 Medium | 1 Low

---

## Summary

| ID | Title | Severity | Category | Repro Test |
|----|-------|----------|----------|------------|
| BUG-001 | Extreme price listing shows generic error | Medium | Boundary input | `element-bugs.spec.ts` |
| BUG-002 | No 404 page for invalid routes | High | Missing 404 page | `element-bugs.spec.ts` |
| BUG-003 | Backend returns 500 for negative price via API | High | API validation | `element-bugs.spec.ts` |
| BUG-005 | Balance display stale after checkout | High | Stale UI state | `flow-bugs.spec.ts` |
| BUG-006 | Cart badge stale after checkout | Medium | Stale UI state | `flow-bugs.spec.ts` |
| BUG-007 | Cart badge not loaded on login | Medium | Stale UI state | `flow-bugs.spec.ts` |
| BUG-008 | No error message for insufficient balance checkout | High | Missing error feedback | `flow-bugs.spec.ts` |
| BUG-009 | Misleading error on double-return | Medium | Misleading error message | `flow-bugs.spec.ts` |
| BUG-010 | API returns empty body for 404 order | Low | Inconsistent API response | `context-derived-bugs.spec.ts` |

---

## Detailed Findings

### BUG-001 — Create listing with extreme price shows generic server error

- **Severity:** Medium
- **Page:** `/marketplace/sell`
- **Reproduction test:** `tests/e2e/tests/bug-discovery/element-bugs.spec.ts`

**Steps to reproduce:**
1. Login as testuser1
2. Navigate to `/marketplace/sell`
3. Select any book from the dropdown
4. Enter price: `999999999`
5. Click "Create Listing"

**Expected:** A specific validation error message such as "Price must be less than $10,000"

**Actual:** The form displays "An unexpected error occurred" — a generic server error. The backend throws an unhandled exception instead of returning a 400 validation response.

**Root cause:** The backend `MarketplaceService` or `ListingRequest` DTO likely lacks a `@Max` constraint on the price field.

---

### BUG-002 — No 404 page for invalid routes

- **Severity:** High
- **Page:** Any invalid route (e.g., `/nonexistent-page`)
- **Reproduction test:** `tests/e2e/tests/bug-discovery/element-bugs.spec.ts`

**Steps to reproduce:**
1. Login as testuser1
2. Navigate to `/nonexistent-page`
3. Observe the page

**Expected:** A "Page not found" or "404" message should be visible.

**Actual:** The main content area is completely blank. Only the navigation sidebar is rendered. Users hitting a bad URL see an empty page with no guidance.

---

### BUG-003 — Backend returns 500 for negative price listing via API

- **Severity:** High
- **Page:** API endpoint `POST /api/marketplace/listings`
- **Reproduction test:** `tests/e2e/tests/bug-discovery/element-bugs.spec.ts`

**Steps to reproduce:**
1. Login as testuser1
2. POST to `/api/marketplace/listings` with body `{ bookId: "book-001", condition: "GOOD", price: -5 }`
3. Observe response

**Expected:** HTTP 400 Bad Request with a validation error message like "Price must be positive"

**Actual:** HTTP 500 Internal Server Error with `{"error":"internal_error","message":"An unexpected error occurred"}`. The backend does not validate for negative prices.

---

### BUG-005 — Balance display is stale on order confirmation page after checkout

- **Severity:** High
- **Page:** Order confirmation page (`/orders/:id` after checkout)
- **Reproduction test:** `tests/e2e/tests/bug-discovery/flow-bugs.spec.ts`

**Steps to reproduce:**
1. Login as testuser1
2. Record initial sidebar balance ($100.00)
3. Add a book to cart ($12.99)
4. Navigate to cart and click Checkout
5. Observe the balance on the order confirmation page

**Expected:** Sidebar balance shows the updated amount ($87.01).

**Actual:** Sidebar still shows "Balance: $100.00" — the pre-checkout value. The checkout flow does not trigger a balance refresh in the navigation component.

---

### BUG-006 — Cart badge still shows item count after checkout

- **Severity:** Medium
- **Page:** Order confirmation page (`/orders/:id` after checkout)
- **Reproduction test:** `tests/e2e/tests/bug-discovery/flow-bugs.spec.ts`

**Steps to reproduce:**
1. Login as testuser1
2. Ensure cart is empty, then add a book
3. Navigate to cart and click Checkout
4. Observe the cart badge on the order confirmation page

**Expected:** Cart badge shows "Cart" with no count (cart is empty after checkout).

**Actual:** Cart badge still shows "Cart1" because the cart state is not refreshed after checkout.

---

### BUG-007 — Cart badge count not loaded on login despite server-side persistence

- **Severity:** Medium
- **Page:** Homepage / any page after login
- **Reproduction test:** `tests/e2e/tests/bug-discovery/flow-bugs.spec.ts`

**Steps to reproduce:**
1. Login as testuser1
2. Add a book to cart (badge shows "Cart1")
3. Logout
4. Login again
5. Observe the cart badge

**Expected:** Cart badge shows "Cart1" because items are persisted server-side.

**Actual:** Cart badge shows "Cart" with no count. The application does not fetch cart count from the server on login. API confirms items ARE persisted, but UI doesn't reflect it until the user navigates to the cart page.

---

### BUG-008 — No visible error message when checkout fails due to insufficient balance

- **Severity:** High
- **Page:** Cart page (`/cart`)
- **Reproduction test:** `tests/e2e/tests/bug-discovery/flow-bugs.spec.ts`

**Steps to reproduce:**
1. Register a new user (gets $100 balance)
2. Add 7 copies of Dune ($16.99 x 7 = $118.93) to cart
3. Navigate to cart and click Checkout
4. Observe the page

**Expected:** An error message visible, such as "Insufficient balance" or "Not enough funds."

**Actual:** Page stays on `/cart` with no error message displayed. The API correctly returns 400 `{"error":"bad_request","message":"Insufficient balance"}`, but the frontend silently swallows the error.

---

### BUG-009 — Misleading error message when returning an already-returned order

- **Severity:** Medium
- **Page:** API endpoint `POST /api/orders/:id/return`
- **Reproduction test:** `tests/e2e/tests/bug-discovery/flow-bugs.spec.ts`

**Steps to reproduce:**
1. Login as testuser1
2. Purchase a book and return the order
3. Attempt to return the same order again via API

**Expected:** Error message indicating "Order already returned"

**Actual:** Error message says "Return window has expired" — conflating two distinct error conditions (expired window vs. already returned).

---

### BUG-010 — API returns empty body for 404 on non-existent order

- **Severity:** Low
- **Page:** API endpoint `GET /api/orders/:id`
- **Reproduction test:** `tests/e2e/tests/bug-discovery/context-derived-bugs.spec.ts`

**Steps to reproduce:**
1. Login as testuser1
2. GET `/api/orders/aaaaaaaaaaaaaaaaaaaaaaaa` (non-existent order ID)
3. Observe the response

**Expected:** HTTP 404 with a JSON body like `{"error":"not_found","message":"Order not found"}`

**Actual:** HTTP 404 with a completely empty response body. All other API errors return structured JSON. The empty body causes an unhandled JSON parse error in the frontend console.

---

## Eliminated False Positives

| ID | Description | Reason for Removal |
|----|-------------|-------------------|
| BUG-004 | Floating-point precision in balance | Manual reproduction returned clean values. Original failure was a test infrastructure issue. |
| BUG-011 | Sidebar balance not auto-refreshing after API-only purchase | Expected behavior — app updates UI on navigation, not real-time push. Test bypassed the UI. |

---

## Coverage Summary

- **Pages probed:** 10/10 (all application pages)
- **Adversarial flows tested:** 4
- **Categories covered:** Boundary inputs, special characters, empty form submissions, negative/zero/extreme values, stale UI state, error feedback, API consistency
- **False positive rate:** 2/11 initial findings removed (18%)
