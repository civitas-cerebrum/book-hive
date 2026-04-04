# Bug Report

**Date:** 2026-04-04
**App:** http://localhost:7547
**Total findings:** 1
**New bugs:** 1 | **Regression candidates:** 0 | **Undocumented quirks:** 0 | **Known but untested:** 0

## Summary by Severity

| Severity | Count | Categories |
|----------|-------|------------|
| Critical | 0     | —          |
| High     | 0     | —          |
| Medium   | 1     | Boundary input |
| Low      | 0     | —          |

## Findings

### [BUG-001] Create listing with extreme price shows generic server error

**Severity:** Medium
**Category:** Boundary input
**Phase discovered:** 1a (Element Probing)
**Page:** CreateListingPage — `/marketplace/sell`
**Reproduction test:** `tests/bug-discovery/element-bugs.spec.ts:L19`

**Steps:**
1. Login as testuser1
2. Navigate to `/marketplace/sell`
3. Select any book from the dropdown
4. Enter price: `999999999`
5. Click "Create Listing"

**Expected:** The form should show a specific validation error message such as "Price must be less than $10,000" or "Price is too high"

**Actual:** The form displays "An unexpected error occurred" — a generic server error message that provides no actionable guidance to the user. The backend throws an unhandled exception instead of returning a proper validation response.

**Root cause analysis:** The backend's `MarketplaceService` or `ListingRequest` DTO likely lacks a `@Max` constraint on the price field. When the price exceeds what the system can handle, the Spring Boot exception handler catches the error generically instead of returning a 400 Bad Request with a descriptive validation message.

**Screenshot:** Evidence committed to `tests/e2e/evidence/BUG-001.png`

---

## Verification Notes

- **BUG-002 (removed):** Empty login form — initially appeared as "no validation feedback" but verified via screenshot that native browser HTML5 validation (`required` attribute) shows "Please fill out this field." tooltip. Not a bug.
- **BUG-003 (removed):** Empty signup form — same as BUG-002, browser native validation is working correctly.

## Coverage Notes

- Pages probed: 10/10 (all application pages)
- Flows tested: 4 adversarial flows
- Categories covered: Boundary inputs, special characters, empty form submissions, negative/zero/extreme values
- Areas not probed: Concurrent tab state (limited by test framework), WebSocket/real-time features (none present)
