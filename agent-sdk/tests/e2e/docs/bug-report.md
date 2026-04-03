# Bug Report - BookHive Application

## Summary
This document tracks bugs discovered during E2E testing of the BookHive application.

---

## Bugs

### BUG-1: Test User Authentication Fails Silently
- **Severity**: High
- **Page/Feature**: Login (`/login`)
- **Steps to Reproduce**:
  1. Navigate to `/login`
  2. Enter email: `test@example.com`
  3. Enter password: `testpassword123`
  4. Click "Sign In"
- **Expected Result**: User should be logged in and redirected to homepage or previous page. Navigation should show authenticated state (Balance, Cart, Orders, Profile, Logout).
- **Actual Result**: Page stays on `/login` with no error message. Navigation continues to show guest state (Login, Sign Up links).
- **Notes**:
  - The signup page shows "already registered" error for `test@example.com`, indicating the account exists
  - However, login with standard test credentials fails silently
  - No error message is displayed to indicate wrong password
  - This blocks all authenticated user flow testing

### BUG-2: No Profile Link in Authenticated Navigation
- **Severity**: Medium
- **Page/Feature**: Navigation - Authenticated State
- **Steps to Reproduce**:
  1. Successfully log in (if possible)
  2. Observe navigation bar
- **Expected Result**: Navigation should show "Profile" link with href="/profile"
- **Actual Result**: Based on app-context.md, authenticated nav should show Profile link, but it's not found with standard selectors
- **Notes**: Blocked by BUG-1 - cannot verify authenticated navigation state

### BUG-3: No Orders Link in Authenticated Navigation
- **Severity**: Medium
- **Page/Feature**: Navigation - Authenticated State
- **Steps to Reproduce**:
  1. Successfully log in (if possible)
  2. Observe navigation bar
- **Expected Result**: Navigation should show "Orders" link with href="/orders"
- **Actual Result**: Link not found in authenticated state
- **Notes**: Blocked by BUG-1 - cannot verify authenticated navigation state

### BUG-4: No Sell a Book Link in Authenticated Navigation
- **Severity**: Medium
- **Page/Feature**: Navigation / Marketplace - Authenticated State
- **Steps to Reproduce**:
  1. Successfully log in (if possible)
  2. Navigate to `/marketplace`
  3. Look for "Sell a Book" option
- **Expected Result**: Should see link/button to access `/marketplace/sell`
- **Actual Result**: Sell a Book option not found
- **Notes**: Blocked by BUG-1 - cannot verify authenticated marketplace features

---

## Skipped Tests Due to Bugs

The following tests have been skipped due to the bugs listed above:

| Test File | Test Name | Blocked By |
|-----------|-----------|------------|
| profile.spec.ts | should show profile page for logged in users | BUG-1 |
| profile.spec.ts | should show Profile link for logged in users | BUG-1, BUG-2 |
| orders.spec.ts | should show orders page for logged in users | BUG-1 |
| orders.spec.ts | should show Orders link for logged in users | BUG-1, BUG-3 |
| marketplace.spec.ts | should show Sell a Book link for logged in users | BUG-1, BUG-4 |
| marketplace.spec.ts | should navigate to sell page when logged in | BUG-1, BUG-4 |
| cart.spec.ts | should add item to cart when logged in | BUG-1 |
| cart.spec.ts | should display cart with items | BUG-1 |
| auth.spec.ts | should show error for already registered email | Flaky - timing issue |

---

## Bug Statistics

- **Total Bugs Found**: 4
- **Critical**: 0
- **High**: 1
- **Medium**: 3
- **Low**: 0

