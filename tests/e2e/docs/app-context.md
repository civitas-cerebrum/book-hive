# BookHive Application Context

## Overview
BookHive is a full-stack bookstore e-commerce application designed for test automation practice.

## Tech Stack
- **Frontend:** React 18 + Vite + React Router 6 + Axios
- **Backend:** Spring Boot 3.2.3 + Java 17 + MongoDB
- **Authentication:** JWT (Bearer token + HttpOnly cookie)

## Application URLs
- Frontend: http://localhost:7547
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

## Test Users
| Username | Email | Password | Starting Balance |
|----------|-------|----------|------------------|
| testuser1 | testuser1@bookhive.test | Test1234! | $100.00 |
| testuser2 | testuser2@bookhive.test | Test1234! | $100.00 |

## Pages Explored

### 1. Home Page (/)
- **URL:** /
- **Purpose:** Browse and search books
- **Auth Required:** No
- **Key Elements:**
  - Book grid displaying all available books
  - Search input for filtering books
  - Genre filter chips
  - Pagination controls
  - Add to cart buttons on each book card

### 2. Book Detail Page (/books/:id)
- **URL:** /books/{bookId}
- **Purpose:** View detailed information about a specific book
- **Auth Required:** No
- **Key Elements:**
  - Book title, author, description
  - Price display
  - Stock availability
  - Add to cart button
  - Genre badge

### 3. Login Page (/login)
- **URL:** /login
- **Purpose:** User authentication
- **Auth Required:** No
- **Key Elements:**
  - Email input field
  - Password input field
  - Submit button
  - Link to signup page
  - Error message display

### 4. Signup Page (/signup)
- **URL:** /signup
- **Purpose:** New user registration
- **Auth Required:** No
- **Key Elements:**
  - Username input field
  - Email input field
  - Password input field
  - Submit button
  - Link to login page

### 5. Cart Page (/cart)
- **URL:** /cart
- **Purpose:** View and manage shopping cart
- **Auth Required:** Yes
- **Key Elements:**
  - Cart item list with quantity controls
  - Individual item remove buttons
  - Clear cart button
  - Cart total
  - Checkout button
  - Empty cart message

### 6. Orders Page (/orders)
- **URL:** /orders
- **Purpose:** View order history
- **Auth Required:** Yes
- **Key Elements:**
  - Order cards showing order details
  - Order status badges
  - Return button (within 10-minute window)
  - No orders message

### 7. Order Detail Page (/orders/:id)
- **URL:** /orders/{orderId}
- **Purpose:** View specific order details
- **Auth Required:** Yes
- **Key Elements:**
  - Order items list
  - Order status
  - Order total
  - Return order button (if within window)

### 8. Marketplace Page (/marketplace)
- **URL:** /marketplace
- **Purpose:** Browse second-hand book listings
- **Auth Required:** No
- **Key Elements:**
  - Listing grid
  - Buy buttons
  - Condition badges
  - Price displays

### 9. Sell Page (/marketplace/sell)
- **URL:** /marketplace/sell
- **Purpose:** Create a new marketplace listing
- **Auth Required:** Yes
- **Key Elements:**
  - Book selection dropdown
  - Condition selection
  - Price input
  - Create listing button

### 10. Profile Page (/profile)
- **URL:** /profile
- **Purpose:** View user profile and active listings
- **Auth Required:** Yes
- **Key Elements:**
  - Username display
  - Email display
  - Balance display
  - Active listings section

## API Endpoints

### Test Helper Endpoints (No Auth)
- POST /api/seed - Populate DB with test data
- POST /api/reset - Reset DB to clean state
- GET /api/health - Health check

### Auth Endpoints
- POST /api/auth/signup - Register new user
- POST /api/auth/login - Authenticate user
- POST /api/auth/logout - Clear session
- GET /api/auth/me - Get current user profile (Auth required)

### Books Endpoints
- GET /api/books - List/search books (paginated)
- GET /api/books/{id} - Get single book

### Cart Endpoints (Auth Required)
- GET /api/cart - Get cart items
- POST /api/cart/items - Add item to cart
- PUT /api/cart/items/{id} - Update item quantity
- DELETE /api/cart/items/{id} - Remove item
- DELETE /api/cart - Clear entire cart

### Order Endpoints (Auth Required)
- POST /api/orders - Checkout (create order)
- GET /api/orders - List user's orders
- GET /api/orders/{id} - Get order details
- POST /api/orders/{id}/return - Return order

### Marketplace Endpoints
- GET /api/marketplace - List all active listings (No Auth)
- POST /api/marketplace/listings - Create listing (Auth)
- POST /api/marketplace/listings/{id}/buy - Buy listing (Auth)
- DELETE /api/marketplace/listings/{id} - Cancel listing (Auth)

## Data-TestID Selectors
All interactive elements have data-testid attributes for reliable test automation.
See page-repository.json for complete selector mappings.

## Test Scenarios to Cover
1. Homepage - Browse books, search, filter by genre, pagination
2. Book detail - View book info, add to cart
3. Authentication - Login, signup, logout, protected routes
4. Cart - Add/remove items, update quantities, clear cart
5. Checkout - Complete purchase, verify balance deduction
6. Orders - View order history, order details
7. Order return - Return within 10-minute window
8. Marketplace - Browse listings, create listing, buy listing
9. Profile - View profile, balance, active listings
10. Responsive - Desktop vs mobile layouts
