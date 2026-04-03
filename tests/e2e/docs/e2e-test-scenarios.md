# E2E Test Scenarios — BookHive

## Overview
This document describes all E2E test scenarios in plain English. These scenarios cover the core user journeys through the BookHive application.

---

## Authentication Tests (9 tests)

### Test: should display login page with all elements
**Area:** Authentication
**Steps:**
1. Navigate to the login page
2. Look for the page container
3. Check that the title says "Welcome back"
4. Verify email input field exists
5. Verify password input field exists
6. Verify sign in button exists
7. Verify link to signup page exists
**Expected Result:** All login page elements are present

### Test: should display signup page with all elements
**Area:** Authentication
**Steps:**
1. Navigate to the signup page
2. Look for the page container
3. Check that the title says "Create an account"
4. Verify username input field exists
5. Verify email input field exists
6. Verify password input field exists
7. Verify create account button exists
8. Verify link to login page exists
**Expected Result:** All signup page elements are present

### Test: should navigate from login to signup page
**Area:** Authentication
**Steps:**
1. Navigate to the login page
2. Click the "Sign up" link
3. Verify URL changes to /signup
4. Verify signup page container is present
**Expected Result:** User navigates from login to signup page

### Test: should navigate from signup to login page
**Area:** Authentication
**Steps:**
1. Navigate to the signup page
2. Click the "Sign in" link
3. Verify URL changes to /login
4. Verify login page container is present
**Expected Result:** User navigates from signup to login page

### Test: should remain on login page after invalid login attempt
**Area:** Authentication
**Steps:**
1. Navigate to the login page
2. Enter an invalid email
3. Enter a wrong password
4. Click the sign in button
5. Wait for network response
6. Verify user remains on login page
**Expected Result:** User stays on login page after failed login

### Test: should show sidebar login/signup links when not authenticated
**Area:** Authentication
**Steps:**
1. Navigate to home page
2. Ensure user is logged out
3. Verify Login link appears in sidebar
4. Verify Sign Up link appears in sidebar
**Expected Result:** Unauthenticated users see login/signup options

### Test: should register a new user successfully
**Area:** Authentication
**Steps:**
1. Navigate to signup page
2. Enter a unique username
3. Enter a unique email
4. Enter a password
5. Click create account button
6. Wait for redirect to home page
7. Verify logout button appears (user is logged in)
8. Verify cart link appears in sidebar
**Expected Result:** New user is registered and logged in

### Test: should show error when username is taken
**Area:** Authentication
**Steps:**
1. Register a new user
2. Logout
3. Try to register with the same username
4. Verify error message appears saying username is taken
**Expected Result:** Duplicate username shows error message

### Test: should login and logout successfully
**Area:** Authentication
**Steps:**
1. Register a new user
2. Logout
3. Login with the created credentials
4. Verify redirect to home page
5. Verify logout button is present
6. Click logout
7. Verify login link reappears
**Expected Result:** User can login and logout successfully

---

## Browse Books Tests (12 tests)

### Test: should display home page with book grid
**Area:** Browse
**Steps:**
1. Navigate to home page
2. Verify page container exists
3. Verify book grid is present
4. Verify there is at least one book card
**Expected Result:** Home page shows books

### Test: should display pagination controls
**Area:** Browse
**Steps:**
1. Navigate to home page
2. Verify pagination is present
3. Verify Previous button exists
4. Verify Next button exists
5. Verify Previous button is disabled on first page
**Expected Result:** Pagination controls are present and functional

### Test: should navigate to next page
**Area:** Browse
**Steps:**
1. Navigate to home page
2. Wait for book grid to load
3. Click Next page button
4. Verify Previous button is now enabled
**Expected Result:** User can navigate to next page of books

### Test: should filter books by genre - Fiction
**Area:** Browse
**Steps:**
1. Navigate to home page
2. Click Fiction genre filter
3. Verify URL contains genre=Fiction parameter
4. Verify book grid still displays
**Expected Result:** Books are filtered by Fiction genre

### Test: should filter books by genre - Sci-Fi
**Area:** Browse
**Steps:**
1. Navigate to home page
2. Click Sci-Fi genre filter
3. Verify URL contains genre=Sci-Fi parameter
4. Verify book grid still displays
**Expected Result:** Books are filtered by Sci-Fi genre

### Test: should search for books
**Area:** Browse
**Steps:**
1. Navigate to home page
2. Type "Mockingbird" in search input
3. Press Enter
4. Verify URL contains search query
5. Verify book grid displays results
**Expected Result:** Search returns matching books

### Test: should navigate to book detail page from card
**Area:** Browse
**Steps:**
1. Navigate to home page
2. Verify first book card exists
3. Click the first book card
4. Verify URL contains /books/
5. Verify book detail page container is present
**Expected Result:** Clicking book card opens detail page

### Test: should display book detail page with all information
**Area:** Browse
**Steps:**
1. Navigate to a specific book page
2. Verify all book information elements are present: title, author, genre, description, price, stock
**Expected Result:** Book detail page shows all information

### Test: should display correct book details for known book
**Area:** Browse
**Steps:**
1. Navigate to To Kill a Mockingbird book page
2. Verify title shows "To Kill a Mockingbird"
3. Verify author shows "Harper Lee"
4. Verify genre shows "Fiction"
5. Verify price shows "$12.99"
**Expected Result:** Book details match expected values

### Test: should show sidebar navigation links
**Area:** Browse
**Steps:**
1. Navigate to home page
2. Verify BookHive logo exists
3. Verify All Books link exists
4. Verify Marketplace link exists
5. Verify genre filter links exist
**Expected Result:** All navigation elements are present

### Test: should navigate to marketplace from sidebar
**Area:** Browse
**Steps:**
1. Navigate to home page
2. Click Marketplace link in sidebar
3. Verify URL changes to /marketplace
4. Verify marketplace page container is present
**Expected Result:** Navigation to marketplace works

### Test: should return to all books from sidebar
**Area:** Browse
**Steps:**
1. Navigate to marketplace
2. Click All Books link in sidebar
3. Verify URL changes to /
4. Verify home page container is present
**Expected Result:** Navigation back to home works

---

## Cart and Checkout Tests (7 tests)

### Test: should show empty cart message when cart is empty
**Area:** Cart
**Steps:**
1. Login as a new user
2. Navigate to cart page
3. Verify cart page container exists
4. Verify empty cart message is shown
5. Verify message says "Your cart is empty"
**Expected Result:** Empty cart shows appropriate message

### Test: should add book to cart from home page
**Area:** Cart
**Steps:**
1. Login as a new user
2. Navigate to home page
3. Click Add to Cart on first book
4. Verify cart badge appears in sidebar
**Expected Result:** Book is added to cart from home page

### Test: should add book to cart from detail page
**Area:** Cart
**Steps:**
1. Login as a new user
2. Navigate to a book detail page
3. Verify Add to Cart button exists
4. Click Add to Cart
5. Verify cart badge appears
**Expected Result:** Book is added to cart from detail page

### Test: should show cart with items after adding
**Area:** Cart
**Steps:**
1. Login as a new user
2. Add a book to cart
3. Navigate to cart page
4. Verify empty message is NOT shown
5. Verify cart total is displayed
6. Verify checkout button exists
7. Verify clear cart button exists
**Expected Result:** Cart page shows added items

### Test: should clear cart when clicking clear button
**Area:** Cart
**Steps:**
1. Login as a new user
2. Add a book to cart
3. Navigate to cart page
4. Click Clear Cart button
5. Verify empty cart message appears
**Expected Result:** Clear cart removes all items

### Test: should show no orders message when no orders exist
**Area:** Orders
**Steps:**
1. Login as a new user
2. Navigate to orders page
3. Verify orders page container exists
4. Verify "No orders yet" message is shown
**Expected Result:** New user has no orders

### Test: should display checkout button and allow clicking
**Area:** Cart
**Steps:**
1. Login as a new user
2. Add a book to cart
3. Navigate to cart page
4. Verify checkout button exists
5. Click checkout button
6. Verify user remains on cart (checkout fails due to $0 balance)
**Expected Result:** Checkout button is clickable (note: checkout fails without balance)

---

## Marketplace Tests (11 tests)

### Test: should display marketplace page
**Area:** Marketplace
**Steps:**
1. Navigate to marketplace page
2. Verify marketplace page container exists
3. Verify title shows "Marketplace"
**Expected Result:** Marketplace page loads correctly

### Test: should display marketplace page content
**Area:** Marketplace
**Steps:**
1. Navigate to marketplace page
2. Verify marketplace container is present
**Expected Result:** Marketplace page loads

### Test: should require login to access sell page
**Area:** Marketplace
**Steps:**
1. Navigate to sell page while logged out
2. Verify redirect to login page
**Expected Result:** Sell page requires authentication

### Test: should display create listing page when logged in
**Area:** Marketplace
**Steps:**
1. Login as a user
2. Navigate to sell page
3. Verify create listing page container exists
4. Verify title shows "Sell a Book"
**Expected Result:** Logged-in user can access sell page

### Test: should display book select dropdown with options
**Area:** Marketplace
**Steps:**
1. Login as a user
2. Navigate to sell page
3. Verify book select dropdown exists
4. Verify condition dropdown exists
5. Verify price input exists
6. Verify create listing button exists
**Expected Result:** All form elements are present

### Test: should create a listing successfully
**Area:** Marketplace
**Steps:**
1. Login as a user
2. Navigate to sell page
3. Select a book from dropdown
4. Select a condition
5. Enter a price
6. Click create listing button
7. Verify redirect to marketplace
8. Verify listing appears (no empty state)
**Expected Result:** Listing is created successfully

### Test: should display profile page with user info
**Area:** Profile
**Steps:**
1. Login as a user
2. Navigate to profile page
3. Verify profile page container exists
4. Verify username is displayed
5. Verify email is displayed
6. Verify balance is displayed
**Expected Result:** Profile page shows user information

### Test: should show no listings initially on profile
**Area:** Profile
**Steps:**
1. Login as a new user
2. Navigate to profile page
3. Verify "No active listings" message is shown
**Expected Result:** New user has no listings

### Test: should show user balance on profile
**Area:** Profile
**Steps:**
1. Login as a user
2. Navigate to profile page
3. Verify balance shows "$0.00" for new user
**Expected Result:** Balance is displayed correctly

### Test: should navigate to sell page from sidebar
**Area:** Navigation
**Steps:**
1. Login as a user
2. Navigate to home page
3. Click "Sell a Book" link in sidebar
4. Verify URL changes to /marketplace/sell
5. Verify create listing page is shown
**Expected Result:** Navigation to sell page works

### Test: should navigate to profile from sidebar
**Area:** Navigation
**Steps:**
1. Login as a user
2. Navigate to home page
3. Click "Profile" link in sidebar
4. Verify URL changes to /profile
5. Verify profile page is shown
**Expected Result:** Navigation to profile works

---

## Coverage Summary
- **Total Tests:** 39
- **Areas Covered:**
  - Authentication (Login, Signup, Session)
  - Browsing (Home, Search, Filter, Pagination)
  - Book Details
  - Cart Management
  - Orders
  - Marketplace Listings
  - Profile

## Known Limitations
1. Checkout flow cannot be fully tested because new users have $0 balance
2. Order detail page is not fully covered due to checkout limitation
3. Error messages for failed login are not shown in UI (potential bug)
4. Error messages for failed checkout are not shown in UI (potential bug)
