# BookHive — Application Context

## Overview

BookHive is a full-stack bookstore e-commerce application built with React 18 (Vite) frontend and Spring Boot 3 (Java 17) backend, backed by MongoDB 7. It serves as a realistic target for UI, API, and end-to-end test automation.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router 6, Axios, CSS Modules |
| Backend | Spring Boot 3.2.3, Java 17, Spring Data MongoDB, Spring Security |
| Database | MongoDB 7 |
| API Docs | SpringDoc OpenAPI (Swagger UI) |
| Infrastructure | Docker Compose (3 services) |

## Service URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:7547 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Health Check | http://localhost:8080/api/health |

## Authentication

- **JWT** via `Authorization: Bearer <token>` header (API testing)
- **HttpOnly cookie** (`bookhive_token`) set automatically on login/signup (UI testing)
- Token expiration: 24 hours

### Test Users

| Username | Email | Password | Starting Balance |
|----------|-------|----------|-----------------|
| testuser1 | testuser1@bookhive.test | Test1234! | $100.00 |
| testuser2 | testuser2@bookhive.test | Test1234! | $100.00 |

## Pages & Routes

### HomePage — `/`
**Purpose:** Browse and search the book catalog.
**Sections:** Search bar, genre filter chips, book grid, pagination.
**Data fields:** Book title, author, price, cover image, stock status.
**Actions:** Search books, filter by genre, add to cart, navigate to book detail, paginate.
**States:** Loaded with books, filtered results, empty search results.
**Navigation:** Links to BookDetailPage, LoginPage, SignupPage.
**Test IDs:** `book-grid`, `search-input`, `genre-chip-*`, `pagination`, `next-page`, `prev-page`, `add-to-cart-{id}`, `out-of-stock-{id}`

### BookDetailPage — `/books/:id`
**Purpose:** View detailed information about a single book.
**Sections:** Book cover, title, author, price, description, stock status, add-to-cart button.
**Data fields:** Title, author, price, description, ISBN, genre, stock.
**Actions:** Add to cart.
**States:** Book loaded, out of stock.
**Navigation:** Reached from HomePage. Links to CartPage.
**Test IDs:** `book-detail-title`, `book-detail-price`, `add-to-cart-detail`

### LoginPage — `/login`
**Purpose:** Authenticate existing users.
**Sections:** Email input, password input, login button, link to signup.
**Actions:** Fill credentials, submit login form.
**States:** Default form, validation errors, login error.
**Navigation:** Reached from nav. Links to SignupPage, redirects to HomePage on success.
**Test IDs:** `login-email`, `login-password`

### SignupPage — `/signup`
**Purpose:** Register new user accounts.
**Sections:** Email input, password input, username input, signup button, link to login.
**Actions:** Fill registration form, submit signup.
**States:** Default form, validation errors, signup error.
**Navigation:** Reached from nav. Links to LoginPage, redirects to HomePage on success.
**Test IDs:** `signup-email`

### CartPage — `/cart` (Auth Required)
**Purpose:** View and manage shopping cart items before checkout.
**Sections:** Cart items list, quantity controls, item totals, cart total, checkout button, clear cart button.
**Data fields:** Book title, quantity, price, subtotal, cart total.
**Actions:** Increase/decrease quantity, remove item, clear cart, checkout.
**States:** Empty cart, cart with items, after checkout.
**Navigation:** Reached from nav. Links to OrdersPage after checkout.
**Test IDs:** `cart-page`, `cart-empty`, `cart-total`, `cart-clear`, `checkout-btn`, `cart-item-{id}`, `cart-qty-{id}`, `cart-qty-plus-{id}`, `cart-qty-minus-{id}`, `cart-remove-{id}`

### OrdersPage — `/orders` (Auth Required)
**Purpose:** View order history.
**Sections:** List of order cards with status, total, date.
**Data fields:** Order ID, status, total price, date, item count.
**Actions:** Click order to view details.
**States:** No orders, list of orders.
**Navigation:** Reached from nav. Links to OrderDetailPage.
**Test IDs:** `orders-page`, `no-orders`, `order-card-{id}`, `order-status-{id}`

### OrderDetailPage — `/orders/:id` (Auth Required)
**Purpose:** View details of a specific order with return option.
**Sections:** Order items list, order status, total, return button with countdown.
**Data fields:** Order items (title, price, quantity), status, total, return window countdown.
**Actions:** Return order (within 10-minute window).
**States:** Order with active return window, order with expired return window, returned order.
**Navigation:** Reached from OrdersPage.
**Test IDs:** `order-item-{idx}`, `return-order-{id}`

### MarketplacePage — `/marketplace`
**Purpose:** Browse second-hand book listings.
**Sections:** Listing cards with book info, condition badge, price, buy button.
**Data fields:** Book title, seller, condition, price, listing status.
**Actions:** Buy a listing.
**States:** No listings, active listings.
**Navigation:** Reached from nav. Links to CreateListingPage.
**Test IDs:** `listing-buy-{id}`, `listing-condition-badge-{id}`

### CreateListingPage — `/marketplace/sell` (Auth Required)
**Purpose:** Create a new second-hand book listing.
**Sections:** Book selection dropdown, condition selector, price input, create button.
**Actions:** Select book, choose condition, set price, create listing.
**States:** Empty form, form filled, submission success/error.
**Navigation:** Reached from nav/marketplace. Links to MarketplacePage on success.
**Test IDs:** `listing-book-select`, `listing-condition`, `listing-price`, `listing-create`

### ProfilePage — `/profile` (Auth Required)
**Purpose:** View user profile and active marketplace listings.
**Sections:** User info (username, email, balance), active listings.
**Data fields:** Username, email, balance.
**Actions:** View profile info, manage listings.
**States:** Profile loaded, with/without active listings.
**Navigation:** Reached from nav.
**Test IDs:** `profile-page`, `profile-username`, `profile-email`, `profile-balance`, `my-listing-{id}`, `cancel-listing-{id}`

## API Endpoints

### Admin/Test Helpers (No Auth)
- `POST /api/seed` — Populate DB with 50 books + 2 test users (idempotent)
- `POST /api/reset` — Drop all collections and re-seed
- `GET /api/health` — Service status + MongoDB connectivity check

### Auth
- `POST /api/auth/signup` — Register new user
- `POST /api/auth/login` — Authenticate, returns JWT
- `POST /api/auth/logout` — Clear session cookie
- `GET /api/auth/me` — Get current user profile (auth required)

### Books (No Auth)
- `GET /api/books` — List/search books (query, genre, page, size)
- `GET /api/books/{id}` — Get single book

### Cart (Auth Required)
- `GET /api/cart` — Get cart items
- `POST /api/cart/items` — Add item (bookId, quantity)
- `PUT /api/cart/items/{id}` — Update item quantity
- `DELETE /api/cart/items/{id}` — Remove item
- `DELETE /api/cart` — Clear entire cart

### Orders (Auth Required)
- `POST /api/orders` — Checkout (converts cart to order)
- `GET /api/orders` — List user's orders
- `GET /api/orders/{id}` — Get order details
- `POST /api/orders/{id}/return` — Return order within 10-min window

### Marketplace
- `GET /api/marketplace` — List all active listings (no auth)
- `POST /api/marketplace/listings` — Create listing (auth required)
- `POST /api/marketplace/listings/{id}/buy` — Buy a listing (auth required)
- `DELETE /api/marketplace/listings/{id}` — Cancel own listing (auth required)

## Test Data

- 50 books with fixed IDs (`book-001` through `book-050`)
- 6 genres: Fiction (8), Sci-Fi (9), Non-Fiction (8), Biography (8), Fantasy (8), Mystery (9)
- Price range: $8.99 - $24.99
- Stock range: 7 - 20 units per book
- Listing conditions: EXCELLENT, GOOD, FAIR
- Order statuses: PENDING, COMPLETED, RETURNED

## UI Features

### Responsive Behaviour
- Desktop (>768px): Sidebar navigation
- Mobile (<=768px): Hamburger menu, mobile search and cart buttons

### State Management
- AuthContext: User session, JWT token, login/logout (HttpOnly cookie)
- CartContext: Shopping cart items, add/remove/update (server-side API)
- ThemeContext: Dark/light mode toggle (localStorage)

### Navigation Test IDs
`topbar`, `sidebar-toggle`, `nav-login`, `nav-signup`, `nav-cart`, `nav-orders`, `nav-sell`, `nav-profile`, `logout-btn`, `cart-badge`

## Known Issues
(None discovered yet — this section will be updated as testing progresses)
