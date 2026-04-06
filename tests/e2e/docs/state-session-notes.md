# State & Session Testing Notes

## Session Mechanism

- **Auth type:** HTTP-only cookies set by Spring backend via `withCredentials: true` (axios)
- **Session storage:** Server-side (Spring Session); `document.cookie` is empty in JS
- **Logout behavior:** Clicking Logout stays on current page, clears session cookie, and removes auth UI elements immediately
- **Auth gating:** Client-side axios interceptor catches 401 responses and redirects to `/login`
- **Protected routes:** `/cart`, `/orders`, `/orders/:id`, `/marketplace/sell`, `/profile`

## Stale UI Findings

### 1. Sidebar Balance — STALE after Checkout

| Element | `[data-testid='user-balance']` in sidebar navigation |
|---|---|
| **Trigger** | User completes checkout (purchases a book) |
| **Expected** | Balance should decrease to reflect the purchase |
| **Actual** | Balance stays at the pre-checkout value (e.g., $100.00 → still $100.00) |
| **Resolves on refresh?** | ✅ Yes — page reload shows correct balance |
| **Root cause** | The checkout response does not trigger a re-fetch of the user balance in the sidebar. The sidebar balance is fetched once on initial auth and cached in React state. |
| **Severity** | Medium — user sees incorrect balance until navigation triggers a state refresh |

### 2. Cart Badge — STALE after Checkout

| Element | `[data-testid='cart-badge']` in sidebar navigation |
|---|---|
| **Trigger** | User completes checkout (cart should be emptied) |
| **Expected** | Cart badge should disappear (0 items) or update to 0 |
| **Actual** | Cart badge still shows the pre-checkout count (e.g., "1") |
| **Resolves on refresh?** | ✅ Yes — page reload shows no badge (empty cart) |
| **Root cause** | The checkout API call empties the cart server-side but does not trigger a cart count update in the client-side navbar state. |
| **Severity** | Medium — misleading cart indicator after purchase |

### 3. Cart Badge — CORRECTLY UPDATES on Add to Cart ✓

| Element | `[data-testid='cart-badge']` in sidebar navigation |
|---|---|
| **Trigger** | User clicks "Add to Cart" from home page or book detail page |
| **Behavior** | Badge appears/increments immediately without page navigation ✓ |
| **Notes** | This is correctly implemented — the add-to-cart handler updates the badge state |

### 4. Cart Page — CORRECTLY UPDATES on Mutations ✓

| Element | Cart items, quantities, totals on `/cart` page |
|---|---|
| **Trigger** | User changes quantity, removes items, or clears cart |
| **Behavior** | All elements update in-place without page navigation ✓ |
| **Notes** | The cart page correctly re-renders on quantity changes, removals, and clear actions |

### 5. Order Status — CORRECTLY UPDATES on Return ✓

| Element | `[data-testid^='order-status-']` on `/orders/:id` page |
|---|---|
| **Trigger** | User clicks "Return Order" |
| **Behavior** | Status changes from "COMPLETED" to "RETURNED" in-place ✓ |
| **Notes** | The order detail page correctly handles the return mutation |

### 6. Marketplace Listings — CORRECTLY UPDATES on Purchase ✓

| Element | Listing cards on `/marketplace` page |
|---|---|
| **Trigger** | User buys a listing |
| **Behavior** | Listing card is removed from the page in-place ✓ |
| **Notes** | The marketplace correctly re-renders after a purchase |

## Cross-Tab Behavior

| Scenario | Tab 1 Action | Tab 2 Behavior | Sync Method |
|---|---|---|---|
| Cart add | Add item to cart | Shows item on next navigation/reload | Server-side state, no auto-sync |
| Cart clear | Clear all cart items | Shows empty after reload | Server-side state, no auto-sync |
| Checkout | Complete checkout | Stale cart visible until reload | Server-side state, no auto-sync |
| Logout | Click Logout | Session invalidated; protected pages redirect on next request | Cookie cleared (HTTP-only, shared) |
| Order return | Return order | Shows RETURNED status after reload | Server-side state, no auto-sync |
| Buy listing | Purchase marketplace listing | Listing removed after reload | Server-side state, no auto-sync |

**Key finding:** The app does NOT use WebSocket, Server-Sent Events, or any real-time sync mechanism between tabs. All cross-tab state sync happens via the shared server-side state — tab 2 sees updates only when it makes a new request (navigation or reload). This is acceptable for this application's complexity level, but means stale data can be interacted with (e.g., attempting to checkout items that were already checked out in another tab).

## Cross-Session Persistence

| State Type | Persists? | Storage | UI Indicator After Re-login |
|---|---|---|---|
| Cart contents | ✅ Yes | Server-side (MongoDB, tied to user) | Cart items present on /cart page; badge may not show immediately on home page |
| Cart quantities | ✅ Yes | Server-side | Quantities preserved on cart page |
| Orders | ✅ Yes | Server-side (immutable) | Orders list and detail pages show all orders |
| User balance | ✅ Yes | Server-side | Sidebar balance shows correct amount |
| Marketplace listings | ✅ Yes | Server-side | Listings visible on marketplace and profile |
| Theme preference | ✅ Yes | Client-side (localStorage) | Persists across page reloads within same browser session |

**Cart badge note:** After re-login, the cart badge in the sidebar may not appear immediately on the home page. The cart item count is fetched when the user first navigates to a page that triggers the cart data fetch. The items themselves are properly persisted server-side and appear correctly on the /cart page.

**Theme preference note:** The theme toggle (☀️/🌙) IS persisted in localStorage. Toggling to dark mode and refreshing preserves the dark mode setting. However, this is browser-local — a different browser or clearing localStorage will reset to default.

## Stale State Risk Assessment

| Page | Risk Level | Reason |
|---|---|---|
| `/cart` | 🟡 Medium | Cart badge and balance stale after checkout; cart page itself updates correctly |
| `/orders/:id` | 🟢 Low | Order status updates correctly in-place on return |
| `/marketplace` | 🟢 Low | Listings update correctly after purchase |
| `/profile` | 🟢 Low | Profile data fetched fresh on each visit |
| `/` (Home) | 🟡 Medium | Sidebar balance can be stale after operations in sub-pages |
| `/books/:id` | 🟢 Low | Book data is relatively static |

## Test Coverage Summary

- **Session Lifecycle:** 6 tests covering all 5 protected routes + cross-user data isolation
- **Stale UI:** 13 tests covering cart badge, balance, cart operations, order status, marketplace
- **Cross-Tab:** 7 tests covering cart, logout, orders, and marketplace across tabs
- **Cross-Session Persistence:** 8 tests covering cart, orders, balance, listings, theme, and user isolation
