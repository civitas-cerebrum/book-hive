# Bug Report

## BUG-001: Cart Badge Disappears After Hard Page Navigation

**Severity:** Medium
**Status:** Confirmed
**Component:** CartContext / Sidebar

### Description
When a user adds a book to the cart, the cart badge (showing item count) appears correctly. However, if the user navigates to another page via a full page reload (e.g., browser refresh or direct URL navigation), the cart badge disappears from the sidebar even though the cart items are still persisted on the server.

### Steps to Reproduce
1. Log in as a test user
2. Add a book to the cart from the home page
3. Verify the cart badge shows "1" next to the Cart link
4. Navigate to `/marketplace` via full page reload (hard navigation)
5. Observe the sidebar Cart link

### Expected Behavior
The cart badge should show "1" (or the correct item count) after page navigation, as the cart data is persisted server-side.

### Actual Behavior
The cart badge disappears after hard page navigation. The Cart link shows "Cart" without any badge count. However, navigating to `/cart` page still shows the cart items correctly.

### Root Cause Analysis
The `CartContext` likely fetches cart items on mount but the badge display in the Sidebar component may not be re-rendering properly after the context is re-initialized on a full page reload. The issue appears to be a timing/state synchronization issue between the cart context fetch and the sidebar badge render.

### Evidence
- Screenshot: `tests/e2e/evidence/BUG-001.png`

---

## BUG-003: Newly Signed-Up User Shows $0.00 Balance Instead of $100.00

**Severity:** Medium
**Status:** Confirmed
**Component:** Auth / User Registration

### Description
When a new user signs up through the registration form, they are redirected to the home page with a balance of $0.00 displayed in the sidebar. The expected starting balance for new users should be $100.00 (as per seed data configuration and existing test user behavior).

### Steps to Reproduce
1. Navigate to `/signup`
2. Fill in username, email, and password (min 8 chars)
3. Click "Create Account"
4. After redirect to home page, observe the balance in the sidebar

### Expected Behavior
The sidebar should display "Balance: $100.00" for newly registered users.

### Actual Behavior
The sidebar displays "Balance: $0.00" for newly registered users.

### Root Cause Analysis
The backend signup endpoint may not be setting the initial balance correctly, or the frontend may not be receiving the updated balance in the auth response after signup. Existing seed users (testuser1, testuser2) have $100.00 because they are pre-configured in seed data.

### Evidence
- Screenshot: `tests/e2e/evidence/BUG-003.png`
