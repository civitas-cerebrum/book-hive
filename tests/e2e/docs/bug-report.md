# Bug Report

This document tracks bugs discovered during E2E testing of the BookHive application.

## Summary

| Bug ID | Severity | Title | Status | Failing Tests |
|--------|----------|-------|--------|---------------|
| BUG-001 | Medium | Invalid login error message not displayed | Open | auth.spec.ts - should show error for invalid login |
| BUG-002 | High | Add to cart button has inconsistent testid | Open | book-detail.spec.ts - 2 tests |
| BUG-003 | High | Order cards not displayed after checkout | Open | checkout.spec.ts, orders.spec.ts - 3+ tests |
| BUG-004 | Medium | Genre filter chips not visible on desktop viewport | Open | homepage.spec.ts - 3 tests |
| BUG-005 | Low | Topbar/sidebar toggle hidden on desktop viewport | Open | navigation.spec.ts - 2 tests |

## Bug Details

### BUG-001: Invalid login error message not displayed

**Severity:** Medium

**Discovered By:** E2E test - auth.spec.ts

**Steps to Reproduce:**
1. Navigate to /login
2. Enter invalid email: invalid@email.com
3. Enter invalid password: wrongpassword
4. Click the login button

**Expected Behavior:**
An error message should be displayed with data-testid="login-error" containing "Invalid credentials"

**Actual Behavior:**
The error message element is not visible after submitting invalid credentials. The page stays on /login without displaying an error.

**Failing Tests:**
- `auth.spec.ts > Authentication > should show error for invalid login`

**Notes:**
- The API correctly returns an error response: `{"error":"login_failed","message":"Invalid credentials"}`
- The UI may not be properly displaying the error message to the user
- This could be a frontend bug where the error state is not being rendered

---

### BUG-002: Add to cart button has inconsistent testid

**Severity:** High

**Steps to Reproduce:**
1. Navigate to /books/book-001
2. Look for add to cart button with `[data-testid='add-to-cart-detail']`

**Expected Behavior:**
Add to cart button should be visible on book detail page with testid `add-to-cart-detail`

**Actual Behavior:**
Element `[data-testid='add-to-cart-detail']` not found. The button may exist with a different selector.

**Failing Tests:**
- `book-detail.spec.ts > Book Detail > should show add to cart button`
- `book-detail.spec.ts > Book Detail > should redirect to login when adding to cart unauthenticated`

**Notes:**
- The test "should add to cart when logged in" PASSES, suggesting this is timing-related
- When logged in, the button is found and works correctly
- May be a conditional rendering issue based on auth state

---

### BUG-003: Order cards not displayed after checkout

**Severity:** High

**Steps to Reproduce:**
1. Login as testuser1
2. Add book to cart from book detail page
3. Navigate to cart
4. Click checkout button
5. Observe orders page

**Expected Behavior:**
Order card with `[data-testid^='order-card-']` should be visible

**Actual Behavior:**
No order cards found on page (0 elements matching selector)

**Failing Tests:**
- `checkout.spec.ts > Checkout > should complete checkout`
- `orders.spec.ts > Orders > should display order after purchase`
- `orders.spec.ts > Orders > should navigate to order detail`

**Notes:**
- This appears to be intermittent - some checkout-related tests pass while others fail
- May be a race condition or state management issue
- Some tests in the same flow (showing COMPLETED status) pass, indicating the issue is timing-related

---

### BUG-004: Genre filter chips not visible on desktop viewport

**Severity:** Medium

**Steps to Reproduce:**
1. Navigate to homepage at desktop viewport (1280x720)
2. Look for genre chip buttons

**Expected Behavior:**
Genre chips should be visible and clickable

**Actual Behavior:**
Elements exist in DOM but are not visible. The element was resolved in DOM but the click action fails with "element is not visible".

**Failing Tests:**
- `homepage.spec.ts > Homepage > should filter by Fiction genre`
- `homepage.spec.ts > Homepage > should filter by Sci-Fi genre`
- `homepage.spec.ts > Homepage > should filter by Mystery genre`

**Root Cause Hypothesis:**
Genre chips may only be visible on mobile viewport or require scrolling. This could be a responsive design decision.

---

### BUG-005: Topbar/sidebar toggle hidden on desktop viewport

**Severity:** Low

**Steps to Reproduce:**
1. Navigate to homepage at desktop viewport
2. Check topbar and sidebar toggle visibility

**Expected Behavior:**
Topbar and sidebar toggle should be visible

**Actual Behavior:**
Elements exist in DOM but report as "hidden" with CSS visibility/display.

**Failing Tests:**
- `navigation.spec.ts > Navigation > TopBar > should display topbar`
- `navigation.spec.ts > Navigation > TopBar > should display sidebar toggle`

**Root Cause Hypothesis:**
These elements are designed for mobile-only display via CSS media queries. At desktop viewport width, they're hidden because the sidebar is always visible.

---

## Test Infrastructure Notes

Several tests failed with "Test not found in the worker process" error. This is a Playwright infrastructure issue caused by test file modifications during test execution, not an application bug.

---

## Additional Notes

### Test Environment
- Frontend URL: http://localhost:7547
- Backend API: http://localhost:8080
- Database: MongoDB (seeded with test data)

### Test Users
- testuser1@bookhive.test / Test1234! (balance: $100)
- testuser2@bookhive.test / Test1234! (balance: $100)

---

*Report generated by QA Agent*
*Last updated: 2026-04-03*
