# Context Bundle

Accumulated knowledge about the application under test. Read before starting any stage. Append experiential notes before completing your stage.

## Application
- Frontend: http://localhost:7547
- Backend API: http://localhost:8080
- Repository: civitas-cerebrum/book-hive
- Target coverage: 100%

## Pages (12 discovered)
- /: 15 actions, 2 error states
- /books/:id: 2 actions, 2 error states
- /login: 4 actions, 1 error states
- /signup: 5 actions, 1 error states
- /marketplace: 2 actions, 2 error states
- /marketplace/sell: 4 actions, 2 error states
- /cart: 5 actions, 3 error states
- /orders: 1 actions, 1 error states
- /orders/:id: 1 actions, 3 error states
- /profile: 2 actions, 1 error states
- /?query=<term>: 3 actions, 1 error states
- /?genre=<genre>: 4 actions, 1 error states

## Journeys (23 mapped)
- happy: 8 (browse-and-purchase-happy, signup-happy, login-happy, search-filter-happy, genre-filter-happy, marketplace-buy-happy, marketplace-sell-happy, order-return-happy)
- error: 3 (login-error, signup-error-duplicate, order-return-expired-error)
- edge: 3 (empty-cart-checkout-edge, search-no-results-edge, book-detail-unauthenticated-edge)
- permission-gated: 4 (cart-access-permission, orders-access-permission, sell-access-permission, profile-access-permission)
- interrupted: 1 (checkout-interrupted)
- branching: 4 (browse-to-buy-branching, browse-to-buy-branch-catalog, browse-to-buy-branch-marketplace, order-view-branching)

## Intersections (8 pages shared across journeys)
- /: shared by 9 journeys
- /login: shared by 7 journeys
- /books/:id: shared by 3 journeys
- /cart: shared by 5 journeys
- /orders/:id: shared by 5 journeys
- /orders: shared by 4 journeys
- /marketplace: shared by 3 journeys
- /signup: shared by 2 journeys

## Experiential Notes

### Stage 2 — Scaffold & Page Repository (QA Agent)

**Seeded test accounts:**
- `testuser1@bookhive.test` / `Test1234!` (balance ~$76, has existing orders)
- `testuser2@bookhive.test` / `Test1234!` (balance $100, fresh account)

**Fixture path fix:** Original `base.ts` had path `tests/data/page-repository.json` — incorrect. Fixed to `data/page-repository.json` (resolved relative to `process.cwd()` = `tests/e2e/`).

**DOM selector patterns discovered:**
- Dynamic IDs: book cards use `book-card-book-001` format, cart items use `cart-item-{mongoId}`, orders use `order-card-{mongoId}`, listings use `listing-card-{mongoId}`
- Cart quantity selector `cart-qty-{id}` requires `:not()` to exclude `cart-qty-minus-{id}` and `cart-qty-plus-{id}`
- Cart item selector `cart-item-{id}` requires `:not()` to exclude `cart-item-title-{id}` and `cart-item-price-{id}`
- Home page (`/`), search results (`/?query=`), and genre filter (`/?genre=`) all share the same `home-page` container and book grid elements
- Genre chips (buttons) exist inside main content area in addition to sidebar genre filter links

**Auth-dependent elements:**
- `add-to-cart-detail` (BookDetailPage) — only visible when authenticated
- `add-to-cart-book-*` (HomePage) — only visible when authenticated
- `listing-buy-*` (MarketplacePage) — only visible when authenticated
- Nav sidebar shows Login/Signup links when unauthenticated, shows Cart/Orders/Sell/Profile/Logout/Balance when authenticated

**Order detail states:**
- Fresh COMPLETED order: shows `return-countdown` (timer) + `return-order-{id}` (button)
- Expired COMPLETED order: shows `return-expired` span, no button
- RETURNED order: no return UI at all

**Timing quirks:**
- Return window is 10 minutes from order creation
- Page loads are fast (~1-2s), no lazy loading observed
- Pagination: 12 books per page, 5 pages total (60 books)
- API seed endpoint: `POST http://localhost:8080/api/seed`

**Page repository coverage:** 11 pages, 120+ elements covering all interactive states across public and authenticated views.

### Stage 3 — Functional Testing (QA Agent)

**Critical: Use `/api/reset` not `/api/seed` for test isolation.**
- `POST /api/seed` only runs if the database is empty (checks `bookRepository.count() > 0`). It does NOT reset existing user balances or clear orders/cart.
- `POST /api/reset` drops ALL data (users, books, cart items, orders, listings) and recreates fresh test users with $100 balance each. This is essential for purchase-related tests.
- New user signups get $0 balance (not $100), so fresh signups cannot be used for purchase tests.

**Logout behavior:**
- Clicking the Logout button does NOT redirect to `/login`. The page stays on the current URL and simply clears the session.
- After logout, you must explicitly `navigateTo('/login')` before filling the login form.
- Protected pages (/cart, /orders, /profile, /marketplace/sell) redirect unauthenticated users to `/login`.

**Genre chips hidden on desktop:**
- The `genre-chips` container has `display: none` on desktop viewports. Genre chips are a mobile-only UI element.
- Use sidebar genre filter links (`genreFilterFiction`, etc.) for desktop tests instead.

**Strict mode violations to avoid:**
- Never call `getText()` on selectors that match multiple elements (e.g., `bookTitle` matches 12 elements on the home page). Use `clickNth()`, `getAll()`, or verify individual elements by index.
- `listingTitle` and `listingPrice` on MarketplacePage also match multiple elements. Use `verifyCount()` instead of `verifyText()`.

**CountVerifyOptions quirk:**
- `verifyCount()` requires one of `{ exact: N }`, `{ greaterThan: N }`, or `{ lessThan: N }`. Passing a variable as `{ exact: someVar }` may fail if the variable is not recognized. Use `getCount()` and `greaterThan: 0` as a safer alternative.

**Test execution strategy:**
- Tests that modify shared state (purchases, cart operations) use `test.describe.configure({ mode: 'serial' })` and call `/api/reset` in `beforeEach` to ensure clean state.
- Read-only tests (search, genre filter, permission checks) can run in parallel.
- All tests run with `--workers=1` for shared DB safety.

**Journeys covered (53 tests across 12 spec files):**
- 12 spec files covering all 23 journey types from the journey map
- Happy paths: browse-and-purchase, signup, login, search-filter, genre-filter, marketplace-sell, marketplace-buy, order-return
- Error paths: login-error, signup-error-duplicate, order-return-expired (documented: 10-min expiry window too long for automated test; verified countdown mechanism instead)
- Edge paths: empty-cart-checkout, search-no-results, book-detail-unauthenticated
- Permission-gated: cart, orders, sell, profile access
- Interrupted: checkout-interrupted (cart persistence across logout/login)
- Branching: catalog vs marketplace purchase, order return vs accept

**Known limitation:**
- The `order-return-expired-error` journey cannot be fully tested because the return window is 10 minutes. Tests verify the return countdown exists for fresh orders and that the mechanism works (return button + status change), but cannot wait for expiry.

### Stage 4 — Negative Testing (QA Agent)

**Auth mechanism discovery:**
- App uses HTTP-only cookies set by Spring backend via `withCredentials: true` (axios).
- `document.cookie` is always empty in JS — cookies are invisible to client-side code.
- To simulate expired session in tests, must use `context.clearCookies()` from Playwright (not `page.evaluate()`).
- The axios interceptor in `api.js` catches 401 responses and redirects to `/login`. This is how auth-gated pages get protected client-side.

**Form validation findings:**
- Login form: No client-side validation at all. All inputs sent directly to server. Server returns "Invalid credentials" for any bad input.
- Signup form: No client-side validation. Server accepts XSS payloads, SQL injection, template injection, special chars, short passwords (1 char), long usernames (256+). React escapes everything on display.
- Sell form: Price field is `<input type="number">` (spinbutton). Browser natively blocks non-numeric input. Server rejects negative prices, zero prices, and empty price.
- No rate limiting observed on any form submission.

**Double-click protection:**
- Checkout button: Protected by cart being emptied after first checkout. Second click effectively has empty cart.
- Create Listing: Protected by navigation — first click creates listing and navigates to marketplace. Second click hits marketplace page.
- Login/Signup: No explicit protection, but idempotent — double-click either processes once or second request is harmless.
- Cart remove/clear: No protection but no negative effects — removing an already-removed item is a no-op.

**Empty state coverage:**
- All pages have proper empty state messages with data-testid selectors.
- Cart: `cart-empty`, Orders: `no-orders`, Profile: `no-listings`, Search: `no-books`.
- Marketplace: `no-listings` when marketplace has no listings.

**Cart quantity constraints:**
- Minus button is `disabled` when quantity is 1 (cannot go below 1).
- Plus button always enabled (up to stock limit).

**No confirmation dialogs on destructive actions:**
- Clear cart, remove item, return order — all execute immediately without confirmation.
- This is a potential UX improvement area but within current app design.

**Test count: 88 negative tests across 6 spec files, all passing.**

### Stage 5 — State & Session Testing (QA Agent)

**Stale UI bugs discovered:**
- Sidebar balance (`user-balance`) does NOT update in-place after checkout. It continues showing the pre-checkout amount (e.g., $100.00) until the page is reloaded. Root cause: the checkout API response does not trigger a re-fetch of user balance in the React sidebar state.
- Cart badge (`cart-badge`) does NOT clear after checkout. It continues showing the pre-checkout item count (e.g., "1") until page reload. Same root cause: checkout completion does not trigger cart count refresh in the navbar state.
- Both stale states resolve on page reload — this is a client-side cache/state issue, not a server-side data bug.

**Cart badge after re-login:**
- After logout + re-login, the cart badge does NOT appear on the home page even though items are persisted server-side. The badge only appears after the user navigates to a page that fetches cart data (e.g., clicking a book's "Add to Cart" or visiting /cart). This is a third stale UI finding related to cart badge initialization on login.

**Correct in-place updates (no stale UI):**
- Cart badge correctly appears/increments when adding to cart from book detail or home page ✓
- Cart page correctly updates on quantity changes, item removals, and clear-cart ✓
- Order status correctly changes from "COMPLETED" to "RETURNED" in-place after clicking "Return Order" ✓
- Marketplace listing correctly disappears from the page after a buy action ✓
- Profile page shows correct (fresh) data on each visit ✓

**Cross-tab behavior:**
- The app uses NO real-time sync (no WebSocket, SSE, or polling). All state is server-side.
- Tab 2 only sees updates from tab 1 when it makes a new HTTP request (navigation or reload).
- Logout in tab 1 correctly invalidates the session cookie (HTTP-only, shared across tabs). Tab 2 will redirect to /login on its next protected-page navigation.
- Stale cart in tab 2 after checkout in tab 1: checkout button is still visible and clickable (stale), but clicking it is handled gracefully (either error or empty order).

**Persistence across logout/login:**
- Cart contents: ✅ Persisted server-side (MongoDB). Items and quantities survive logout/login.
- Orders: ✅ Persisted. All order history visible after re-login.
- User balance: ✅ Persisted. Reflects purchases after re-login.
- Marketplace listings: ✅ Persisted. Visible on marketplace and profile after re-login.
- Theme preference: ✅ Persisted in localStorage. Survives page reloads.
- Cart is user-scoped: User 1's cart does not appear for User 2.

**`verifyCount()` API quirk (important for future stages):**
- The correct property for exact count is `{ exactly: N }`, NOT `{ exact: N }`. Using `{ exact: N }` throws "You must provide 'exact', 'greaterThan', or 'lessThan' in CountVerifyOptions" — confusing error message because it suggests `exact` but the actual key is `exactly`.

**`switchToNewTab()` not used — context.newPage() used instead:**
- The Steps API `switchToNewTab()` method requires a UI action callback that opens a new tab. For cross-tab tests where we need a second tab viewing the same page, we use Playwright's native `context.newPage()` instead, then interact with the returned `Page` object directly (not via the Steps API fixture).

**Test count: 34 state & session tests across 4 spec files, all passing.**
- session-lifecycle.spec.ts: 6 tests (4-state cycle for all 5 protected routes + user bleed check)
- session-stale-ui.spec.ts: 13 tests (cart badge, balance, cart ops, order status, marketplace, profile)
- session-cross-tab.spec.ts: 7 tests (cart, logout, orders, marketplace across tabs)
- session-persistence.spec.ts: 8 tests (cart, orders, balance, listings, theme, user isolation)

### Stage 6 — Permission & Access Testing (QA Agent)

**Auth gate behavior:**
- All 5 protected routes (`/cart`, `/orders`, `/orders/:id`, `/marketplace/sell`, `/profile`) correctly redirect unauthenticated guests to `/login`.
- **No return URL in redirect**: The app uses `<Navigate to="/login" replace />` with no query parameter. After login, users always land on `/` (home page), NOT the originally requested page. This is a documented finding, not a bug per se, but a UX gap.
- Public routes (`/`, `/books/:id`, `/marketplace`, `/login`, `/signup`) are correctly accessible without auth.

**API auth responses — Spring Security returns 403, not 401:**
- All protected API endpoints (`/api/cart`, `/api/orders`, `/api/auth/me`, `/api/marketplace/listings`, etc.) return **403** for unauthenticated requests, not 401.
- This is because Spring Security's default `AccessDeniedHandler` returns 403 when no explicit `AuthenticationEntryPoint` is configured. The JWT filter silently passes unauthenticated requests through, and the security chain then denies them with 403.
- Important for future test writers: use `expect(status).toBe(403)` not `toBe(401)` for unauthenticated API tests.

**Fresh request context required for API auth tests:**
- `page.request` in Playwright inherits the browser context's cookies, which may carry session tokens from previous tests.
- For pure unauthenticated API tests, use `playwright.request.newContext()` to create a cookie-free request context. Remember to call `ctx.dispose()` after use.

**No role-based access control:**
- The app has NO admin role. All authenticated users have equal privileges (`UserPrincipal.getAuthorities()` returns empty list).
- No `@PreAuthorize`, `@Secured`, or `@RolesAllowed` annotations anywhere.
- Vertical privilege escalation tests are not applicable (no admin routes exist).

**Horizontal user isolation (service-layer ownership validation):**
- Cart items: Filtered by `userId` — user A cannot see/modify user B's cart items.
- Orders: Filtered by `userId` — user A cannot access user B's order details. Returns 404 (not 403) because the ownership filter hides the order entirely.
- Order returns: Same userId filter — user A cannot return user B's order.
- Marketplace listings: `cancelListing()` checks `sellerId`. `buyListing()` prevents buying own listing (`sellerId !== buyerId`).
- Profile: Each user sees only their own data — email, balance, listings.

**Marketplace visibility boundary (important):**
- Guest users: Can see listing cards but NO buy buttons. The `ListingCard` component conditionally renders the buy button only when `user` context exists AND `user.userId !== listing.sellerId`.
- Sellers: See their own listing cards but NO buy button (can't buy own listing).
- Other authenticated users: See both listing cards AND buy buttons.
- The dropdown API method is `selectDropdown()` with `{ type: 'index', index: N }`, NOT `selectOption()`.

**Findings summary:**
1. No return URL in auth redirects — UX gap (not security issue)
2. Post-login always redirects to `/` — no post-auth deep linking
3. 403 instead of 401 for unauthenticated API requests — semantic issue (should be 401 per HTTP spec for "not authenticated" vs 403 for "not authorized")
4. All user isolation boundaries properly enforced at the service layer
5. All error responses are clean (no 500s for auth/permission failures)

**Test count: 50 permission & access tests across 4 spec files, all passing.**
- permission-gate.spec.ts: 14 tests (redirect, return URL, post-login landing for all protected + public routes)
- permission-visibility.spec.ts: 14 tests (guest vs auth element visibility on home, book detail, marketplace, nav, search, genre)
- permission-role-boundary.spec.ts: 7 tests (cart/order/profile/listing/balance isolation, session switch, URL manipulation)
- permission-api.spec.ts: 18 tests (unauthenticated 403s, public endpoints, cross-user API access, error quality)

### Stage 7 — Usability Testing (QA Agent)

**Empty State Coverage (10 tests):**
- All data-driven pages have proper empty-state messages with `data-testid` selectors:
  - `/` (home): `no-books` — "No books found"
  - `/?query=<term>`: `no-books` — "No books found" (search retains input)
  - `/?genre=<genre>`: `no-books` — "No books found" for invalid genre
  - `/books/:id`: `not-found` — "Book not found"
  - `/cart`: `cart-empty` — "Your cart is empty" (checkout button hidden)
  - `/orders`: `no-orders` — "No orders yet"
  - `/orders/:id`: `not-found` — "Order not found"
  - `/marketplace`: `no-listings` — "No listings available"
  - `/profile`: `no-listings` — "No active listings"
- API error on home page: defaults to empty books array, shows "No books found" — not a blank page.
- Route interception used for reliable empty-state testing (avoids shared DB state issues).

**Error Feedback Coverage (12 tests) — Findings:**
- **Login**: Shows error via `login-error` testid. Error is specific (from server). Form retains input. Error clears on success. ✅
- **Signup**: Shows error via `signup-error` testid. Client-side validation for short username (< 3 chars) and HTML tags. Server error for duplicate email. Error clears on success. ✅
- **Create Listing**: Shows error via `listing-error` testid. Server errors displayed with fallback "Failed to create listing". Form retains input. Error clears on success. ✅
- **Create Listing — Native Validation**: Book select has `required`, price input has `min="0.01"`. Browser native validation prevents submission of empty/zero/negative values (no custom error displayed — browser tooltip shown instead). This is acceptable UX.
- **BUG — Cart Checkout**: `CartPage.jsx` `handleCheckout()` has NO catch block and NO error state. Checkout failures (insufficient balance, out of stock, network error) are **silently swallowed**. The user sees the "Checkout" button return to idle state with zero feedback. The `cart-error` testid exists in page-repository.json but NOT in source code.
- **BUG — Marketplace Buy**: `ListingCard.jsx` `handleBuy()` has NO catch block. Buy failures are silently swallowed. The user sees the "Buy" button return to idle state with no error message.
- **BUG — Order Return**: `OrderDetailPage.jsx` `handleReturn()` has NO catch block. Return failures are silently swallowed. The "Return Order" button returns to idle with no feedback.

**Content Overflow Coverage (14 tests):**
- 500+ characters in search input: layout intact, no horizontal overflow ✅
- Long single word (no spaces) in search: no horizontal scroll ✅
- Special characters + emoji + XSS payloads in search: safe rendering, no script execution ✅
- 500+ characters in login email, 2000 chars in password: field contained, no overflow ✅
- 500+ characters in signup username, email: field contained, no overflow ✅
- Emoji sequences in signup username: field contained ✅
- Extreme price value (999999999999) in listing form: contained ✅
- Long book title/author via route interception: book cards contained within viewport ✅
- Long book description via route interception: no horizontal overflow ✅
- Long query in URL: no overflow ✅
- Line break characters in search: handled gracefully ✅

**Navigation Dead End Coverage (21 tests) — Findings:**
- **BUG — No 404 Page**: `App.jsx` has no `<Route path="*">` catch-all. Unknown routes (e.g., `/non-existent-route-xyz`, `/admin/settings/advanced/nope`) render sidebar + completely blank `<main>`. No "Page not found" message, no link to homepage. The sidebar still provides navigation recovery.
- `/books/:id` with invalid ID: Shows "Book not found" message + sidebar for recovery ✅
- `/orders/:id` with invalid ID: Shows "Order not found" message + sidebar for recovery ✅
- Browser back after login: Does not crash (shows login or home) ✅
- Browser back after signup: Does not resubmit (no duplicate account) ✅
- Browser back after checkout: Does not create duplicate order ✅
- Browser back after listing creation: Does not create duplicate listing ✅
- All 10+ pages have one-click path to homepage via "All Books" sidebar link ✅
- Auth redirect to `/login` provides navigation options (All Books, Marketplace, Sign up) ✅
- Error pages (book not found, order not found) all have sidebar for recovery ✅

**Retry-Safety Patterns Discovered:**
- Tests involving checkout MUST clear cart before adding items (leftover cart items from retries accumulate and may exceed balance).
- Use `greaterThan: 0` instead of `exactly: N` for order/listing counts when retries can create additional records.
- The `/api/reset` endpoint drops ALL collections and re-seeds with $100 balances, but if tests don't properly reset browser cookies, the stale session may still reference old user IDs.
- Use route interception for empty-state tests to avoid shared-DB pollution.

**Test count: 57 usability tests across 4 spec files, all passing.**
- usability-empty-states.spec.ts: 10 tests (empty states for all data-driven pages)
- usability-error-feedback.spec.ts: 12 tests (login, signup, listing errors + missing error feedback docs)
- usability-content-overflow.spec.ts: 14 tests (input fields + display areas)
- usability-navigation-dead-ends.spec.ts: 21 tests (404, back button, path to home, error recovery)

### Stage 8 — Search & Filtering Testing (QA Agent)

**Search implementation details:**
- SearchBar uses form submission (Enter key) — no debounce, no real-time search.
- SearchBar uses `useState('')` for local state — does NOT read from URL params. Navigating directly to `/?query=Dune` shows results but the search input is empty. This is a UX gap (search input not synced with URL).
- Backend search: MongoDB `$regex` with `$options: 'i'` (case-insensitive) on `$or: [title, author]`. Special regex characters are escaped in `BookService.java`.
- Backend query truncation: queries longer than 100 characters are truncated to 100 by `BookController`.
- `useSearchParams()` via React Router manages URL state. `setSearchParams()` replaces ALL params (not merge), so search clears genre and vice versa.

**Genre filter implementation details:**
- Genre filter is **case-sensitive** (exact match via `findByGenre()`). `fiction` returns 0 results, `Fiction` returns 8.
- Six genres: Fiction(8), Sci-Fi(9), Non-Fiction(8), Biography(8), Fantasy(8), Mystery(9) = 50 total books.
- Genre chips (GenreFilter.jsx) are hidden on desktop (`display: none`). Sidebar NavLinks are the desktop mechanism.
- "All" genre chip calls `onChange(null)` which clears `genre` param from URL.

**BUG — Sidebar genre NavLink does NOT reset page state:**
- Sidebar genre links use `<NavLink to="/?genre=Fiction">` which navigates via React Router.
- This does NOT call `handleGenre()` (which has `setPage(0)`).
- The `page` React state from `useState(0)` is only reset on component mount, not when URL params change via NavLink.
- Result: If user is on page 2+ of catalog, clicking a sidebar genre link fetches that genre at the old page number. For small genres (≤12 books), page 1 (0-indexed) is empty → shows "No books found".
- Workaround: Navigate to page 1 first, or use the genre chips (which call `handleGenre`).
- Fix: Add `useEffect` that resets `page` to 0 when `query` or `genre` changes.

**Combined search+genre behavior:**
- Backend if-else chain: query takes priority over genre. If both are provided, genre is ignored.
- Frontend `setSearchParams()` replaces all params, so search and genre cannot coexist in the URL from the UI. However, manually crafting a URL with both works (query wins).
- "All Books" sidebar link (`<NavLink to="/">`) clears both query and genre from URL.

**Pagination behavior:**
- 12 books per page. Page state is React `useState(0)` — NOT in the URL.
- Pagination resets to 0 when search is submitted (via `handleSearch`/`handleGenre` which call `setPage(0)`).
- Page refresh always resets to page 1 (state not in URL).
- Previous button disabled at page 0, Next disabled at last page.
- Pagination component hidden when totalPages ≤ 1.

**Strict mode violations to remember:**
- `addToCartBtn` on HomePage matches multiple elements. Use `verifyCount` with `greaterThan: 0`, not `verifyPresence`.
- `bookTitle`, `bookAuthor`, `bookGenre` all match multiple elements. Use `getAll()` to extract arrays.

**Route interception for API error testing:**
- Must set up `page.route()` BEFORE `navigateTo()` because HomePage fetches books on mount.
- API errors (500) in the books endpoint cause `.then()` to not run, leaving `books` as `[]` (initial state). `.finally()` sets `loading=false`, so the empty array triggers "No books found".

**Test count: 76 search & filtering tests across 5 spec files, all passing.**
- search-edge-cases.spec.ts: 18 tests (case sensitivity, partial match, special chars, XSS, regex injection, empty/whitespace, truncation, content verification)
- genre-filter-edge-cases.spec.ts: 14 tests (case sensitivity, invalid genre, all genres, genre switching, clearing, pagination, hyphenated genres)
- search-url-state.spec.ts: 17 tests (bookmarkability, search input sync UX gap, back/forward, search↔genre transitions, query params, refresh, URL encoding)
- search-pagination.spec.ts: 14 tests (pagination basics, search/genre reset, multi-page search, page state in URL, stale page bug, single/no result)
- search-filter-combined.spec.ts: 13 tests (query priority, mutual exclusion, clearing, rapid switching, book detail→back, authenticated search, API error)

### Stage 9 — Responsive Testing (QA Agent)

**Breakpoint boundary confirmed:**
- Single breakpoint: `max-width: 767px` (all CSS files use the same value).
- At 767px: topbar=`flex` (visible), sidebar=`translateX(-240px)` (hidden), genre chips=`flex` (visible). Mobile layout.
- At 768px: topbar=`none` (hidden), sidebar=`none` transform (visible), genre chips=`none` (hidden). Desktop layout.
- No intermediate "tablet" breakpoint — 768px and above is full desktop layout with sidebar always visible.

**Mobile layout structure:**
- TopBar: Fixed at top, `z-index: 98`. Contains hamburger, BookHive logo, search and cart buttons.
- Sidebar: Off-screen via `transform: translateX(-100%)`. Opens as drawer with `.sidebarOpen` class (`translateX(0)`). Overlay at `z-index: 99`.
- Main content: `margin-left: 0`, `padding-top: calc(60px + 16px)` = 76px for topbar clearance.
- Genre chips: Horizontal scrollable strip (`overflow-x: auto`, `display: flex`) — mobile-only, hidden on desktop.
- Book grid: 2 columns on mobile (`repeat(2, 1fr)`, `gap: 12px`), 3 columns on desktop (`repeat(3, 1fr)`, `gap: 20px`).
- Book detail: Header changes from `flex-direction: row` (desktop) to `column` (mobile). Cover goes full-width (100%) on mobile.

**BUG — Home page horizontal overflow at all mobile viewports:**
- The home page (`/`, `/?query=`, `/?genre=`) has horizontal scrolling on ALL mobile viewports (320px, 375px, 414px, 767px).
- Root cause: The main content area has no `overflow-x: hidden` or `max-width: 100%` constraint. The book grid and genre chips container expand beyond the viewport.
- At 375px: `scrollWidth=637px` vs `clientWidth=375px` (262px overflow).
- All other pages (book detail, login, signup, marketplace, cart, orders, profile) do NOT overflow at mobile.

**Mobile-specific interaction patterns:**
- `addToCartDetail` button is pushed below the fold on mobile due to column layout. Must use `scrollIntoView()` before `click()`.
- Sidebar toggle buttons need `clickWithoutScrolling()` since they are in a fixed-position topbar.
- Sidebar overlay captures clicks — clicking hamburger while sidebar is open doesn't work reliably because overlay (z-index 99) sits above topbar (z-index 98). Use overlay click to close instead.
- After `/api/reset`, clear browser cookies with `page.context().clearCookies()` before re-logging in (stale cookies from deleted users cause 403s).

**Auth verification pattern for mobile tests:**
- `verifyUrlContains('/')` is UNSAFE after login — it matches `/login` too!
- Use `verifyPresence('HomePage', 'homePage')` instead to confirm login succeeded.

**Sidebar drawer behavior:**
- Clicking any NavLink closes the drawer (`setOpen(false)`) and applies `translateX(-100%)`.
- Close transition is 300ms. Wait >= 400ms after toggle before checking transform.
- Overlay click also closes the drawer.

**Test count: 82 responsive tests across 4 spec files, all passing.**
- responsive-layout.spec.ts: 25 tests (breakpoint boundary, main content area, grid columns, book detail, viewport resizing, page overflow, auth pages)
- responsive-mobile-elements.spec.ts: 19 tests (topbar, hamburger sidebar, genre chips, cart badge, theme toggle)
- responsive-journeys.spec.ts: 18 tests (auth, browse+purchase, search+genre filter, marketplace, cart ops, orders, profile, logout)
- responsive-content.spec.ts: 20 tests (grid integrity, text overflow, form fields, cart page, pagination, tablet portrait, touch targets)

### Stage 10 — Security Testing (QA Agent)

**Authentication architecture:**
- Stateless JWT with HS256 (HMAC-SHA256), 24-hour expiration.
- Dual token delivery: `Authorization: Bearer <token>` header AND `bookhive_token` HttpOnly cookie.
- JWT filter checks header first, then cookie. If neither found, request passes through unauthenticated.
- Spring Security returns 403 (not 401) for unauthenticated requests to protected endpoints.

**Cookie security attributes (verified):**
- `HttpOnly`: Yes — prevents JavaScript access (document.cookie is empty).
- `SameSite=Lax`: Yes — provides CSRF protection for cross-origin POST requests.
- `Path=/`: Yes — cookie sent on all routes.
- `Max-Age=86400`: Yes — 24-hour expiry matching JWT expiration.
- `Secure`: **No** — cookie can be sent over plain HTTP. Expected for localhost dev, but FINDING for production.

**CORS configuration:**
- Allowed origins: `http://localhost:*` and `http://127.0.0.1:*` (pattern-based).
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS.
- Allowed headers: Authorization, Content-Type.
- Credentials: true (required for cookie auth).
- Evil origins (e.g., `http://evil.com`) do NOT receive Access-Control-Allow-Origin header.

**Security headers present on all API responses:**
- `X-Frame-Options: DENY` — clickjacking protection ✅
- `X-Content-Type-Options: nosniff` — MIME type sniffing prevention ✅
- `Cache-Control: no-cache, no-store, max-age=0, must-revalidate` — caching prevention ✅
- `X-XSS-Protection: 0` — Spring Security default (recommends CSP instead) ✅

**Security headers MISSING (documented findings):**
- No `Strict-Transport-Security` (HSTS) header — expected for localhost HTTP.
- No `Content-Security-Policy` (CSP) header — recommended for production.
- No `Referrer-Policy` header.
- No `Permissions-Policy` header.
- Frontend HTML pages lack `X-Frame-Options` (only set by backend, not nginx).

**WebConfig timing filter override issue:**
- `WebConfig.java` defines a `timingFilter` that sets `X-Response-Time`, `X-Content-Type-Options`, `X-Frame-Options`, and `X-XSS-Protection: 1; mode=block`.
- However, Spring Security's `HeaderWriterFilter` runs first and overrides these with its defaults.
- Result: `X-Response-Time` header does NOT appear in responses; `X-XSS-Protection` shows `0` (Spring Security default) instead of `1; mode=block`.

**XSS protection (all safe):**
- React escapes all rendered content — XSS payloads in username, search, URLs are displayed as text, not executed.
- API search endpoint returns JSON content-type — no reflected HTML.
- `<input type="number">` on price field blocks non-numeric input natively.
- URL-based XSS payloads (query, genre, book ID, order ID) are all safely rendered.

**NoSQL injection protection (all safe):**
- Search queries: `BookService.java` escapes special regex characters before building `$regex` query. MongoDB operators like `{$ne:null}` are treated as literal text → 0 results.
- Genre filter: Uses `findByGenre()` (exact string match in Spring Data MongoDB). MongoDB operators treated as literal string → 0 results.
- Login/signup: Jackson DTO deserialization expects `String` type for email/password fields. Sending `{"$ne":""}` as an object instead of string causes Jackson deserialization failure (500). No auth bypass possible.
- Cart/order IDs: MongoDB `findById()` expects String — operator objects cause type mismatch, not injection.

**JWT manipulation protection (all safe):**
- Tampered payload: Signature verification fails → 403.
- Modified signature: Rejected → 403.
- `alg: "none"` token: jjwt library rejects → 403.
- Empty token, garbage string: Rejected → 403.
- Wrong scheme (`Basic` instead of `Bearer`): Without cookie, rejected → 403.

**Mass assignment protection:**
- Signup: Extra fields (balance, role, id) in request body are ignored by `SignupRequest` record DTO and `User` constructor. Balance defaults to 0.0.
- Cart items: `CartItem` created server-side with authenticated user's ID. Extra userId/id fields in request body ignored.
- No admin role exists — no privilege escalation possible.

**API abuse findings:**
- Parameter pollution (duplicate query params): Handled gracefully — Spring takes last value.
- **FINDING: No server-side page size cap** — `?size=10000` returns all 50 books. Could be a DoS vector with larger datasets.
- Negative page number: Returns 200 with empty results (Spring Pageable handles gracefully).
- Path traversal: Spring/Tomcat normalizes `..` paths. URL-encoded traversal (`%2e%2e`) returns 400 (blocked by Tomcat).
- HTTP method tampering: Unsupported methods return 403 or 405.
- Content-type validation: Non-JSON content types (text/plain, XML, no content-type) rejected with 500 (deserializer fails).

**Sensitive endpoint exposure (documented findings):**
- `/api/seed` and `/api/reset` are publicly accessible (no auth required). These are test helpers that should be disabled in production.
- `/swagger-ui/index.html` and `/api-docs` are publicly accessible. Should be restricted in production.

**Error information disclosure (safe):**
- Auth errors: Return structured `{error, message}` JSON — no stack traces, no class names.
- 404 errors: No implementation details leaked.
- 500 errors: Generic "An unexpected error occurred" message — stack trace logged server-side only.
- No BCrypt hash, no MongoDB details, no Spring framework details in any error response.

**Token storage (safe):**
- Token NOT stored in localStorage or sessionStorage.
- Token NOT exposed in URL query parameters.
- Token transmitted only via HttpOnly cookie or Authorization header.

**Session lifecycle:**
- Stateless JWT — no server-side session store.
- **FINDING: No token revocation mechanism.** Tokens remain valid until expiry even after logout. Logout only clears the cookie (Max-Age=0).
- Different users get different tokens with different userId claims.

**Curl/Playwright API testing quirk:**
- Shell escaping of `!` in passwords corrupts JSON payloads in curl. Use `printf '...'` to write JSON to a temp file, then `curl -d @/tmp/file.json`.
- Playwright `ctx.get()` fails with URLs containing raw curly braces `{}`. Use `params: {}` option to let Playwright properly encode query parameters.
- Playwright's HTTP client normalizes `..` path traversal in URLs before sending. Cannot test raw `../` traversal via Playwright — use `%2e%2e` encoding instead.

**Test count: 131 security tests across 6 spec files, all passing.**
- security-xss-injection.spec.ts: 21 tests (search, login, signup, sell form, URL-based, API reflection)
- security-nosql-injection.spec.ts: 17 tests (search, genre, login, signup, cart, order, UI inputs)
- security-headers.spec.ts: 19 tests (public/auth/error endpoints, missing headers, frontend)
- security-csrf-cors.spec.ts: 14 tests (CORS origin validation, CSRF protection, cross-origin blocking)
- security-jwt-auth.spec.ts: 17 tests (token validation, tampering, none algo, cookie auth, session lifecycle)
- security-api-abuse.spec.ts: 29 tests (mass assignment, parameter pollution, path traversal, method tampering, content-type, sensitive endpoints, info disclosure)
- security-cookie-session.spec.ts: 14 tests (cookie attributes, JS inaccessibility, session isolation, token scope)

### Stage 11 — Expanded Coverage (QA Agent)

**Coverage expansion strategy:**
- Identified 7 gap areas from analysis of existing 571 tests across 46 spec files.
- Wrote 101 new tests across 7 new spec files to reach 672 total tests.
- All 672 tests pass in ~11.5 minutes with --workers=1.

**New spec files created (101 tests):**
- coverage-api-resilience.spec.ts: 14 tests (API 500 errors, empty responses, slow responses, recovery after failure, network failures for home/book-detail/cart/orders/marketplace/profile/search)
- coverage-data-integrity.spec.ts: 11 tests (balance calculations, cart total accuracy, multi-item totals, removal updates, order data, return refund, marketplace balance transfer, cart badge count)
- coverage-workflow-robustness.spec.ts: 7 tests (seller→buyer marketplace lifecycle, purchase→return status chain, signup→browse→$0 balance, search→detail→checkout, genre→detail→checkout, cart management→checkout, cross-feature interactions)
- coverage-loading-async.spec.ts: 10 tests (loading indicators for home/book-detail/marketplace/orders/cart, navigation during async, rapid page switching, slow auth responses)
- coverage-theme-ui-state.spec.ts: 10 tests (theme toggle cycle, localStorage persistence under key `bookhive_theme`, theme across navigation/reload/auth pages/login/logout, sidebar NavLink active state with CSS module class)
- coverage-concurrent-ops.spec.ts: 8 tests (same book qty accumulation, parallel API `/api/cart/items` calls, cross-tab cart visibility, cross-tab checkout sync, cross-tab session invalidation, rapid increment/decrement, quick home page add-to-cart)
- coverage-navigation-deeplink.spec.ts: 25 tests (direct URL access to all 8 public routes, 4 protected routes, sidebar links, genre filter links, book card navigation, login/signup cross-links, browser back/forward, order navigation)
- coverage-page-content.spec.ts: 16 tests (book detail completeness, book-001 specific content, home page 12-per-page, book card elements, pagination controls, profile details/listings, orders/order-detail completeness, marketplace/create-listing forms, cart item elements)

**Critical discovery: `/api/reset` + stale cookies pattern:**
- `/api/reset` drops ALL collections and re-creates test users with new MongoDB IDs.
- If browser cookies still reference the OLD user ID, the next login attempt uses stale credentials → 403 error.
- **FIX:** Always call `await context.clearCookies()` AFTER `/api/reset` and BEFORE re-logging in. This pattern is essential for any serial test block that calls `/api/reset` in `beforeEach`.
- All 14 `beforeEach` blocks in coverage specs were updated with this pattern.

**API endpoint discovery:**
- Cart add item: `POST /api/cart/items` (NOT `/api/cart`). The endpoint expects `{ bookId, quantity }` in the body.
- Previous stages used UI interactions (clicking "Add to Cart" buttons) which hid this detail.

**Theme persistence key:**
- Theme is stored in localStorage as `bookhive_theme` (NOT `theme`).
- Default theme is `dark`. Toggle cycles between `dark` and `light`.
- `document.documentElement.setAttribute('data-theme', theme)` is used for CSS variable switching.

**Sidebar NavLink active class:**
- CSS Modules generate hashed class names. The `navClass` function uses `styles.navItemActive`.
- In compiled CSS, this becomes something like `Sidebar_navItemActive__xyz123`.
- Test assertion: use `class.toLowerCase().includes('active')` instead of exact match.

**Search API error behavior (app-level finding):**
- `HomePage.jsx` has NO `.catch()` on the books API fetch.
- When `api.get('/books', { params })` returns 500, `.then()` is NOT called → `books` state retains previous value.
- `.finally()` sets `loading=false`, so the page shows STALE books (from previous successful fetch), NOT "No books found".
- This is a data staleness bug — search failure silently shows old results.

**Route interception timing:**
- Must set up `page.route()` BEFORE `navigateTo()` for pages that fetch on mount (HomePage, BookDetailPage).
- For search API interception, set route AFTER initial page load to only catch subsequent search requests.
- `page.unroute()` cleanly removes interceptions for recovery tests.

**Cross-tab testing pattern:**
- `context.newPage()` creates a new tab sharing the same cookie jar (same session).
- After checkout in tab 1, `page2.reload()` in tab 2 correctly shows empty cart.
- After logout in tab 1, `page2.goto('/cart')` correctly redirects to login (session cookie cleared).

**Book detail stock display:**
- `bookDetailStock` testid exists but may not always be visible depending on stock count.
- Use `.isVisible().catch(() => false)` pattern to handle optional elements.

**Pagination boundary:**
- 50 books / 12 per page = 5 pages (page 5 has 2 books).
- `prev-page` disabled at page 0, `next-page` disabled at last page.
- Pagination hidden when `totalPages <= 1`.

**Test count: 672 total tests across 53 spec files, all passing.**

### Stage 12 — Bug Discovery / Adversarial Probing (QA Agent)

**14 bugs discovered via adversarial probing. 19 reproduction tests across 4 spec files.**

**CRITICAL race conditions (4 bugs, all exploitable):**
- **BUG-001: Double-checkout** — Concurrent `POST /api/orders` creates phantom orders. User charged once but 2 orders created. Returning both yields net profit ($100 → $112.99). Stock inflates above original. Root cause: no concurrency control in `OrderService.checkout()`.
- **BUG-002: Double-return** — Concurrent `POST /api/orders/{id}/return` issues multiple refunds for single order. 5 concurrent requests → 2-3 succeed → balance inflated, stock inflated. Root cause: `isReturnEligible()` check is non-atomic.
- **BUG-003: Double-buy marketplace** — Concurrent `POST /api/marketplace/listings/{id}/buy` all succeed for single listing. 5 requests → 3-5 orders created. Root cause: ACTIVE status check in `buyListing()` is non-atomic.
- **BUG-004: Duplicate cart entries** — Concurrent `POST /api/cart/items` for same bookId creates separate cart entries instead of consolidating quantity. At checkout, user is charged for all duplicates but stock only decremented once per bookId. Root cause: `addItem()` check-then-act is non-atomic.

**All race conditions share the same root cause pattern:** MongoDB operations are read-check-write without atomic guarantees. Fix: use `findOneAndUpdate` with conditions, optimistic locking (`@Version`), or MongoDB transactions.

**Stale UI bugs (3 bugs, all confirmed):**
- **BUG-005:** Sidebar balance not updated after checkout (requires reload)
- **BUG-006:** Cart badge not cleared after checkout (requires reload)
- **BUG-007:** Cart badge not shown after re-login despite server-side cart items
- All three caused by CartPage/AuthContext not triggering re-fetch after mutations.

**Silent error handling (3 bugs):**
- **BUG-008:** `CartPage.jsx` `handleCheckout()` — no `.catch()` block. Errors silently swallowed.
- **BUG-009:** `ListingCard.jsx` `handleBuy()` — no `.catch()` block.
- **BUG-010:** `OrderDetailPage.jsx` `handleReturn()` — no `.catch()` block.
- All three follow same pattern: `try { await api.post(...) } finally { setLoading(false) }` with no catch.

**UI/UX defects (4 bugs):**
- **BUG-011:** No 404 page — `App.jsx` missing `<Route path="*">` catch-all.
- **BUG-012:** Search input not synced with URL — `SearchBar.jsx` uses local state, doesn't read from `searchParams`.
- **BUG-013:** Wrong error message "Return window has expired" for already-returned orders. Should be "Order already returned".
- **BUG-014:** Floating point precision artifacts in balance (`$82.03000000000002`). Java `double` used for monetary calculations instead of `BigDecimal`.

**Testing patterns for race condition reproduction:**
- Use `Promise.all()` with 2-5 concurrent `page.request.post()` calls.
- Race bugs are non-deterministic — tests may be "flaky" by nature (Playwright retries handle this).
- `page.request.post()` uses the browser context's cookies, so authenticated requests work without explicit headers if the page has logged in.
- For API-only tests where no browser session exists, use explicit `Authorization: Bearer` headers.

**Shell escaping gotcha:**
- `printf` and shell variables mangle `!` in passwords (history expansion). Use heredoc `cat > file << 'EOF'` to write JSON payloads to temp files, then `curl -d @file`.

**Adversarial probing methodology:**
- API-level probing first (fastest, most reliable for race conditions)
- Browser probing second (for UI state bugs, error feedback)
- Route interception for simulating API failures
- Cross-reference API behavior with frontend handling to find silent error gaps

**Test count: 691 total tests across 57 spec files (672 previous + 19 bug reproduction).**
