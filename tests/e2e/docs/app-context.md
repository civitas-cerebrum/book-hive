# BookHive Application Context

## Overview
BookHive is a full-stack bookstore e-commerce application for test automation practice.

## Tech Stack
- **Frontend:** React 18, Vite, React Router 6, Axios
- **Backend:** Spring Boot 3.2.3, Java 17, Spring Data MongoDB
- **Database:** MongoDB 7

## URLs
- Frontend: http://localhost:7547
- Backend: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html

## Test Users
| Email | Password | Balance |
|-------|----------|---------|
| testuser1@bookhive.test | Test1234! | $100.00 |
| testuser2@bookhive.test | Test1234! | $100.00 |

---

## HomePage - `/`

**Purpose:** Browse and search for books across the catalog

**Sections:**
- Search bar with autocomplete
- Genre filter chips (All, Fiction, Sci-Fi, Non-Fiction, Biography, Fantasy, Mystery)
- Book grid (12 items per page)
- Pagination controls

**Data Fields:** Book title, author, genre, price, stock availability

**Actions:**
- Search books by title/author
- Filter by genre
- Navigate to book detail
- Add to cart (when authenticated)
- Paginate through results

**States:**
- Loading: "Loading..." message
- Empty: "No books found" message
- Unauthenticated: No add-to-cart buttons
- Out of stock: "Out of Stock" label

**Navigation:** Entry point -> Links to book details, marketplace, login/signup

---

## LoginPage - `/login`

**Purpose:** Authenticate existing users

**Sections:** Page header, login form, signup link

**Data Fields:** Email input, password input

**Actions:** Submit credentials, navigate to signup

**States:**
- Default: Form ready
- Loading: "Signing in..." button disabled
- Error: Red error message displayed
- Success: Redirects to homepage

**Navigation:** Reached from nav bar, protected routes -> Links to signup, home on success

---

## SignupPage - `/signup`

**Purpose:** Register new user accounts

**Sections:** Page header, registration form, login link

**Data Fields:** Username, email, password (min 8 chars)

**Actions:** Submit registration, navigate to login

**States:**
- Default: Form ready
- Loading: "Creating account..." button disabled
- Error: Error message (e.g., "Email already in use")
- Success: Redirects to homepage

**Navigation:** Reached from nav bar, login page -> Links to login, home on success

---

## BookDetailPage - `/books/{id}`

**Purpose:** Display comprehensive book information with purchase option

**Sections:** Book cover, metadata, description, price/stock, add to cart

**Data Fields:** Title, author, genre, description, price, stock count, ISBN

**Actions:** Add to cart (when authenticated and in stock)

**States:**
- Loading: "Loading..." message
- Not found: "Book not found" message
- Authenticated + In stock: Add to Cart button
- Authenticated + Out of stock: "Out of Stock" message
- Unauthenticated: Add to Cart redirects to login

**Navigation:** Reached from homepage book cards -> Links to cart, login

---

## CartPage - `/cart` (Protected)

**Purpose:** Review and manage shopping cart items before checkout

**Sections:** Cart header, items list, total, checkout button

**Data Fields:** Item title, price, quantity, subtotal, cart total

**Actions:** Increase/decrease quantity, remove item, clear cart, checkout

**States:**
- Empty: "Your cart is empty" message
- With items: List of cart items with controls

**Navigation:** Reached from nav bar -> Links to checkout/orders

---

## OrdersPage - `/orders` (Protected)

**Purpose:** View order history

**Sections:** Page header, orders list

**Data Fields:** Order ID, date, status, total, item count

**Actions:** View order details

**States:**
- Empty: "No orders yet" message
- With orders: List of order cards

**Navigation:** Reached from nav bar, after checkout -> Links to order details

---

## OrderDetailPage - `/orders/{id}` (Protected)

**Purpose:** View specific order details with return option

**Sections:** Order header, return countdown, items list, total

**Data Fields:** Order status (PENDING, COMPLETED, RETURNED), return countdown, items

**Actions:** Return order (within 10-minute window)

**States:**
- Within return window: Return button + countdown visible
- Outside return window: No return option
- Returned: Status shows RETURNED

**Navigation:** Reached from orders list -> Links back to orders

---

## MarketplacePage - `/marketplace`

**Purpose:** Browse second-hand book listings from other users

**Sections:** Page header, listings grid

**Data Fields:** Book title, author, condition (EXCELLENT/GOOD/FAIR), price

**Actions:** Buy listing (when authenticated and not own listing)

**States:**
- Empty: "No listings available" message
- With listings: Grid of listing cards
- Own listing: No buy button shown

**Navigation:** Reached from nav bar -> Links to create listing, login

---

## CreateListingPage - `/marketplace/sell` (Protected)

**Purpose:** Create new marketplace listing to sell a book

**Sections:** Page header, listing form

**Data Fields:** Book dropdown, condition select, price input

**Actions:** Create listing

**States:**
- Default: Form ready
- Success: Shows success message, redirects to marketplace
- Error: Shows error message

**Navigation:** Reached from nav bar, marketplace -> Links to marketplace on success

---

## ProfilePage - `/profile` (Protected)

**Purpose:** View user account info and manage listings

**Sections:** User info, balance display, active listings

**Data Fields:** Username, email, account balance, listings

**Actions:** Cancel own listings

**States:**
- No listings: "No active listings" message
- With listings: List of own marketplace listings

**Navigation:** Reached from nav bar -> Links to create listing

---

## Navigation Components

### Sidebar (Desktop)
- BookHive logo
- Browse section (All Books, Marketplace)
- Categories section (genre links)
- Account section (dynamic based on auth)
- Theme toggle

**Authenticated Items:** Balance, Cart (with badge), Orders, Sell a Book, Profile, Logout

**Unauthenticated Items:** Login, Sign Up

### TopBar (Mobile)
- Hamburger menu toggle
- Search button
- Cart button with badge

---

## API Endpoints
- POST /api/seed - Seed database (idempotent)
- POST /api/reset - Reset database (drops all, re-seeds)
- GET /api/health - Health check
- POST /api/auth/login - Login
- POST /api/auth/signup - Signup
- POST /api/auth/logout - Logout
- GET /api/auth/me - Current user
- GET /api/books - List books (paginated)
- GET /api/books/{id} - Get book
- GET /api/cart - Get cart
- POST /api/cart/items - Add to cart
- PUT /api/cart/items/{id} - Update quantity
- DELETE /api/cart/items/{id} - Remove item
- DELETE /api/cart - Clear cart
- POST /api/orders - Checkout
- GET /api/orders - List orders
- GET /api/orders/{id} - Get order
- POST /api/orders/{id}/return - Return order
- GET /api/marketplace - List listings
- POST /api/marketplace/listings - Create listing
- POST /api/marketplace/listings/{id}/buy - Buy listing
- DELETE /api/marketplace/listings/{id} - Cancel listing

---

## Known Issues
(To be updated during test stabilization and bug discovery)
