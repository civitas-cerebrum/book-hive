# E2E Test Scenarios — BookHive

**Date:** 2026-04-06
**Branch:** `qa/onboarding-v2`
**Framework:** Playwright + Chromium
**Total Spec Files:** 54
**Total Tests (with retries):** 631

## Final Run Results

| Metric | Count |
|--------|-------|
| Total unique tests | 631 |
| Passed | 552 |
| Failed | 19 |
| Flaky | 28 |
| Skipped | 32 |
| Duration | ~9.4 min |

---

## Test Categories

### 1. Happy Path (6 files)

Core user workflows verifying the primary success paths.

| Spec File | Tests | Scenarios |
|-----------|-------|-----------|
| `signup-happy.spec.ts` | 3 | Account creation, starting balance, login link |
| `login-happy.spec.ts` | 2 | Valid credentials sign-in, balance display |
| `browse-and-purchase-happy.spec.ts` | 5 | Full purchase from catalog, cart badge, order status, cart empty after checkout |
| `marketplace-happy.spec.ts` | 5 | Create listing, view listings, purchase listing, profile listing display |
| `order-return-happy.spec.ts` | 4 | Return order, returned order in list, order detail fields |
| `search-filter-happy.spec.ts` | 6 | Search by title, search by author, genre filter (Fiction, Sci-Fi, Mystery, Fantasy) |

### 2. Negative & Boundary Tests (5 files)

Input validation, injection attacks, duplicate submissions, and state integrity.

| Spec File | Tests | Focus |
|-----------|-------|-------|
| `negative-login.spec.ts` | 18 | Empty fields, type violations, boundary values, XSS/SQL injection, duplicate submit |
| `negative-signup.spec.ts` | 20 | Empty fields, type violations, boundary values, XSS/SQL injection, duplicate submit |
| `negative-cart.spec.ts` | 6 | Double-click checkout/clear/remove, rapid quantity changes |
| `negative-sell.spec.ts` | 9 | Empty form, negative/zero price, non-numeric input, XSS, boundary prices |
| `negative-state.spec.ts` | 13 | Expired session (4 pages), missing prerequisites, stale references, concurrent mutations |

### 3. Bug Reproduction Suite (4 files)

Tests that reproduce and document confirmed application bugs.

| Spec File | Bugs Covered | Tests |
|-----------|-------------|-------|
| `bug-race-conditions.spec.ts` | BUG-001 to BUG-004 | Double checkout, double return, double marketplace buy, duplicate cart entries |
| `bug-stale-ui.spec.ts` | BUG-005 to BUG-007 | Stale balance after checkout, stale cart badge, missing badge after re-login |
| `bug-silent-errors.spec.ts` | BUG-008 to BUG-010 | Silent checkout failure, silent marketplace buy failure, silent return failure |
| `bug-ui-ux.spec.ts` | BUG-011 to BUG-014 | Missing 404 page, search input desync, wrong error message, floating point artifacts |

### 4. Search & Filtering (7 files)

Comprehensive search functionality, URL state management, and edge cases.

| Spec File | Tests | Focus |
|-----------|-------|-------|
| `search-filter-happy.spec.ts` | 6 | Basic search and genre filter happy paths |
| `search-edge-cases.spec.ts` | 17 | Case sensitivity, partial match, XSS/SQL in search, empty/whitespace queries, long queries |
| `search-pagination.spec.ts` | 14 | Page navigation, search resets page, genre filter page state, boundary pages |
| `search-url-state.spec.ts` | 15 | Direct URL navigation, browser back/forward, URL encoding, query/genre param priority |
| `search-filter-combined.spec.ts` | 12 | Query/genre interaction, clearing, rapid switching, authenticated search |
| `genre-filter-edge-cases.spec.ts` | 12 | Case sensitivity, non-existent genres, XSS in genre, all 6 genres validated |

### 5. Session Management (4 files)

Authentication lifecycle, cross-tab behavior, data persistence, and stale UI.

| Spec File | Tests | Focus |
|-----------|-------|-------|
| `session-lifecycle.spec.ts` | 6 | Full 4-state cycles for /cart, /orders, /marketplace/sell, /profile, /orders/:id |
| `session-cross-tab.spec.ts` | 7 | Cart sync across tabs, logout propagation, order/marketplace cross-tab state |
| `session-persistence.spec.ts` | 9 | Cart survival across logout/login, order persistence, balance persistence, theme persistence |
| `session-stale-ui.spec.ts` | 11 | Cart badge updates, cart total after removal, order status after return, marketplace after buy |

### 6. Permission & Authorization (4 files)

Auth gates, element visibility boundaries, role isolation, and API-level enforcement.

| Spec File | Tests | Focus |
|-----------|-------|-------|
| `permission-gate.spec.ts` | 9 | Protected route redirects, no return URL, post-login landing page |
| `permission-visibility.spec.ts` | 11 | Guest vs. authenticated element visibility, marketplace seller/buyer distinction |
| `permission-role-boundary.spec.ts` | 7 | User data isolation (cart, orders, profile, balance), session switch cleanup |
| `permission-api.spec.ts` | 19 | Unauthenticated API rejection, public endpoint access, cross-user API prevention |

### 7. Security (7 files)

Cookie attributes, CORS, CSRF, headers, JWT validation, XSS, and NoSQL injection.

| Spec File | Tests | Focus |
|-----------|-------|-------|
| `security-cookie-session.spec.ts` | 5 | HttpOnly, SameSite, Path, Max-Age, Secure flag check |
| `security-csrf-cors.spec.ts` | 3 | CORS origin validation, wildcard rejection, CSRF via SameSite |
| `security-headers.spec.ts` | 6 | X-Frame-Options, X-Content-Type-Options, Cache-Control, Content-Type |
| `security-jwt-auth.spec.ts` | 10 | Token validation, modified signature rejection, cookie clearing, protected page redirect |
| `security-xss-injection.spec.ts` | 10 | Reflected XSS in search, stored XSS in listings, script/img/event handler payloads |
| `security-nosql-injection.spec.ts` | 8 | $gt, $ne, $or, $where operators in login/signup, auth bypass attempts |
| `security-api-abuse.spec.ts` | 11 | Rate limit probing, oversized payloads, malformed JSON, path traversal |

### 8. Responsive Design (4 files)

Mobile breakpoints, touch targets, content overflow, and full mobile user journeys.

| Spec File | Tests | Focus |
|-----------|-------|-------|
| `responsive-layout.spec.ts` | 18 | Breakpoint boundary (767/768px), grid columns, sidebar/topbar visibility, viewport resizing |
| `responsive-mobile-elements.spec.ts` | 21 | Topbar buttons, hamburger menu, genre chips, cart badge, theme toggle at mobile |
| `responsive-content.spec.ts` | 18 | Book card overflow, text truncation, form fields, cart/pagination at mobile, touch targets |
| `responsive-journeys.spec.ts` | 26 | Full user journeys at mobile: login, signup, browse, purchase, search, marketplace, orders |

### 9. Usability (3 files)

Empty states, error feedback quality, content overflow, and navigation dead ends.

| Spec File | Tests | Focus |
|-----------|-------|-------|
| `usability-empty-states.spec.ts` | 12 | Empty cart, empty orders, empty marketplace, no search results, empty profile |
| `usability-error-feedback.spec.ts` | 20 | Login errors, signup errors, sell form errors, return errors, error clearing |
| `usability-navigation-dead-ends.spec.ts` | 14 | 404 handling, back after form submit, browser back from order, dead-end recovery |
| `usability-content-overflow.spec.ts` | 12 | Long titles, descriptions, prices, Unicode, RTL text, deeply nested content |

### 10. Coverage & Workflows (5 files)

Data integrity verification, API resilience, loading states, page content completeness, deep linking.

| Spec File | Tests | Focus |
|-----------|-------|-------|
| `coverage-data-integrity.spec.ts` | 7 | Balance calculations, cart totals, order totals, return refunds |
| `coverage-api-resilience.spec.ts` | 7 | 500 errors, empty responses, failed cart fetch, add-to-cart failure |
| `coverage-loading-async.spec.ts` | 5 | Loading indicators, async page transitions, navigation during load |
| `coverage-page-content.spec.ts` | 8 | All pages render expected elements and content |
| `coverage-navigation-deeplink.spec.ts` | 8 | Direct URL access, back/forward, sidebar navigation, authenticated deep links |
| `coverage-theme-ui-state.spec.ts` | 3 | Theme toggle, persistence, localStorage |
| `coverage-workflow-robustness.spec.ts` | 5 | Cross-feature workflows: purchase→sell→verify |

### 11. Additional Paths (3 files)

Branching decisions, interrupted flows, and edge navigation.

| Spec File | Tests | Focus |
|-----------|-------|-------|
| `branching-paths.spec.ts` | 6 | Catalog vs. marketplace purchase branches, return branch |
| `checkout-interrupted.spec.ts` | 1 | Checkout completion after session interruption |
| `edge-paths.spec.ts` | 1 | Navigation recovery from no-results state |

---

## Pages Covered

| Page | Happy | Negative | Permission | Session | Security | Responsive | Bugs |
|------|-------|----------|------------|---------|----------|------------|------|
| `/` (Home) | search, browse | state | visibility | stale-ui | XSS | layout, content | BUG-012 |
| `/login` | login | 18 tests | gate | lifecycle | injection | mobile journey | — |
| `/signup` | signup | 20 tests | gate | — | injection | mobile journey | — |
| `/books/:id` | browse | state | visibility | — | — | layout | — |
| `/cart` | purchase | 6 tests | gate, role | lifecycle, cross-tab | — | mobile journey | BUG-005,006,008 |
| `/orders` | — | state | gate, role | lifecycle | — | mobile journey | — |
| `/orders/:id` | return | state | role, API | lifecycle | — | — | BUG-010,013 |
| `/marketplace` | buy | — | visibility | cross-tab | — | mobile journey | BUG-003,009 |
| `/marketplace/sell` | sell | 9 tests | gate | lifecycle | — | mobile journey | — |
| `/profile` | — | state | gate, role | lifecycle | — | mobile journey | BUG-007,014 |
| `/*` (404) | — | — | — | — | — | — | BUG-011 |

---

## Confirmed Bugs by Severity

| ID | Severity | Title |
|----|----------|-------|
| BUG-001 | Critical | Double-checkout race condition creates phantom orders |
| BUG-002 | Critical | Double-return race condition issues multiple refunds |
| BUG-003 | Critical | Double-buy marketplace race creates multiple orders from single listing |
| BUG-004 | Critical | Concurrent add-to-cart bypasses deduplication |
| BUG-005 | Major | Sidebar balance not updated after checkout |
| BUG-006 | Major | Cart badge not cleared after checkout |
| BUG-007 | Major | Cart badge not shown after re-login despite server-side items |
| BUG-008 | Major | Checkout failure silently swallowed |
| BUG-009 | Major | Marketplace buy failure silently swallowed |
| BUG-010 | Minor | Order return failure silently swallowed |
| BUG-011 | Minor | No 404 page — blank content area |
| BUG-012 | Minor | Search input not synced with URL query |
| BUG-013 | Minor | Wrong error message for already-returned orders |
| BUG-014 | Minor | Floating point precision artifacts in balance |
