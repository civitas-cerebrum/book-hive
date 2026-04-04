# E2E Test Scenarios

**Date:** 2026-04-04
**Total tests:** 69
**Pass rate:** 100% (69/69)
**Coverage:** All 10 application pages, all major user flows

---

## Home Page & Browsing (12 tests)

| Test | File |
|------|------|
| Display book catalog with search and pagination | `home-and-browse.spec.ts` |
| Navigate to book detail page | `home-and-browse.spec.ts` |
| Filter books by genre category | `home-and-browse.spec.ts` |
| Display book catalog with cards | `home-browse.spec.ts` |
| Display pagination controls | `home-browse.spec.ts` |
| Navigate to next and previous pages | `home-browse.spec.ts` |
| Search books by title | `home-browse.spec.ts` |
| Display search icon | `home-browse.spec.ts` |
| Paginate through all pages | `search-and-filter.spec.ts` |
| Show no results for non-existent search | `search-and-filter.spec.ts` |
| Search by author name | `search-and-filter.spec.ts` |
| Clear search and show all books | `search-and-filter.spec.ts` |

## Genre Filtering (6 tests)

| Test | File |
|------|------|
| Filter by Fiction genre | `genre-filter.spec.ts` |
| Filter by Sci-Fi genre | `genre-filter.spec.ts` |
| Return to all books from genre filter | `genre-filter.spec.ts` |
| Filter by Biography genre | `search-and-filter.spec.ts` |
| Filter by Fantasy genre | `search-and-filter.spec.ts` |
| Filter by Mystery genre | `search-and-filter.spec.ts` |

## Book Detail Page (6 tests)

| Test | File |
|------|------|
| Display book details for Fiction book | `home-and-browse.spec.ts` |
| Navigate from home to book detail by clicking card | `book-detail.spec.ts` |
| Display book details for Sci-Fi book | `book-detail-extended.spec.ts` |
| Show not-found for invalid book ID | `book-detail-extended.spec.ts` |
| Show add to cart when logged in | `book-detail-extended.spec.ts` |
| Hide add to cart when not logged in | `book-detail-extended.spec.ts` |

## Authentication (7 tests)

| Test | File |
|------|------|
| Login with valid credentials | `auth.spec.ts` |
| Logout and show unauthenticated nav | `auth.spec.ts` |
| Display signup form with all fields | `signup.spec.ts` |
| Navigate from signup to login | `signup.spec.ts` |
| Navigate from login to signup | `signup.spec.ts` |
| Register a new user | `signup.spec.ts` |
| Show error for duplicate email | `signup.spec.ts` |

## Cart & Checkout (9 tests)

| Test | File |
|------|------|
| Add book to cart, view cart, checkout | `cart-and-checkout.spec.ts` |
| Show orders list with past orders | `cart-and-checkout.spec.ts` |
| Show empty cart initially | `cart-checkout.spec.ts` |
| Add book from detail page | `cart-checkout.spec.ts` |
| Complete checkout flow | `cart-checkout.spec.ts` |
| Show empty cart message | `cart-extended.spec.ts` |
| Clear cart using clear button | `cart-extended.spec.ts` |
| Display cart total | `cart-extended.spec.ts` |
| Add multiple books to cart | `cart-extended.spec.ts` |

## Orders & Balance (6 tests)

| Test | File |
|------|------|
| Display orders page heading | `orders.spec.ts` |
| Checkout redirects to order detail | `orders.spec.ts` |
| Display user balance in nav | `balance-and-orders.spec.ts` |
| Balance deducts after checkout | `balance-and-orders.spec.ts` |
| Show order items on detail page | `balance-and-orders.spec.ts` |
| Navigate from orders list to detail | `balance-and-orders.spec.ts` |

## Marketplace (6 tests)

| Test | File |
|------|------|
| Create marketplace listing | `marketplace.spec.ts` |
| Show user profile with balance | `marketplace.spec.ts` |
| Show no listings when empty | `marketplace-extended.spec.ts` |
| Create listing and verify on marketplace | `marketplace-extended.spec.ts` |
| Show listing on profile | `marketplace-extended.spec.ts` |
| Navigate to create listing page | `create-listing.spec.ts` |

## Profile (2 tests)

| Test | File |
|------|------|
| Display user profile information | `profile.spec.ts` |
| Logout returns to unauthenticated state | `profile.spec.ts` |

## Theme & Navigation (4 tests)

| Test | File |
|------|------|
| Theme toggle | `theme-nav.spec.ts` |
| Genre navigation links | `theme-nav.spec.ts` |
| Marketplace link | `theme-nav.spec.ts` |
| Unauthenticated cart redirect | `theme-nav.spec.ts` |

## Edge Cases & Security (8 tests)

| Test | File |
|------|------|
| Previous button disabled on page 1 | `edge-cases.spec.ts` |
| Search form submission via Enter | `edge-cases.spec.ts` |
| Direct URL access to book detail | `edge-cases.spec.ts` |
| Direct URL access to genre filter | `edge-cases.spec.ts` |
| Redirect unauth user from order detail | `edge-cases.spec.ts` |
| Marketplace accessible without auth | `edge-cases.spec.ts` |
| Book detail accessible without auth | `edge-cases.spec.ts` |
| Protected routes redirect to login | `protected-routes.spec.ts` |

## Bug Discovery (3 tests)

| Test | File | Status |
|------|------|--------|
| Login invalid credentials shows error | `bug-discovery/element-bugs.spec.ts` | PASS (BUG-001 resolved) |
| Negative price listing rejected | `bug-discovery/validation-bugs.spec.ts` | PASS (BUG-002 validated) |
| Insufficient balance checkout no error | `bug-discovery/validation-bugs.spec.ts` | PASS (BUG-003 confirmed) |
