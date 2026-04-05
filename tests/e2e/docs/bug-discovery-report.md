# Bug Discovery Report

**Date:** 2026-04-05
**App:** http://localhost:7547
**Total findings:** 9
**New bugs:** 7 | **Regression candidates:** 0 | **Undocumented quirks:** 1 | **Known but untested:** 1

---

## Summary by Severity

| Severity | Count | Bug IDs |
|----------|-------|---------|
| Critical | 0     | —       |
| High     | 3     | BUG-002, BUG-003, BUG-007 |
| Medium   | 5     | BUG-001, BUG-004, BUG-005, BUG-006, BUG-008 |
| Low      | 1     | BUG-009 |

---

## Findings

### [BUG-001] Create listing with extreme price shows generic server error
*(Previously discovered — carried forward)*

**Severity:** Medium
**Classification:** New bug
**Phase discovered:** 1a (Element Probing)
**Page:** CreateListingPage — `/marketplace/sell`
**Reproduction test:** `tests/bug-discovery/element-bugs.spec.ts` — test line 19

**Steps:**
1. Login as testuser1
2. Navigate to `/marketplace/sell`
3. Select any book from the dropdown
4. Enter price: `999999999`
5. Click "Create Listing"

**Expected:** A specific validation error message such as "Price must be less than $10,000"
**Actual:** Displays "An unexpected error occurred" — a generic server error with no actionable guidance

**Root cause:** Backend `MarketplaceService` lacks a `@Max` constraint on the price field. The Spring Boot exception handler catches the error generically instead of returning a 400 with a validation message.

**Screenshot:** `tests/e2e/evidence/BUG-001.png`

---

### [BUG-002] Double-click Add to Cart creates duplicate cart items

**Severity:** High
**Classification:** New bug
**Phase discovered:** 1a (Element Probing)
**Page:** HomePage — `/` → CartPage — `/cart`
**Reproduction test:** `tests/bug-discovery/element-bugs.spec.ts` — test line 50

**Steps:**
1. Login as testuser1
2. Navigate to homepage
3. Double-click the "Add to Cart" button on any book card
4. Navigate to `/cart`
5. Observe TWO separate cart items for the same book (each qty 1) instead of ONE item with qty 2

**Expected:** A single cart item with quantity 2 (or the second click should be debounced/ignored)
**Actual:** Two separate cart items are created for the same book, each with quantity 1. Total shows double the price.

**Root cause:** The `BookCard.handleAdd()` function is `async` but has no debounce or click-prevention mechanism. When double-clicked, two concurrent `POST /cart/items` requests are sent before the first one completes. The backend creates two separate cart item documents instead of merging them (upsert on bookId).

**Screenshot:** `tests/e2e/evidence/BUG-002-duplicate-cart-items.png`

---

### [BUG-003] Sidebar balance not updated immediately after checkout

**Severity:** High
**Classification:** New bug
**Phase discovered:** 1a (Element Probing)
**Page:** OrderDetailPage — `/orders/:id` (after checkout redirect)
**Reproduction test:** `tests/bug-discovery/element-bugs.spec.ts` — test line 94

**Steps:**
1. Login as testuser1 (balance: $100.00)
2. Add "To Kill a Mockingbird" ($12.99) to cart
3. Navigate to cart and click Checkout
4. On the order detail page, observe the sidebar balance

**Expected:** Sidebar balance should show $87.01 immediately after checkout
**Actual:** Sidebar still displays $100.00. Balance only updates after navigating to another page (e.g., Profile).

**Root cause:** `CartPage.handleCheckout()` calls `api.post('/orders')` then `navigate()` but never calls `AuthContext.refreshUser()`. The `user.balance` in `AuthContext` remains stale until the next page that triggers a user data fetch.

**Screenshot:** `tests/e2e/evidence/BUG-003-balance-not-updated-after-checkout.png`

---

### [BUG-004] Cart badge shows stale count after successful checkout

**Severity:** Medium
**Classification:** New bug (same root cause as BUG-003)
**Phase discovered:** 1a (Element Probing)
**Page:** OrderDetailPage — `/orders/:id` (after checkout redirect)
**Reproduction test:** `tests/bug-discovery/flow-bugs.spec.ts` — test line 16

**Steps:**
1. Login as testuser1
2. Add a book to cart (cart badge shows "1")
3. Navigate to cart and click Checkout
4. On the order detail page, observe the cart badge in sidebar

**Expected:** Cart badge should disappear (cart is empty after checkout)
**Actual:** Cart badge still shows "1" on the order detail page

**Root cause:** `CartPage.handleCheckout()` navigates to the order detail page after checkout but never calls `CartContext.fetchCart()` or `CartContext.clearCart()`. The `items` array in `CartContext` remains stale with the pre-checkout items.

**Screenshot:** `tests/e2e/evidence/BUG-003-balance-not-updated-after-checkout.png` (same screenshot — both issues visible)

---

### [BUG-005] Marketplace accepts absurdly low price listing ($0.01)

**Severity:** Medium
**Classification:** New bug
**Phase discovered:** 1a (Element Probing)
**Page:** CreateListingPage — `/marketplace/sell`
**Reproduction test:** `tests/bug-discovery/element-bugs.spec.ts` — test line 134

**Steps:**
1. Login as testuser1
2. Navigate to `/marketplace/sell`
3. Select any book
4. Enter price: `0.01`
5. Click "Create Listing"

**Expected:** Validation error such as "Price must be at least $1.00"
**Actual:** Listing is created successfully with a price of $0.01 and user is redirected to marketplace

**Root cause:** Neither the frontend form validation (`min="0.01"` allows $0.01) nor the backend has a reasonable minimum price constraint. The HTML min attribute only prevents values below $0.01 but doesn't enforce a business-logic minimum.

**Screenshot:** `tests/e2e/evidence/BUG-005-no-minimum-price-validation.png`

---

### [BUG-006] Invalid routes show blank page instead of 404

**Severity:** Medium
**Classification:** New bug
**Phase discovered:** 1a (Element Probing)
**Page:** Any invalid route (e.g., `/nonexistent-page`)
**Reproduction test:** `tests/bug-discovery/element-bugs.spec.ts` — test line 162

**Steps:**
1. Navigate to any invalid route (e.g., `/this-route-does-not-exist`)
2. Observe the page content

**Expected:** A "Page not found" or "404" message in the main content area
**Actual:** Blank main content area with only the sidebar visible. No user feedback whatsoever.

**Root cause:** `App.jsx` `<Routes>` has no catch-all `<Route path="*">` fallback. When no route matches, React Router renders nothing inside `<main>`, resulting in a blank page.

**Screenshot:** `tests/e2e/evidence/BUG-006-no-404-page.png`

---

### [BUG-007] Checkout with insufficient balance shows no error message

**Severity:** High
**Classification:** New bug
**Phase discovered:** 1a (Element Probing)
**Page:** CartPage — `/cart`
**Reproduction test:** `tests/bug-discovery/element-bugs.spec.ts` — test line 182

**Steps:**
1. Login as testuser1 (balance: $100.00)
2. Add expensive items to cart exceeding $100 total (e.g., Dune $16.99 x 7 = $118.93)
3. Click Checkout
4. Observe the page

**Expected:** An error message like "Insufficient balance" or "Cannot complete checkout — your balance ($100.00) is less than the cart total ($118.93)"
**Actual:** The checkout silently fails — stays on cart page with no error message, no feedback, nothing. User has no idea why checkout didn't work.

**Root cause:** `CartPage.handleCheckout()` has a `try/catch/finally` but the `catch` block is empty — it only has a `finally` that resets `setChecking(false)`. The API returns a 400 error, but it's completely swallowed with no user-facing feedback.

**Screenshot:** `tests/e2e/evidence/BUG-007-no-checkout-error-message.png`

---

### [BUG-008] Search input not synced with URL query parameter

**Severity:** Medium
**Classification:** New bug
**Phase discovered:** 1b (Flow Probing)
**Page:** HomePage — `/?query=...`
**Reproduction test:** `tests/bug-discovery/flow-bugs.spec.ts` — test line 58

**Steps:**
1. Navigate to `/?query=Dune`
2. Verify search results correctly show only "Dune"
3. Check the search input field value

**Expected:** Search input should display "Dune" reflecting the active query from the URL
**Actual:** Search input is empty (`""`) even though the URL has `?query=Dune` and results are correctly filtered

**Root cause:** `SearchBar` component initializes with `useState('')` and never reads the `query` parameter from URL search params. The `HomePage` reads `searchParams.get('query')` for API calls but doesn't pass it to `SearchBar`.

**Screenshot:** `tests/e2e/evidence/BUG-008-search-input-not-synced-with-url.png`

---

### [BUG-009] Documentation lists wrong condition values

**Severity:** Low
**Classification:** Undocumented quirk (documentation discrepancy)
**Phase discovered:** 4 (Context-Derived Analysis)
**Page:** CreateListingPage — `/marketplace/sell`
**Reproduction test:** `tests/bug-discovery/flow-bugs.spec.ts` — test line 85

**Steps:**
1. Open `app-context.md` and read MarketplacePage section
2. Note documented conditions: "EXCELLENT/GOOD/FAIR"
3. Navigate to `/marketplace/sell`
4. Check condition dropdown options

**Expected (per docs):** EXCELLENT, GOOD, FAIR
**Actual:** NEW, LIKE_NEW, GOOD, FAIR

**Root cause:** `app-context.md` documentation is outdated or was incorrectly documented. The actual frontend `CreateListingPage.jsx` defines `CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']`.

---

## Undocumented Quirks (User Decision Required)

| # | Description | Recommendation |
|---|-------------|----------------|
| 1 | Cart quantity "+" button doesn't disable at stock limit. Backend enforces limit (400 error) but frontend silently fails — no UI feedback. | Consider disabling "+" when qty equals stock, or showing a toast/message. |
| 2 | `app-context.md` lists condition values as EXCELLENT/GOOD/FAIR but actual UI uses NEW/LIKE_NEW/GOOD/FAIR. | Update documentation or update code to match docs. |

---

## Coverage Notes

### Pages Probed: 10/10
- `/` (HomePage) — search, pagination, genre filter, add to cart
- `/books/:id` (BookDetailPage) — add to cart, non-existent book
- `/login` (LoginPage) — form submission, validation
- `/signup` (SignupPage) — form fields
- `/cart` (CartPage) — qty controls, checkout, clear cart, insufficient balance
- `/orders` (OrdersPage) — order list
- `/orders/:id` (OrderDetailPage) — return button, non-existent order
- `/marketplace` (MarketplacePage) — listing cards, buy button
- `/marketplace/sell` (CreateListingPage) — form validation, boundary prices
- `/profile` (ProfilePage) — user info, listings management

### Probing Categories Covered
- **Boundary inputs:** Empty/whitespace search, XSS payloads, extreme prices, minimum prices, max quantities
- **State transitions:** Browser back after submit, logout/login cart persistence, balance after checkout/return
- **Race conditions:** Double-click on Add to Cart, double-click on Checkout, double-click on Buy, rapid qty increment
- **Permission/access:** Protected routes after logout, non-existent order IDs, own vs other user listings
- **Data edge cases:** Empty cart, insufficient balance checkout, stock limit, non-existent routes
- **Cross-feature:** Marketplace buy flow across users, search state with URL params

### Flows Tested: 5 adversarial flows
1. Double-click Add to Cart → duplicate items
2. Cart persistence across logout/login cycle
3. Marketplace cross-user buy flow (user1 sells → user2 buys)
4. Search → book detail → browser back (state preservation)
5. Protected route access after logout

### Areas Not Probed
- Concurrent tab state (two browser tabs with same user — limited by single-tab test framework)
- WebSocket/real-time features (none present)
- Journey intersection/handoff/collision (journey-map.json not available)
- Mobile-specific interaction patterns (responsive tests exist in existing suite)
