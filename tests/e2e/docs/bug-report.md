# Bug Report — BookHive E2E Testing

## Summary

During E2E test automation, **3 bugs** were discovered through adversarial probing. Two bugs relate to missing user feedback for error conditions, and one is a UX issue with authentication flow.

---

## Bug #1: No Error Message on Failed Login

| Field | Value |
|-------|-------|
| **ID** | BUG-001 |
| **Severity** | Medium |
| **Area** | Authentication / UX |
| **Status** | Confirmed |
| **Reproduction Test** | `tests/bug-discovery/login-error-missing.spec.ts` |

### Description
When a user enters invalid credentials (wrong email or password) and attempts to login, the application does not display any error message to inform the user that the login failed.

### Steps to Reproduce
1. Navigate to `/login`
2. Enter an email that doesn't exist in the system (e.g., `fake@example.com`)
3. Enter any password
4. Click the "Sign In" button
5. **Observe:** No error message appears; user remains on login page with no feedback

### Expected Behavior
An error message should be displayed, such as:
- "Invalid email or password"
- "Login failed. Please check your credentials."

### Actual Behavior
The login form submits, the API returns a 401/403 error, but no user-facing error message is shown. The user is left on the login page with the form fields still populated, receiving no indication that their login attempt failed.

### Business Impact
- Poor user experience: Users don't know why login failed
- Users may repeatedly try the same invalid credentials
- Users may assume the system is broken rather than their credentials being wrong

### Technical Notes
- The `LoginPage` component does not have an error message element (`[data-testid="error-message"]`)
- API errors are not being caught and displayed to the user

---

## Bug #2: No Error Message on Checkout Failure (Insufficient Funds)

| Field | Value |
|-------|-------|
| **ID** | BUG-002 |
| **Severity** | High |
| **Area** | Cart / Checkout / UX |
| **Status** | Confirmed |
| **Reproduction Test** | `tests/bug-discovery/checkout-error-missing.spec.ts` |

### Description
When a user attempts to checkout with items in their cart but has insufficient balance (new users start with $0.00), the checkout silently fails without displaying any error message.

### Steps to Reproduce
1. Create a new user account (starts with $0.00 balance)
2. Navigate to any book detail page (e.g., `/books/book-001`)
3. Click "Add to Cart"
4. Navigate to the cart page (`/cart`)
5. Click the "Checkout" button
6. **Observe:** No error message appears; user remains on cart page

### Expected Behavior
An error message should be displayed, such as:
- "Insufficient balance. Please add funds to your account."
- "Checkout failed: Your balance is $0.00 but the total is $12.99"

### Actual Behavior
The checkout button is clicked, the API returns an error (likely 400 or 402), but no user-facing error message is shown. The cart items remain in place, but the user has no idea why checkout didn't complete.

### Business Impact
- **High severity**: This directly impacts the purchase funnel
- Users may abandon their cart out of frustration
- Users may think the system is broken
- Lost revenue due to failed conversions
- Increased support tickets from confused users

### Technical Notes
- The `CartPage` component does not have an error message element (`[data-testid="error-message"]`)
- The checkout API error response is not being caught and displayed
- Cart items correctly remain after failed checkout (this is good)

---

## Recommendations

### Immediate Actions
1. **Add error handling to LoginPage**: Catch API errors and display a generic "Invalid credentials" message
2. **Add error handling to CartPage**: Catch checkout errors and display specific messages based on error type (insufficient funds, out of stock, etc.)

### UI Components Needed
Both pages need an error message display component:
```jsx
{error && (
  <div data-testid="error-message" className="error-message">
    {error}
  </div>
)}
```

### Testing Selectors
The following selectors should be added for proper error testing:
- `[data-testid="error-message"]` on LoginPage
- `[data-testid="error-message"]` on CartPage
- Consider `[data-testid="error-message"]` on SignupPage as well

---

---

## Bug #3: Authenticated Users Can Access Login/Signup Pages

| Field | Value |
|-------|-------|
| **ID** | BUG-003 |
| **Severity** | Low |
| **Area** | Authentication / Routing / UX |
| **Status** | Confirmed |
| **Reproduction Test** | `tests/bug-discovery/auth-redirect.spec.ts` |

### Description
Users who are already logged in can navigate directly to the `/login` and `/signup` pages. They see the authentication forms while their balance and logout button are still displayed in the sidebar.

### Steps to Reproduce
1. Login with valid credentials
2. Verify you see your balance and logout button in the sidebar
3. Navigate directly to `/login`
4. **Observe:** Login form is displayed while sidebar shows authenticated state
5. Navigate directly to `/signup`
6. **Observe:** Signup form is displayed while sidebar shows authenticated state

### Expected Behavior
Authenticated users should be:
- Redirected to the home page when accessing `/login` or `/signup`
- OR shown a message indicating they are already logged in

### Actual Behavior
- The login/signup form is fully displayed
- Sidebar continues to show authenticated state (balance, logout button)
- Forms are functional and could be submitted
- No redirect or warning is provided

### Business Impact
- Confusing user experience: Shows auth form while user is already authenticated
- Could lead to accidental duplicate account creation attempts
- Potential session/state conflicts if forms are submitted

### Technical Notes
- Missing route guards in React Router configuration
- LoginPage and SignupPage components don't check authentication state
- The auth context is available but not used for redirects

---

## Recommendations

### Immediate Actions
1. **Add error handling to LoginPage**: Catch API errors and display a generic "Invalid credentials" message
2. **Add error handling to CartPage**: Catch checkout errors and display specific messages based on error type (insufficient funds, out of stock, etc.)
3. **Add route guards**: Redirect authenticated users away from `/login` and `/signup`

### UI Components Needed
Both pages need an error message display component:
```jsx
{error && (
  <div data-testid="error-message" className="error-message">
    {error}
  </div>
)}
```

### Route Guards
Add authentication checks to auth pages:
```jsx
// In LoginPage.jsx and SignupPage.jsx:
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  // ... rest of component
}
```

### Testing Selectors
The following selectors should be added for proper error testing:
- `[data-testid="error-message"]` on LoginPage
- `[data-testid="error-message"]` on CartPage
- Consider `[data-testid="error-message"]` on SignupPage as well

---

## Test Evidence

All bugs have automated reproduction tests in the `tests/bug-discovery/` directory:
- `login-error-missing.spec.ts` - Demonstrates BUG-001
- `checkout-error-missing.spec.ts` - Demonstrates BUG-002
- `checkout-no-error.spec.ts` - Additional evidence for BUG-002
- `auth-redirect.spec.ts` - Demonstrates BUG-003

These tests:
1. Trigger the error condition
2. Verify that no error message is displayed (confirming the bug)
3. Document expected vs actual behavior

Run bug discovery tests:
```bash
npx playwright test tests/bug-discovery/ --project=chromium
```

---

## Bug Severity Matrix

| Bug ID | Severity | Priority | Impact |
|--------|----------|----------|--------|
| BUG-001 | Medium | P2 | User confusion on login |
| BUG-002 | High | P1 | Direct conversion impact |
| BUG-003 | Low | P3 | Minor UX inconsistency |
