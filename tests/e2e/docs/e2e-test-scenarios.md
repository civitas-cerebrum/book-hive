# E2E Test Scenarios

**Total tests:** 217
**All passing:** Yes
**Last run:** 2026-04-05

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

### Displays book grid with books
**Steps:** Open homepage → Verify book grid loads
**Expected Result:** Grid of book cards visible with at least one book

### Displays book cards with title and price
**Steps:** Open homepage → Check card content
**Expected Result:** Cards show book titles and prices

### Shows pagination controls
**Steps:** Open homepage → Look for pagination
**Expected Result:** Next/Previous buttons visible

### Can navigate to next page
**Steps:** Click Next button → Verify new books load
**Expected Result:** New set of books displayed

### Can navigate to next page and back
**Steps:** Click Next → Click Previous
**Expected Result:** Returns to original book set

### Search filters books by title
**Steps:** Type "Dune" in search → Press Enter
**Expected Result:** Filtered results showing matching books

### Search with no results shows empty state
**Steps:** Search for nonsense term
**Expected Result:** No book cards shown

### Clicking a book card navigates to book detail
**Steps:** Click first book card
**Expected Result:** Navigated to `/books/:id` with book title visible

---

## Homepage — Add to Cart & Interactions (7 tests)
**File:** `tests/e2e/homepage-add-to-cart.spec.ts`

### Authenticated user sees add to cart buttons on homepage
**Steps:** Login → Navigate to homepage
**Expected Result:** Each book card has an Add to Cart button

### Clicking add to cart on homepage adds item
**Steps:** Login → Click Add to Cart on a book → Navigate to cart
**Expected Result:** Cart contains the added item

### Unauthenticated user does not see add to cart buttons on homepage
**Steps:** Logout → Navigate to homepage
**Expected Result:** No Add to Cart buttons visible

### Homepage book cards show genre badge
**Steps:** Navigate to homepage
**Expected Result:** Book cards display genre information

### Homepage page info shows current page number
**Steps:** Navigate to homepage → Check page info text
**Expected Result:** Shows "1 / 5" format

### Page info updates after navigation
**Steps:** Navigate to page 2 → Check page info
**Expected Result:** Page info updates to show "2 / 5"

### Search clears when navigating to homepage via All Books
**Steps:** Search for "Dune" → Click All Books in sidebar
**Expected Result:** All books displayed again

---

## Book Detail Page (4 tests)
**File:** `tests/e2e/book-detail.spec.ts`

### Displays book details with title and price
**Steps:** Navigate to `/books/book-001`
**Expected Result:** "To Kill a Mockingbird" title and price visible

### Shows add to cart button when not logged in
**Steps:** View book detail as guest
**Expected Result:** Title visible (no add to cart for unauthenticated)

### Shows stock information
**Steps:** Navigate to book detail
**Expected Result:** Stock info present

### Add to cart button works for authenticated user
**Steps:** Login → Navigate to book → Click Add to Cart
**Expected Result:** Item added successfully

---

## Book Detail — Navigation & Content (7 tests)
**File:** `tests/e2e/book-detail-navigation.spec.ts`

### Book detail shows all fields: author, genre, description, stock
**Steps:** Navigate to book detail page
**Expected Result:** All data fields (title, author, genre, description, price, stock) visible

### Navigating back to browse from book detail via All Books link
**Steps:** View book detail → Click All Books sidebar link
**Expected Result:** Returns to homepage with book grid

### Book detail page has correct page container
**Steps:** Navigate to book detail
**Expected Result:** Page container element present

### Stock info shows number in stock
**Steps:** Navigate to book detail
**Expected Result:** Stock text contains "in stock"

### Book genre displays correctly
**Steps:** Navigate to book-001
**Expected Result:** Genre shows "Fiction"

### Book description is not empty
**Steps:** Navigate to book detail
**Expected Result:** Description text is populated

### Unauthenticated user does not see add to cart button
**Steps:** Visit book detail without login
**Expected Result:** Add to Cart button not visible

---

## Book Detail — Deep Coverage (5 tests)
**File:** `tests/e2e/book-detail-deep.spec.ts`

### Navigating to non-existent book shows error or redirect
**Steps:** Navigate to `/books/nonexistent-book-id`
**Expected Result:** Handles gracefully, no crash

### Book detail page shows price format with dollar sign
**Steps:** Navigate to book detail → Read price
**Expected Result:** Price contains "$"

### Book detail title matches homepage title
**Steps:** Navigate to `/books/book-002`
**Expected Result:** Title shows "The Great Gatsby"

### Different books show different details
**Steps:** Compare book-001 and book-002 titles
**Expected Result:** Titles are different

### Book detail accessible without login
**Steps:** Navigate to book-003 without authentication
**Expected Result:** Title "1984" visible

---

## Cart & Checkout (6 tests)
**File:** `tests/e2e/cart-checkout.spec.ts`

### Empty cart shows empty message
**Steps:** Login → Clear cart → View cart
**Expected Result:** "Your cart is empty" message shown

### Add item to cart from homepage
**Steps:** Login → Click Add to Cart on homepage → View cart
**Expected Result:** Item appears in cart

### Add item to cart from book detail page
**Steps:** Login → Navigate to book detail → Click Add to Cart → View cart
**Expected Result:** Item appears in cart

### Cart shows total price
**Steps:** Add item → View cart
**Expected Result:** Cart total with dollar amount visible

### Clear cart removes all items
**Steps:** Add item → Click Clear cart
**Expected Result:** Cart shows empty state

### Checkout creates an order
**Steps:** Add item → Click Checkout
**Expected Result:** Redirected to orders page

---

## Cart Management — Quantity & Items (5 tests)
**File:** `tests/e2e/cart-management.spec.ts`

### Adding same book twice increases quantity
**Steps:** Add same book twice → View cart
**Expected Result:** One cart item with quantity > 1

### Adding different books shows multiple cart items
**Steps:** Add two different books → View cart
**Expected Result:** Multiple cart items visible

### Cart total updates with items
**Steps:** Add item → Check cart total
**Expected Result:** Total shows dollar amount

### Checkout button is visible when cart has items
**Steps:** Add item → View cart
**Expected Result:** Checkout button present and enabled

### Clear cart button is visible when cart has items
**Steps:** Add item → View cart
**Expected Result:** Clear cart button present

---

## Cart — Quantity Controls & Item Removal (5 tests)
**File:** `tests/e2e/cart-quantity.spec.ts`

### Increase quantity with plus button
**Steps:** Add item → Click "+" button
**Expected Result:** Quantity changes from 1 to 2

### Decrease quantity with minus button
**Steps:** Add book twice (qty 2) → Click "-" button
**Expected Result:** Quantity changes from 2 to 1

### Remove item button removes item from cart
**Steps:** Add item → Click Remove
**Expected Result:** Cart becomes empty

### Cart shows item title and price
**Steps:** Add item → View cart
**Expected Result:** Item title and price text visible

### Minus button is disabled when quantity is 1
**Steps:** Add item (qty 1) → Check minus button
**Expected Result:** "-" button is disabled

---

## Cart Badge & Balance Display (5 tests)
**File:** `tests/e2e/cart-badge-balance.spec.ts`

### Sidebar shows balance for authenticated user
**Steps:** Login → Check sidebar
**Expected Result:** Balance display visible with text

### Sidebar balance contains dollar sign and amount
**Steps:** Login → Read balance text
**Expected Result:** Text contains "$" and "100.00"

### Balance decreases after checkout and reflects in profile
**Steps:** Login → Check profile balance → Buy a book → Check profile balance again
**Expected Result:** Balance has decreased after purchase

### Balance is restored after returning an order
**Steps:** Login → Record balance → Buy book → Return order → Check balance
**Expected Result:** Balance returns to pre-purchase value

### Unauthenticated user does not see balance
**Steps:** Visit homepage as guest
**Expected Result:** No balance display in sidebar

---

## Orders (4 tests)
**File:** `tests/e2e/orders.spec.ts`

### Unauthenticated user cannot access orders
**Steps:** Navigate to `/orders` without login
**Expected Result:** Redirected to `/login`

### Orders page heading is visible
**Steps:** Login → Navigate to orders
**Expected Result:** "Your Orders" heading visible

### Orders page shows orders after checkout
**Steps:** Login → Create order → View orders
**Expected Result:** Order card visible

### Clicking an order card shows order detail
**Steps:** Login → Create order → Click order card
**Expected Result:** Navigated to `/orders/:id`

---

## Orders — Empty State & Display (3 tests)
**File:** `tests/e2e/orders-empty-state.spec.ts`

### Orders page shows no-orders message for fresh user
**Steps:** Login as user with no orders → View orders
**Expected Result:** "No orders yet" message shown

### Order card shows status badge on orders list
**Steps:** Login → Create order → View orders list
**Expected Result:** Order card has status badge visible

### Multiple orders display in list after several checkouts
**Steps:** Login → Create two orders → View orders list
**Expected Result:** More than one order card visible

---

## Order Detail & Return (4 tests)
**File:** `tests/e2e/order-detail.spec.ts`

### Order detail page shows order information
**Steps:** Login → Create order → Navigate to detail
**Expected Result:** Order status visible

### Order detail shows order items
**Steps:** Login → Create order → View detail
**Expected Result:** Order items listed

### Recently created order shows return button
**Steps:** Create order → View detail immediately
**Expected Result:** Return Order button visible

### Return order changes order status
**Steps:** Create order → Click Return Order
**Expected Result:** Status changes to "RETURNED"

---

## Order Detail — Deep Coverage (5 tests)
**File:** `tests/e2e/order-detail-deep.spec.ts`

### Checkout redirects to order detail page
**Steps:** Add item → Checkout
**Expected Result:** Redirected to `/orders/:id` with status visible

### Order detail shows COMPLETED status for new order
**Steps:** Create order → View detail
**Expected Result:** Status shows "COMPLETED"

### Order detail shows total price
**Steps:** Add item → Checkout → Check order total
**Expected Result:** Order total contains "$"

### Order detail page has order items
**Steps:** Create single-item order → View detail
**Expected Result:** At least one order item visible

### Multi-item order shows all items in detail
**Steps:** Add two books → Checkout → View detail
**Expected Result:** More than one item listed in order detail

---

## Order Return — Window & Status (4 tests)
**File:** `tests/e2e/return-window.spec.ts`

### Recently created order shows return countdown
**Steps:** Create order → View detail
**Expected Result:** Return countdown and return button visible

### Order detail shows order total
**Steps:** Create order → View detail
**Expected Result:** Order total with non-empty value

### Returned order shows RETURNED status
**Steps:** Create and return order
**Expected Result:** Status shows "RETURNED", return button disappears

### Returned order does not show return button
**Steps:** Create, return, verify
**Expected Result:** No return button or countdown on returned order

---

## Marketplace (5 tests)
**File:** `tests/e2e/marketplace.spec.ts`

### Marketplace page loads with heading
**Steps:** Navigate to `/marketplace`
**Expected Result:** Heading visible

### Marketplace page is accessible and displays content
**Steps:** Navigate to marketplace
**Expected Result:** "Marketplace" heading text

### Create listing page requires authentication
**Steps:** Navigate to `/marketplace/sell` without login
**Expected Result:** Redirected to login

### Create listing page shows form
**Steps:** Login → Navigate to sell page
**Expected Result:** Book select, condition select, price input, create button all visible

### Can create a listing and see it on marketplace
**Steps:** Login → Fill form → Create listing
**Expected Result:** Redirected to marketplace

---

## Marketplace — Buy Listing (3 tests)
**File:** `tests/e2e/marketplace-buy.spec.ts`

### User can buy a listing from another user
**Steps:** User1 creates listing → User2 buys it
**Expected Result:** Buy completes successfully

### Marketplace listing shows after creation
**Steps:** Create listing → View marketplace
**Expected Result:** Listing card visible

### Listing appears on user profile
**Steps:** Create listing → View profile
**Expected Result:** Cancel button visible on profile listings

---

## Marketplace — Buy Flow Deep Coverage (3 tests)
**File:** `tests/e2e/marketplace-buy-flow.spec.ts`

### Buying a listing redirects to order detail
**Steps:** User1 creates listing → User2 buys → Check URL
**Expected Result:** Redirected to `/orders/:id`

### Bought listing disappears from marketplace
**Steps:** User1 creates listing → User2 buys → Check marketplace
**Expected Result:** Marketplace shows no listings

### Seller balance increases after listing is bought
**Steps:** Check seller balance → Create listing → Buyer buys → Check seller balance
**Expected Result:** Seller balance has increased

---

## Marketplace — Edge Cases (4 tests)
**File:** `tests/e2e/marketplace-edge.spec.ts`

### Marketplace shows no listings when none exist
**Steps:** Reset DB → View marketplace
**Expected Result:** No listings message shown

### Marketplace heading displays correctly
**Steps:** View marketplace
**Expected Result:** Heading text is "Marketplace"

### Listing owner cannot see buy button on own listing
**Steps:** Create listing → View marketplace as same user
**Expected Result:** No buy button on own listing

### Listing shows title, condition, and price
**Steps:** Create listing → View marketplace
**Expected Result:** Listing card shows title, condition badge, and price

---

## Marketplace — Unauthenticated User Behavior (4 tests)
**File:** `tests/e2e/marketplace-unauthenticated.spec.ts`

### Unauthenticated user can browse marketplace
**Steps:** Navigate to marketplace as guest
**Expected Result:** Marketplace heading visible

### Unauthenticated user does not see buy buttons on listings
**Steps:** Create listing → Logout → Browse marketplace
**Expected Result:** Listing cards visible but no buy buttons

### Marketplace listings show title and price for unauthenticated user
**Steps:** Browse marketplace as guest
**Expected Result:** Title and price elements present

### Marketplace listings show condition badge for unauthenticated user
**Steps:** Browse marketplace as guest
**Expected Result:** Condition badge visible

---

## Marketplace Sell — Form Validation & Conditions (8 tests)
**File:** `tests/e2e/marketplace-sell-validation.spec.ts`

### Create listing with NEW condition
**Steps:** Login → Select book, NEW condition, price → Create
**Expected Result:** Redirected to marketplace

### Create listing with GOOD condition
**Steps:** Login → Select book, GOOD condition, price → Create
**Expected Result:** Redirected to marketplace

### Create listing with FAIR condition
**Steps:** Login → Select book, FAIR condition, price → Create
**Expected Result:** Redirected to marketplace

### Submit listing with zero price stays on page or shows error
**Steps:** Login → Select book, price = 0 → Create
**Expected Result:** Stays on sell page

### Submit listing without selecting a book stays on page
**Steps:** Login → Select condition and price only → Create
**Expected Result:** Stays on sell page

### Submit listing without price stays on page
**Steps:** Login → Select book and condition, leave price empty → Create
**Expected Result:** Stays on sell page

### Sell page heading shows Sell a Book
**Steps:** Login → Navigate to sell page
**Expected Result:** Heading visible

### All form elements are present on sell page
**Steps:** Login → Navigate to sell page
**Expected Result:** Book select, condition select, price input, create button all present

---

## Profile Page (4 tests)
**File:** `tests/e2e/profile.spec.ts`

### Profile page requires authentication
**Steps:** Navigate to `/profile` without login
**Expected Result:** Redirected to `/login`

### Displays user profile information
**Steps:** Login → View profile
**Expected Result:** Username, email, balance visible

### Shows correct username and email
**Steps:** Login as testuser1 → View profile
**Expected Result:** "testuser1" and "testuser1@bookhive.test" displayed

### Shows My Listings section
**Steps:** Login → View profile
**Expected Result:** "My Listings" heading visible

---

## Profile — Deep Coverage (6 tests)
**File:** `tests/e2e/profile-deep.spec.ts`

### Profile shows no active listings message for fresh user
**Steps:** Login → View profile (no listings)
**Expected Result:** No listings element visible

### Profile balance shows dollar format
**Steps:** Login → View profile → Read balance
**Expected Result:** Balance contains "$"

### Profile for different users shows different data
**Steps:** Login as user1 → Read username → Login as user2 → Read username
**Expected Result:** Usernames are different

### Profile shows listing after creating one
**Steps:** Login → Create marketplace listing → View profile
**Expected Result:** At least one listing visible

### Profile page shows all sections
**Steps:** Login → View profile
**Expected Result:** Profile page, username, email, balance, My Listings heading all present

### User2 profile shows correct data
**Steps:** Login as testuser2 → View profile
**Expected Result:** "testuser2" and "testuser2@bookhive.test" displayed

---

## Profile — Cancel Listing (3 tests)
**File:** `tests/e2e/listing-cancel.spec.ts`

### User can cancel own listing from profile
**Steps:** Create listing → Go to profile → Click Cancel
**Expected Result:** Listing removed, "no active listings" shown

### Cancelled listing no longer appears on marketplace
**Steps:** Create listing → Cancel → Check marketplace
**Expected Result:** Marketplace shows no listings

### Profile shows my listing details
**Steps:** Create listing → View profile
**Expected Result:** My Listings heading, listing card, and cancel button visible

---

## Navigation (8 tests)
**File:** `tests/e2e/navigation.spec.ts`

### Unauthenticated user sees login and signup links
**Steps:** Visit homepage as guest
**Expected Result:** Login and Sign Up links visible

### Sidebar has category links
**Steps:** Visit homepage
**Expected Result:** All Books and Marketplace links visible

### Genre links filter books
**Steps:** Navigate with genre parameter
**Expected Result:** Filtered books displayed

### Authenticated user sees account navigation links
**Steps:** Login → Check sidebar
**Expected Result:** Cart, Orders, Sell, Profile, Logout all visible

### Cart/Orders/Sell/Profile links navigate correctly
**Steps:** Login → Click each nav link
**Expected Result:** Each navigates to correct page

---

## Navigation — Deep Coverage (7 tests)
**File:** `tests/e2e/navigation-deep.spec.ts`

### Logo text BookHive is visible
**Steps:** Visit homepage
**Expected Result:** Logo element present

### Sidebar shows Browse and Categories sections
**Steps:** Visit homepage
**Expected Result:** Sidebar, All Books, Marketplace links visible

### Sidebar shows all genre filter links
**Steps:** Visit homepage
**Expected Result:** Fiction, Sci-Fi, Non-Fiction, Biography, Fantasy, Mystery all present

### Navigation links change after login
**Steps:** Check unauth links → Login → Check auth links
**Expected Result:** Login/Signup disappear, Cart/Orders/Sell/Profile/Logout appear

### Navigation links change after logout
**Steps:** Login → Logout → Check sidebar
**Expected Result:** Reverts to Login/Signup, Cart/Logout disappear

### Sidebar persists across page navigation
**Steps:** Navigate to homepage → marketplace → login
**Expected Result:** Sidebar present on every page

### Theme toggle persists across pages
**Steps:** Toggle theme → Navigate to multiple pages
**Expected Result:** Theme toggle present on every page

---

## Genre Filtering (8 tests)
**File:** `tests/e2e/genre-filter.spec.ts`

### All 6 genre filters show filtered results
**Steps:** Navigate with each genre query parameter
**Expected Result:** Books displayed for each genre

### Search by author name returns results
**Steps:** Search for "Orwell"
**Expected Result:** Book cards visible

### Clicking genre from sidebar filters books
**Steps:** Navigate with genre parameter
**Expected Result:** Filtered results displayed

---

## Sidebar Genre Navigation (8 tests)
**File:** `tests/e2e/genre-chip-filter.spec.ts`

### Each genre sidebar link filters books correctly
**Steps:** Click Fiction/Sci-Fi/Non-Fiction/Biography/Fantasy/Mystery in sidebar
**Expected Result:** URL updates with genre parameter, books displayed

### All Books sidebar link navigates to unfiltered homepage
**Steps:** From filtered page, click All Books
**Expected Result:** All books displayed without filter

### Marketplace sidebar link navigates to marketplace
**Steps:** Click Marketplace in sidebar
**Expected Result:** Marketplace page loads

---

## Protected Routes (9 tests)
**File:** `tests/e2e/protected-routes.spec.ts`

### Cart/Orders/Profile/Sell redirect to login when not authenticated
**Steps:** Visit each protected page without login
**Expected Result:** Redirected to `/login`

### Public pages accessible without authentication
**Steps:** Visit marketplace, homepage, book detail, login, signup
**Expected Result:** All load successfully

---

## Theme Toggle (3 tests)
**File:** `tests/e2e/theme-toggle.spec.ts`

### Theme toggle button is visible
**Steps:** Visit homepage
**Expected Result:** Toggle button present

### Clicking theme toggle changes theme
**Steps:** Click toggle → Verify page still works
**Expected Result:** No crash, page content intact

### Theme persists after navigation
**Steps:** Toggle theme → Navigate between pages
**Expected Result:** Pages continue to load correctly

---

## Pagination — Deep Navigation (4 tests)
**File:** `tests/e2e/pagination-deep.spec.ts`

### First page has Previous button disabled
**Steps:** Visit homepage
**Expected Result:** Previous button disabled

### Navigating to page 2 enables Previous button
**Steps:** Click Next → Check Previous
**Expected Result:** Previous button enabled

### Can navigate through multiple pages
**Steps:** Click Next twice
**Expected Result:** Books load on each page

### Navigating to last page disables Next button
**Steps:** Click Next 4 times
**Expected Result:** Next button disabled on page 5

---

## Insufficient Balance (1 test)
**File:** `tests/e2e/insufficient-balance.spec.ts`

### Checkout with insufficient balance shows error
**Steps:** Register new user → Drain balance with purchases → Try checkout
**Expected Result:** Stays on cart page (checkout fails)

---

## Balance Tracking (2 tests)
**File:** `tests/e2e/balance-tracking.spec.ts`

### Balance decreases after purchase
**Steps:** Login → Check balance → Buy book → Check balance
**Expected Result:** Balance has decreased

### Balance shown in profile is visible
**Steps:** Login → Check profile
**Expected Result:** Balance text is not empty

---

## End-to-End User Journeys (4 tests)
**File:** `tests/e2e/end-to-end-flows.spec.ts`

### Complete purchase flow: login, add to cart, checkout
**Steps:** Login → Add cheap book → Checkout
**Expected Result:** Redirected to orders

### Marketplace flow: create listing, verify on marketplace, buy
**Steps:** User1 creates listing → User2 buys it
**Expected Result:** Complete marketplace cycle works

### Search and navigate flow
**Steps:** Search for "Gatsby" → Click result
**Expected Result:** Book detail page loads

### Multi-item cart checkout
**Steps:** Add 3 books → Checkout
**Expected Result:** Order created with multiple items

---

## Negative Auth Tests (6 tests)
**File:** `tests/e2e/negative-auth.spec.ts`

### Empty login form submission stays on page
**Steps:** Click Sign In with no input
**Expected Result:** Stays on `/login`

### Login with only email/password stays on page
**Steps:** Fill only one field → Submit
**Expected Result:** Stays on `/login`

### Signup with empty form stays on page
**Steps:** Click Create Account with no input
**Expected Result:** Stays on `/signup`

### Signup with only email stays on page
**Steps:** Fill only email → Submit
**Expected Result:** Stays on `/signup`

### Signup with duplicate username stays on page
**Steps:** Use existing username with unique email → Submit
**Expected Result:** Stays on `/signup`

---

## Negative Cart Tests (5 tests)
**File:** `tests/e2e/negative-cart.spec.ts`

### Empty cart does not show checkout button
**Steps:** Login → Clear cart → View cart
**Expected Result:** No checkout button, empty message shown

### Empty cart does not show clear button
**Steps:** Login → Clear cart → View cart
**Expected Result:** No clear button, empty message shown

### Removing last item shows empty cart
**Steps:** Add one item → Remove it
**Expected Result:** Empty cart message appears

### Clearing cart results in empty cart state
**Steps:** Add two items → Clear cart
**Expected Result:** Empty cart, no checkout button

### Insufficient balance shows error on checkout
**Steps:** Register new user → Drain balance → Try checkout
**Expected Result:** Stays on cart page

---

## Negative Marketplace Tests (5 tests)
**File:** `tests/e2e/negative-marketplace.spec.ts`

### Creating listing with negative price stays on page
**Steps:** Login → Set price to -5 → Create
**Expected Result:** Stays on sell page

### Listing with zero price is rejected
**Steps:** Login → Set price to 0 → Create
**Expected Result:** Stays on sell page

### Buying own listing is prevented
**Steps:** Create listing → View marketplace as owner
**Expected Result:** No buy button on own listing

### Marketplace sell page requires auth
**Steps:** Visit `/marketplace/sell` without login
**Expected Result:** Redirected to login

### Marketplace buy requires authentication
**Steps:** Create listing → Logout → Check marketplace
**Expected Result:** No buy button for unauthenticated users

---

## Negative — Injection & XSS Tests (7 tests)
**File:** `tests/e2e/negative-injection.spec.ts`

### XSS in login email/password field is handled safely
**Steps:** Enter `<script>alert(1)</script>` in fields → Submit
**Expected Result:** Stays on login page, script not executed

### SQL injection in login email is rejected
**Steps:** Enter `' OR 1=1 --` as email → Submit
**Expected Result:** Stays on login page

### XSS in signup username field is handled safely
**Steps:** Enter `<img src=x onerror=alert(1)>` → Submit
**Expected Result:** No script execution

### HTML injection in signup email is rejected
**Steps:** Enter `<b>bold</b>@test.com` → Submit
**Expected Result:** Stays on signup page

### XSS/SQL injection in search input is handled safely
**Steps:** Enter XSS/SQL payloads in search → Press Enter → Navigate back
**Expected Result:** Page intact, data not corrupted, books still load

---

## Negative — Boundary Value Tests (8 tests)
**File:** `tests/e2e/negative-boundary.spec.ts`

### Signup with very long username does not crash
**Steps:** Enter 256-char username → Submit
**Expected Result:** App handles gracefully (either validates or creates account)

### Signup with very long email stays on page
**Steps:** Enter 200-char email → Submit
**Expected Result:** Stays on signup page

### Signup with very short password stays on page
**Steps:** Enter single-char password → Submit
**Expected Result:** Stays on signup page

### Login with extremely long email/password
**Steps:** Enter 500+/1000+ char credentials → Submit
**Expected Result:** Stays on login page

### Search with very long query does not crash
**Steps:** Enter 400-char search query → Submit → Navigate back
**Expected Result:** App handles gracefully, books still load

### Navigating to non-existent book/order ID handles gracefully
**Steps:** Navigate to invalid book/order URL
**Expected Result:** No crash, handles gracefully

---

## Negative — Session & Permission Tests (8 tests)
**File:** `tests/e2e/negative-session.spec.ts`

### All protected pages redirect to login when unauthenticated
**Steps:** Visit cart/orders/profile/sell/order-detail without login
**Expected Result:** Redirected to `/login`

### After logout, protected pages redirect to login
**Steps:** Login → Verify cart access → Logout → Try cart again
**Expected Result:** Redirected to login after logout

### Empty form submissions stay on auth pages
**Steps:** Submit empty login/signup forms
**Expected Result:** Stays on respective page

---

## Bug Discovery (1 test)
**File:** `tests/bug-discovery/element-bugs.spec.ts`

### BUG-001: Extreme price listing shows generic error
**Steps:** Create listing with price 999999999
**Expected Result:** Proper validation message (actual: generic error)

---

## Negative Coverage Matrix

| Page | T1: Empty | T1: Boundary | T1: Injection | T1: Duplicate | T2: Session | T3: Empty State | Notes |
|---|---|---|---|---|---|---|---|
| /login | done | done | done | n/a | done | n/a | XSS, SQL injection, long input |
| /signup | done | done | done | done | done | n/a | Boundary, injection, duplicate |
| / (Home) | n/a | done | done | n/a | n/a | done | Search injection/boundary |
| /books/:id | n/a | done | n/a | n/a | n/a | n/a | Non-existent ID |
| /cart | done | n/a | n/a | n/a | done | done | Empty cart, auth required |
| /orders | n/a | done | n/a | n/a | done | done | Empty state, bad ID |
| /marketplace | n/a | n/a | n/a | n/a | n/a | done | Unauth, no buy button |
| /marketplace/sell | done | done | n/a | n/a | done | n/a | Zero/negative price, auth |
| /profile | n/a | n/a | n/a | n/a | done | done | No listings, auth required |
