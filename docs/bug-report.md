# Bug Report — BookHive E2E Test Discovery

**Date:** 2026-04-06
**Branch:** `qa/onboarding-v2`
**Total Bugs Found:** 14
**Critical:** 4 | **Major:** 5 | **Minor:** 5

---

## Critical Bugs

### BUG-001: Double-checkout race condition creates phantom orders and enables money duplication

| Field | Detail |
|-------|--------|
| **Severity** | Critical |
| **Category** | Race Condition |
| **Test File** | `specs/bug-race-conditions.spec.ts` |

**Description:** Concurrent `POST /api/orders` requests both succeed when cart has items. Two orders are created but balance is only deducted once and stock only decremented once. Returning both orders yields a net profit — balance exceeds the original $100 and stock inflates above original levels.

**Impact:** Financial — users can duplicate money. Inventory — stock integrity violated. Exploitable by any authenticated user.

**Reproduction Steps:**
1. Login, add a book to cart.
2. Fire 2+ concurrent `POST /api/orders`.
3. Both return 200 with different order IDs.
4. Balance only decremented once.
5. Return both orders → balance > $100.

**Root Cause:** `OrderService.checkout()` has no concurrency control — no optimistic locking, no synchronized block, no database-level atomic operation. Multiple threads read the same cart state before any clears it.

**Recommended Fix:** Add `@Version` field to CartItem/Order for optimistic locking, or use MongoDB transactions, or implement a distributed lock on checkout per userId.

---

### BUG-002: Double-return race condition issues multiple refunds for single order

| Field | Detail |
|-------|--------|
| **Severity** | Critical |
| **Category** | Race Condition |
| **Test File** | `specs/bug-race-conditions.spec.ts` |

**Description:** Concurrent `POST /api/orders/{id}/return` requests on the same order succeed multiple times. The `isReturnEligible()` check passes for all concurrent requests before any updates the status to RETURNED. Each successful return refunds the full order amount and restores stock.

**Impact:** Financial — unlimited money generation. Inventory — stock inflation. Exploitable by any authenticated user with a recent order.

**Reproduction Steps:**
1. Login, purchase a book.
2. Fire 5+ concurrent `POST /api/orders/{id}/return`.
3. Multiple requests return 200.
4. Balance exceeds original amount.
5. Stock exceeds original count.

**Root Cause:** `OrderService.returnOrder()` reads order status and checks `isReturnEligible()` non-atomically. Race window between status check and status update allows multiple refunds.

**Recommended Fix:** Use MongoDB `findAndModify` with status check (atomic update) or optimistic locking with `@Version`.

---

### BUG-003: Double-buy marketplace race creates multiple orders from single listing

| Field | Detail |
|-------|--------|
| **Severity** | Critical |
| **Category** | Race Condition |
| **Test File** | `specs/bug-race-conditions.spec.ts` |

**Description:** Concurrent `POST /api/marketplace/listings/{id}/buy` requests all succeed. Multiple orders are created, buyer is charged multiple times, and seller receives multiple payments — all from a single listing that should only be sold once.

**Impact:** Financial — buyer overcharged, seller overpaid. Data integrity — phantom orders with no corresponding listing. Exploitable by any pair of users.

**Reproduction Steps:**
1. User1 creates listing at $5.99.
2. User2 fires 5 concurrent buy requests.
3. Multiple succeed (typically 2–5).
4. Buyer charged N x $5.99.
5. Seller receives N x $5.99.

**Root Cause:** `MarketplaceService.buyListing()` checks listing status ACTIVE non-atomically. Multiple threads all see ACTIVE before any sets it to SOLD.

**Recommended Fix:** Use MongoDB `findOneAndUpdate` with `{status: 'ACTIVE'}` filter to atomically claim the listing.

---

### BUG-004: Concurrent add-to-cart bypasses deduplication creating duplicate entries

| Field | Detail |
|-------|--------|
| **Severity** | Critical |
| **Category** | Race Condition |
| **Test File** | `specs/bug-race-conditions.spec.ts` |

**Description:** Concurrent `POST /api/cart/items` for the same bookId creates multiple separate cart entries instead of consolidating into a single entry with accumulated quantity. At checkout, each duplicate entry is processed separately — the user is charged for all duplicates but stock is only decremented once per bookId.

**Impact:** Financial — user charged correctly but stock undercount leads to overselling. Inventory — sold items not fully deducted from stock.

**Reproduction Steps:**
1. Login.
2. Fire 2+ concurrent `POST /api/cart/items` with same bookId and qty=1.
3. Cart shows 2+ separate entries for same bookId.
4. Checkout charges for all entries but stock only decremented once.

**Root Cause:** `CartService.addItem()` checks for existing cart item by bookId then either updates or inserts. The check-then-act is non-atomic, so concurrent requests both see "not found" and both insert.

**Recommended Fix:** Use MongoDB upsert with `{userId, bookId}` as the filter, or use unique compound index on `(userId, bookId)`.

---

## Major Bugs

### BUG-005: Sidebar balance not updated after checkout

| Field | Detail |
|-------|--------|
| **Severity** | Major |
| **Category** | Stale UI |
| **Test File** | `specs/bug-stale-ui.spec.ts` |

**Description:** After successful checkout, the sidebar balance display continues showing the pre-checkout amount ($100.00) instead of the updated balance. The correct value only appears after a full page reload.

**Impact:** UX — user sees incorrect balance, may attempt purchases they cannot afford. No financial impact (server-side balance is correct).

**Reproduction Steps:**
1. Login (balance $100).
2. Add book ($12.99) to cart.
3. Checkout.
4. Sidebar still shows $100.00.
5. Reload page → shows $87.01.

**Root Cause:** `CartPage.jsx handleCheckout()` navigates to order page after checkout but does not call `refreshUser()` or any mechanism to update the sidebar balance. The AuthContext user object retains the stale balance.

**Recommended Fix:** Call `refreshUser()` from AuthContext after successful checkout, or update the user state locally after the checkout API response.

---

### BUG-006: Cart badge not cleared after checkout

| Field | Detail |
|-------|--------|
| **Severity** | Major |
| **Category** | Stale UI |
| **Test File** | `specs/bug-stale-ui.spec.ts` |

**Description:** After successful checkout, the cart badge in the sidebar still shows the pre-checkout item count (e.g., "1") even though the cart is now empty server-side. The badge only disappears after a page reload.

**Impact:** UX — user sees stale cart count, may think items are still in cart.

**Reproduction Steps:**
1. Login, add item to cart (badge shows "1").
2. Checkout.
3. Badge still shows "1".
4. Reload → badge disappears.

**Root Cause:** Checkout does not trigger a cart state refresh. The CartContext items array is not cleared after checkout.

**Recommended Fix:** Call `clearCart()` or `fetchCart()` from CartContext after successful checkout to reset the cart state.

---

### BUG-007: Cart badge not shown after re-login despite server-side cart items

| Field | Detail |
|-------|--------|
| **Severity** | Major |
| **Category** | Stale UI |
| **Test File** | `specs/bug-stale-ui.spec.ts` |

**Description:** After logout and re-login, the cart badge does not appear on the home page even though the user has items in their server-side cart. The badge only appears after navigating to a page that triggers a cart fetch.

**Impact:** UX — user doesn't know they have items in cart after logging back in.

**Reproduction Steps:**
1. Login, add item to cart (badge shows "1").
2. Logout.
3. Login again.
4. Badge is absent.
5. Navigate to /cart → items are there.

**Root Cause:** Login flow does not fetch cart data. The CartContext initializes with empty items and only fetches on cart-related page visits or add-to-cart actions.

**Recommended Fix:** Call `fetchCart()` after successful login to initialize the cart badge.

---

### BUG-008: Checkout failure silently swallowed — no error feedback to user

| Field | Detail |
|-------|--------|
| **Severity** | Major |
| **Category** | Silent Error |
| **Test File** | `specs/bug-silent-errors.spec.ts` |

**Description:** When checkout fails (insufficient balance, out of stock, network error), the CartPage shows zero visual feedback. The Checkout button returns to idle state and the user has no idea why the purchase did not complete.

**Impact:** UX — user cannot understand why checkout failed. May repeatedly click with no result. Error only visible in browser console.

**Reproduction Steps:**
1. Login as user with $0 balance.
2. Add book to cart.
3. Click Checkout.
4. Button shows "Processing..." then returns to "Checkout".
5. No error message anywhere on page.

**Root Cause:** `CartPage.jsx handleCheckout()` has `try/finally` but no `catch` block. API errors are thrown as unhandled AxiosErrors.

**Recommended Fix:** Add `catch` block to `handleCheckout()` that sets an error state, displayed as a user-visible message (e.g., "Insufficient balance" or "Checkout failed").

---

### BUG-009: Marketplace buy failure silently swallowed — no error feedback

| Field | Detail |
|-------|--------|
| **Severity** | Major |
| **Category** | Silent Error |
| **Test File** | `specs/bug-silent-errors.spec.ts` |

**Description:** When buying a marketplace listing fails (insufficient balance, listing already sold), the ListingCard shows no error. The Buy button returns to idle state silently.

**Impact:** UX — user cannot understand why marketplace purchase failed.

**Reproduction Steps:**
1. Login as user with $0 balance.
2. Navigate to marketplace.
3. Click Buy on a listing.
4. Button shows "Buying..." then returns to "Buy".
5. No error message.

**Root Cause:** `ListingCard.jsx handleBuy()` has `try/finally` but no `catch` block.

**Recommended Fix:** Add `catch` block with error state display on the listing card.

---

## Minor Bugs

### BUG-010: Order return failure silently swallowed — no error feedback

| Field | Detail |
|-------|--------|
| **Severity** | Minor |
| **Category** | Silent Error |
| **Test File** | `specs/bug-silent-errors.spec.ts` |

**Description:** When returning an order fails (API error, network issue), the OrderDetailPage shows no error. The Return Order button returns to idle state silently.

**Reproduction Steps:**
1. Login, view a completed order.
2. Intercept return API to simulate error.
3. Click Return Order.
4. Button shows "Returning..." then returns to "Return Order".
5. No error message.

**Root Cause:** `OrderDetailPage.jsx handleReturn()` has `try/finally` but no `catch` block.

---

### BUG-011: No 404 page — unknown routes render blank main content area

| Field | Detail |
|-------|--------|
| **Severity** | Minor |
| **Category** | UI/UX |
| **Test File** | `specs/bug-ui-ux.spec.ts` |

**Description:** Navigating to any undefined route (e.g., `/nonexistent`, `/admin/settings`) renders the sidebar but a completely blank main content area. No "Page not found" message, no navigation hints.

**Reproduction Steps:**
1. Navigate to `http://localhost:7547/nonexistent-route`.
2. Main area is empty.
3. No "404" or "Page not found" text.

**Root Cause:** `App.jsx` has no catch-all `<Route path='*'>` element.

---

### BUG-012: Search input not synced with URL query parameter

| Field | Detail |
|-------|--------|
| **Severity** | Minor |
| **Category** | UI/UX |
| **Test File** | `specs/bug-ui-ux.spec.ts` |

**Description:** When navigating directly to `/?query=Dune`, the search results are displayed correctly but the search input field is empty.

**Reproduction Steps:**
1. Navigate to `/?query=Dune`.
2. Books matching "Dune" are shown.
3. Search input is empty (should show "Dune").

**Root Cause:** `SearchBar.jsx` initializes search state with `useState('')` and never reads from `searchParams`.

---

### BUG-013: Wrong error message for returning already-returned orders

| Field | Detail |
|-------|--------|
| **Severity** | Minor |
| **Category** | UI/UX |
| **Test File** | `specs/bug-ui-ux.spec.ts` |

**Description:** When attempting to return an order that was already returned, the API responds with "Return window has expired" instead of a more accurate message like "Order already returned".

**Reproduction Steps:**
1. Purchase and return an order.
2. Attempt to return the same order again.
3. Error message: "Return window has expired" (incorrect).

**Root Cause:** `OrderService.returnOrder()` uses `isReturnEligible()` which checks both `status === COMPLETED` AND time window. When status is RETURNED, the check fails but the error message always blames the time window.

---

### BUG-014: Floating point precision artifacts in balance after marketplace transactions

| Field | Detail |
|-------|--------|
| **Severity** | Minor |
| **Category** | UI/UX |
| **Test File** | `specs/bug-ui-ux.spec.ts` |

**Description:** After multiple marketplace buy/sell transactions, user balances display floating point noise (e.g., `$82.03000000000002` instead of `$82.03`).

**Reproduction Steps:**
1. User1 creates 3 listings at $5.99 each.
2. User2 buys all 3.
3. User2 balance: `82.03000000000002` (should be `82.03`).

**Root Cause:** Java `double` type used for monetary calculations. IEEE 754 floating point cannot represent $5.99 exactly.

**Recommended Fix:** Use `BigDecimal` for all monetary fields and calculations, or store amounts in cents as integers.
