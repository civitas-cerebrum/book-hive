# BookHive — Application Context

## Overview
BookHive is a full-stack bookstore e-commerce application built with React 18 (Vite) frontend and Spring Boot 3 (Java 17) backend, backed by MongoDB 7. It features book browsing, shopping cart, orders, a second-hand marketplace, user authentication, and a dark/light theme toggle.

## Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router 6, Axios, CSS Modules |
| Backend | Spring Boot 3.2.3, Java 17, Spring Data MongoDB, Spring Security |
| Database | MongoDB 7 |
| Infrastructure | Docker Compose (3 services) |

## URLs
| Service | URL |
|---------|-----|
| Frontend | http://localhost:7547 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Health Check | http://localhost:8080/api/health |

## Test Users
| Username | Email | Password | Starting Balance |
|----------|-------|----------|-----------------|
| testuser1 | testuser1@bookhive.test | Test1234! | $100.00 |
| testuser2 | testuser2@bookhive.test | Test1234! | $100.00 |

## Test Data
- 50 books with fixed IDs (book-001 through book-050)
- 6 genres: Fiction (8), Sci-Fi (9), Non-Fiction (8), Biography (8), Fantasy (8), Mystery (9)
- Price range: $8.99 - $24.99
- Stock range: 7 - 20 units per book
- Seed endpoint: POST /api/seed (idempotent)
- Reset endpoint: POST /api/reset (drops all collections and re-seeds)

## Authentication
- JWT-based auth with HttpOnly cookie (bookhive_token)
- Token expiration: 24 hours
- Both Bearer token and cookie supported simultaneously

---

## HomePage — `/`
**Purpose:** Browse and search books in the catalog.
**Sections:** Search bar, genre filter chips, book grid, pagination.
**Data fields:** Book title, author, price, cover image per card.
**Actions:** Search books, filter by genre, paginate, click book card for details, add to cart from card.
**States:** Loading state, populated grid, empty search results.
**Navigation:** Entry point; links to BookDetailPage, LoginPage, SignupPage via nav.

## BookDetailPage — `/books/:id`
**Purpose:** View detailed information about a single book.
**Sections:** Book cover, title, author, genre, description, price, stock status, add-to-cart button.
**Data fields:** Title, author, genre, description, price, ISBN, stock count.
**Actions:** Add to cart (requires auth).
**States:** Loading, book found, book not found.
**Navigation:** Reached from HomePage book cards.

## LoginPage — `/login`
**Purpose:** Authenticate existing users.
**Sections:** Email input, password input, submit button, link to signup.
**Data fields:** Email, password.
**Actions:** Submit login form.
**States:** Default form, validation errors, authentication error.
**Navigation:** Reached from nav; redirects to home on success.

## SignupPage — `/signup`
**Purpose:** Register new user accounts.
**Sections:** Email input, password input, username input, submit button, link to login.
**Data fields:** Email, password, username.
**Actions:** Submit signup form.
**States:** Default form, validation errors, registration error.
**Navigation:** Reached from nav; redirects to home on success.

## CartPage — `/cart` (Auth Required)
**Purpose:** View and manage shopping cart items before checkout.
**Sections:** Cart item list, item quantity controls, cart total, checkout button, clear cart button.
**Data fields:** Book title, price, quantity, subtotal per item, cart total.
**Actions:** Increase/decrease quantity, remove item, clear cart, checkout.
**States:** Empty cart, populated cart, post-checkout.
**Navigation:** Reached from nav cart link; checkout creates order.

## OrdersPage — `/orders` (Auth Required)
**Purpose:** View order history.
**Sections:** Order card list with status, total, and date.
**Data fields:** Order ID, status (PENDING/COMPLETED/RETURNED), total price, items, date.
**Actions:** Click order card for details.
**States:** No orders, list of orders.
**Navigation:** Reached from nav; links to OrderDetailPage.

## OrderDetailPage — `/orders/:id` (Auth Required)
**Purpose:** View a single order with option to return.
**Sections:** Order items, status, total, return button with countdown.
**Data fields:** Order items (title, quantity, price), order total, status, return window countdown.
**Actions:** Return order (within 10-minute window).
**States:** Active order with return window, expired return window, returned order.
**Navigation:** Reached from OrdersPage.

## MarketplacePage — `/marketplace`
**Purpose:** Browse second-hand book listings.
**Sections:** Listing cards grid.
**Data fields:** Book title, condition badge, price, seller info.
**Actions:** Buy listing (requires auth).
**States:** No listings, populated listings.
**Navigation:** Reached from nav; links to CreateListingPage for sellers.

## CreateListingPage — `/marketplace/sell` (Auth Required)
**Purpose:** Create a new second-hand book listing.
**Sections:** Book selector, condition dropdown, price input, create button.
**Data fields:** Book selection, condition (EXCELLENT/GOOD/FAIR), price.
**Actions:** Select book, choose condition, set price, create listing.
**States:** Default form, validation errors, success.
**Navigation:** Reached from nav sell link or marketplace page.

## ProfilePage — `/profile` (Auth Required)
**Purpose:** View user profile information and active marketplace listings.
**Sections:** User info (username, email, balance), active listings.
**Data fields:** Username, email, balance.
**Actions:** View own listings, cancel own listings.
**States:** Profile with listings, profile with no listings.
**Navigation:** Reached from nav profile link.

---

## API Endpoints

### Admin/Test Helper
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/seed | Populate DB with 50 books + 2 test users |
| POST | /api/reset | Drop all collections and re-seed |
| GET | /api/health | Service status + MongoDB check |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | Authenticate, returns JWT |
| POST | /api/auth/logout | Clear session cookie |
| GET | /api/auth/me | Get current user profile |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/books | List/search books (paginated) |
| GET | /api/books/{id} | Get single book |

### Cart (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cart | Get cart items |
| POST | /api/cart/items | Add item |
| PUT | /api/cart/items/{id} | Update item quantity |
| DELETE | /api/cart/items/{id} | Remove item |
| DELETE | /api/cart | Clear entire cart |

### Orders (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/orders | Checkout cart to order |
| GET | /api/orders | List user's orders |
| GET | /api/orders/{id} | Get order details |
| POST | /api/orders/{id}/return | Return order within 10-min window |

### Marketplace
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/marketplace | List all active listings |
| POST | /api/marketplace/listings | Create listing (auth) |
| POST | /api/marketplace/listings/{id}/buy | Buy listing (auth) |
| DELETE | /api/marketplace/listings/{id} | Cancel own listing (auth) |

## Data-testid Selectors

### Navigation
topbar, sidebar-toggle, nav-login, nav-signup, nav-cart, nav-orders, nav-sell, nav-profile, logout-btn, cart-badge

### Books
book-grid, book-detail-title, book-detail-price, add-to-cart-{id}, add-to-cart-detail, out-of-stock-{id}, search-input, genre-chip-*, pagination, next-page, prev-page

### Cart
cart-page, cart-empty, cart-total, cart-clear, checkout-btn, cart-item-{id}, cart-qty-{id}, cart-qty-plus-{id}, cart-qty-minus-{id}, cart-remove-{id}

### Orders
orders-page, no-orders, order-card-{id}, order-status-{id}, order-item-{idx}, return-order-{id}

### Marketplace
my-listing-{id}, cancel-listing-{id}, listing-buy-{id}, listing-condition-badge-{id}

### Forms
login-email, login-password, signup-email, listing-book-select, listing-condition, listing-price, listing-create

### Profile
profile-page, profile-username, profile-email, profile-balance

## Known Issues
(None discovered yet)
