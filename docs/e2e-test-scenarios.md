# E2E Test Scenarios — BookHive

**Total tests:** 210 (202 passing, 8 bug reproduction)
**Framework:** Playwright
**Last full run:** 2026-04-05
**Duration:** ~7.4 minutes
**Spec files:** 40 (38 feature tests + 2 bug discovery)

---

## Test Results Summary

| Category | Tests | Status |
|----------|-------|--------|
| Feature tests (e2e/) | 202 | All passing |
| Bug discovery tests (bug-discovery/) | 8 | Failing (intentional — documenting real bugs) |
| **Total** | **210** | **202 pass / 8 fail** |

---

## Feature Test Breakdown

### Authentication — Login (7 tests)
**File:** `tests/e2e/auth-login.spec.ts`

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Displays login form | Open `/login` | Heading, email, password, submit visible |
| 2 | Successful login redirects to homepage | Fill valid credentials, submit | Redirected to `/`, logout button visible |
| 3 | Shows authenticated navigation | Login successfully | Cart, Orders, Sell, Profile links visible |
| 4 | Wrong password shows error | Enter valid email, wrong password | Error message, stays on login |
| 5 | Non-existent email shows error | Enter non-existent email | Error message appears |
| 6 | Has link to signup page | Click "Sign up" link | Navigated to `/signup` |
| 7 | Logout returns to unauthenticated state | Login, click Logout | Login link reappears |

### Authentication — Signup (4 tests)
**File:** `tests/e2e/auth-signup.spec.ts`

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Displays signup form | Open `/signup` | Username, email, password, submit visible |
| 2 | Successful signup redirects | Fill unique credentials, submit | Redirected to homepage |
| 3 | Has link to login page | Click "Sign in" link | Navigated to `/login` |
| 4 | Duplicate email shows error | Submit with existing email | Error message displayed |

### Homepage — Browse Books (8 tests)
**File:** `tests/e2e/homepage-browse.spec.ts`

Covers: book grid display, book cards, pagination, search functionality, book detail navigation.

### Homepage — Genre Chips (4 tests)
**File:** `tests/e2e/homepage-genre-chips.spec.ts`

Covers: genre chip visibility, filtering functionality, active genre highlighting.

### Book Detail (4 tests)
**File:** `tests/e2e/book-detail.spec.ts`

Covers: book info display, add to cart button, stock info, add to cart action.

### Book Detail — Deep (5 tests)
**File:** `tests/e2e/book-detail-deep.spec.ts`

Covers: non-existent book handling, price format, title matching, different books, no auth required.

### Book Detail — Complete (7 tests)
**File:** `tests/e2e/book-detail-complete.spec.ts`

Covers: comprehensive book detail page elements and interactions.

### Book Detail — Extended (8 tests)
**File:** `tests/e2e/book-detail-extended.spec.ts`

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Shows author name | Open book detail | Author name visible |
| 2 | Shows genre badge | Open book detail | Genre badge displayed |
| 3 | Shows description | Open book detail | Description not empty |
| 4 | Sci-fi book correct genre | Navigate to Dune | Shows "Sci-Fi" |
| 5 | Price contains dollar sign | Open book detail | Price includes `$` |
| 6 | Stock shows numeric value | Open book detail | Stock has number |
| 7 | Navigating between books updates content | Open book-001, then book-009 | Titles differ |
| 8 | Non-existent book shows not found | Navigate to `/books/nonexistent-id` | "Book not found" shown |

### Cart & Checkout (6 tests)
**File:** `tests/e2e/cart-checkout.spec.ts`

Covers: empty cart state, add from homepage, add from detail page, total calculation, clear cart, full checkout flow.

### Cart Management (5 tests)
**File:** `tests/e2e/cart-management.spec.ts`

Covers: duplicate book qty increase, different books, total calculation, checkout button, clear button.

### Cart Quantity Management (6 tests)
**File:** `tests/e2e/cart-quantity.spec.ts`

Covers: plus/minus buttons, minus disabled at qty 1, remove item, item titles and prices, total updates.

### Orders (4 tests)
**File:** `tests/e2e/orders.spec.ts`

Covers: auth required, heading visible, orders after checkout, order detail navigation.

### Order Detail (4 tests)
**File:** `tests/e2e/order-detail.spec.ts`

Covers: order info display, items list, return button, return changes status.

### Order Detail — Complete (4 tests)
**File:** `tests/e2e/order-detail-complete.spec.ts`

Covers: complete order detail page elements and interactions.

### Orders — Status (4 tests)
**File:** `tests/e2e/orders-status.spec.ts`

Covers: order status display and filtering.

### Order Return — Extended Flow (4 tests)
**File:** `tests/e2e/order-return-flow.spec.ts`

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | New order shows COMPLETED status | Create order, view orders | Status badge visible |
| 2 | Order detail shows return countdown | Create order, view detail | Return button and timer visible |
| 3 | Order detail shows total price | Create order, view detail | Total contains `$` |
| 4 | Returned order shows RETURNED status | Create order, return it | Status changes to "RETURNED" |

### Marketplace (5 tests)
**File:** `tests/e2e/marketplace.spec.ts`

Covers: heading, content, auth required for selling, form visible, create listing.

### Marketplace — Buy Listing (3 tests)
**File:** `tests/e2e/marketplace-buy.spec.ts`

Covers: buy from another user, listing display, profile listings.

### Marketplace — Listing Details (4 tests)
**File:** `tests/e2e/marketplace-listing-details.spec.ts`

Covers: listing card elements, pricing, seller info.

### Marketplace — Empty State & Own Listings (4 tests)
**File:** `tests/e2e/marketplace-empty-own.spec.ts`

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Shows heading on fresh load | Navigate to marketplace | "Marketplace" heading visible |
| 2 | Own listing hides buy button | Create listing, view as seller | No buy button for own listings |
| 3 | Other user sees buy button | View another user's listing | Buy button visible |
| 4 | Accessible without auth | Navigate without login | Page loads, no redirect |

### Profile (4 tests)
**File:** `tests/e2e/profile.spec.ts`

Covers: auth required, user info, correct data, my listings section.

### Profile — Listings (4 tests)
**File:** `tests/e2e/profile-listings.spec.ts`

Covers: profile listing management and display.

### Navigation (8 tests)
**File:** `tests/e2e/navigation.spec.ts`

Covers: unauthenticated links, category links, genre filter, authenticated links, all navigation links.

### Navigation — Deep (9 tests)
**File:** `tests/e2e/navigation-deep.spec.ts`

Covers: sidebar, browse links, category links, theme toggle persistence, authenticated balance, navigation consistency.

### Genre Filtering (8 tests)
**File:** `tests/e2e/genre-filter.spec.ts`

Covers: Fiction, Sci-Fi, Non-Fiction, Biography, Fantasy, Mystery, author search, sidebar genre navigation.

### Protected Routes (9 tests)
**File:** `tests/e2e/protected-routes.spec.ts`

Covers: Cart, Orders, Profile, Sell pages redirect to login; public pages (homepage, marketplace, book detail, login, signup) remain accessible.

### Theme Toggle (3 tests)
**File:** `tests/e2e/theme-toggle.spec.ts`

Covers: visibility, toggle changes theme, persistence across navigation.

### Pagination Deep (4 tests)
**File:** `tests/e2e/pagination-deep.spec.ts`

Covers: previous disabled on first page, enabled on page 2, multi-page navigation, next disabled on last page.

### Balance Tracking (2 tests)
**File:** `tests/e2e/balance-tracking.spec.ts`

Covers: balance decreases after purchase, balance displayed in sidebar.

### End-to-End Flows (4 tests)
**File:** `tests/e2e/end-to-end-flows.spec.ts`

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Complete purchase flow | Browse → Add to cart → Checkout → View order | Order created successfully |
| 2 | Marketplace flow | Create listing → Another user buys | Transaction completes |
| 3 | Search and navigate | Search for book → Click result → View detail | Correct book displayed |
| 4 | Multi-item checkout | Add multiple books → Checkout | Order contains all items |

---

## Negative Test Coverage

### Negative Auth (6 tests)
**File:** `tests/e2e/negative-auth.spec.ts`

Covers: empty login, email only, password only, empty signup, email-only signup, duplicate username.

### Negative — Login Injection & Boundary (6 tests)
**File:** `tests/e2e/negative-login-injection.spec.ts`

| # | Scenario | Input | Expected Result |
|---|----------|-------|-----------------|
| 1 | XSS payload in email | `<script>alert('xss')</script>` | Stays on login, no execution |
| 2 | SQL injection in email | `' OR '1'='1` | Stays on login |
| 3 | HTML injection in password | `<img src=x onerror=alert(1)>` | Stays on login |
| 4 | Extremely long email | 256 characters | No crash |
| 5 | Extremely long password | 256 characters | No crash |
| 6 | Special characters | Unicode/emoji in fields | No crash |

### Negative — Signup Validation (7 tests)
**File:** `tests/e2e/negative-signup-validation.spec.ts`

Covers: short password, invalid email format, SQL injection, XSS in username, very long username, password-only, username-only.

### Negative — Cart & Checkout (3 tests)
**File:** `tests/e2e/negative-cart-checkout.spec.ts`

Covers: insufficient balance checkout, empty cart state, cart badge updates.

### Negative — Listing Validation (6 tests)
**File:** `tests/e2e/negative-listing-validation.spec.ts`

Covers: no book selected, zero price, negative price, empty price, form elements verification, all condition options.

---

## Additional Coverage

### Empty States & UX Integrity (6 tests)
**File:** `tests/e2e/empty-states.spec.ts`

Covers: orders empty state, marketplace empty, profile no listings, cart empty, search no results, book grid on load.

### Search — Advanced (7 tests)
**File:** `tests/e2e/search-advanced.spec.ts`

Covers: partial title, author last name, case insensitive, empty search restores all, XSS in search, SQL injection in search, genre filter via URL.

### Responsive — Mobile Viewport (7 tests)
**File:** `tests/e2e/responsive-mobile.spec.ts`

Covers: homepage, book detail, login, cart, marketplace, signup, pagination at 375x812 viewport.

---

## Bug Discovery Tests (8 tests — intentionally failing)

### Element Probing (5 tests)
**File:** `tests/bug-discovery/element-bugs.spec.ts`

| # | Bug ID | Description |
|---|--------|-------------|
| 1 | BUG-002 | Double-click add to cart creates duplicates |
| 2 | BUG-003 | Sidebar balance not updated after checkout |
| 3 | BUG-005 | Marketplace accepts $0.01 listing |
| 4 | BUG-006 | Invalid route shows blank page |
| 5 | BUG-007 | Checkout with insufficient balance — no error |

### Flow Probing (3 tests)
**File:** `tests/bug-discovery/flow-bugs.spec.ts`

| # | Bug ID | Description |
|---|--------|-------------|
| 1 | BUG-004 | Cart badge stale after checkout |
| 2 | BUG-008 | Search input not synced with URL query |
| 3 | BUG-009 | Documentation condition values mismatch |

---

## Negative Coverage Matrix

| Page | Empty Submit | Type Validation | Boundary | Injection | Empty State |
|------|------------|-----------------|----------|-----------|-------------|
| /login | Yes | Yes | Yes | Yes (XSS, SQL) | N/A |
| /signup | Yes | Yes | Yes | Yes (XSS, SQL) | N/A |
| /cart | Yes | N/A | N/A | N/A | Yes |
| /orders | N/A | N/A | N/A | N/A | Yes |
| /marketplace | N/A | N/A | N/A | N/A | Yes |
| /marketplace/sell | Yes | Yes | Yes | N/A | N/A |
| /profile | N/A | N/A | N/A | N/A | Yes |
| /books/:id | N/A | N/A | N/A | N/A | Yes (not found) |
| / (search) | N/A | N/A | N/A | Yes (XSS, SQL) | Yes |

---

## Pages Covered: 10/10

1. `/` — Homepage (browse, search, filter, add to cart)
2. `/books/:id` — Book Detail (info, add to cart, not found)
3. `/login` — Login (form, validation, injection)
4. `/signup` — Signup (form, validation, injection)
5. `/cart` — Cart (management, checkout, empty state)
6. `/orders` — Orders List (display, navigation)
7. `/orders/:id` — Order Detail (info, return flow)
8. `/marketplace` — Marketplace (listings, buy flow)
9. `/marketplace/sell` — Create Listing (form, validation)
10. `/profile` — Profile (user info, listings)
