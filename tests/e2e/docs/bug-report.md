# Bug Report — BookHive E2E Testing

## Summary

During E2E test automation, **2 bugs** were discovered through adversarial probing. Both bugs relate to missing user feedback for error conditions.

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

## Test Evidence

Both bugs have automated reproduction tests in the `tests/bug-discovery/` directory:
- `login-error-missing.spec.ts` - Demonstrates BUG-001
- `checkout-error-missing.spec.ts` - Demonstrates BUG-002

These tests:
1. Trigger the error condition
2. Verify that no error message is displayed (confirming the bug)
3. Document expected vs actual behavior

Run bug discovery tests:
```bash
npx playwright test tests/bug-discovery/ --project=chromium
```
