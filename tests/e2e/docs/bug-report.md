# BookHive Bug Report

This document tracks bugs discovered during E2E test development and exploratory testing.

## Bug Template

```
### BUG-XXX: [Brief Description]
- **Severity:** Critical | High | Medium | Low
- **Test:** [test file and test name that exposes this bug]
- **Steps to Reproduce:**
  1. Step 1
  2. Step 2
- **Expected Result:** What should happen
- **Actual Result:** What actually happens
- **Notes:** Additional context
```

---

## Discovered Bugs

### BUG-001: Login error message not displayed for invalid credentials
- **Severity:** Medium
- **Test:** `auth.spec.ts` >> `Authentication` >> `Login` >> `should show error with invalid credentials`
- **Steps to Reproduce:**
  1. Navigate to /login
  2. Enter an invalid email (e.g., "invalid@test.com")
  3. Enter an invalid password (e.g., "wrongpassword")
  4. Click the "Sign In" button
- **Expected Result:** An error message should be displayed saying "Invalid credentials" or similar
- **Actual Result:** The page reloads and no error message is displayed. The form fields are cleared.
- **Notes:**
  - Root cause: The axios interceptor in `frontend/src/services/api.js` redirects to `/login` on any 401 response
  - When login fails (401), the interceptor triggers `window.location.href = '/login'` which reloads the page
  - This redirect happens BEFORE the error is propagated to the LoginPage component
  - The error state is never set, so no error message is displayed
  - **Fix:** The interceptor should NOT redirect on 401 responses from the `/auth/login` endpoint
  - The failing test serves as regression evidence for this bug

---

### BUG-002: Negative quantity in cart causes internal server error
- **Severity:** Medium
- **Test:** N/A (discovered via API probing)
- **Steps to Reproduce:**
  1. Login to get a valid token
  2. POST to `/api/cart/items` with body: `{"bookId":"book-001","quantity":-5}`
- **Expected Result:** Server should return a 400 Bad Request with validation error message
- **Actual Result:** Server returns 500 Internal Server Error with generic "An unexpected error occurred" message
- **Notes:**
  - Missing input validation for quantity field
  - Should validate that quantity > 0
  - Could expose backend stack traces in logs

---

### BUG-003: Negative price in marketplace listing causes internal server error
- **Severity:** Medium
- **Test:** N/A (discovered via API probing)
- **Steps to Reproduce:**
  1. Login to get a valid token
  2. POST to `/api/marketplace/listings` with body: `{"bookId":"book-001","condition":"GOOD","price":-10.00}`
- **Expected Result:** Server should return a 400 Bad Request with validation error message
- **Actual Result:** Server returns 500 Internal Server Error with generic "An unexpected error occurred" message
- **Notes:**
  - Missing input validation for price field
  - Should validate that price > 0
  - Could expose backend stack traces in logs

---

### BUG-004: Invalid condition value accepted when creating marketplace listing
- **Severity:** Low
- **Test:** N/A (discovered via API probing)
- **Steps to Reproduce:**
  1. Login to get a valid token
  2. POST to `/api/marketplace/listings` with body: `{"bookId":"book-001","condition":"INVALID","price":10.00}`
- **Expected Result:** Server should return a 400 Bad Request with validation error for invalid enum value
- **Actual Result:** Server creates the listing with condition "INVALID"
- **Notes:**
  - No enum validation for condition field
  - Valid values should be: NEW, LIKE NEW, GOOD, FAIR
  - This could cause display issues in the UI or data integrity problems
  - **Fix:** Add @Valid annotation and enum constraint in Spring Boot DTO

---

## Summary

| Bug ID | Severity | Category | Exposed By Test |
|--------|----------|----------|-----------------|
| BUG-001 | Medium | Frontend/UX | auth.spec.ts:34 |
| BUG-002 | Medium | Backend/Validation | API Probing |
| BUG-003 | Medium | Backend/Validation | API Probing |
| BUG-004 | Low | Backend/Validation | API Probing |

**Total Bugs Found:** 4
- **Critical:** 0
- **High:** 0
- **Medium:** 3
- **Low:** 1
