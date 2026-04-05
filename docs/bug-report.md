# Bug Report — BookHive

**Date:** 2026-04-05
**Application:** BookHive (http://localhost:7547)
**Total findings:** 9
**Classification:** 7 new bugs | 1 undocumented quirk | 1 documentation discrepancy

## Summary by Severity

| Severity | Count | Bug IDs |
|----------|-------|---------|
| Critical | 0     | —       |
| High     | 3     | BUG-002, BUG-003, BUG-007 |
| Medium   | 5     | BUG-001, BUG-004, BUG-005, BUG-006, BUG-008 |
| Low      | 1     | BUG-009 |

---

## High Severity

### [BUG-002] Double-click Add to Cart creates duplicate cart items

**Page:** HomePage `/` → CartPage `/cart`
**Reproduction test:** `tests/bug-discovery/element-bugs.spec.ts:L50`

**Steps:**
1. Login as testuser1
2. Navigate to homepage
3. Double-click the "Add to Cart" button on any book card
4. Navigate to `/cart`

**Expected:** A single cart item with quantity 2
**Actual:** Two separate cart items for the same book, each with quantity 1. Cart badge shows "2", total shows double the book price.

**Root cause:** `BookCard.handleAdd()` has no debounce or click-prevention. Two concurrent `POST /cart/items` requests create two separate cart item documents. Backend should upsert on bookId instead of always creating.

**Evidence:** `tests/e2e/evidence/BUG-002-duplicate-cart-items.png`

---

### [BUG-003] Sidebar balance not updated immediately after checkout

**Page:** OrderDetailPage `/orders/:id`
**Reproduction test:** `tests/bug-discovery/element-bugs.spec.ts:L94`

**Steps:**
1. Login as testuser1 (balance: $100.00)
2. Add "To Kill a Mockingbird" ($12.99) to cart
3. Navigate to cart and click Checkout
4. Observe sidebar balance on order detail page

**Expected:** Sidebar balance should show $87.01 immediately
**Actual:** Sidebar still displays $100.00 until next full page navigation

**Root cause:** `CartPage.handleCheckout()` never calls `AuthContext.refreshUser()`. The `user.balance` remains stale.

**Evidence:** `tests/e2e/evidence/BUG-003-balance-not-updated-after-checkout.png`

---

### [BUG-007] Checkout with insufficient balance shows no error message

**Page:** CartPage `/cart`
**Reproduction test:** `tests/bug-discovery/element-bugs.spec.ts:L182`

**Steps:**
1. Login as testuser1 (balance: $100.00)
2. Add expensive items exceeding $100 total (e.g., Dune $16.99 x 7 = $118.93)
3. Click Checkout

**Expected:** Error message like "Insufficient balance"
**Actual:** Silent failure — stays on cart page with no error message or feedback

**Root cause:** `CartPage.handleCheckout()` catch block is empty; only `finally` resets loading state. The API 400 error is swallowed silently.

**Evidence:** `tests/e2e/evidence/BUG-007-no-checkout-error-message.png`

---

## Medium Severity

### [BUG-001] Create listing with extreme price shows generic server error

**Page:** CreateListingPage `/marketplace/sell`
**Reproduction test:** `tests/bug-discovery/element-bugs.spec.ts:L19`

**Steps:**
1. Login as testuser1
2. Navigate to `/marketplace/sell`
3. Select any book, enter price: `999999999`
4. Click "Create Listing"

**Expected:** Specific validation error (e.g., "Price must be less than $10,000")
**Actual:** Displays "An unexpected error occurred" — generic server error

**Root cause:** Backend `MarketplaceService` lacks a `@Max` constraint on the price field.

**Evidence:** `tests/e2e/evidence/BUG-001.png`

---

### [BUG-004] Cart badge shows stale count after successful checkout

**Page:** OrderDetailPage `/orders/:id`
**Reproduction test:** `tests/bug-discovery/flow-bugs.spec.ts:L16`

**Steps:**
1. Login, add book to cart (badge shows "1")
2. Navigate to cart, click Checkout
3. On order detail page, observe cart badge

**Expected:** Cart badge should disappear (cart is empty)
**Actual:** Cart badge still shows "1"

**Root cause:** `handleCheckout()` doesn't call `fetchCart()` or `clearCart()` after order creation. Same root cause as BUG-003.

---

### [BUG-005] Marketplace accepts absurdly low price listing ($0.01)

**Page:** CreateListingPage `/marketplace/sell`
**Reproduction test:** `tests/bug-discovery/element-bugs.spec.ts:L134`

**Steps:**
1. Login, navigate to `/marketplace/sell`
2. Select book, enter price: `0.01`, submit

**Expected:** Validation error — minimum price should be enforced
**Actual:** Listing created successfully at $0.01

**Evidence:** `tests/e2e/evidence/BUG-005-no-minimum-price-validation.png`

---

### [BUG-006] Invalid routes show blank page instead of 404

**Page:** Any invalid route (e.g., `/nonexistent-page`)
**Reproduction test:** `tests/bug-discovery/element-bugs.spec.ts:L162`

**Steps:**
1. Navigate to any invalid route

**Expected:** "Page not found" or 404 message
**Actual:** Blank main content area with only sidebar visible

**Root cause:** `App.jsx` Routes has no `<Route path="*">` fallback.

**Evidence:** `tests/e2e/evidence/BUG-006-no-404-page.png`

---

### [BUG-008] Search input not synced with URL query parameter

**Page:** HomePage `/?query=...`
**Reproduction test:** `tests/bug-discovery/flow-bugs.spec.ts:L58`

**Steps:**
1. Navigate to `/?query=Dune`
2. Results correctly show only "Dune"
3. Check search input field value

**Expected:** Search input shows "Dune"
**Actual:** Search input is empty

**Root cause:** `SearchBar` initializes with `useState('')` and never reads URL search params.

**Evidence:** `tests/e2e/evidence/BUG-008-search-input-not-synced-with-url.png`

---

## Low Severity

### [BUG-009] Documentation lists wrong condition values

**Page:** CreateListingPage `/marketplace/sell`
**Reproduction test:** `tests/bug-discovery/flow-bugs.spec.ts:L85`

**Steps:**
1. `app-context.md` documents conditions as "EXCELLENT/GOOD/FAIR"
2. Actual UI shows "NEW/LIKE_NEW/GOOD/FAIR"

**Expected:** Documentation matches actual UI
**Actual:** Documentation is outdated

---

## Verification Summary

All 9 bugs were verified through automated re-runs (2x per test, 0 flakes) and failure screenshot analysis. Selected bugs were also reproduced manually via browser.

| Bug ID | Verdict | Flake Rate |
|--------|---------|------------|
| BUG-001 | Confirmed | 0% |
| BUG-002 | Confirmed | 0% |
| BUG-003 | Confirmed | 0% |
| BUG-004 | Confirmed | 0% |
| BUG-005 | Confirmed | 0% |
| BUG-006 | Confirmed | 0% |
| BUG-007 | Confirmed | 0% |
| BUG-008 | Confirmed | 0% |
| BUG-009 | Confirmed | 0% |

---

## Recommendations

1. **BUG-002 (High):** Add debounce/disable to "Add to Cart" button; backend should upsert cart items on bookId.
2. **BUG-003/004 (High/Medium):** Call `AuthContext.refreshUser()` and `CartContext.clearCart()` after successful checkout.
3. **BUG-007 (High):** Display error message in catch block of `handleCheckout()`.
4. **BUG-001 (Medium):** Add `@Max` validation on price field in backend DTO.
5. **BUG-005 (Medium):** Add minimum price validation (e.g., $1.00).
6. **BUG-006 (Medium):** Add `<Route path="*" element={<NotFound />} />` fallback.
7. **BUG-008 (Medium):** Initialize SearchBar from URL `query` parameter.
8. **BUG-009 (Low):** Update `app-context.md` to reflect actual condition values.
