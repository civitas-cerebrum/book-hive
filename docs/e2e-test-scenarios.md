# E2E Test Scenarios

## Test Suite Overview

**Total Tests:** 99+ (63 existing + 43 new + 2 bug reproduction)
**Framework:** Playwright with custom fixtures
**Base URL:** http://localhost:7547
**API URL:** http://localhost:8080

---

## Test Files

### Existing Tests (from baseline)

#### auth.spec.ts (9 tests)
- Login page displays form elements
- Successful login with valid credentials
- Login with invalid credentials stays on login page
- Login with empty email shows HTML5 validation
- Signup link navigates to signup page
- Signup page displays form elements
- Successful signup with valid data
- Signup with existing email shows error
- Logout returns to guest state

#### book-detail.spec.ts (5 tests)
- Displays complete book information
- Shows genre badge correctly
- Shows add-to-cart for unauthenticated users
- Shows not found for non-existent book
- Different book shows different details

#### cart.spec.ts (8 tests)
- Empty cart shows message
- Add item from home page
- Cart displays items correctly
- Update item quantity (increase)
- Decrease item quantity
- Remove item from cart
- Clear entire cart
- Checkout creates order

#### home.spec.ts (9 tests)
- Displays book grid with cards
- Each card shows title, author, genre, price
- First book card correct data
- Search filters by title
- Search filters by author
- Search with no results
- Pagination forward/backward
- Clicking book card navigates to detail
- Genre filter from sidebar

#### marketplace.spec.ts (7 tests)
- Displays marketplace page
- Shows listings from seed data
- Listing card details
- Create listing form elements
- Create listing successfully
- Sell link visible when authenticated
- Cancel listing from profile

#### navigation.spec.ts (18 tests)
- Sidebar display and guest navigation
- All Books, Marketplace, Login, Sign Up links
- Authenticated navigation items
- Cart, Orders, Sell, Profile navigation
- User balance display
- 6 genre filter tests (Fiction, Sci-Fi, Non-Fiction, Biography, Fantasy, Mystery)

#### orders.spec.ts (5 tests)
- Orders page display
- Order after checkout
- Navigate to order detail
- Order status display
- Balance deduction after checkout

#### profile.spec.ts (4 tests)
- Profile page user information
- Profile listings section
- Balance display
- Auth required for profile

---

### New Tests (added in this session)

#### cart-quantity.spec.ts (5 tests)
- Increase quantity with plus button
- Minus button disabled at quantity 1
- Remove item with remove button
- Cart item displays title and price
- Cart total updates when quantity changes

#### search-pagination.spec.ts (8 tests)
- Search query appears in URL
- Pagination resets when searching
- Case-insensitive search
- Search by author name
- Empty state for nonexistent search
- Genre filter displays correct books
- Clear search when clicking All Books
- Genre filter updates URL

#### balance-flow.spec.ts (3 tests)
- Initial balance $100.00
- Balance matches on profile and sidebar
- Balance refunded after return

#### order-details.spec.ts (5 tests)
- Order total on detail page
- Correct item count in order
- Multiple orders on list
- RETURNED status after return
- Not found for invalid order ID

#### book-detail-auth.spec.ts (3 tests)
- Add to cart from detail updates badge
- Complete Sci-Fi book information
- Navigate from card to detail

#### marketplace-buy.spec.ts (4 tests)
- Buyer redirected to order after purchase
- Listing shows title, condition, price
- No buy button on own listing
- No buy button for guests

#### auth-session.spec.ts (7 tests)
- Auth persists across navigation
- Authenticated sidebar items
- Guest sidebar items
- Login error stays on page
- Cart persists across SPA navigation
- New user balance after signup
- Protected routes redirect to login

#### theme-ui.spec.ts (8 tests)
- Toggle theme
- Different icon per theme
- Theme persists across pages
- Genre filter links in sidebar
- Emoji book cover on cards
- Pagination info display
- Next button disabled on last page
- 12 books per page

---

### Bug Discovery Tests

#### bug-discovery/bugs.spec.ts (2 tests)
- BUG-001: Cart badge disappears after hard navigation
- BUG-003: Signup user shows $0.00 balance

---

## Coverage Summary

| Feature Area | Tests | Coverage |
|---|---|---|
| Authentication (Login/Signup/Logout) | 16 | High |
| Home Page (Browse/Search) | 17 | High |
| Book Detail | 8 | High |
| Cart (Add/Remove/Quantity/Checkout) | 13 | High |
| Orders (List/Detail/Return) | 10 | High |
| Marketplace (List/Create/Buy/Cancel) | 11 | High |
| Navigation & Sidebar | 18 | High |
| Profile | 4 | Medium |
| Theme Toggle | 3 | Medium |
| UI/Pagination | 8 | High |
| Balance/Financial | 3 | Medium |
| Bug Reproduction | 2 | N/A |
