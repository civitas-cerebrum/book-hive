# E2E Test Scenarios

## Home Page & Browsing

### Display book catalog with search and pagination
**Area:** HomePage
**Steps:**
1. Open the home page
2. Verify the book grid is visible with book cards
3. Verify pagination shows "Previous" disabled on first page
4. Click "Next" to go to page 2
5. Verify books are displayed on page 2
6. Return to page 1 and search for "Dune"
7. Verify search results show relevant books
**Expected Result:** Book grid loads with cards, pagination works, search filters results.

### Navigate to book detail page
**Area:** BookDetailPage
**Steps:**
1. Navigate to /books/book-001
2. Check title shows "To Kill a Mockingbird"
3. Check author shows "Harper Lee"
4. Check price, stock, and description are present
**Expected Result:** All book details are displayed correctly.

### Filter books by genre category
**Area:** HomePage
**Steps:**
1. Navigate to /?genre=Sci-Fi
2. Verify the book grid displays books
**Expected Result:** Only Sci-Fi genre books appear in the grid.

---

## Authentication

### Login with valid credentials
**Area:** Auth
**Steps:**
1. Go to /login
2. Enter testuser1@bookhive.test and password
3. Click Sign In
4. Verify redirect to home page
5. Verify Cart, Orders, Profile, Logout links appear in navigation
**Expected Result:** User is logged in and sees authenticated navigation.

### Logout and show unauthenticated nav
**Area:** Auth
**Steps:**
1. Log in with valid credentials
2. Click Logout button
3. Verify Login and Sign Up links appear in navigation
**Expected Result:** User is logged out and sees unauthenticated navigation.

---

## Cart & Checkout Flow

### Add book to cart, view cart, and checkout
**Area:** Cart, Checkout
**Steps:**
1. Log in
2. Go to a book detail page
3. Click "Add to Cart"
4. Navigate to the cart
5. Verify cart has at least 1 item with total and checkout button
6. Click Checkout
7. Verify redirect to order detail page with order total and items
**Expected Result:** Complete purchase flow works end-to-end.

### Show orders list with past orders
**Area:** Orders
**Steps:**
1. Log in and complete a purchase
2. Navigate to the orders page
3. Verify at least one order card is visible
**Expected Result:** Orders page shows completed orders.

---

## Marketplace & Listings

### Create a marketplace listing
**Area:** Marketplace
**Steps:**
1. Log in
2. Navigate to Sell a Book page
3. Select a book from the dropdown
4. Choose a condition (GOOD)
5. Enter a price ($9.99)
6. Click Create Listing
7. Navigate to the marketplace page
8. Verify at least one listing card appears
**Expected Result:** Listing is created and visible on the marketplace.

### Show user profile with balance and listings
**Area:** Profile
**Steps:**
1. Log in
2. Navigate to the profile page
3. Verify username and email are displayed (non-empty)
4. Verify balance is present
**Expected Result:** Profile page shows user information.

---

## Protected Routes

### Redirect unauthenticated users from protected routes to login
**Area:** Auth, Security
**Steps:**
1. Without logging in, navigate to /cart
2. Verify redirect to /login
3. Navigate to /orders — verify redirect to /login
4. Navigate to /profile — verify redirect to /login
5. Navigate to /marketplace/sell — verify redirect to /login
**Expected Result:** All protected routes redirect unauthenticated users to the login page.

---

## Bug Discovery

### BUG-001: Login with invalid credentials should show error message
**Area:** Auth (Bug)
**Steps:**
1. Navigate to /login
2. Enter invalid email and password
3. Click Sign In
4. Check for error message
**Expected Result:** Error message "Invalid credentials" or "Login failed" should be visible
**Actual Result:** Page reloads with empty form, no error message shown (BUG-001)
