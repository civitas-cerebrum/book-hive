# Bug Report - BookHive E2E Testing

**Generated:** 2026-04-03
**Test Suite:** Playwright E2E Automation
**Tester:** QA Agent

---

## Summary

During comprehensive E2E testing of the BookHive application, **3 bugs** were discovered:
- **1 Critical** (blocks core functionality)
- **1 High** (significantly impacts user experience)
- **1 Medium** (usability issue)

---

## Bug Details

### BUG-001: Login Error Message Never Shown

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Status** | Open |
| **Component** | Authentication |
| **File** | `frontend/src/services/api.js` |

**Description:**
When a user attempts to log in with invalid credentials, no error message is displayed. Instead, the page reloads/redirects and the form is cleared.

**Steps to Reproduce:**
1. Navigate to `/login`
2. Enter invalid email (e.g., `invalid@test.com`)
3. Enter any password
4. Click "Sign In" button

**Expected Behavior:**
An error message should appear indicating "Invalid credentials" or similar feedback.

**Actual Behavior:**
- The API returns 401 (correct)
- The axios interceptor catches the 401 and redirects to `/login`
- This causes a page reload which clears the form
- No error message is ever displayed to the user

**Root Cause:**
```javascript
// frontend/src/services/api.js
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/login';  // Redirects on ANY 401, including login failure
    }
    return Promise.reject(error);
  }
);
```

**Suggested Fix:**
The interceptor should NOT redirect when already on `/login` page, or the login API should return a different status code for invalid credentials.

**Evidence:**
Screenshot: `bug-evidence/BUG-001-login-error-not-shown.png`

---

### BUG-002: New Users Cannot Checkout (Zero Balance, No Deposit Feature)

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Status** | Open |
| **Component** | Checkout / User Balance |
| **Files** | `backend/.../model/User.java`, `backend/.../service/OrderService.java` |

**Description:**
New users start with $0.00 balance. Checkout requires balance >= order total. There is no "Add Funds" or "Deposit" feature in the application. This creates a situation where new users cannot make any purchases.

**Steps to Reproduce:**
1. Create a new user account
2. Add any item to cart
3. Attempt to checkout

**Expected Behavior:**
Either:
- New users should receive initial balance (e.g., welcome bonus)
- A "Add Funds" / "Deposit" feature should exist
- Cart should warn about insufficient balance before checkout

**Actual Behavior:**
- Checkout fails with 400 "Insufficient balance"
- User has no way to add funds
- Only way to get balance is to sell books and have another user (with balance) buy them

**Root Cause:**
```java
// User.java line 29 - Users start with zero balance
this.balance = 0.0;

// OrderService.java line 49 - Checkout requires balance
if (user.getBalance() < total) {
    throw new IllegalArgumentException("Insufficient balance");
}
```

**Impact:**
This is a **critical business logic flaw** - the application is essentially unusable for new users who want to purchase books.

**Evidence:**
Screenshot: `bug-evidence/BUG-002-zero-balance-checkout.png`

---

### BUG-003: Checkout Button Enabled with Insufficient Balance

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Status** | Open |
| **Component** | Cart UI |
| **File** | `frontend/src/pages/CartPage.jsx` |

**Description:**
The checkout button is always enabled regardless of user's balance. Users can click checkout even when they don't have sufficient funds, leading to a confusing error.

**Steps to Reproduce:**
1. Login as user with $0 balance
2. Add items to cart
3. Observe checkout button is enabled

**Expected Behavior:**
- Checkout button should be disabled when balance < cart total
- Or show a tooltip/warning explaining the balance requirement

**Actual Behavior:**
- Button is always enabled
- User clicks, gets error, no clear feedback

**Suggested Fix:**
Add client-side validation to disable checkout button when `userBalance < cartTotal`.

---

## Test Coverage Impact

Due to these bugs, **2 checkout tests are blocked**:
- `should complete checkout and create order`
- `should show order in orders list after checkout`

These tests are marked as skipped with reference to BUG-002.

---

## Recommendations

### Immediate Actions
1. **BUG-002 (Critical):** Implement one of these solutions:
   - Give new users initial balance ($50 welcome bonus)
   - Add "Deposit Funds" feature
   - Implement payment gateway integration

2. **BUG-001 (High):** Fix the 401 interceptor to skip redirect when on login page:
   ```javascript
   if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
     window.location.href = '/login';
   }
   ```

3. **BUG-003 (Medium):** Add UI validation to cart checkout button

### Long-term Improvements
- Add comprehensive API error handling across all forms
- Implement toast/notification system for user feedback
- Add client-side balance validation before API calls

---

## Files Modified/Created

### Bug Discovery Tests
- `tests/bug-discovery/auth-bugs.spec.ts` - BUG-001 reproduction
- `tests/bug-discovery/checkout-bugs.spec.ts` - BUG-002, BUG-003 reproduction

### Evidence
- `bug-evidence/BUG-001-login-error-not-shown.png`
- `bug-evidence/BUG-002-zero-balance-checkout.png`
