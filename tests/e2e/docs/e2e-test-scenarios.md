# E2E Test Scenarios — BookHive

**Total test count:** 89
**Spec files:** 13
**Test framework:** Playwright
**Application under test:** http://localhost:7547 (frontend), http://localhost:8080 (API)

---

## Authentication — Login (5 tests)

**Spec file:** `tests/auth.spec.ts`

### 1. Displays login form elements
**Area:** Authentication / Login
**Steps:** Navigate to /login. Wait for the login page container to load. Verify that the heading, email input, password input, submit button, and signup link are all present on the page.
**Expected Result:** All five login form elements are visible and rendered correctly on the login page.

### 2. Successful login redirects to home and shows authenticated state
**Area:** Authentication / Login
**Steps:** Navigate to /login. Enter valid credentials (testuser1@bookhive.test / Test1234!). Click the Sign In button. Wait for navigation to complete and the home page book grid to appear. Check the sidebar for authenticated-state elements.
**Expected Result:** The user is redirected to the home page (/). The sidebar displays the logout button, cart link, orders link, and the user balance of $100.00, confirming successful authentication.

### 3. Login with invalid credentials stays on login page
**Area:** Authentication / Login
**Steps:** Navigate to /login. Enter invalid credentials (wrong@example.com / WrongPass1!). Click the Sign In button. Wait for the page to settle.
**Expected Result:** The user remains on the /login page. The sidebar does not show the logout button, confirming the user was not authenticated.

### 4. Login with empty email prevents submission via HTML validation
**Area:** Authentication / Login
**Steps:** Navigate to /login. Leave the email field empty and fill in only the password field (SomePass1!). Click the Sign In button. Inspect the email input's HTML validity state.
**Expected Result:** The browser's native HTML validation prevents form submission. The page remains on /login and the email input reports validity.valid as false.

### 5. Signup link navigates to signup page
**Area:** Authentication / Login
**Steps:** Navigate to /login. Click the signup link in the login form.
**Expected Result:** The browser navigates to /signup and the signup page container is rendered.

---

## Authentication — Signup (5 tests)

**Spec file:** `tests/auth.spec.ts`

### 6. Displays signup form elements
**Area:** Authentication / Signup
**Steps:** Navigate to /signup. Wait for the signup page container to load. Verify that the heading, username input, email input, password input, submit button, and login link are present.
**Expected Result:** All six signup form elements are visible and rendered correctly on the signup page.

### 7. Successful signup redirects to home with authenticated state
**Area:** Authentication / Signup
**Steps:** Navigate to /signup. Fill in a unique username, unique email, and valid password (NewPass1234!). Click the submit button. Wait for navigation and the home page book grid.
**Expected Result:** The user is redirected to the home page (/). The sidebar displays the logout button, confirming the new account was created and the user is authenticated.

### 8. Signup with existing email shows error
**Area:** Authentication / Signup
**Steps:** Navigate to /signup. Enter a new username but use an existing email (testuser1@bookhive.test) and a valid password. Click the submit button.
**Expected Result:** An error message is displayed on the signup page indicating that the email is already in use. The user remains on the signup page.

### 9. Signup with short password is blocked by HTML validation
**Area:** Authentication / Signup
**Steps:** Navigate to /signup. Fill in a unique username, unique email, and a short password (Ab1!). Click the submit button. Inspect the password input's HTML validity state.
**Expected Result:** The browser's native HTML validation prevents form submission. The page remains on /signup and the password input reports validity.valid as false.

### 10. Login link navigates to login page
**Area:** Authentication / Signup
**Steps:** Navigate to /signup. Click the login link in the signup form.
**Expected Result:** The browser navigates to /login and the login page container is rendered.

---

## Authentication — Logout (1 test)

**Spec file:** `tests/auth.spec.ts`

### 11. Logout returns to unauthenticated state
**Area:** Authentication / Logout
**Steps:** Navigate to /login. Login with valid credentials (testuser1@bookhive.test / Test1234!). Wait for the home page to load. Verify the logout button is present in the sidebar. Click the logout button.
**Expected Result:** The sidebar reverts to unauthenticated state, showing the login and signup links. The logout button is no longer present.

---

## Authentication — Protected Routes (4 tests)

**Spec file:** `tests/auth.spec.ts`

### 12. Cart redirects to login when not authenticated
**Area:** Authentication / Protected Routes
**Steps:** Without logging in, navigate directly to /cart.
**Expected Result:** The user is redirected to /login because the cart page requires authentication.

### 13. Orders redirects to login when not authenticated
**Area:** Authentication / Protected Routes
**Steps:** Without logging in, navigate directly to /orders.
**Expected Result:** The user is redirected to /login because the orders page requires authentication.

### 14. Profile redirects to login when not authenticated
**Area:** Authentication / Protected Routes
**Steps:** Without logging in, navigate directly to /profile.
**Expected Result:** The user is redirected to /login because the profile page requires authentication.

### 15. Sell page redirects to login when not authenticated
**Area:** Authentication / Protected Routes
**Steps:** Without logging in, navigate directly to /marketplace/sell.
**Expected Result:** The user is redirected to /login because the sell page requires authentication.

---

## HomePage — Browse Books (13 tests)

**Spec file:** `tests/home-browse.spec.ts`

### 16. Displays book catalog with cards
**Area:** HomePage / Browse
**Steps:** Navigate to the home page (/). Wait for the book grid to load. Count the number of book cards displayed.
**Expected Result:** The book grid is visible and exactly 12 book cards are displayed on the first page.

### 17. Each book card shows title, author, genre and price
**Area:** HomePage / Browse
**Steps:** Navigate to the home page. Wait for the book grid. Verify that there is at least one element for each of the following: book title, book author, book price, and book genre.
**Expected Result:** All four data fields (title, author, genre, price) are present on at least one book card, confirming the card layout renders all expected information.

### 18. First book card displays correct data for To Kill a Mockingbird
**Area:** HomePage / Browse
**Steps:** Navigate to the home page. Wait for the book grid. Locate the first book card and read the title text of the first book title element.
**Expected Result:** The first book card's title contains "To Kill a Mockingbird", confirming correct data binding and sort order.

### 19. Pagination shows page 1 of 5
**Area:** HomePage / Pagination
**Steps:** Navigate to the home page. Wait for the book grid. Locate the pagination element.
**Expected Result:** The pagination element displays "1 / 5", indicating the user is on page 1 of 5 total pages.

### 20. Previous button is disabled on first page
**Area:** HomePage / Pagination
**Steps:** Navigate to the home page. Wait for the book grid. Inspect the state of the previous button.
**Expected Result:** The previous button is disabled since the user is already on the first page and cannot navigate further back.

### 21. Next button navigates to page 2
**Area:** HomePage / Pagination
**Steps:** Navigate to the home page. Wait for the book grid. Click the next button. Read the pagination text.
**Expected Result:** The pagination element updates to display "2 / 5", confirming navigation to page 2.

### 22. Previous button navigates back from page 2
**Area:** HomePage / Pagination
**Steps:** Navigate to the home page. Click next to go to page 2. Verify pagination shows "2 / 5". Click the previous button.
**Expected Result:** The pagination element returns to "1 / 5", confirming backward navigation works correctly.

### 23. Search filters books by title
**Area:** HomePage / Search
**Steps:** Navigate to the home page. Type "Dune" into the search input and press Enter. Wait for the book grid to update.
**Expected Result:** At least one book card is displayed and the first result's title contains "Dune", confirming title-based search filtering works.

### 24. Search filters books by author
**Area:** HomePage / Search
**Steps:** Navigate to the home page. Type "Orwell" into the search input and press Enter. Wait for the book grid to update.
**Expected Result:** At least one book card is displayed and the first result's title contains "1984", confirming that searching by author name correctly returns that author's books.

### 25. Search with no results shows empty state
**Area:** HomePage / Search
**Steps:** Navigate to the home page. Type "xyznonexistentbook999" into the search input and press Enter.
**Expected Result:** The "no books" empty state message is displayed, indicating no books matched the search query.

### 26. Clicking book card navigates to detail page
**Area:** HomePage / Navigation
**Steps:** Navigate to the home page. Wait for the book grid. Click the first book card.
**Expected Result:** The URL changes to /books/book-001 and the book detail page container is rendered.

### 27. Sidebar shows unauthenticated navigation
**Area:** HomePage / Sidebar
**Steps:** Navigate to the home page without logging in. Inspect the sidebar elements.
**Expected Result:** The sidebar displays the login link, signup link, All Books link, and marketplace link — the navigation items expected for unauthenticated users.

### 28. Theme toggle switches theme
**Area:** HomePage / Theme
**Steps:** Navigate to the home page. Read the current data-theme attribute from the HTML element. Click the theme toggle button in the sidebar. Read the data-theme attribute again.
**Expected Result:** The data-theme attribute value changes after clicking the toggle, confirming the theme switch (e.g., from light to dark or vice versa).

---

## Genre Filtering (7 tests)

**Spec file:** `tests/genre-filter.spec.ts`

### 29. Fiction genre filter shows only fiction books
**Area:** Genre Filtering
**Steps:** Navigate to the home page. Click the Fiction genre filter link in the sidebar. Wait for the URL to contain "genre=Fiction" and the book grid to reload.
**Expected Result:** Every book card displayed has the genre "Fiction". No books from other genres appear in the results.

### 30. Sci-Fi genre filter shows only sci-fi books
**Area:** Genre Filtering
**Steps:** Navigate to the home page. Click the Sci-Fi genre filter link in the sidebar. Wait for the URL to contain "genre=Sci-Fi" and the book grid to reload.
**Expected Result:** Every book card displayed has the genre "Sci-Fi". No books from other genres appear in the results.

### 31. Non-Fiction genre filter shows only non-fiction books
**Area:** Genre Filtering
**Steps:** Navigate to the home page. Click the Non-Fiction genre filter link in the sidebar. Wait for the URL to contain "genre=Non-Fiction" and the book grid to reload.
**Expected Result:** Every book card displayed has the genre "Non-Fiction". No books from other genres appear in the results.

### 32. Biography genre filter shows only biography books
**Area:** Genre Filtering
**Steps:** Navigate to the home page. Click the Biography genre filter link in the sidebar. Wait for the URL to contain "genre=Biography" and the book grid to reload.
**Expected Result:** Every book card displayed has the genre "Biography". No books from other genres appear in the results.

### 33. Fantasy genre filter shows only fantasy books
**Area:** Genre Filtering
**Steps:** Navigate to the home page. Click the Fantasy genre filter link in the sidebar. Wait for the URL to contain "genre=Fantasy" and the book grid to reload.
**Expected Result:** Every book card displayed has the genre "Fantasy". No books from other genres appear in the results.

### 34. Mystery genre filter shows only mystery books
**Area:** Genre Filtering
**Steps:** Navigate to the home page. Click the Mystery genre filter link in the sidebar. Wait for the URL to contain "genre=Mystery" and the book grid to reload.
**Expected Result:** Every book card displayed has the genre "Mystery". No books from other genres appear in the results.

### 35. All Books link clears genre filter
**Area:** Genre Filtering
**Steps:** Navigate to the home page. Click the Fiction genre filter to apply a filter. Verify the URL contains "genre=Fiction". Click the All Books link in the sidebar. Wait for the book grid to reload.
**Expected Result:** The genre filter is cleared and exactly 12 book cards are displayed, restoring the default unfiltered catalog view.

---

## BookDetailPage (4 tests)

**Spec file:** `tests/book-detail.spec.ts`

### 36. Displays full book details
**Area:** BookDetailPage
**Steps:** Navigate directly to /books/book-001. Wait for the book detail container to load. Verify the title, author, genre, price, stock status, and description fields.
**Expected Result:** The page displays "To Kill a Mockingbird" by "Harper Lee", genre "Fiction", price "$12.99", stock status containing "in stock", and a non-empty description.

### 37. Shows no add to cart button when not logged in
**Area:** BookDetailPage / Auth Guard
**Steps:** Navigate to /books/book-001 without logging in. Wait for the book detail container.
**Expected Result:** The add-to-cart button is absent from the page, preventing unauthenticated users from adding items to a cart.

### 38. Shows not found for invalid book ID
**Area:** BookDetailPage / Error Handling
**Steps:** Navigate to /books/invalid-id.
**Expected Result:** The "not found" element is displayed, indicating the book does not exist.

### 39. Navigates back to home from book detail
**Area:** BookDetailPage / Navigation
**Steps:** Navigate to /books/book-001. Wait for the book detail container. Click the All Books link in the sidebar.
**Expected Result:** The URL changes to / and the home page book grid is rendered, confirming navigation back to the catalog.

---

## Cart & Checkout (7 tests)

**Spec file:** `tests/cart-checkout.spec.ts`

### 40. Empty cart shows empty message
**Area:** Cart
**Steps:** Login as testuser1. Navigate to /cart. Wait for the cart container to load.
**Expected Result:** The cart displays an empty message since no items have been added.

### 41. Add to cart from home page
**Area:** Cart / Add Item
**Steps:** Login as testuser1. On the home page, click the add-to-cart button on the first book card. Check the sidebar.
**Expected Result:** The cart badge appears in the sidebar showing "1", confirming the book was added to the cart.

### 42. Add to cart from book detail page
**Area:** Cart / Add Item
**Steps:** Login as testuser1. Navigate to /books/book-001. Wait for the book detail page. Click the add-to-cart button.
**Expected Result:** The cart badge appears in the sidebar showing "1", confirming the book was added from the detail page.

### 43. Cart displays added items correctly
**Area:** Cart / Display
**Steps:** Login as testuser1. Add the first book to cart from the home page. Navigate to /cart. Wait for the cart container and cart total to load.
**Expected Result:** The cart shows exactly 1 cart item, along with the cart total, checkout button, and clear cart button.

### 44. Clear cart removes all items
**Area:** Cart / Clear
**Steps:** Login as testuser1. Add a book to cart. Navigate to /cart. Wait for the cart item to appear. Click the Clear Cart button.
**Expected Result:** All items are removed and the empty cart message is displayed.

### 45. Checkout creates order and redirects to order detail
**Area:** Cart / Checkout
**Steps:** Login as testuser1. Add a book to cart. Navigate to /cart. Wait for the checkout button. Click Checkout.
**Expected Result:** The URL changes to /orders/{orderId}. The order detail page is rendered showing the order status and at least one order item.

### 46. Checkout navigates to order detail with correct status
**Area:** Cart / Checkout
**Steps:** Login as testuser1. Add a book to cart. Navigate to /cart. Click Checkout. Wait for the order detail page.
**Expected Result:** The order detail page displays the order status as "COMPLETED" and shows the order total.

---

## Cart — Advanced (5 tests)

**Spec file:** `tests/cart-advanced.spec.ts`

### 47. Add multiple different books to cart
**Area:** Cart / Multiple Items
**Steps:** Login as testuser1. On the home page, click add-to-cart on the first book, then click add-to-cart on the second book.
**Expected Result:** The cart badge in the sidebar shows "2", confirming both distinct books were added.

### 48. Adding same book twice increases quantity
**Area:** Cart / Quantity
**Steps:** Login as testuser1. Click add-to-cart on the first book twice. Navigate to /cart.
**Expected Result:** The cart badge shows "1" (one unique item) and the cart page shows exactly 1 cart item line, with the quantity incremented rather than a duplicate entry created.

### 49. Cart total shows correct price for multiple items
**Area:** Cart / Pricing
**Steps:** Login as testuser1. Add the first book to cart. Navigate to /cart. Wait for the cart total.
**Expected Result:** The cart total is displayed and is non-empty, reflecting the price of the items in the cart.

### 50. Checkout with multiple items creates order
**Area:** Cart / Checkout
**Steps:** Login as testuser1. Add the first and second books to cart. Navigate to /cart. Click Checkout.
**Expected Result:** The URL changes to /orders/{orderId}. The order detail page shows exactly 2 order items, confirming both books are included in the order.

### 51. Navigating pages after last page wraps pagination (next disabled on page 5)
**Area:** HomePage / Pagination (in cart-advanced spec)
**Steps:** Navigate to the home page. Click the next button four times, advancing through pages 2, 3, 4, and 5.
**Expected Result:** The pagination reads "5 / 5" on the last page and the next button is disabled, preventing navigation beyond the final page.

---

## Orders (6 tests)

**Spec file:** `tests/orders.spec.ts`

### 52. Orders page shows empty state with no orders
**Area:** Orders
**Steps:** Login as testuser1 (after API reset). Navigate to /orders. Wait for the orders container.
**Expected Result:** The orders page displays an empty message since the user has no order history.

### 53. Checkout redirects to order detail page
**Area:** Orders / Checkout Flow
**Steps:** Login as testuser1. Add a book to cart. Navigate to /cart. Click Checkout.
**Expected Result:** The URL contains /orders/. The order detail page renders, showing order status, order total, and at least one order item.

### 54. Order appears on orders list after checkout
**Area:** Orders / History
**Steps:** Login as testuser1. Add a book to cart. Checkout. After landing on the order detail page, navigate to /orders.
**Expected Result:** The orders list shows exactly 1 order card, confirming the completed order is recorded in the user's order history.

### 55. Order detail shows return button and countdown for recent orders
**Area:** Orders / Returns
**Steps:** Login as testuser1. Add a book to cart. Checkout. Wait for the order detail page.
**Expected Result:** The order detail page displays both a return button and a return countdown timer, indicating the order is eligible for return within the allowed window.

### 56. Return order changes status to RETURNED
**Area:** Orders / Returns
**Steps:** Login as testuser1. Add a book, checkout, and land on the order detail page. Click the Return button.
**Expected Result:** The order status text updates to "RETURNED", confirming the return was processed successfully.

### 57. Return order changes status and return button disappears
**Area:** Orders / Returns
**Steps:** Login as testuser1. Add a book, checkout, and land on the order detail page. Click the Return button. Verify the status changes to RETURNED.
**Expected Result:** The order status is "RETURNED" and the return button is no longer present, preventing duplicate return requests.

---

## Marketplace — Unauthenticated (2 tests)

**Spec file:** `tests/marketplace.spec.ts`

### 58. Marketplace page shows empty state when no listings
**Area:** Marketplace / Unauthenticated
**Steps:** Reset the API. Navigate to /marketplace without logging in. Wait for the marketplace container.
**Expected Result:** The marketplace page displays an empty message since there are no active listings in the system.

### 59. Marketplace link in sidebar navigates correctly
**Area:** Marketplace / Navigation
**Steps:** Navigate to the home page. Click the marketplace link in the sidebar.
**Expected Result:** The URL changes to /marketplace, confirming the sidebar navigation link works.

---

## Marketplace — Create Listing (4 tests)

**Spec file:** `tests/marketplace.spec.ts`

### 60. Create listing page shows form elements
**Area:** Marketplace / Create Listing
**Steps:** Login as testuser1. Navigate to /marketplace/sell. Wait for the create listing container.
**Expected Result:** The form displays the book select dropdown, condition select dropdown, price input, and submit button.

### 61. Create listing successfully redirects to marketplace
**Area:** Marketplace / Create Listing
**Steps:** Login as testuser1. Navigate to /marketplace/sell. Select the first book from the dropdown, set condition to "GOOD", enter price $9.99, and click submit.
**Expected Result:** The URL changes to /marketplace. The marketplace page shows at least one listing card, confirming the listing was created.

### 62. Listing appears on marketplace after creation
**Area:** Marketplace / Create Listing
**Steps:** Login as testuser1. Navigate to /marketplace/sell. Select the first book, set condition to "LIKE_NEW", enter price $15.00, and submit.
**Expected Result:** The marketplace page displays at least one listing card with a visible price, confirming the new listing is publicly visible.

### 63. Listing appears on profile page after creation
**Area:** Marketplace / Profile Integration
**Steps:** Login as testuser1. Create a listing (first book, condition "NEW", price $20.00). After redirect to marketplace, navigate to /profile.
**Expected Result:** The profile page displays at least one listing under "my listings", confirming the seller can see their own listing on their profile.

---

## Marketplace — Advanced (4 tests)

**Spec file:** `tests/marketplace-advanced.spec.ts`

### 64. Cancel listing removes it from profile
**Area:** Marketplace / Cancel
**Steps:** Login as testuser1. Create a listing (condition "GOOD", price $7.99). Navigate to /profile. Verify the listing appears. Click the cancel listing button.
**Expected Result:** The profile page shows the "no listings" message, confirming the listing was removed.

### 65. Buy listing as different user
**Area:** Marketplace / Purchase
**Steps:** Login as testuser1 and create a listing (condition "NEW", price $5.00). Logout. Login as testuser2. Navigate to /marketplace. Click the buy button on the listing. Navigate back to /marketplace.
**Expected Result:** The marketplace shows the empty message, confirming the listing was purchased and is no longer available.

### 66. Create listing with different conditions
**Area:** Marketplace / Conditions
**Steps:** Login as testuser1. Navigate to /marketplace/sell. Select the second book, set condition to "FAIR", enter price $3.50, and submit.
**Expected Result:** The marketplace page displays at least one listing card, confirming that listings with the "FAIR" condition are created successfully.

### 67. Authenticated user sees sidebar sell link
**Area:** Marketplace / Navigation
**Steps:** Login as testuser1. Inspect the sidebar for the sell book link. Click it.
**Expected Result:** The sidebar displays the sell book link for authenticated users, and clicking it navigates to /marketplace/sell.

---

## ProfilePage (3 tests)

**Spec file:** `tests/profile.spec.ts`

### 68. Displays user profile information
**Area:** ProfilePage
**Steps:** Login as testuser1. Navigate to /profile. Wait for the profile container.
**Expected Result:** The profile page displays the username "testuser1", email "testuser1@bookhive.test", and balance "$100.00".

### 69. Shows no active listings message
**Area:** ProfilePage / Listings
**Steps:** Login as testuser1 (after API reset). Navigate to /profile.
**Expected Result:** The profile page displays the "no listings" message since the user has no active marketplace listings.

### 70. Sidebar profile link navigates to profile
**Area:** ProfilePage / Navigation
**Steps:** Login as testuser1. Click the profile link in the sidebar.
**Expected Result:** The URL changes to /profile and the profile page container is rendered.

---

## Navigation & Sidebar (6 tests)

**Spec file:** `tests/navigation.spec.ts`

### 71. Sidebar displays all genre category links
**Area:** Navigation / Sidebar
**Steps:** Navigate to the home page. Inspect the sidebar for genre filter links.
**Expected Result:** The sidebar contains links for all six genres: Fiction, Sci-Fi, Non-Fiction, Biography, Fantasy, and Mystery.

### 72. Sidebar logo is visible
**Area:** Navigation / Sidebar
**Steps:** Navigate to the home page. Check for the sidebar logo element.
**Expected Result:** The sidebar logo is present and contains the text "BookHive".

### 73. Marketplace page accessible without auth
**Area:** Navigation / Public Routes
**Steps:** Navigate directly to /marketplace without logging in.
**Expected Result:** The marketplace page container renders successfully, confirming it is a public route.

### 74. Book detail accessible without auth
**Area:** Navigation / Public Routes
**Steps:** Navigate directly to /books/book-001 without logging in.
**Expected Result:** The book detail page renders and the book title is visible, confirming book details are publicly accessible.

### 75. Browser back button works from book detail to home
**Area:** Navigation / History
**Steps:** Navigate to the home page. Click the first book card to go to /books/book-001. Use the browser back action.
**Expected Result:** The URL returns to / (home page), confirming browser history navigation works correctly.

### 76. Search preserves in URL query
**Area:** Navigation / URL State
**Steps:** Navigate to the home page. Type "Tolkien" into the search input and press Enter.
**Expected Result:** The URL contains "query=Tolkien", confirming the search term is persisted in the URL query parameters for shareability and bookmarking.

---

## Edge Cases (10 tests)

**Spec file:** `tests/edge-cases.spec.ts`

### 77. Search with special characters returns results or empty state
**Area:** Edge Cases / Search
**Steps:** Navigate to the home page. Enter the string `<script>alert(1)</script>` into the search input and press Enter.
**Expected Result:** The application does not break. The home page container remains present, showing either search results or an empty state. The XSS payload is safely handled.

### 78. Search with single character returns results
**Area:** Edge Cases / Search
**Steps:** Navigate to the home page. Enter "a" into the search input and press Enter.
**Expected Result:** The home page container remains present, displaying any books that match the single-character query.

### 79. Clearing search shows all books again
**Area:** Edge Cases / Search
**Steps:** Navigate to the home page. Search for "Dune" and wait for filtered results. Clear the search input and press Enter.
**Expected Result:** The book grid reloads with exactly 12 book cards, restoring the default unfiltered catalog view.

### 80. Signup with existing username shows error
**Area:** Edge Cases / Signup
**Steps:** Reset the API. Navigate to /signup. Enter the username "testuser1" (already exists), a unique email, and a valid password. Click submit.
**Expected Result:** An error message is displayed on the signup page, indicating the username is already taken.

### 81. Non-existent route shows the appropriate page
**Area:** Edge Cases / Routing
**Steps:** Navigate to /nonexistent-route.
**Expected Result:** The URL contains /nonexistent-route. The application handles the unknown route gracefully (renders a 404 page or falls through to the home page).

### 82. Book detail with invalid ID format
**Area:** Edge Cases / Routing
**Steps:** Navigate to /books/completely-invalid-id-12345.
**Expected Result:** The "not found" element is displayed on the book detail page, indicating no book matches the given ID.

### 83. Create listing without selecting book shows validation
**Area:** Edge Cases / Marketplace Validation
**Steps:** Login as testuser1. Navigate to /marketplace/sell. Fill in the price ($10.00) but leave the book select at its default/empty value. Click submit.
**Expected Result:** The browser's HTML required validation prevents form submission. The page stays on /marketplace/sell and the book select element reports validity.valid as false.

### 84. Create listing without price shows validation
**Area:** Edge Cases / Marketplace Validation
**Steps:** Login as testuser1. Navigate to /marketplace/sell. Select a book from the dropdown but leave the price field empty. Click submit.
**Expected Result:** The browser's HTML required validation prevents form submission. The page stays on /marketplace/sell.

### 85. Theme persists across page navigation
**Area:** Edge Cases / Theme
**Steps:** Navigate to the home page. Click the theme toggle to change the theme. Read the data-theme attribute. Navigate to /marketplace. Read the data-theme attribute again.
**Expected Result:** The data-theme attribute value is the same on both pages, confirming the theme selection persists across client-side navigation.

### 86. Accessing non-existent order shows not found
**Area:** Edge Cases / Orders
**Steps:** Login as testuser1. Navigate to /orders/nonexistent-order-id.
**Expected Result:** The order detail page displays the "not found" element, indicating no order exists with that ID.

---

## Bug Discovery (3 failing tests)

**Spec file:** `tests/bug-discovery/flow-bugs.spec.ts`

### 87. Login with invalid credentials should show error message but gets redirected
**Area:** Bug Discovery / Auth UX
**Steps:** Navigate to /login. Enter invalid credentials (wrong@example.com / WrongPass1!). Click Sign In. Wait 2 seconds for the response.
**Expected Result (intended):** An error message should appear on the login page informing the user their credentials are invalid.
**Actual Result (bug):** The global 401 axios interceptor in `services/api.js` fires before the LoginPage catch block, redirecting to /login with empty fields. No error message is ever shown. See BUG-001 in the bug report.

### 88. Sidebar balance should update after checkout
**Area:** Bug Discovery / State Management
**Steps:** Reset the API. Login as testuser1 (balance: $100.00). Add the first book ($12.99) to cart. Navigate to /cart and click Checkout. On the order detail page, read the sidebar balance.
**Expected Result (intended):** The sidebar balance should display $87.01 after the $12.99 purchase.
**Actual Result (bug):** The sidebar balance still shows $100.00 because `CartPage.jsx` never calls `refreshUser()` from AuthContext after checkout. See BUG-002 in the bug report.

### 89. Cart badge should clear after checkout
**Area:** Bug Discovery / State Management
**Steps:** Reset the API. Login as testuser1. Add a book to cart (badge shows "1"). Navigate to /cart and click Checkout. On the order detail page, check whether the cart badge is present.
**Expected Result (intended):** The cart badge should disappear or show "0" since the cart is now empty after checkout.
**Actual Result (bug):** The cart badge still shows "1" because `CartPage.jsx` never calls `fetchCart()` from CartContext after checkout, leaving stale cart items in the frontend state. See BUG-003 in the bug report.
