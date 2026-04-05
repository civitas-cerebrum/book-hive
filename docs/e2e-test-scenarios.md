# E2E Test Scenarios — BookHive

**Total tests:** 225
**Passing (functional):** 217
**Failing (bug reproductions):** 8
**Last full run:** 2025-04-05
**Duration:** ~8.8 minutes (serial execution, 1 worker)

---

## Test Suite Overview

| Category | File | Tests | Status |
|----------|------|-------|--------|
| Auth — Login | `auth-login.spec.ts` | 7 | All pass |
| Auth — Signup | `auth-signup.spec.ts` | 4 | All pass |
| Homepage — Browse | `homepage-browse.spec.ts` | 8 | All pass |
| Homepage — Add to Cart | `homepage-add-to-cart.spec.ts` | 7 | All pass |
| Book Detail | `book-detail.spec.ts` | 4 | All pass |
| Book Detail — Navigation | `book-detail-navigation.spec.ts` | 7 | All pass |
| Book Detail — Deep | `book-detail-deep.spec.ts` | 5 | All pass |
| Cart & Checkout | `cart-checkout.spec.ts` | 6 | All pass |
| Cart Management | `cart-management.spec.ts` | 5 | All pass |
| Cart — Quantity Controls | `cart-quantity.spec.ts` | 5 | All pass |
| Cart Badge & Balance | `cart-badge-balance.spec.ts` | 5 | All pass |
| Orders | `orders.spec.ts` | 4 | All pass |
| Orders — Empty State | `orders-empty-state.spec.ts` | 3 | All pass |
| Order Detail | `order-detail.spec.ts` | 4 | All pass |
| Order Detail — Deep | `order-detail-deep.spec.ts` | 5 | All pass |
| Return Window | `return-window.spec.ts` | 4 | All pass |
| Marketplace | `marketplace.spec.ts` | 5 | All pass |
| Marketplace — Buy | `marketplace-buy.spec.ts` | 3 | All pass |
| Marketplace — Buy Flow | `marketplace-buy-flow.spec.ts` | 3 | All pass |
| Marketplace — Edge Cases | `marketplace-edge.spec.ts` | 4 | All pass |
| Marketplace — Unauthenticated | `marketplace-unauthenticated.spec.ts` | 4 | All pass |
| Marketplace — Sell Validation | `marketplace-sell-validation.spec.ts` | 8 | All pass |
| Profile | `profile.spec.ts` | 4 | All pass |
| Profile — Deep | `profile-deep.spec.ts` | 6 | All pass |
| Listing Cancel | `listing-cancel.spec.ts` | 3 | All pass |
| Navigation | `navigation.spec.ts` | 8 | All pass |
| Navigation — Deep | `navigation-deep.spec.ts` | 7 | All pass |
| Genre Filter | `genre-filter.spec.ts` | 8 | All pass |
| Genre Chip Filter | `genre-chip-filter.spec.ts` | 8 | All pass |
| Protected Routes | `protected-routes.spec.ts` | 9 | All pass |
| Theme Toggle | `theme-toggle.spec.ts` | 3 | All pass |
| Pagination — Deep | `pagination-deep.spec.ts` | 4 | All pass |
| Insufficient Balance | `insufficient-balance.spec.ts` | 1 | All pass |
| Balance Tracking | `balance-tracking.spec.ts` | 2 | All pass |
| End-to-End Flows | `end-to-end-flows.spec.ts` | 4 | All pass |
| Negative — Auth | `negative-auth.spec.ts` | 6 | All pass |
| Negative — Cart | `negative-cart.spec.ts` | 5 | All pass |
| Negative — Marketplace | `negative-marketplace.spec.ts` | 5 | All pass |
| Negative — Injection/XSS | `negative-injection.spec.ts` | 7 | All pass |
| Negative — Boundary | `negative-boundary.spec.ts` | 8 | All pass |
| Negative — Session | `negative-session.spec.ts` | 8 | All pass |
| Bug Discovery — Element | `element-bugs.spec.ts` | 3 | 2 fail (BUG-002, BUG-003) |
| Bug Discovery — Flow | `flow-bugs.spec.ts` | 5 | 5 fail (BUG-005..009) |
| Bug Discovery — Context | `context-derived-bugs.spec.ts` | 1 | 1 fail (BUG-010) |

---

## Scenario Details

### Authentication — Login (7 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Displays login form | Open `/login` | Heading, email, password, submit visible |
| 2 | Successful login redirects to homepage | Fill valid credentials, click Sign In | Redirected to `/`, logout button visible |
| 3 | Shows authenticated navigation after login | Login, check sidebar | Cart, Orders, Sell, Profile links visible |
| 4 | Failed login with wrong password | Enter valid email, wrong password | Error message appears, stays on login |
| 5 | Failed login with non-existent email | Enter non-existent email | Error message appears |
| 6 | Has link to signup page | Click "Sign up" link | Navigated to `/signup` |
| 7 | Logout returns to unauthenticated state | Login, click Logout | Login link reappears |

### Authentication — Signup (4 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Displays signup form | Open `/signup` | All fields and submit button visible |
| 2 | Successful signup redirects to homepage | Fill unique credentials, submit | Redirected to homepage, authenticated |
| 3 | Has link to login page | Click "Sign in" link | Navigated to `/login` |
| 4 | Duplicate email shows error | Submit with existing email | Error message displayed |

### Homepage — Browse Books (8 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Displays book grid | Open homepage | Book cards visible |
| 2 | Cards show title and price | Open homepage | Titles and prices on cards |
| 3 | Shows pagination controls | Open homepage | Next/Previous buttons visible |
| 4 | Navigate to next page | Click Next | New books displayed |
| 5 | Navigate next and back | Click Next, then Previous | Returns to original set |
| 6 | Search filters by title | Search "Dune" | Filtered results shown |
| 7 | Search with no results | Search nonsense term | No book cards |
| 8 | Clicking card navigates to detail | Click first book | Navigated to `/books/:id` |

### Homepage — Add to Cart & Interactions (7 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Authenticated user sees add to cart buttons | Login, visit homepage | Add to Cart buttons on cards |
| 2 | Add to cart from homepage | Click Add to Cart, check cart | Item in cart |
| 3 | Unauthenticated user no add to cart | Visit homepage without login | No Add to Cart buttons |
| 4 | Book cards show genre badge | Visit homepage | Genre info on cards |
| 5 | Page info shows current page | Check pagination info | Shows "1 / 5" format |
| 6 | Page info updates on navigation | Go to page 2 | Shows "2 / 5" |
| 7 | Search clears via All Books | Search, then click All Books | All books displayed |

### Book Detail (4 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Shows title and price | Navigate to `/books/book-001` | Title and price visible |
| 2 | Shows add to cart when not logged in | View as guest | Title visible |
| 3 | Shows stock information | Navigate to book | Stock info present |
| 4 | Add to cart works for authenticated user | Login, add to cart | Item added |

### Book Detail — Navigation & Content (7 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Shows all fields | Navigate to book detail | Author, genre, description, stock visible |
| 2 | Navigate back via All Books | Click All Books link | Returns to homepage |
| 3 | Has page container | Navigate to book | Container element present |
| 4 | Stock shows number in stock | Navigate to book | "in stock" text present |
| 5 | Genre displays correctly | Navigate to book-001 | Genre shows "Fiction" |
| 6 | Description is not empty | Navigate to book | Description populated |
| 7 | Unauthenticated no add to cart | Visit without login | No Add to Cart button |

### Book Detail — Deep Coverage (5 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Non-existent book handled | Navigate to invalid ID | No crash |
| 2 | Price format has dollar sign | Read price | Contains "$" |
| 3 | Title matches expected | Navigate to book-002 | "The Great Gatsby" |
| 4 | Different books differ | Compare book-001 and book-002 | Different titles |
| 5 | Accessible without login | Navigate to book-003 | "1984" visible |

### Cart & Checkout (6 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Empty cart shows message | Clear cart, view | "Your cart is empty" |
| 2 | Add from homepage | Add to cart, view cart | Item in cart |
| 3 | Add from book detail | Navigate to book, add | Item in cart |
| 4 | Shows total price | Add item, view cart | Dollar total visible |
| 5 | Clear cart removes all | Add item, click Clear | Empty state |
| 6 | Checkout creates order | Add item, checkout | Redirected to orders |

### Cart Management (5 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Same book increases qty | Add book twice | Quantity > 1 |
| 2 | Different books shown | Add two different books | Multiple cart items |
| 3 | Cart total updates | Add item, check total | Dollar amount shown |
| 4 | Checkout button visible with items | Add item | Checkout button present |
| 5 | Clear button visible with items | Add item | Clear button present |

### Cart — Quantity Controls (5 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Increase with plus button | Add item, click "+" | Quantity becomes 2 |
| 2 | Decrease with minus button | Add twice, click "-" | Quantity becomes 1 |
| 3 | Remove button removes item | Add item, click Remove | Cart empty |
| 4 | Shows item title and price | Add item, view cart | Title and price visible |
| 5 | Minus disabled at qty 1 | Add item (qty 1) | "-" button disabled |

### Cart Badge & Balance Display (5 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Sidebar shows balance | Login, check sidebar | Balance display visible |
| 2 | Balance has dollar format | Login, read balance | "$" and "100.00" present |
| 3 | Balance decreases after checkout | Buy book, check profile | Balance decreased |
| 4 | Balance restored after return | Buy, return, check | Balance restored |
| 5 | Unauthenticated no balance | Visit as guest | No balance display |

### Orders (4 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Unauthenticated redirected | Navigate to `/orders` | Redirected to `/login` |
| 2 | Heading visible | Login, view orders | "Your Orders" heading |
| 3 | Shows orders after checkout | Create order, view | Order card visible |
| 4 | Click order shows detail | Click order card | Navigated to `/orders/:id` |

### Orders — Empty State (3 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Fresh user no orders | Login as new user | "No orders yet" message |
| 2 | Order card shows status | Create order, view list | Status badge visible |
| 3 | Multiple orders display | Create two orders | Multiple cards visible |

### Order Detail (4 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Shows order information | Create order, view detail | Status visible |
| 2 | Shows order items | Create order, view detail | Items listed |
| 3 | Recent order shows return | Create, view immediately | Return button visible |
| 4 | Return changes status | Click Return Order | Status changes to "RETURNED" |

### Order Detail — Deep (5 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Checkout redirects to order detail | Checkout | Redirected to `/orders/:id` |
| 2 | COMPLETED status for new order | Create order | Status "COMPLETED" |
| 3 | Shows total price | Checkout, check total | Total contains "$" |
| 4 | Has order items | Create order, view | At least one item |
| 5 | Multi-item order shows all | Add two books, checkout | Multiple items listed |

### Return Window (4 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Recent order shows countdown | Create, view | Countdown and return button visible |
| 2 | Shows order total | Create, view | Total with value |
| 3 | RETURNED status shown | Return order | Status shows "RETURNED" |
| 4 | No return button on returned | Return, verify | No return button/countdown |

### Marketplace (5 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Page loads with heading | Navigate to marketplace | Heading visible |
| 2 | Displays content | Navigate | "Marketplace" heading text |
| 3 | Sell requires auth | Visit `/marketplace/sell` unauthenticated | Redirected to login |
| 4 | Shows form | Login, visit sell | All form elements visible |
| 5 | Create listing and verify | Fill form, create | Redirected to marketplace |

### Marketplace — Buy (3 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Buy from another user | User1 creates, User2 buys | Purchase completes |
| 2 | Listing shows after creation | Create, view marketplace | Listing card visible |
| 3 | Listing on profile | Create, view profile | Cancel button visible |

### Marketplace — Buy Flow Deep (3 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Buying redirects to order | Buy listing | Redirected to `/orders/:id` |
| 2 | Bought listing disappears | Buy, check marketplace | No listings |
| 3 | Seller balance increases | Buy, check seller | Balance increased |

### Marketplace — Edge Cases (4 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | No listings message | Reset, view marketplace | No listings shown |
| 2 | Heading correct | View marketplace | "Marketplace" heading |
| 3 | Owner no buy button | Create, view as same user | No buy button on own |
| 4 | Listing shows details | Create, view | Title, condition, price shown |

### Marketplace — Unauthenticated (4 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Can browse marketplace | Visit as guest | Heading visible |
| 2 | No buy buttons | Visit as guest | No buy buttons on listings |
| 3 | Shows title and price | Browse as guest | Title/price present |
| 4 | Shows condition badge | Browse as guest | Condition badge visible |

### Marketplace Sell — Validation (8 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | NEW condition accepted | Create with NEW | Redirected to marketplace |
| 2 | GOOD condition accepted | Create with GOOD | Redirected to marketplace |
| 3 | FAIR condition accepted | Create with FAIR | Redirected to marketplace |
| 4 | Zero price rejected | Price = 0 | Stays on sell page |
| 5 | No book selected rejected | Skip book | Stays on sell page |
| 6 | No price rejected | Leave price empty | Stays on sell page |
| 7 | Heading shows title | Visit sell page | Heading visible |
| 8 | All form elements present | Visit sell page | All inputs present |

### Profile (4 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Requires auth | Visit `/profile` unauthenticated | Redirected to login |
| 2 | Shows user info | Login, view profile | Username, email, balance |
| 3 | Correct username/email | Login as testuser1 | Correct data shown |
| 4 | My Listings section | Login, view | Heading visible |

### Profile — Deep (6 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | No listings message | Fresh user profile | No listings element |
| 2 | Balance dollar format | View profile | "$" in balance |
| 3 | Different users differ | Compare two users | Different usernames |
| 4 | Listing after creation | Create, view profile | Listing visible |
| 5 | All sections present | View profile | All elements present |
| 6 | User2 correct data | Login as testuser2 | Correct data |

### Listing Cancel (3 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Cancel own listing | Create, cancel from profile | Removed, no listings |
| 2 | Cancelled gone from marketplace | Cancel, check marketplace | No listings |
| 3 | Profile shows listing details | Create, view profile | Listing and cancel button |

### Navigation (8 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Unauthenticated sees login/signup | Visit as guest | Login and Sign Up visible |
| 2 | Sidebar has category links | Visit homepage | All Books and Marketplace |
| 3 | Genre links filter | Navigate with genre | Filtered books |
| 4 | Authenticated sees account links | Login, check sidebar | Cart, Orders, Sell, Profile, Logout |
| 5-8 | Nav links navigate correctly | Click each link | Correct page loaded |

### Navigation — Deep (7 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Logo visible | Visit homepage | Logo element present |
| 2 | Browse and Categories | Visit homepage | Sidebar sections |
| 3 | All genre links present | Visit homepage | 6 genres listed |
| 4 | Links change after login | Login, check | Auth links appear |
| 5 | Links change after logout | Logout, check | Auth links disappear |
| 6 | Sidebar persists | Navigate pages | Sidebar on every page |
| 7 | Theme toggle persists | Toggle, navigate | Toggle on every page |

### Genre Filter (8 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1-6 | Each genre shows results | Navigate with genre param | Books displayed per genre |
| 7 | Search by author | Search "Orwell" | Results shown |
| 8 | Sidebar genre filters | Navigate with genre | Filtered results |

### Genre Chip Filter (8 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1-6 | Each sidebar genre link filters | Click genre links | URL updates, books shown |
| 7 | All Books resets filter | Click All Books | Unfiltered homepage |
| 8 | Marketplace link works | Click Marketplace | Marketplace loads |

### Protected Routes (9 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1-4 | Protected pages redirect | Visit cart/orders/profile/sell unauthenticated | Redirected to `/login` |
| 5-9 | Public pages accessible | Visit marketplace/homepage/book/login/signup | All load successfully |

### Theme Toggle (3 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Toggle visible | Visit homepage | Button present |
| 2 | Clicking changes theme | Click toggle | No crash, content intact |
| 3 | Theme persists | Toggle, navigate | Pages load correctly |

### Pagination — Deep (4 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | First page Prev disabled | Visit homepage | Prev button disabled |
| 2 | Page 2 enables Prev | Click Next | Prev enabled |
| 3 | Multiple pages work | Click Next twice | Books load each page |
| 4 | Last page Next disabled | Navigate to page 5 | Next disabled |

### End-to-End User Journeys (4 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Complete purchase flow | Login, add to cart, checkout | Redirected to orders |
| 2 | Marketplace flow | User1 creates, User2 buys | Full cycle works |
| 3 | Search and navigate | Search "Gatsby", click result | Book detail loads |
| 4 | Multi-item cart checkout | Add 3 books, checkout | Order with multiple items |

### Negative — Auth (6 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Empty login form | Submit empty | Stays on `/login` |
| 2 | Login only email | Fill email only | Stays on `/login` |
| 3 | Login only password | Fill password only | Stays on `/login` |
| 4 | Signup empty form | Submit empty | Stays on `/signup` |
| 5 | Signup only email | Fill email only | Stays on `/signup` |
| 6 | Signup duplicate username | Use existing username | Stays on `/signup` |

### Negative — Cart (5 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Empty cart no checkout | Clear cart, check | No checkout button |
| 2 | Empty cart no clear | Clear cart, check | No clear button |
| 3 | Remove last item | Add one, remove | Empty cart message |
| 4 | Clear cart empties | Add two, clear | Empty state |
| 5 | Insufficient balance | Overfill cart, checkout | Stays on cart |

### Negative — Marketplace (5 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Negative price rejected | Set price to -5 | Stays on sell page |
| 2 | Zero price rejected | Set price to 0 | Stays on sell page |
| 3 | Can't buy own listing | Create, check as owner | No buy button |
| 4 | Sell requires auth | Visit unauthenticated | Redirected to login |
| 5 | Buy requires auth | Logout, check marketplace | No buy buttons |

### Negative — Injection/XSS (7 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | XSS in login email | Enter `<script>` tag | Stays on login, no exec |
| 2 | XSS in login password | Enter `<script>` tag | Stays on login, no exec |
| 3 | SQL injection in login | Enter `' OR 1=1 --` | Stays on login |
| 4 | XSS in signup username | Enter `<img onerror>` | No script execution |
| 5 | HTML injection signup email | Enter HTML tags | Stays on signup |
| 6 | XSS in search | Enter XSS payload | Page intact |
| 7 | SQL injection in search | Enter SQL payload | Data not corrupted |

### Negative — Boundary Values (8 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Long username signup | 256-char username | No crash |
| 2 | Long email signup | 200-char email | Stays on signup |
| 3 | Short password signup | 1-char password | Stays on signup |
| 4 | Long email login | 500-char email | Stays on login |
| 5 | Long password login | 1000-char password | Stays on login |
| 6 | Long search query | 400-char query | No crash |
| 7 | Non-existent book ID | Invalid URL | No crash |
| 8 | Non-existent order ID | Invalid URL | No crash |

### Negative — Session & Permission (8 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1-5 | Protected pages redirect | Visit 5 protected routes unauthenticated | Redirected to `/login` |
| 6 | After logout redirects | Login, logout, try cart | Redirected to login |
| 7 | Empty login stays | Submit empty login | Stays on `/login` |
| 8 | Empty signup stays | Submit empty signup | Stays on `/signup` |

### Bug Discovery — Element Probing (3 tests, 2 expected failures)

| # | Bug | Assertion | Status |
|---|-----|-----------|--------|
| 1 | BUG-001: Extreme price generic error | Stays on sell page (passes) | PASS |
| 2 | BUG-002: No 404 page | Asserts "not found" text (fails — blank page) | FAIL (bug) |
| 3 | BUG-003: Negative price 500 | Asserts status 400 (fails — returns 500) | FAIL (bug) |

### Bug Discovery — Flow Probing (5 tests, all expected failures)

| # | Bug | Assertion | Status |
|---|-----|-----------|--------|
| 1 | BUG-005: Stale balance after checkout | Asserts balance changed | FAIL (bug) |
| 2 | BUG-006: Stale cart badge after checkout | Asserts "Cart" (no count) | FAIL (bug) |
| 3 | BUG-007: Cart badge not loaded on login | Asserts count present | FAIL (bug) |
| 4 | BUG-008: No error on insufficient balance | Asserts error text visible | FAIL (bug) |
| 5 | BUG-009: Misleading double-return error | Asserts "already returned" | FAIL (bug) |

### Bug Discovery — Context-Derived (1 test, expected failure)

| # | Bug | Assertion | Status |
|---|-----|-----------|--------|
| 1 | BUG-010: Empty body for 404 order | Asserts response has JSON body | FAIL (bug) |

---

## Negative Coverage Matrix

| Page | Empty Input | Boundary | Injection | Duplicate | Session | Empty State |
|------|------------|----------|-----------|-----------|---------|-------------|
| `/login` | Yes | Yes | Yes | N/A | Yes | N/A |
| `/signup` | Yes | Yes | Yes | Yes | Yes | N/A |
| `/` (Home) | N/A | Yes | Yes | N/A | N/A | Yes |
| `/books/:id` | N/A | Yes | N/A | N/A | N/A | N/A |
| `/cart` | Yes | N/A | N/A | N/A | Yes | Yes |
| `/orders` | N/A | Yes | N/A | N/A | Yes | Yes |
| `/marketplace` | N/A | N/A | N/A | N/A | N/A | Yes |
| `/marketplace/sell` | Yes | Yes | N/A | N/A | Yes | N/A |
| `/profile` | N/A | N/A | N/A | N/A | Yes | Yes |
