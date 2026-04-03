# E2E Test Scenarios - BookHive

**Generated:** 2026-04-03
**Framework:** Playwright + @civitas-cerebrum/element-interactions
**Total Tests:** 53 (49 passing, 1 failing bug reproduction, 3 skipped)

---

## Test Suite Overview

| Suite | Tests | Status |
|-------|-------|--------|
| Authentication | 10 | 9 pass, 1 skip |
| Home & Browsing | 9 | All pass |
| Book Details | 5 | All pass |
| Shopping Cart | 7 | All pass |
| Checkout | 2 | 2 skip (blocked by bug) |
| Orders | 4 | All pass |
| Marketplace | 4 | All pass |
| Profile | 3 | All pass |
| Bug Discovery | 3 | 1 fail (expected), 2 pass |

---

## Detailed Test Scenarios

### 1. Authentication (`auth.spec.ts`)

#### Login Page
| # | Test Case | Status |
|---|-----------|--------|
| 1 | should display login form | Pass |
| 2 | should display "Welcome back" title | Pass |
| 3 | should have link to signup page | Pass |
| 4 | should show error for invalid credentials | Skip (BUG-001) |
| 5 | should login successfully with valid credentials | Pass |

#### Signup Page
| # | Test Case | Status |
|---|-----------|--------|
| 6 | should display signup form | Pass |
| 7 | should display "Create an account" title | Pass |
| 8 | should have link to login page | Pass |
| 9 | should signup successfully with valid data | Pass |
| 10 | should show error for duplicate email | Pass |

#### Logout
| # | Test Case | Status |
|---|-----------|--------|
| 11 | should logout successfully | Pass |

---

### 2. Home Page & Book Browsing (`home-browse.spec.ts`)

| # | Test Case | Status |
|---|-----------|--------|
| 1 | should display the home page with book grid | Pass |
| 2 | should display book cards with correct information | Pass |
| 3 | should display pagination controls | Pass |
| 4 | should navigate to next page when clicking Next | Pass |
| 5 | should navigate back when clicking Previous | Pass |
| 6 | should display sidebar navigation | Pass |
| 7 | should display genre filter links in sidebar | Pass |
| 8 | should filter books by Fiction genre | Pass |
| 9 | should filter books by Sci-Fi genre | Pass |
| 10 | should navigate to book detail page when clicking a book card | Pass |

---

### 3. Book Details (`book-detail.spec.ts`)

| # | Test Case | Status |
|---|-----------|--------|
| 1 | should display book detail page with all information | Pass |
| 2 | should show add to cart button for in-stock books | Pass |
| 3 | should add book to cart when clicking Add to Cart | Pass |
| 4 | should show not found message for invalid book ID | Pass |
| 5 | should display book price | Pass |

---

### 4. Shopping Cart (`cart.spec.ts`)

| # | Test Case | Status |
|---|-----------|--------|
| 1 | should display empty cart message when cart is empty | Pass |
| 2 | should display cart page with title | Pass |
| 3 | should add item to cart from homepage | Pass |
| 4 | should show total price in cart | Pass |
| 5 | should show checkout button when cart has items | Pass |
| 6 | should clear cart when clicking Clear button | Pass |
| 7 | should navigate to cart from sidebar | Pass |

---

### 5. Checkout (`checkout.spec.ts`)

| # | Test Case | Status |
|---|-----------|--------|
| 1 | should complete checkout and create order | Skip (BUG-002) |
| 2 | should show order in orders list after checkout | Skip (BUG-002) |

**Note:** Checkout tests are blocked by BUG-002 (zero balance, no deposit feature).

---

### 6. Orders (`orders.spec.ts`)

| # | Test Case | Status |
|---|-----------|--------|
| 1 | should display orders page with title | Pass |
| 2 | should show no orders message for new user | Pass |
| 3 | should navigate to orders from sidebar | Pass |
| 4 | should display orders page container | Pass |

---

### 7. Marketplace (`marketplace.spec.ts`)

| # | Test Case | Status |
|---|-----------|--------|
| 1 | should display marketplace page | Pass |
| 2 | should display create listing page | Pass |
| 3 | should show book selection dropdown on create listing | Pass |
| 4 | should navigate to marketplace from sidebar | Pass |

---

### 8. Profile (`profile.spec.ts`)

| # | Test Case | Status |
|---|-----------|--------|
| 1 | should display profile page with user info | Pass |
| 2 | should show user balance on profile | Pass |
| 3 | should show no listings message for new user | Pass |

---

### 9. Bug Discovery (`bug-discovery/*.spec.ts`)

| # | Test Case | Status | Bug ID |
|---|-----------|--------|--------|
| 1 | login error message never shown due to 401 interceptor | Fail (expected) | BUG-001 |
| 2 | new users cannot checkout due to zero balance | Pass | BUG-002 |
| 3 | checkout button enabled even with insufficient balance | Pass | BUG-003 |

**Note:** Bug discovery tests are designed to demonstrate defects. Test #1 fails because it asserts the CORRECT behavior (error should be shown), which proves the bug exists.

---

## Page Repository

All selectors are maintained in `data/page-repository.json`:

| Page | Elements |
|------|----------|
| Sidebar | 17 elements (navigation, auth controls, genre filters) |
| HomePage | 11 elements (search, book grid, pagination) |
| LoginPage | 7 elements (form fields, error, links) |
| SignupPage | 8 elements (form fields, error, links) |
| BookDetailPage | 11 elements (book info, cart controls) |
| CartPage | 10 elements (items, totals, checkout) |
| OrdersPage | 5 elements (list, no-orders state) |
| OrderDetailPage | 8 elements (order info, return controls) |
| MarketplacePage | 6 elements (listings, buy controls) |
| CreateListingPage | 6 elements (form fields) |
| ProfilePage | 7 elements (user info, listings) |

---

## Running Tests

```bash
# Run all tests
npx playwright test

# Run specific suite
npx playwright test tests/auth.spec.ts

# Run excluding bug discovery tests
npx playwright test --grep-invert "@bug-discovery"

# Run only bug discovery tests
npx playwright test --grep "@bug-discovery"

# Run with UI mode
npx playwright test --ui

# Generate HTML report
npx playwright show-report
```

---

## Test Architecture

```
tests/e2e/
├── fixtures/
│   └── base.ts              # Playwright fixture with Steps API
├── data/
│   └── page-repository.json # All page selectors
├── tests/
│   ├── auth.spec.ts
│   ├── home-browse.spec.ts
│   ├── book-detail.spec.ts
│   ├── cart.spec.ts
│   ├── checkout.spec.ts
│   ├── orders.spec.ts
│   ├── marketplace.spec.ts
│   ├── profile.spec.ts
│   └── bug-discovery/
│       ├── auth-bugs.spec.ts
│       └── checkout-bugs.spec.ts
├── docs/
│   ├── app-context.md
│   ├── bug-report.md
│   └── e2e-test-scenarios.md
├── bug-evidence/
│   ├── BUG-001-login-error-not-shown.png
│   └── BUG-002-zero-balance-checkout.png
└── playwright.config.ts
```
