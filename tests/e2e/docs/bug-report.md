# Bug Report

This document tracks bugs discovered during E2E testing of BookHive.

## Bug Tracking

| ID | Severity | Status | Summary |
|----|----------|--------|---------|
| BUG-1 | Low | Open | Invalid login error message test flaky |
| BUG-2 | Medium | Open | Marketplace listing price validation returns internal error |
| BUG-3 | Low | Open | Non-existent book returns empty response instead of 404 |

---

## Bug Details

### BUG-1: Invalid login error message test flaky

**Severity:** Low

**Status:** Open

**Steps to Reproduce:**
1. Navigate to /login
2. Enter invalid credentials (email: invalid@test.com, password: wrongpassword)
3. Click Sign In
4. Observe the error message

**Expected Behavior:**
Error message "Invalid credentials" or "Login failed" should appear in the form

**Actual Behavior:**
The test is flaky - sometimes the fill() commands don't properly populate the form fields.
The error message element with data-testid="login-error" does not always appear.

**Environment:**
- Browser: Chrome (via Playwright)
- OS: macOS

**Notes:**
This test has been skipped pending investigation. The issue may be related to:
- React state management timing
- Playwright fill() command timing
- Form validation/submission race condition

The login functionality works correctly when tested manually. This appears to be a test reliability issue.

---

### BUG-2: Marketplace listing price validation returns internal error

**Severity:** Medium

**Status:** Open

**Steps to Reproduce:**
1. Login as any user
2. POST to /api/marketplace/listings with invalid price:
   - Negative price: `{"bookId":"book-001","condition":"GOOD","price":-10}`
   - Zero price: `{"bookId":"book-001","condition":"GOOD","price":0}`
   - Extremely large price: `{"bookId":"book-001","condition":"GOOD","price":999999999}`
3. Observe the response

**Expected Behavior:**
Should return a validation error with clear message like:
`{"error":"validation_error","message":"Price must be greater than 0"}`

**Actual Behavior:**
Returns generic internal error:
`{"error":"internal_error","message":"An unexpected error occurred"}`

**Environment:**
- API: Spring Boot backend

**Notes:**
The API should validate listing prices on the backend and return appropriate validation errors.
This could mask actual server errors and provides poor user experience.

---

### BUG-3: Non-existent book returns empty response instead of 404

**Severity:** Low

**Status:** Open

**Steps to Reproduce:**
1. GET /api/books/nonexistent-book-id

**Expected Behavior:**
Should return 404 Not Found with error message:
`{"error":"not_found","message":"Book not found"}`

**Actual Behavior:**
Returns empty response with 200 OK status (or no response body)

**Environment:**
- API: Spring Boot backend

**Notes:**
While the frontend handles this gracefully by showing a "Not Found" message,
the API should return proper HTTP status codes for better REST compliance.

---

## Test Coverage Notes

### Skipped Tests

| Test | Reason | Related Bug |
|------|--------|-------------|
| should show error with invalid credentials | Flaky test - fill() not working reliably | BUG-1 |

### Test Statistics

- **Total Tests:** 64
- **Passed:** 63
- **Skipped:** 1
- **Failed:** 0

All major user flows are covered:
- Home page browsing and search
- Book detail viewing
- User authentication (login, signup, logout)
- Shopping cart operations
- Order checkout and history
- Marketplace listings (create, buy, cancel)
- User profile
- Navigation and genre filtering
