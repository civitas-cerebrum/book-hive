# E2E Test Scenarios

## Summary
- **Total tests:** 114 (112 passing + 2 bug reproduction)
- **Test files:** 19
- **Coverage areas:** 10 pages, 17 functional spec files, 2 bug discovery tests
- **Framework:** Playwright with Steps API

---

## HomePage (home.spec.ts) — 9 tests
1. **displays book grid with cards on load** — Verify 12 book cards in grid
2. **each book card shows title, author, genre and price** — All card fields present
3. **first book card has correct data** — "To Kill a Mockingbird" first
4. **search filters books by title** — Search "Dune", only Dune shown
5. **search filters books by author** — Search "Harper Lee", only her books
6. **search with no results shows empty state** — Nonsense query shows "No books found"
7. **pagination navigates between pages** — Next/Previous buttons work
8. **pagination previous button works** — Returns to page 1
9. **clicking book card navigates to detail** — Card click goes to /books/{id}

## BookDetailPage (book-detail.spec.ts, book-detail-auth.spec.ts) — 11 tests
1. **displays complete book information** — Title, author, price, description, stock
2. **shows genre badge** — Fiction badge on book-001
3. **no add-to-cart for unauthenticated** — Button hidden when logged out
4. **non-existent book shows not-found** — /books/book-999 shows error
5. **different book shows different details** — Dune/Frank Herbert/Sci-Fi
6. **add-to-cart button when logged in** — Button visible after login
7. **add to cart updates badge** — Cart badge appears in sidebar
8. **stock count displayed** — "X in stock" text shown
9. **description displayed** — Long description text present
10. **Fantasy genre book** — book-034 shows Fantasy
11. **Mystery genre book** — book-042 shows Mystery

## Authentication (auth.spec.ts, auth-edge.spec.ts) — 16 tests
1. **login page form elements** — Email, password, submit, signup link
2. **signup page form elements** — Username, email, password, submit
3. **successful login redirects home** — Valid creds redirect to /
4. **invalid login stays on page** — Bad creds keep user on /login
5. **signup link navigation** — Login -> Signup link works
6. **login link navigation** — Signup -> Login link works
7. **successful signup redirects** — New user created and logged in
8. **logout returns to unauth** — Logout button clears session
9. **auth sidebar shows links** — Cart, Orders, Sell, Profile visible
10. **unauth sidebar shows login/signup** — Login, Sign Up visible
11. **duplicate signup error** — Existing email stays on /signup
12. **signup form validation** — Required attribute on email
13. **login form validation** — Required attribute on email
14. **seeded user balance** — $100.00 for testuser1
15. **session persists across pages** — Logout button on all pages
16. **new signup zero balance** — New user starts at $0.00

## Cart (cart.spec.ts, cart-advanced.spec.ts) — 17 tests
1. **empty cart message** — "Your cart is empty"
2. **add from book detail** — Item appears in cart
3. **add from home page card** — Quick add works
4. **cart displays title and price** — Item info shown
5. **increase quantity** — + button increments
6. **decrease quantity** — - button decrements
7. **remove item** — Remove clears item
8. **clear cart** — Clear all button works
9. **cart total correct** — Sum of item prices
10. **checkout creates order** — Redirects to /orders
11. **same book twice increases qty** — Qty=2 after double add
12. **multiple books multiple items** — 2+ distinct items
13. **cart badge count** — Badge shows "1"
14. **minus disabled at qty 1** — Cannot go below 1
15. **total for multiple items** — Correct sum
16. **checkout empties cart** — Cart empty after checkout

## Orders (orders.spec.ts, order-return.spec.ts) — 9 tests
1. **no orders for fresh user** — "No orders yet" message
2. **order after checkout** — Order card visible
3. **order card status badge** — Status shown
4. **click order navigates to detail** — /orders/{id}
5. **order detail items and total** — Items list + total
6. **return button within window** — Return available
7. **return order** — Status changes to RETURNED
8. **order total displayed** — $ amount shown
9. **multi-item order** — 2 items in order detail

## Marketplace (marketplace.spec.ts, marketplace-advanced.spec.ts) — 11 tests
1. **marketplace page loads** — Heading visible
2. **empty marketplace** — "No listings" message
3. **sidebar link navigation** — /marketplace
4. **create listing page elements** — Form fields present
5. **sell link navigation** — /marketplace/sell
6. **create listing and verify** — Listing on marketplace
7. **listing cards show details** — Title, condition, price
8. **buy from another user** — Listing removed after purchase
9. **cancel own listing** — Removed from profile
10. **listing form validation** — Submit without fields
11. **created listing price correct** — $15.00 shown

## Navigation (navigation.spec.ts) — 12 tests
1. **sidebar logo and browse** — Logo, All Books, Marketplace
2. **genre category links** — Fiction, Sci-Fi, Non-Fiction text
3. **All Books link** — Navigates to /
4. **Marketplace link** — Navigates to /marketplace
5. **Login link** — Navigates to /login
6. **Sign Up link** — Navigates to /signup
7. **Theme toggle present** — Button exists
8. **Theme toggle changes theme** — Theme attribute updates
9. **Cart link (auth)** — /cart
10. **Orders link (auth)** — /orders
11. **Protected route redirect** — /cart -> /login
12. **Profile link (auth)** — /profile

## Genre Filtering (genre-filter.spec.ts) — 6 tests
1. **genre chips in DOM** — 7 chip buttons attached
2. **genre chip click filters** — Fiction books only
3. **sidebar Fiction link** — Fiction genre filter
4. **sidebar Sci-Fi link** — Sci-Fi genre filter
5. **All Books clears filter** — Mixed genres shown
6. **URL genre parameter** — /?genre=Biography works

## Profile (profile.spec.ts) — 5 tests
1. **profile page displays info** — Username, email, balance
2. **correct username** — testuser1
3. **correct email** — testuser1@bookhive.test
4. **balance shown** — $ amount displayed
5. **profile link navigation** — /profile

## Theme (theme.spec.ts) — 3 tests
1. **toggle switches theme** — Theme changes
2. **theme persists navigation** — Same after nav
3. **toggle accessible** — Enabled button

## Negative Tests (negative-tests.spec.ts) — 11 tests
1. **non-existent route** — Handled gracefully
2. **non-existent book** — Not-found state
3. **empty search** — Shows all books
4. **special chars in search** — No crash
5. **XSS in search** — Sanitized
6. **cart without auth** — Redirect to /login
7. **orders without auth** — Redirect to /login
8. **profile without auth** — Redirect to /login
9. **sell without auth** — Redirect to /login
10. **very long search query** — Handles gracefully
11. **last page disables Next** — Next button disabled

## User Journeys (user-journey.spec.ts) — 4 tests
1. **complete shopping flow** — Browse -> Cart -> Checkout -> Orders
2. **marketplace flow** — Create -> Verify -> Cancel
3. **search and detail flow** — Search -> Detail -> Back
4. **balance after purchase** — Balance decreases after buying listing

## Bug Discovery (bug-discovery/element-bugs.spec.ts) — 2 tests
1. **BUG-001: login error message missing** — FAILS (confirmed bug)
2. **BUG-002: genre chips hidden** — FAILS (confirmed bug)
