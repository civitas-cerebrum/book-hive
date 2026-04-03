# E2E Test Scenarios

## HomePage — Browse Books (8 tests)
### displays book grid with 12 books per page
**Steps:** Open the home page. Look for the book grid.
**Expected Result:** 12 book cards are displayed on the first page.

### each book card shows title, author, genre, and price
**Steps:** Open the home page. Inspect each book card.
**Expected Result:** Every card shows a title, author, genre tag, and price.

### displays pagination controls
**Steps:** Open the home page. Look at the bottom of the book grid.
**Expected Result:** Previous (disabled) and Next buttons are visible with page indicator.

### navigates to next page and back
**Steps:** Click Next, verify new books appear and Previous is enabled. Click Previous.
**Expected Result:** Page 2 shows different books. Returning to page 1 disables Previous.

### search filters books by title
**Steps:** Type "Dune" into search and press Enter.
**Expected Result:** Only books with "Dune" in the title are shown.

### search filters books by author
**Steps:** Type "Orwell" into search and press Enter.
**Expected Result:** Only books by Orwell appear.

### search with no results shows empty state
**Steps:** Search for a non-existent term.
**Expected Result:** "No books found" message appears.

### clicking a book card navigates to book detail
**Steps:** Click the first book card.
**Expected Result:** Navigates to `/books/{id}` and shows book detail page.

## BookDetailPage — View Book Details (7 tests)
### displays book title / author / genre / description / price / stock
**Steps:** Navigate to `/books/book-001`. Check each field.
**Expected Result:** Title is "To Kill a Mockingbird", author is "Harper Lee", genre is "Fiction", price is "$12.99", description and stock are not empty.

### does not show add-to-cart button when not logged in
**Steps:** Visit book detail page without logging in.
**Expected Result:** No "Add to Cart" button is visible.

## BookDetailPage — Authenticated (4 tests)
### shows add-to-cart button when logged in
**Steps:** Log in, visit book detail.
**Expected Result:** "Add to Cart" button is visible.

### displays details for different books (book-002, book-009, book-018)
**Steps:** Navigate to each book by ID.
**Expected Result:** Correct title, author, genre, and price are shown for each.

## Authentication — Login & Signup (10 tests)
### Login Page form elements, heading, successful login, invalid credentials, signup link
**Steps:** Visit `/login`, verify form fields, test login flows, test navigation links.
**Expected Result:** Form is complete, successful login redirects to home, invalid login stays on page.

### Signup Page form elements, heading, successful signup, duplicate email error, login link
**Steps:** Visit `/signup`, verify form fields, test signup flows.
**Expected Result:** Form is complete, successful signup redirects to home, duplicate email shows error.

## Navigation — Sidebar & Routing (17 tests)
### Unauthenticated: shows login/signup, hides cart/orders/sell/profile, nav links work, protected routes redirect
**Steps:** Without logging in, check sidebar contents and try accessing protected pages.
**Expected Result:** Only public links shown. Protected routes redirect to login.

### Authenticated: shows cart/orders/sell/profile, hides login/signup, nav links work, logout works, balance shown
**Steps:** Log in, check sidebar contents, click each nav link, test logout.
**Expected Result:** All authenticated links work. Logout returns to unauthenticated state.

## Cart & Checkout (6 + 5 tests)
### empty cart, add item, clear cart, checkout, heading, multiple items, total displayed, cart empties after checkout
**Steps:** Test cart in empty and populated states. Add items. Checkout. Verify empty after.
**Expected Result:** Cart correctly shows items, totals, and empties after successful checkout.

## Orders — View & Return (4 + 3 tests)
### no orders initially, orders after checkout, order detail, return within window, multiple orders, click order card
**Steps:** Check empty state. Create orders via checkout. View details. Return.
**Expected Result:** Orders appear in list. Detail page shows items and total. Return button works within 10-minute window.

## Genre Filter (6 tests)
### Fiction / Sci-Fi / Non-Fiction / Biography / Fantasy / Mystery filters
**Steps:** Navigate with genre query parameter. Check displayed genres.
**Expected Result:** Each filter shows only books of that genre.

## Pagination Advanced (3 tests)
### last page disabled, different books on page 2, last page has 2 books
**Steps:** Navigate through all 5 pages.
**Expected Result:** Last page has Next disabled and shows 2 remaining books.

## Marketplace (4 + 3 tests)
### no listings after reset, create listing form, create listing and view, listing in profile, buy listing, cancel listing, condition types
**Steps:** Create, view, buy, and cancel marketplace listings.
**Expected Result:** Listings appear on marketplace and in seller's profile. Can be bought by other users or cancelled by seller.

## Profile (2 tests)
### displays user info, shows no active listings initially
**Steps:** Navigate to profile page.
**Expected Result:** Username, email, balance displayed correctly. "No active listings" shown.

## Theme Toggle (3 tests)
### button present, toggle changes theme, double toggle returns original
**Steps:** Click the theme toggle button.
**Expected Result:** Theme icon changes on click and returns on double-click.

## E2E User Journeys (4 tests)
### complete purchase, return order, marketplace sell/cancel, balance deduction
**Steps:** Execute complete user flows across multiple pages.
**Expected Result:** Full flows work end-to-end with correct data propagation.

## Negative Tests (10 tests)
### empty form fields prevent submission, duplicate username error, non-existent book/route, search with special chars, search reset
**Steps:** Submit forms with missing data. Navigate to invalid routes. Search with edge case inputs.
**Expected Result:** Forms are validated. Application handles edge cases gracefully.

## Bug Discovery (2 tests — expected failures)
### BUG-001: login error not displayed
### BUG-002: checkout insufficient balance no error
**Steps:** Reproduce specific bugs.
**Expected Result:** Tests assert correct behavior — they fail because bugs exist.
