# E2E Test Scenarios

**Total tests:** 89 (84 passing + 5 bug reproduction)
**Framework:** Playwright 1.59.1 with custom Steps API
**Runner:** Single worker, sequential execution
**Config:** `tests/e2e/playwright.config.ts`

---

## Test Suite Overview

| Spec File | Tests | Status | Category |
|-----------|-------|--------|----------|
| auth.spec.ts | 8 | All pass | Authentication |
| signup-flow.spec.ts | 3 | All pass | Registration |
| homepage-browse.spec.ts | 9 | All pass | Browsing & Search |
| genre-filter.spec.ts | 7 | All pass | Filtering |
| book-detail.spec.ts | 5 | All pass | Book Detail |
| cart-badge.spec.ts | 2 | All pass | Cart Badge |
| cart-management.spec.ts | 5 | All pass | Cart Operations |
| cart-checkout.spec.ts | 4 | All pass | Checkout Flow |
| orders.spec.ts | 4 | All pass | Order History |
| order-return.spec.ts | 3 | All pass | Order Returns |
| marketplace.spec.ts | 6 | All pass | Marketplace |
| profile.spec.ts | 2 | All pass | User Profile |
| profile-listings.spec.ts | 2 | All pass | Profile Listings |
| theme-toggle.spec.ts | 1 | All pass | UI Theme |
| checkout-edge-cases.spec.ts | 3 | All pass | Checkout Edge Cases |
| marketplace-edge-cases.spec.ts | 4 | All pass | Marketplace Edge Cases |
| navigation-edge-cases.spec.ts | 6 | All pass | Navigation Edge Cases |
| stock-management.spec.ts | 4 | All pass | Stock Management |
| session-security.spec.ts | 4 | All pass | Session Security |
| bug-discovery/element-bugs.spec.ts | 2 | All fail (bugs) | Bug Reproduction |
| bug-discovery/flow-bugs.spec.ts | 3 | All fail (bugs) | Bug Reproduction |

---

## Detailed Scenarios

### Authentication (auth.spec.ts)

1. **should display login form with all fields** — Verifies login page renders all expected elements (email, password, submit, signup link)
2. **should login successfully with valid credentials** — Login with testuser1, verify redirect to home and authenticated UI
3. **should stay on login page after invalid credentials** — Invalid login keeps user on /login
4. **should navigate to signup page from login** — Signup link navigates to /signup
5. **should display signup form with all fields** — Signup page has all expected form elements
6. **should reject signup with existing email** — Duplicate email shows error message
7. **should logout successfully** — Logout clears session and shows login/signup links
8. **should redirect authenticated user from login** — Already logged-in user is redirected away from /login

### Signup Flow (signup-flow.spec.ts)

1. **should register new user** — Full signup flow with unique credentials
2. **should show validation for weak password** — Weak password is rejected
3. **should navigate from signup to login** — Login link works from signup page

### Homepage & Browsing (homepage-browse.spec.ts)

1. **should display book grid on homepage** — Books render in grid format
2. **should display pagination** — Pagination controls are visible
3. **should navigate to next page** — Next button advances page
4. **should navigate to previous page** — Previous button goes back
5. **should search books by title** — Search for "Gatsby" finds matching book
6. **should show no results for gibberish search** — Random search shows "No books found"
7. **should navigate to book detail from card** — Clicking book card opens detail page
8. **should display book card details** — Cards show title, author, genre, price
9. **should handle empty search input** — Empty search shows all books

### Genre Filter (genre-filter.spec.ts)

1. **should filter by Fiction** — Fiction filter shows only fiction books
2. **should filter by Sci-Fi** — Sci-Fi filter shows only sci-fi books
3. **should filter by Non-Fiction** — Non-Fiction filter works correctly
4. **should filter by Biography** — Biography filter works correctly
5. **should filter by Fantasy** — Fantasy filter works correctly
6. **should filter by Mystery** — Mystery filter works correctly
7. **should show all books when All is selected** — All filter resets to full catalog

### Book Detail (book-detail.spec.ts)

1. **should display book details** — All book metadata visible (title, author, genre, description, price, stock)
2. **should show add to cart for authenticated user** — Logged-in user sees "Add to Cart"
3. **should hide add to cart for unauthenticated user** — Guest users don't see add-to-cart
4. **should show book not found for invalid ID** — Invalid book ID shows error
5. **should add book to cart** — Add to cart works and updates cart badge

### Cart Badge (cart-badge.spec.ts)

1. **should show cart badge after adding item** — Badge appears with count after add-to-cart
2. **should update cart badge after removing item** — Badge updates when items removed

### Cart Management (cart-management.spec.ts)

1. **should display cart items** — Cart page shows added items
2. **should increase item quantity** — Plus button increments quantity
3. **should decrease item quantity** — Minus button decrements quantity
4. **should remove item from cart** — Remove button deletes item
5. **should clear entire cart** — Clear cart button empties cart

### Cart & Checkout (cart-checkout.spec.ts)

1. **should display cart total** — Cart shows correct total price
2. **should checkout and redirect to order** — Checkout redirects to order detail
3. **should show empty cart after checkout** — Cart is empty after successful checkout
4. **should show order in orders list** — New order appears in orders page

### Orders (orders.spec.ts)

1. **should display orders page** — Orders page renders correctly
2. **should show order cards** — Order cards display with correct info
3. **should navigate to order detail** — Clicking order card shows detail
4. **should show no orders for new user** — Fresh user sees "No orders"

### Order Return (order-return.spec.ts)

1. **should display return button on recent order** — Return button visible within window
2. **should return order successfully** — Return changes status to RETURNED
3. **should show returned status** — Order status updates in UI

### Marketplace (marketplace.spec.ts)

1. **should display marketplace page** — Marketplace renders listing cards
2. **should create a new listing** — Sell flow creates visible listing
3. **should show listing details** — Listings show title, condition, price
4. **should buy a listing** — Buy button purchases listing for buyer
5. **should not show buy on own listing** — Own listings lack buy button
6. **should cancel a listing from profile** — Cancel removes listing

### Profile (profile.spec.ts)

1. **should display user profile** — Profile page shows username, email, balance
2. **should show correct balance** — Balance displays accurately

### Profile Listings (profile-listings.spec.ts)

1. **should show listings on profile** — Created listings appear in profile
2. **should cancel listing from profile** — Cancel removes listing from profile

### Theme Toggle (theme-toggle.spec.ts)

1. **should toggle theme between light and dark** — Theme toggle switches appearance

### Checkout Edge Cases (checkout-edge-cases.spec.ts)

1. **should update user balance after successful checkout** — Balance decreases after purchase
2. **should update balance after returning an order** — Balance increases after return
3. **should handle checkout with cart total exceeding balance** — Over-balance checkout handled gracefully

### Marketplace Edge Cases (marketplace-edge-cases.spec.ts)

1. **should buy listing and verify balance deduction** — Balance decreases after marketplace buy
2. **should not show buy button on own listings** — Self-buy prevented
3. **should reject listing creation with empty price** — Validation prevents empty price
4. **should show listing status as SOLD after purchase** — Sold listings tracked on profile

### Navigation Edge Cases (navigation-edge-cases.spec.ts)

1. **should show not found for invalid order ID** — Graceful handling of bad order URLs
2. **should redirect protected routes to login** — /orders without auth redirects
3. **should redirect order detail to login** — /orders/:id without auth redirects
4. **should redirect profile to login** — /profile without auth redirects
5. **should navigate from book card to book detail** — Card click navigates correctly
6. **should persist search when navigating back** — Browser back preserves state

### Stock Management (stock-management.spec.ts)

1. **should show stock count on book detail page** — Stock count displays on detail
2. **should hide add to cart when out of stock** — Out-of-stock hides add button
3. **should decrease stock after checkout** — Stock decrements after purchase
4. **should restore stock after order return** — Stock restores after return

### Session Security (session-security.spec.ts)

1. **should clear auth on logout** — Logout clears session properly
2. **should hide balance when not authenticated** — Balance not shown to guests
3. **should handle double-click on add to cart** — Double-click doesn't duplicate
4. **should persist auth across navigation** — Auth survives page navigation

### Bug Reproduction (bug-discovery/)

1. **BUG-001** — Login error message not displayed (FAILS = bug confirmed)
2. **BUG-002** — Checkout silent failure on insufficient balance (FAILS = bug confirmed)
3. **BUG-003** — Navbar balance stale after checkout (FAILS = bug confirmed)
4. **BUG-003b** — Navbar balance doesn't match server after checkout (FAILS = bug confirmed)
5. **BUG-004** — Cart + button not disabled at max stock (FAILS = bug confirmed)
