# E2E Test Scenarios

**Total tests:** 104
**All passing:** Yes
**Last run:** 2026-04-04

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
