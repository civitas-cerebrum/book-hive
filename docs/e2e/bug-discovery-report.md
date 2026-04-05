# Bug Discovery Report

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0     |
| High     | 4     |
| Medium   | 5     |
| Low      | 1     |
| **Total** | **10** |

**Discovery method:** Adversarial probing (Phases 1a & 1b) followed by context cross-reference (Phases 2-5).
**Pages probed:** `/`, `/books/:id`, `/login`, `/signup`, `/cart`, `/orders`, `/orders/:id`, `/marketplace`, `/marketplace/sell`, `/profile`, `/nonexistent-page`
**Flows tested:** Purchase + checkout, return orders, marketplace listing, logout/login persistence, insufficient balance checkout, cross-journey intersection, browser back navigation
**Areas NOT probed:** Mobile viewport responsive behavior, concurrent multi-user scenarios (two different users in two browser contexts), WebSocket/real-time updates, accessibility (a11y) compliance

---

## Findings

### BUG-001 | Extreme price listing shows generic error instead of validation message

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Classification** | New bug |
| **Phase discovered** | 1a (Element probing) |
| **Page** | `/marketplace/sell` |
| **Reproduction test** | `element-bugs.spec.ts` - "listing with extreme price shows generic error" |

**Steps:**
1. Login as testuser1
2. Navigate to `/marketplace/sell`
3. Select a book from dropdown
4. Enter price: `999999999`
5. Click "Create Listing"

**Expected:** A clear validation error like "Price must be less than $10,000"
**Actual:** Generic "An unexpected error occurred" message — the backend returns 500 instead of a proper validation response.

---

### BUG-002 | No 404 page for invalid routes

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Classification** | New bug |
| **Phase discovered** | 1a (Element probing) |
| **Page** | Any invalid route (e.g. `/nonexistent-page`) |
| **Reproduction test** | `element-bugs.spec.ts` - "no 404 page for invalid routes" |

**Steps:**
1. Navigate to `/nonexistent-page`
2. Observe main content area

**Expected:** A "Page not found" or "404" message with guidance to navigate back
**Actual:** The navigation sidebar renders, but the main content area is completely **blank** with no feedback.

---

### BUG-003 | Backend returns 500 for negative price listing

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Classification** | New bug |
| **Phase discovered** | 1a (Element probing) |
| **Page** | `/api/marketplace/listings` (API) |
| **Reproduction test** | `element-bugs.spec.ts` - "backend returns 500 for negative price listing" |

**Steps:**
1. Login and POST to `/api/marketplace/listings` with `{ bookId: "book-001", condition: "GOOD", price: -5 }`
2. Observe response

**Expected:** `400 Bad Request` with message like "Price must be positive"
**Actual:** `500 Internal Server Error` with "An unexpected error occurred" — the backend crashes instead of validating.

---

### BUG-004 | Floating point precision issue in balance

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Classification** | New bug |
| **Phase discovered** | 1a (Element probing) / 1b (Flow probing) |
| **Page** | `/api/auth/me` (API), sidebar balance display |
| **Reproduction test** | `element-bugs.spec.ts` - "floating point precision issue in balance" |

**Steps:**
1. Starting balance: $100.00
2. Purchase and return several books with prices like $12.99, $11.99, $11.49
3. Fetch balance from `GET /api/auth/me`

**Expected:** Balance is a clean decimal like `$81.02`
**Actual:** Balance returns as `81.02000000000001` (IEEE 754 floating-point drift). Backend uses `Double` type without rounding to 2 decimal places.

---

### BUG-005 | Stale balance display after checkout

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Classification** | New bug |
| **Phase discovered** | 1b (Flow probing) |
| **Page** | `/orders/:id` (order confirmation page) |
| **Reproduction test** | `flow-bugs.spec.ts` - "balance display is stale on order confirmation page" |

**Steps:**
1. Login (balance shows $100.00)
2. Add a book to cart ($12.99) and checkout
3. Observe the sidebar balance on the order confirmation page

**Expected:** Balance updates to $87.01
**Actual:** Balance still shows $100.00 (the pre-checkout value). The sidebar state is not refreshed after the checkout API call succeeds. Only navigating away and back updates it.

---

### BUG-006 | Stale cart badge after checkout

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Classification** | New bug |
| **Phase discovered** | 1b (Flow probing) |
| **Page** | `/orders/:id` (order confirmation page) |
| **Reproduction test** | `flow-bugs.spec.ts` - "cart badge still shows item count after checkout" |

**Steps:**
1. Login, add a book to cart (badge shows "Cart1")
2. Checkout
3. Observe the cart badge on the order confirmation page

**Expected:** Cart badge shows "Cart" (no number) since the cart was cleared on checkout
**Actual:** Cart badge still shows "Cart1" (stale state). The cart was cleared server-side but the UI nav state was not refreshed.

---

### BUG-007 | Cart badge count not loaded on login

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Classification** | Known but untested (documented in spec: "Cart survives logout/login") |
| **Phase discovered** | 1b (Flow probing) / Phase 4 (Context-derived) |
| **Page** | `/` (homepage after login) |
| **Reproduction test** | `flow-bugs.spec.ts` - "cart badge count not loaded on login" |

**Steps:**
1. Login, add a book to cart (badge shows "Cart1")
2. Logout
3. Login again
4. Observe the cart badge

**Expected:** Cart badge should show "Cart1" (items are persisted server-side)
**Actual:** Cart badge shows "Cart" (no count). The app does not fetch the cart count on login. Navigating to `/cart` correctly shows the items and updates the badge.

---

### BUG-008 | No visible error message for insufficient balance checkout

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Classification** | New bug |
| **Phase discovered** | 1b (Flow probing) |
| **Page** | `/cart` |
| **Reproduction test** | `flow-bugs.spec.ts` - "no visible error message when checkout fails" |

**Steps:**
1. New user with $100 balance
2. Add items totaling > $100 to cart (e.g. 7x Dune @ $16.99 = $118.93)
3. Click "Checkout"

**Expected:** An error message like "Insufficient balance" appears on the cart page
**Actual:** The page stays on `/cart` with **zero feedback**. The API returns 400 "Insufficient balance" but the frontend swallows the error — no toast, no inline message, nothing. The AxiosError appears only in the browser console.

---

### BUG-009 | Misleading error for already-returned order

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Classification** | New bug |
| **Phase discovered** | 1b (Flow probing) |
| **Page** | `/api/orders/:id/return` (API) |
| **Reproduction test** | `flow-bugs.spec.ts` - "misleading error when returning already-returned order" |

**Steps:**
1. Purchase a book
2. Return the order (status becomes RETURNED)
3. Call `POST /api/orders/:id/return` again

**Expected:** `400` with message "Order already returned"
**Actual:** `400` with message "Return window has expired" — this is misleading. The two states (time expired vs. already returned) are conflated. A user who just returned an order and mistakenly clicks again would be confused by a "window expired" message.

---

### BUG-010 | Empty response body for 404 order API

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Classification** | New bug |
| **Phase discovered** | 1a (Element probing) / Phase 4 (Context-derived) |
| **Page** | `/api/orders/:id` (API) |
| **Reproduction test** | `context-derived-bugs.spec.ts` - "API returns empty body for 404" |

**Steps:**
1. Authenticated user fetches `GET /api/orders/aaaaaaaaaaaaaaaaaaaaaaaa`

**Expected:** `404` with JSON body `{"error": "not_found", "message": "Order not found"}`
**Actual:** `404` with an **empty response body**. Every other error endpoint returns JSON, making this inconsistent. The frontend logs an unhandled `JSON.parse` error in the console when it tries to parse the empty body.

---

### BUG-011 | Sidebar balance does not auto-refresh after API purchase

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Classification** | Context-derived (design spec discrepancy) |
| **Phase discovered** | Phase 4 (Context-derived) |
| **Page** | Navigation sidebar (all pages) |
| **Reproduction test** | `context-derived-bugs.spec.ts` - "sidebar balance does not auto-refresh" |

**Steps:**
1. Login and note balance in sidebar
2. Perform a checkout via API (or through the app's own checkout flow)
3. Without navigating, check sidebar balance

**Expected:** Balance updates automatically (design spec states "API state changes reflect in UI")
**Actual:** Balance remains stale until a full page navigation occurs. There is no polling, WebSocket, or state refresh mechanism for the sidebar balance.

---

## Undocumented Quirks (User Decision Required)

| Quirk | Observation | Possible Justification |
|-------|-------------|----------------------|
| **Search drops genre filter** | Searching from a genre-filtered view (`/?genre=Fiction`) replaces the genre with `?query=...` instead of combining both | May be intentional — "search all books" vs "search within genre" |
| **Add to Cart increments silently** | Clicking "Add to Cart" multiple times from homepage increases quantity with no feedback (no toast, no badge animation) | May be by design for simplicity, but confusing for users who click twice accidentally |
| **Console 403 on unauthenticated pages** | Every page load fires `GET /api/auth/me` which returns 403 when not logged in, logging an error to the console | Expected behavior for cookie-based auth check, but pollutes the console |

---

## Coverage Notes

### Pages Probed
- `/` (homepage) - search, pagination, genre filters, add to cart, theme toggle
- `/books/:id` - book detail, add to cart, non-existent book
- `/login` - form validation, empty submit, invalid credentials
- `/signup` - form validation, XSS in username, duplicate email
- `/cart` - quantity controls, clear cart, checkout, insufficient balance
- `/orders` - order list, order card navigation
- `/orders/:id` - order detail, return button, return window
- `/marketplace` - listing display, own listing (no buy button)
- `/marketplace/sell` - form validation, zero price, negative price, extreme price
- `/profile` - user info, listings management, cancel listing
- `/nonexistent-page` - 404 handling

### Flows Tested
- Full purchase flow (browse -> cart -> checkout -> order detail)
- Return flow (order detail -> return -> refund)
- Logout/login persistence (cart items survive)
- Insufficient balance checkout (error handling)
- Browser back after checkout
- Genre filter -> search -> back navigation
- Create and cancel marketplace listing
- Double-click / rapid-click race conditions

### Categories Covered
- Boundary inputs (XSS, SQL injection, extreme values, negative numbers, whitespace)
- State transitions (back navigation, refresh, re-submit)
- Race conditions (double-click add to cart, rapid pagination, simultaneous return API calls)
- Permission/access (direct URL access without auth, accessing other user's resources)
- Data edge cases (empty lists, last page pagination, non-existent resources)
- API-level validation (negative prices, empty cart checkout, buying own listing)

### Areas Not Probed
- Mobile responsive layout (viewport < 768px, hamburger menu)
- Concurrent multi-user scenarios (two browser contexts with different users)
- WebSocket/real-time update mechanisms
- Accessibility (ARIA labels, keyboard navigation, screen reader compatibility)
- Performance/load testing (memory leaks, DOM growth over time)
- Image/asset loading (no images in current app)
