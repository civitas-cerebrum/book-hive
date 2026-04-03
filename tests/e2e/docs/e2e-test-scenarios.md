# E2E Test Scenarios

This document describes all test scenarios covered in plain English.

## Authentication Tests (9 tests)

1. **Login page displays correctly** - Verifies that the login form shows email input, password input, and submit button.

2. **Login with valid credentials** - User can log in with a valid email and password, redirects to homepage.

3. **Signup page displays correctly** - Verifies that the registration form shows username, email, password inputs, and submit button.

4. **Signup with valid data** - User can create a new account and is redirected to homepage.

5. **Signup with duplicate email shows error** - When attempting to register with an email already in use, an error message is displayed.

6. **Logout successfully** - User can log out and is redirected to unauthenticated state.

7. **Protected routes redirect to login** - Visiting cart, orders, profile, or sell page when not logged in redirects to login.

8. **Navigate from login to signup** - Clicking the signup link on login page navigates to signup page.

9. **Navigate from signup to login** - Clicking the login link on signup page navigates to login page.

## Homepage Tests (11 tests)

1. **Display book grid** - Homepage shows a grid of book cards with title, author, and price.

2. **Display navigation** - Navigation sidebar shows all expected links.

3. **Search books by title** - Typing in search filters books by title/author.

4. **Navigate to book detail** - Clicking a book card navigates to the book detail page.

5. **Display pagination controls** - Homepage shows Previous/Next buttons and page indicator.

6. **Paginate to next page** - Clicking Next button loads more books.

7. **Filter by Fiction genre** - Clicking Fiction genre filter shows only fiction books.

8. **Filter by Sci-Fi genre** - Clicking Sci-Fi genre filter shows only sci-fi books.

9. **Filter by Mystery genre** - Clicking Mystery genre filter shows only mystery books.

10. **Display theme toggle** - Theme toggle button is visible.

11. **Clear search shows all books** - Clearing search input shows all books again.

## Book Detail Tests (9 tests)

1. **Display book details** - Book detail page shows title, author, price, and description.

2. **Display book title text** - Title element contains text.

3. **Display book genre** - Genre badge is visible and contains text.

4. **Display stock information** - Stock availability indicator is visible.

5. **Show add to cart when authenticated** - Add to Cart button appears when logged in.

6. **Show not found for invalid book** - Invalid book ID shows "Book not found" message.

7. **Add book to cart** - Clicking Add to Cart adds item and shows cart badge.

8. **Hide add to cart when not authenticated** - Add to Cart button is not visible when logged out.

9. **Navigate back to homepage** - Clicking All Books link returns to homepage.

## Shopping Cart Tests (9 tests)

1. **Show empty cart message** - Empty cart displays "Your cart is empty" message.

2. **Display cart page elements** - Cart page shows items, total, and checkout button.

3. **Add item to cart from book detail** - Adding a book shows cart badge.

4. **Display cart items after adding** - Cart shows items with quantity and price.

5. **Increase item quantity** - Clicking plus button increases quantity.

6. **Remove item from cart** - Clicking remove button removes item from cart.

7. **Clear entire cart** - Clicking clear button removes all items.

8. **Show checkout button with items** - Checkout button appears when cart has items.

9. **Display cart total** - Cart total is calculated and displayed.

## Checkout Tests (5 tests)

1. **Complete checkout successfully** - Clicking checkout creates order and redirects to order detail.

2. **Order shows COMPLETED status** - Order detail page shows COMPLETED status.

3. **Empty cart after checkout** - Cart is empty after successful checkout.

4. **Deduct balance after checkout** - User balance decreases by order total.

5. **Display order items on detail page** - Order detail shows purchased items.

## Orders Tests (6 tests)

1. **Show no orders initially** - Orders page shows "No orders yet" after database reset.

2. **Display order after purchase** - Order appears in orders list after checkout.

3. **Navigate to order detail** - Clicking order navigates to detail page.

4. **Show return button on recent order** - Return button and countdown appear within return window.

5. **Process order return** - Clicking return changes order status to RETURNED.

6. **Display order total on detail page** - Order total is shown on detail page.

## Marketplace Tests (9 tests)

1. **Display marketplace page** - Marketplace page loads with heading.

2. **Show no listings when empty** - Empty marketplace shows appropriate message.

3. **Accessible without authentication** - Marketplace can be browsed without logging in.

4. **Display create listing page** - Create listing form shows book selector, condition, and price.

5. **Create listing successfully** - User can create a new listing.

6. **Show listing on marketplace** - New listing appears on marketplace page.

7. **Show listing in profile** - User's listings appear on their profile.

8. **Redirect to login when unauthenticated** - Creating listing without auth redirects to login.

9. **Display condition badges** - Listing cards show condition badge (NEW, GOOD, etc.).

## Navigation Tests (16 tests)

1. **Show public navigation items** - All Books, Marketplace, genre links visible when logged out.

2. **Hide authenticated items when logged out** - Cart, Orders, Profile links not visible when logged out.

3. **Navigate to marketplace** - Clicking Marketplace link works.

4. **Navigate to login** - Clicking Login link works.

5. **Navigate to signup** - Clicking Sign Up link works.

6. **Show authenticated items when logged in** - Cart, Orders, Profile, Logout visible when logged in.

7. **Hide public auth links when authenticated** - Login/Signup links hidden when logged in.

8. **Navigate to cart** - Clicking Cart link navigates to cart page.

9. **Navigate to orders** - Clicking Orders link navigates to orders page.

10. **Navigate to profile** - Clicking Profile link navigates to profile page.

11. **Show cart badge when items in cart** - Cart badge appears with item count.

12. **Display user balance** - User balance shown in sidebar.

13. **Display topbar on mobile** - Mobile topbar is visible on small screens.

14. **Display sidebar toggle on mobile** - Hamburger menu appears on mobile.

15. **Display theme toggle** - Theme toggle button is visible.

16. **Toggle theme when clicked** - Clicking theme button changes theme.

17. **Display logo with BookHive text** - Logo/brand text is visible.

## Profile Tests (7 tests)

1. **Display profile page with user info** - Profile shows username, email, balance.

2. **Display starting balance** - Balance shows $100.00 after reset.

3. **Show no listings when none exist** - Profile shows "No active listings" when empty.

4. **Navigate from sidebar to profile** - Profile link in sidebar works.

5. **Show balance in sidebar** - Balance appears in navigation sidebar.

6. **Display email correctly** - Email field contains user's email.

7. **Display username correctly** - Username field contains user's name.

---

## Bug Discovery Tests (1 test - expected to fail)

1. **@bug-discovery Login with invalid credentials should show error message** - Tests that error message appears on failed login (currently fails due to BUG-001).

---

**Total: 82 test scenarios** (81 passing + 1 bug reproduction)
