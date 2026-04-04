# Bug Report
**Date:** 2026-04-04
**App:** http://localhost:7547
**Total findings:** 1
**New bugs:** 1 | **Regression candidates:** 0 | **Undocumented quirks:** 0 | **Known but untested:** 0

## Summary by Severity
| Severity | Count | Categories |
|----------|-------|------------|
| Critical | 0     | —          |
| High     | 1     | Authentication error handling |
| Medium   | 0     | —          |
| Low      | 0     | —          |

## Findings

### [BUG-001] Login form does not display error message on invalid credentials
**Severity:** High
**Category:** Authentication error handling
**Phase discovered:** 1a (Element Probing)
**Page:** LoginPage — `/login`
**Reproduction test:** `tests/e2e/tests/bug-discovery/element-bugs.spec.ts:20`
**Steps:**
1. Navigate to /login
2. Enter an invalid email (e.g., "invalid@email.com")
3. Enter an invalid password (e.g., "wrongpassword")
4. Click "Sign In"
5. Observe the page

**Expected:** An error message such as "Invalid credentials" or "Login failed" should appear below the form heading, informing the user that their credentials are incorrect.

**Actual:** The login form reloads with empty fields and NO error message is displayed. The user receives zero feedback about why their login attempt failed.

**Root Cause Analysis:**
The axios response interceptor in `frontend/src/services/api.js` (lines 8-16) intercepts ALL 401 responses and performs `window.location.href = '/login'`. When the login API returns a 401 for invalid credentials, this interceptor fires BEFORE the `LoginPage` component's catch block can set the error state. The `window.location.href` assignment triggers a full browser page reload (not a React Router navigation), which destroys the entire React component tree, including any error state that might have been briefly set.

**Impact:** Users who enter incorrect credentials have no way to know what went wrong. They see an empty login form and may think the application is broken or their account doesn't exist.

**Suggested Fix:** The 401 interceptor should exclude the `/auth/login` endpoint from the redirect logic. For example:
```javascript
if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
  window.location.href = '/login';
}
```

**Screenshot:** See `tests/e2e/evidence/BUG-001.png`

---

## Coverage Notes
- Pages probed: 10/10 (all routes)
- Flows tested: Login, signup, browse, cart, checkout, orders, marketplace listing, profile
- Categories covered: Boundary inputs, state transitions, form validation, empty states, authentication, protected routes
- Areas not probed: Return order flow (requires specific time-window), multi-user concurrent scenarios
