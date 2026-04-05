# E2E Test Scenarios

**Total tests:** 202
**All passing:** Yes
**Last run:** 2026-04-05
**Files:** 39 spec files

---

## Authentication — Login (7 tests)
**File:** `tests/e2e/auth-login.spec.ts`

### Displays login form
**Steps:** Open login page → Verify heading, email, password, submit button visible
**Expected Result:** All form elements present

### Successful login redirects to homepage
**Steps:** Fill valid credentials → Click Sign In
**Expected Result:** Redirected to `/`, logout button visible

### Shows authenticated navigation after login
**Steps:** Login successfully → Check sidebar
**Expected Result:** Cart, Orders, Sell, Profile links visible

### Failed login with wrong password shows error
**Steps:** Enter valid email, wrong password → Submit
**Expected Result:** Error message appears, stays on login page

### Failed login with non-existent email shows error
**Steps:** Enter non-existent email → Submit
**Expected Result:** Error message appears

### Has link to signup page
**Steps:** Click "Sign up" link on login page
**Expected Result:** Navigated to `/signup`

### Logout returns to unauthenticated state
**Steps:** Login → Click Logout
**Expected Result:** Login link reappears in sidebar

---

## Authentication — Signup (4 tests)
**File:** `tests/e2e/auth-signup.spec.ts`

### Displays signup form with all fields
**Steps:** Open signup page
**Expected Result:** Username, email, password inputs and submit button visible

### Successful signup redirects to homepage
**Steps:** Fill unique credentials → Submit
**Expected Result:** Redirected to homepage with authenticated state

### Has link to login page
**Steps:** Click "Sign in" link
**Expected Result:** Navigated to `/login`

### Duplicate email shows error
**Steps:** Submit with existing email
**Expected Result:** Error message displayed

---

## Homepage — Browse Books (8 tests)
**File:** `tests/e2e/homepage-browse.spec.ts`

### Displays book grid / cards / pagination / search / navigation
**Steps:** Open homepage → Verify book grid, cards, pagination, search, book detail navigation
**Expected Result:** All elements visible and functional

---

## Book Detail (4 tests)
**File:** `tests/e2e/book-detail.spec.ts`

### Displays book details / Shows add to cart / Stock info / Add to cart works
**Steps:** Navigate to `/books/book-001` → Verify title, price, stock, add to cart
**Expected Result:** Correct book info displayed, add to cart functional for authenticated users

---

## Book Detail — Extended Coverage (8 tests) — NEW
**File:** `tests/e2e/book-detail-extended.spec.ts`

### Shows author name
**Steps:** Open book detail → Verify author element contains "Harper Lee"
**Expected Result:** Author name visible and correct

### Shows genre badge
**Steps:** Open book detail → Verify genre badge shows "Fiction"
**Expected Result:** Genre badge displayed correctly

### Shows description text
**Steps:** Open book detail → Verify description is not empty
**Expected Result:** Book description is visible

### Sci-fi book shows correct genre
**Steps:** Navigate to Dune → Verify genre shows "Sci-Fi"
**Expected Result:** Genre classification correct

### Price contains dollar sign
**Steps:** Open book detail → Read price text
**Expected Result:** Price format includes `$`

### Stock shows numeric value
**Steps:** Open book detail → Read stock text
**Expected Result:** Stock info contains a number

### Navigating between books updates content
**Steps:** Open book-001, read title → Navigate to book-009, read title
**Expected Result:** Titles are different

### Non-existent book shows not found message
**Steps:** Navigate to `/books/nonexistent-id`
**Expected Result:** "Book not found" message displayed

---

## Cart & Checkout (6 tests)
**File:** `tests/e2e/cart-checkout.spec.ts`

### Empty cart / Add from homepage / Add from detail / Total / Clear / Checkout
**Steps:** Login → Manage cart → Checkout
**Expected Result:** Cart operations work end-to-end, checkout creates order

---

## Cart Management (5 tests)
**File:** `tests/e2e/cart-management.spec.ts`

### Same book twice increases qty / Different books / Total / Checkout button / Clear button
**Steps:** Add items to cart, verify counts and controls
**Expected Result:** Cart correctly tracks items and quantities

---

## Cart Quantity Management (6 tests)
**File:** `tests/e2e/cart-quantity.spec.ts`

### Plus/Minus buttons / Minus disabled at 1 / Remove item / Titles and prices / Total updates
**Steps:** Manipulate cart quantities with +/- buttons
**Expected Result:** Quantity controls work correctly

---

## Negative — Cart & Checkout (3 tests) — NEW
**File:** `tests/e2e/negative-cart-checkout.spec.ts`

### Checkout with insufficient balance stays on cart
**Steps:** Add Dune 7 times ($118.93) → Attempt checkout with $100 balance
**Expected Result:** Stays on cart page, no crash

### Empty cart shows empty message
**Steps:** Login → Clear cart → Verify empty state
**Expected Result:** "Your cart is empty" message visible

### Cart badge updates when item added
**Steps:** Login → Clear cart → Add item → Check cart link
**Expected Result:** Cart link visible after adding item

---

## Orders (4 tests)
**File:** `tests/e2e/orders.spec.ts`

### Auth required / Heading visible / Orders after checkout / Order detail navigation
**Steps:** Login → Create order → View orders → Click order
**Expected Result:** Orders displayed with cards, clickable to detail

---

## Order Detail & Return (4 tests)
**File:** `tests/e2e/order-detail.spec.ts`

### Order info / Items / Return button / Return changes status
**Steps:** Create order → Navigate to detail → Return
**Expected Result:** Order detail shows status, items; return changes status to RETURNED

---

## Order Return — Extended Flow (4 tests) — NEW
**File:** `tests/e2e/order-return-flow.spec.ts`

### Newly created order shows COMPLETED status
**Steps:** Create order → Navigate to orders list
**Expected Result:** Order card shows status badge

### Order detail shows return countdown timer
**Steps:** Create order → Navigate to order detail
**Expected Result:** Return button and countdown timer visible

### Order detail shows total price
**Steps:** Create order → Navigate to order detail → Check total
**Expected Result:** Total contains `$` symbol

### Returned order shows RETURNED status
**Steps:** Create order → Return it → Verify status
**Expected Result:** Status changes to "RETURNED"

---

## Marketplace (5 tests)
**File:** `tests/e2e/marketplace.spec.ts`

### Heading / Content / Auth required / Form visible / Create listing
**Steps:** Browse marketplace, create listing as authenticated user
**Expected Result:** Listings work end-to-end

---

## Marketplace — Buy Listing (3 tests)
**File:** `tests/e2e/marketplace-buy.spec.ts`

### Buy from another user / Listing shows / Profile listings
**Steps:** User1 creates listing → User2 buys → Profile shows listings
**Expected Result:** Complete marketplace flow works

---

## Marketplace — Empty State & Own Listings (4 tests) — NEW
**File:** `tests/e2e/marketplace-empty-own.spec.ts`

### Shows heading on fresh load
**Steps:** Navigate to marketplace
**Expected Result:** "Marketplace" heading visible

### Own listing does not show buy button to seller
**Steps:** Create listing → View on marketplace as same user
**Expected Result:** No buy button shown for own listings

### Marketplace listing shows buy button to other users
**Steps:** User2 views User1's listing
**Expected Result:** Buy button visible for another user's listing

### Marketplace accessible without authentication
**Steps:** Navigate to marketplace without login
**Expected Result:** Page loads with heading, no redirect

---

## Profile (4 tests)
**File:** `tests/e2e/profile.spec.ts`

### Auth required / User info / Correct data / My Listings
**Steps:** Login → Navigate to profile
**Expected Result:** Username, email, balance, listings visible

---

## Navigation (8 tests)
**File:** `tests/e2e/navigation.spec.ts`

### Unauth links / Category links / Genre filter / Auth links / All navigation links
**Steps:** Verify all sidebar links navigate correctly
**Expected Result:** Each link goes to correct page

---

## Navigation — Deep Coverage (9 tests) — NEW
**File:** `tests/e2e/navigation-deep.spec.ts`

### Sidebar visible / All Books & Marketplace links / Navigation works
**Steps:** Verify sidebar, browse links, and marketplace link
**Expected Result:** All navigation elements present and functional

### Category links visible / Theme toggle visible on all pages
**Steps:** Verify all 6 genre filter links and theme toggle
**Expected Result:** All category links present, theme toggle on every page

### Unauthenticated shows Login and Sign Up
**Steps:** Visit homepage without login
**Expected Result:** Login and Sign Up links visible

### Authenticated balance displayed / Navigation persists
**Steps:** Login → Navigate between pages → Verify logout button on each
**Expected Result:** Balance visible, navigation consistent across pages

---

## Genre Filtering (8 tests)
**File:** `tests/e2e/genre-filter.spec.ts`

### Fiction / Sci-Fi / Non-Fiction / Biography / Fantasy / Mystery / Author search / Sidebar genre
**Steps:** Navigate with genre query params and search
**Expected Result:** Filtered results displayed

---

## Protected Routes (9 tests)
**File:** `tests/e2e/protected-routes.spec.ts`

### Cart/Orders/Profile/Sell redirect to login / Public pages accessible
**Steps:** Visit protected pages without auth
**Expected Result:** Redirected to `/login`; public pages load normally

---

## Theme Toggle (3 tests)
**File:** `tests/e2e/theme-toggle.spec.ts`

### Visible / Toggle works / Persists
**Steps:** Click theme toggle, navigate between pages
**Expected Result:** Theme changes without crash, persists across navigation

---

## Pagination Deep (4 tests)
**File:** `tests/e2e/pagination-deep.spec.ts`

### Previous disabled on first / Enabled on page 2 / Multi-page / Last page disables Next
**Steps:** Navigate through pagination
**Expected Result:** Correct button states on each page

---

## Negative Auth Tests (6 tests)
**File:** `tests/e2e/negative-auth.spec.ts`

### Empty login / Email only / Password only / Empty signup / Email-only signup / Duplicate username
**Steps:** Submit forms with incomplete data
**Expected Result:** Stays on page, no unintended navigation

---

## Negative — Login Injection & Boundary (6 tests) — NEW
**File:** `tests/e2e/negative-login-injection.spec.ts`

### XSS payload in email / SQL injection in email / HTML injection in password
**Steps:** Enter malicious payloads in login fields → Submit
**Expected Result:** Stays on login page, payloads rejected

### Extremely long email / Extremely long password / Special characters
**Steps:** Enter boundary-length strings → Submit
**Expected Result:** Stays on login page, no crash

---

## Negative — Signup Validation (7 tests) — NEW
**File:** `tests/e2e/negative-signup-validation.spec.ts`

### Short password / Invalid email format / SQL injection in email
**Steps:** Submit signup with invalid data
**Expected Result:** Stays on signup page

### XSS in username / Very long username
**Steps:** Enter XSS or 256-char username → Submit
**Expected Result:** Handled safely, no script execution, no crash

### Password-only / Username-only
**Steps:** Submit partial forms
**Expected Result:** Stays on signup page

---

## Negative — Create Listing Validation (6 tests) — NEW
**File:** `tests/e2e/negative-listing-validation.spec.ts`

### No book selected / Zero price / Negative price / Empty price
**Steps:** Submit listing with invalid data
**Expected Result:** Stays on sell page or handles gracefully

### Form has all required elements / All condition options available
**Steps:** Verify all form fields and dropdown options
**Expected Result:** Book select, condition select, price, and create button present; all conditions selectable

---

## Empty States & UX Integrity (6 tests) — NEW
**File:** `tests/e2e/empty-states.spec.ts`

### Orders empty state / Marketplace empty / Profile no listings / Cart empty / Search no results / Book grid on load
**Steps:** Navigate to each page in empty state
**Expected Result:** Meaningful empty messages shown, no blank screens

---

## Search — Advanced Coverage (7 tests) — NEW
**File:** `tests/e2e/search-advanced.spec.ts`

### Partial title / Author last name / Case insensitive / Empty search restores all
**Steps:** Search with various queries
**Expected Result:** Correct results returned

### XSS in search / SQL injection in search
**Steps:** Enter malicious strings in search box
**Expected Result:** No crash, shows "no results" message

### Genre filter via URL
**Steps:** Navigate to `/?genre=Fiction`
**Expected Result:** Filtered books displayed

---

## Responsive — Mobile Viewport (7 tests) — NEW
**File:** `tests/e2e/responsive-mobile.spec.ts`

### Homepage / Book detail / Login / Cart / Marketplace / Signup / Pagination on mobile
**Steps:** Load each page at 375x812 viewport
**Expected Result:** All pages render and function correctly on mobile

---

## End-to-End Flows (4 tests)
**File:** `tests/e2e/end-to-end-flows.spec.ts`

### Complete purchase / Marketplace flow / Search navigate / Multi-item checkout
**Steps:** Full user journeys across multiple pages
**Expected Result:** All flows complete successfully

---

## Book Detail Deep (5 tests)
**File:** `tests/e2e/book-detail-deep.spec.ts`

### Non-existent book / Price format / Title matches / Different books / No auth required
**Steps:** Various book detail edge cases
**Expected Result:** Correct behaviour for all scenarios

---

## Balance Tracking (2 tests)
**File:** `tests/e2e/balance-tracking.spec.ts`

### Balance decreases after purchase / Balance displayed
**Steps:** Make purchase, check balance
**Expected Result:** Balance updates correctly

---

## Bug Discovery (1 test)
**File:** `tests/bug-discovery/element-bugs.spec.ts`

### BUG-001: Extreme price listing shows generic error
**Steps:** Create listing with price 999999999
**Expected Result:** Proper validation message (actual: generic error)

---

## Negative Coverage Matrix

| Page | T1: Empty | T1: Type | T1: Boundary | T1: Injection | T2: Session | T2: Prereq | T3: Empty State | T3: Overflow | Notes |
|---|---|---|---|---|---|---|---|---|---|
| /login | done | done | done | done | n/a | n/a | n/a | done | 6 injection + 6 auth negative tests |
| /signup | done | done | done | done | n/a | n/a | n/a | done | 7 signup validation tests |
| /cart | done | n/a | n/a | n/a | n/a | n/a | done | n/a | Empty cart + insufficient balance |
| /orders | n/a | n/a | n/a | n/a | n/a | n/a | done | n/a | Empty orders state |
| /orders/:id | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | Return countdown + status |
| /marketplace | n/a | n/a | n/a | n/a | n/a | n/a | done | n/a | No listings empty state |
| /marketplace/sell | done | done | done | n/a | n/a | n/a | n/a | n/a | 6 validation tests |
| /profile | n/a | n/a | n/a | n/a | n/a | n/a | done | n/a | No active listings state |
| /books/:id | n/a | n/a | n/a | n/a | n/a | n/a | done | n/a | Not found state |
| / (search) | n/a | n/a | n/a | done | n/a | n/a | done | n/a | XSS + SQL injection in search |
