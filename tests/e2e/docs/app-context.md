# BookHive — Application Context

> Living knowledge base for the BookHive E2E test suite. Updated as new pages, states, and edge cases are discovered.

---

## Application Overview

BookHive is a full-stack bookstore e-commerce application with a React 18 frontend (Vite, React Router 6) and Spring Boot 3 backend (Java 17, MongoDB 7). It supports user authentication, book browsing/search, shopping cart, checkout, order management with returns, a second-hand marketplace, and a user profile with balance tracking.

**URLs:**
- Frontend: http://localhost:7547
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

**Start command:** `docker-compose up -d`
**Health check:** `GET /api/health`
**Seed data:** `POST /api/seed` (idempotent) | `POST /api/reset` (drop + re-seed)

---

## Test Users

| Username | Email | Password | Starting Balance |
|----------|-------|----------|-----------------|
| testuser1 | testuser1@bookhive.test | Test1234! | $100.00 |
| testuser2 | testuser2@bookhive.test | Test1234! | $100.00 |

---

## HomePage — `/`

**Purpose:** Browse and search the book catalog.
**Sections:** Top bar with search, sidebar navigation, book grid with cards, genre filter chips, pagination.
**Data fields:** Book title, author, price, cover image, genre badges.
**Actions:** Search input, genre filter chips, add to cart buttons per book, pagination next/prev, click book card to view details.
**States:** Loaded with books, search results (filtered), empty search results, paginated views.
**Navigation:** Entry point. Links to → BookDetailPage (click card), LoginPage, SignupPage, CartPage, OrdersPage, MarketplacePage, ProfilePage (via sidebar/topbar).
**Known issues:** None discovered yet.

---

## BookDetailPage — `/books/:id`

**Purpose:** View detailed information about a specific book.
**Sections:** Book cover image, title, author, price, description, ISBN, stock status, add-to-cart button.
**Data fields:** Title, author, genre, description, price, cover image, stock count, ISBN.
**Actions:** Add to cart button (requires auth), back navigation.
**States:** Book loaded, out of stock (add-to-cart disabled).
**Navigation:** Reached from → HomePage (click book card). Links to → CartPage (via nav).
**Known issues:** None discovered yet.

---

## LoginPage — `/login`

**Purpose:** Authenticate an existing user.
**Sections:** Login form with email and password fields, submit button, link to signup.
**Data fields:** Email input, password input.
**Actions:** Fill email, fill password, submit login form.
**States:** Empty form, validation errors, successful login (redirect to home), failed login (error message).
**Navigation:** Reached from → Navigation sidebar/topbar. Links to → SignupPage, HomePage (after login).
**Known issues:** None discovered yet.

---

## SignupPage — `/signup`

**Purpose:** Register a new user account.
**Sections:** Signup form with username, email, password fields, submit button, link to login.
**Data fields:** Username input, email input, password input.
**Actions:** Fill fields, submit registration.
**States:** Empty form, validation errors, successful signup (redirect), duplicate email error.
**Navigation:** Reached from → LoginPage, Navigation. Links to → LoginPage, HomePage (after signup).
**Known issues:** None discovered yet.

---

## CartPage — `/cart` (Auth Required)

**Purpose:** View and manage shopping cart items before checkout.
**Sections:** Cart item list, quantity controls per item, cart total, checkout button, clear cart button.
**Data fields:** Book title, price, quantity, item subtotal, cart total.
**Actions:** Increase/decrease quantity, remove item, clear cart, checkout.
**States:** Empty cart, cart with items, checkout success, insufficient balance error.
**Navigation:** Reached from → Navigation (cart icon). Links to → OrdersPage (after checkout).
**Known issues:** None discovered yet.

---

## OrdersPage — `/orders` (Auth Required)

**Purpose:** View order history.
**Sections:** Order cards with status, total, date, item summary.
**Data fields:** Order ID, status (PENDING/COMPLETED/RETURNED), total price, creation date, items list.
**Actions:** Click order card to view details.
**States:** No orders (empty state), orders list.
**Navigation:** Reached from → Navigation. Links to → OrderDetailPage (click order).
**Known issues:** None discovered yet.

---

## OrderDetailPage — `/orders/:id` (Auth Required)

**Purpose:** View order details and optionally return the order.
**Sections:** Order summary, item list, return button with countdown timer.
**Data fields:** Order ID, status, items with title/price/quantity, total, return window countdown.
**Actions:** Return order (within 10-minute window).
**States:** Order within return window (return button enabled with countdown), return window expired (return button hidden/disabled), returned order.
**Navigation:** Reached from → OrdersPage.
**Known issues:** None discovered yet.

---

## MarketplacePage — `/marketplace`

**Purpose:** Browse second-hand book listings from other users.
**Sections:** Listing cards with book info, condition badge, price, buy button.
**Data fields:** Book title, seller info, condition (EXCELLENT/GOOD/FAIR), price, listing status.
**Actions:** Buy listing (requires auth), browse listings.
**States:** No listings (empty), listings loaded, listing sold.
**Navigation:** Reached from → Navigation. Links to → CreateListingPage (via nav sell link).
**Known issues:** None discovered yet.

---

## CreateListingPage — `/marketplace/sell` (Auth Required)

**Purpose:** Create a new second-hand book listing.
**Sections:** Listing form with book selector, condition dropdown, price input, create button.
**Data fields:** Book selection dropdown, condition dropdown (EXCELLENT/GOOD/FAIR), price input.
**Actions:** Select book, select condition, enter price, create listing.
**States:** Empty form, form with selections, successful creation, validation errors.
**Navigation:** Reached from → Navigation (sell link). Links to → MarketplacePage (after creation).
**Known issues:** None discovered yet.

---

## ProfilePage — `/profile` (Auth Required)

**Purpose:** View user profile information and active marketplace listings.
**Sections:** Profile info card (username, email, balance), active listings section.
**Data fields:** Username, email, account balance, active listing cards.
**Actions:** View profile details, manage active listings (cancel).
**States:** Profile loaded, no active listings, active listings displayed.
**Navigation:** Reached from → Navigation (profile link).
**Known issues:** None discovered yet.

---

## API Endpoints Reference

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/seed | Seed database with test data |
| POST | /api/reset | Reset database to clean state |
| GET | /api/health | Health check |
| GET | /api/books | List/search books (paginated) |
| GET | /api/books/:id | Get single book |
| GET | /api/marketplace | List active marketplace listings |
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | Authenticate user |
| POST | /api/auth/logout | Clear session |

### Authenticated Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/auth/me | Get current user profile |
| GET | /api/cart | Get cart items |
| POST | /api/cart/items | Add item to cart |
| PUT | /api/cart/items/:id | Update cart item quantity |
| DELETE | /api/cart/items/:id | Remove cart item |
| DELETE | /api/cart | Clear entire cart |
| POST | /api/orders | Checkout (cart → order) |
| GET | /api/orders | List user orders |
| GET | /api/orders/:id | Get order details |
| POST | /api/orders/:id/return | Return order (10-min window) |
| POST | /api/marketplace/listings | Create listing |
| POST | /api/marketplace/listings/:id/buy | Buy listing |
| DELETE | /api/marketplace/listings/:id | Cancel listing |

---

## Data-TestID Selectors

### Navigation
`topbar`, `sidebar-toggle`, `nav-login`, `nav-signup`, `nav-cart`, `nav-orders`, `nav-sell`, `nav-profile`, `logout-btn`, `cart-badge`

### Books
`book-grid`, `book-detail-title`, `book-detail-price`, `add-to-cart-{id}`, `add-to-cart-detail`, `out-of-stock-{id}`, `search-input`, `genre-chip-*`, `pagination`, `next-page`, `prev-page`

### Cart
`cart-page`, `cart-empty`, `cart-total`, `cart-clear`, `checkout-btn`, `cart-item-{id}`, `cart-qty-{id}`, `cart-qty-plus-{id}`, `cart-qty-minus-{id}`, `cart-remove-{id}`

### Orders
`orders-page`, `no-orders`, `order-card-{id}`, `order-status-{id}`, `order-item-{idx}`, `return-order-{id}`

### Marketplace
`my-listing-{id}`, `cancel-listing-{id}`, `listing-buy-{id}`, `listing-condition-badge-{id}`

### Forms
`login-email`, `login-password`, `signup-email`, `listing-book-select`, `listing-condition`, `listing-price`, `listing-create`

### Profile
`profile-page`, `profile-username`, `profile-email`, `profile-balance`

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router 6, Axios, CSS Modules |
| Backend | Spring Boot 3.2.3, Java 17, Spring Data MongoDB, Spring Security |
| Database | MongoDB 7 |
| Auth | JWT (HttpOnly cookie + Bearer token), 24h expiration |
| Infrastructure | Docker Compose (3 services: frontend, backend, mongodb) |

---

## Responsive Breakpoints

- Desktop (>768px): Sidebar navigation visible
- Mobile (<=768px): Hamburger menu, mobile search and cart buttons in top bar
