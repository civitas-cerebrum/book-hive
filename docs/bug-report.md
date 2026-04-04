# Bug Report
**Date:** 2026-04-04
**App:** http://localhost:7547 (BookHive)
**Total findings:** 2
**New bugs:** 2

## Summary by Severity
| Severity | Count | Categories |
|----------|-------|------------|
| High     | 1     | State transition |
| Medium   | 1     | UI/CSS |

## Findings

### [BUG-001] Login form shows no error message after failed login
**Severity:** High
**Status:** Confirmed
**Category:** State transition
**Page:** LoginPage — `/login`
**Reproduction test:** `tests/e2e/bug-discovery/element-bugs.spec.ts:16`

**Steps to Reproduce:**
1. Navigate to /login
2. Enter invalid email (e.g., "invalid@nonexistent.com") and password
3. Click "Sign In"
4. Observe the form

**Expected:** An error message like "Login failed" or "Invalid credentials" should appear in the `[data-testid="login-error"]` element.

**Actual:** The form fields are cleared and NO error message is displayed. The user has no indication that login failed.

**Root Cause:** The Axios response interceptor in `frontend/src/services/api.js` catches 401 responses and redirects to `/login` via `window.location.href = '/login'`. When the login API returns 401, this interceptor fires BEFORE the `catch` block in `LoginPage.jsx` can set the error state. The redirect re-renders the page with a fresh state, losing the error.

**Evidence:** Screenshot in `tests/e2e/evidence/BUG-001.png`

---

### [BUG-002] Genre filter chips hidden at desktop viewport
**Severity:** Medium
**Status:** Confirmed
**Category:** UI/CSS
**Page:** HomePage — `/`
**Reproduction test:** `tests/e2e/bug-discovery/element-bugs.spec.ts:38`

**Steps to Reproduce:**
1. Navigate to / at desktop viewport (1280x720 or similar)
2. Inspect the genre chips container `[data-testid="genre-chips"]`

**Expected:** Genre filter chip buttons (All, Fiction, Sci-Fi, Non-Fiction, Biography, Fantasy, Mystery) should be visible between the search bar and the book grid.

**Actual:** The genre chips container has `display: none` via CSS at desktop viewport. The chips exist in the DOM but are completely invisible and non-interactive.

**Root Cause:** The CSS module `GenreFilter.module.css` applies `display: none` at desktop breakpoints. Users on desktop must use the sidebar genre links instead.

**Evidence:** Screenshot in `tests/e2e/evidence/BUG-002.png`
