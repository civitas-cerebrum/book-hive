# BookHive Application Context

## Overview
BookHive is a full-stack bookstore e-commerce application with the following features:
- Browse and search books
- User authentication (login/signup)
- Shopping cart management
- Order placement and history
- Marketplace for second-hand books
- User profile management

## URLs
- **Frontend:** http://localhost:7547
- **Backend API:** http://localhost:8080
- **Swagger UI:** http://localhost:8080/swagger-ui.html

## Tech Stack
- **Frontend:** React 18 + Vite + React Router 6 + Axios
- **Backend:** Spring Boot 3.2.3 + Java 17 + MongoDB
- **Auth:** JWT tokens (HttpOnly cookie or Authorization header)

## Test Users
| Username | Email | Password | Starting Balance |
|----------|-------|----------|-----------------|
| testuser1 | testuser1@bookhive.test | Test1234! | $100.00 |
| testuser2 | testuser2@bookhive.test | Test1234! | $100.00 |

## Pages Explored

### Home Page (/)
- **URL:** http://localhost:7547/
- **Purpose:** Browse and search books
- **Key Elements:**
  - Book grid displaying book cards
  - Search input for filtering books
  - Genre filter chips
  - Pagination controls
  - Add to cart buttons (for authenticated users)

### Book Detail Page (/books/:id)
- **URL:** http://localhost:7547/books/{bookId}
- **Purpose:** View detailed information about a single book
- **Key Elements:**
  - Book title, author, price, description
  - Cover image
  - Add to cart button
  - Stock information

### Login Page (/login)
- **URL:** http://localhost:7547/login
- **Purpose:** User authentication
- **Key Elements:**
  - Email input
  - Password input
  - Submit button
  - Link to signup

### Signup Page (/signup)
- **URL:** http://localhost:7547/signup
- **Purpose:** New user registration
- **Key Elements:**
  - Username input
  - Email input
  - Password input
  - Submit button
  - Link to login

### Cart Page (/cart)
- **URL:** http://localhost:7547/cart
- **Purpose:** View and manage shopping cart
- **Auth Required:** Yes
- **Key Elements:**
  - Cart items list with quantity controls
  - Cart total
  - Checkout button
  - Clear cart button
  - Empty cart message (when empty)

### Orders Page (/orders)
- **URL:** http://localhost:7547/orders
- **Purpose:** View order history
- **Auth Required:** Yes
- **Key Elements:**
  - Order cards with status
  - Order details
  - Return order button (within 10-minute window)

### Order Detail Page (/orders/:id)
- **URL:** http://localhost:7547/orders/{orderId}
- **Purpose:** View specific order details
- **Auth Required:** Yes
- **Key Elements:**
  - Order items
  - Order total
  - Order status
  - Return option (if within window)

### Marketplace Page (/marketplace)
- **URL:** http://localhost:7547/marketplace
- **Purpose:** Browse second-hand book listings
- **Key Elements:**
  - Listing cards with condition badges
  - Buy buttons
  - Seller information

### Sell Page (/marketplace/sell)
- **URL:** http://localhost:7547/marketplace/sell
- **Purpose:** Create second-hand book listing
- **Auth Required:** Yes
- **Key Elements:**
  - Book dropdown select
  - Condition dropdown
  - Price input
  - Create listing button

### Profile Page (/profile)
- **URL:** http://localhost:7547/profile
- **Purpose:** View user profile and active listings
- **Auth Required:** Yes
- **Key Elements:**
  - Username display
  - Email display
  - Balance display
  - Active listings list

## Navigation
- **Desktop (>768px):** Sidebar navigation
- **Mobile (<=768px):** Hamburger menu with mobile-optimized UI

## API Endpoints

### Admin/Test
- POST /api/seed - Populate DB with test data
- POST /api/reset - Reset DB to clean state
- GET /api/health - Health check

### Auth
- POST /api/auth/signup - Register
- POST /api/auth/login - Login
- POST /api/auth/logout - Logout
- GET /api/auth/me - Get current user

### Books
- GET /api/books - List/search books
- GET /api/books/{id} - Get single book

### Cart (Auth Required)
- GET /api/cart - Get cart
- POST /api/cart/items - Add item
- PUT /api/cart/items/{id} - Update quantity
- DELETE /api/cart/items/{id} - Remove item
- DELETE /api/cart - Clear cart

### Orders (Auth Required)
- POST /api/orders - Checkout
- GET /api/orders - List orders
- GET /api/orders/{id} - Get order
- POST /api/orders/{id}/return - Return order

### Marketplace
- GET /api/marketplace - List listings
- POST /api/marketplace/listings - Create listing (auth)
- POST /api/marketplace/listings/{id}/buy - Buy listing (auth)
- DELETE /api/marketplace/listings/{id} - Cancel listing (auth)
