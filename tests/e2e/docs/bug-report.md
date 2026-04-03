# Bug Report - BookHive Application

## Summary
This document contains bugs discovered during E2E test development and exploration of the BookHive application.

---

## Bug #1: Login Error Message Not Displayed

**Severity:** Medium
**Component:** Authentication
**Status:** Open

### Description
When a user attempts to login with invalid credentials, no error message is displayed in the UI. The form should display an error message at `[data-testid='login-error']` to inform the user that their credentials are incorrect.

### Steps to Reproduce
1. Navigate to `/login`
2. Enter invalid email: `invalid@email.com`
3. Enter invalid password: `wrongpassword`
4. Click "Sign In" button

### Expected Result
An error message should appear indicating invalid credentials.

### Actual Result
The form appears to submit (possibly shows loading state) but no error message is displayed to the user.

### Impact
Users have no feedback when login fails, leading to confusion about why they cannot access the application.

---

## Bug #2: Cart Item Quantity Display Issues

**Severity:** Low
**Component:** Shopping Cart
**Status:** Open

### Description
After increasing or decreasing cart item quantity, the displayed quantity value sometimes requires additional time to update in the UI. The quantity display element at `[data-testid^="cart-qty-"]` may show stale values.

### Steps to Reproduce
1. Login as a user
2. Add a book to cart
3. Go to cart page
4. Click the "+" button to increase quantity
5. Immediately check the displayed quantity

### Expected Result
Quantity should update instantly to show the new value.

### Actual Result
There's a brief delay before the quantity updates, and sometimes the test fails because the value hasn't propagated yet.

### Impact
Minor UX issue - users may think their action didn't work.

---

## Bug #3: Genre Filter URL Encoding

**Severity:** Low
**Component:** Book Catalog
**Status:** Open

### Description
When filtering books by genre, the URL parameters are encoded inconsistently. The filter for "Sci-Fi" genre sometimes doesn't match the expected URL pattern `genre=Sci-Fi`.

### Steps to Reproduce
1. Navigate to homepage (`/`)
2. Click on "Sci-Fi" genre chip
3. Check the URL

### Expected Result
URL should contain `genre=Sci-Fi`

### Actual Result
URL may contain differently encoded value or the navigation timing causes test flakiness.

### Impact
Low impact - functionality works, but URL bookmarking may be inconsistent.

---

## Bug #4: API Signup Endpoint Returns 500 Error

**Severity:** High
**Component:** Backend API
**Status:** Open

### Description
The API endpoint `/api/auth/signup` returns a 500 Internal Server Error when attempting to register new users via direct API calls, even with valid data.

### Steps to Reproduce
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!@#"}' \
  http://localhost:8080/api/auth/signup
```

### Expected Result
```json
{"success": true, "user": {...}}
```

### Actual Result
```json
{"error":"internal_error","message":"An unexpected error occurred"}
```

### Impact
High - Cannot register users via API. Frontend signup still works through UI, but API-based testing is impaired.

---

## Bug #5: Checkout Button Disabled State

**Severity:** Low
**Component:** Shopping Cart
**Status:** Open

### Description
When a user's balance is lower than the cart total, the checkout button should be disabled with a clear message. Currently, the disabled state may not be clearly communicated.

### Steps to Reproduce
1. Create a new user (default balance: $100)
2. Add multiple expensive books to cart (total > $100)
3. Navigate to cart
4. Observe checkout button state

### Expected Result
Checkout button should be disabled with a tooltip or message explaining insufficient balance.

### Actual Result
Behavior needs verification - may silently fail or show cryptic error.

### Impact
Users may be confused about why they cannot complete checkout.

---

## Bug #6: Strict Mode Violations in Selectors

**Severity:** Medium
**Component:** Frontend UI
**Status:** Open

### Description
Several data-testid attributes in the cart and order pages match multiple elements, causing Playwright strict mode violations. For example, `[data-testid^="cart-item-"]` matches `cart-item-{id}`, `cart-item-title-{id}`, and `cart-item-price-{id}`.

### Affected Components
- Cart item rows
- Order items
- Listing cards

### Recommendation
Consider using more specific naming conventions:
- `cart-item-row-{id}` for the row container
- `cart-item-title-{id}` for the title
- `cart-item-price-{id}` for the price

---

## Test Stability Notes

Some tests exhibit flakiness due to:
1. Race conditions between UI updates and assertions
2. Network timing variations
3. Database state dependencies between tests

### Recommendations
1. Add explicit waits for API responses using `waitForResponse`
2. Use more granular data-testid attributes
3. Consider implementing test data isolation (create fresh user per test)
4. Add retry logic for flaky operations

---

## Environment Details
- **Frontend**: React 18.2.0 running on port 7547
- **Backend**: Spring Boot 3.2.3 running on port 8080
- **Database**: MongoDB 7
- **Browser**: Chromium (Playwright)

---

*Generated by QA Agent during E2E test suite development*
