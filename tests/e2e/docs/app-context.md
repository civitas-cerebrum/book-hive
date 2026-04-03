# BookHive — Application Context

> Living knowledge base for the BookHive application under test.
> Updated during test discovery and automation sessions.

## Application Overview

**Name:** BookHive
**Type:** Full-stack bookstore e-commerce application
**Purpose:** Browse, search, purchase books; manage orders with returns; buy/sell on a second-hand marketplace.

### Tech Stack

| Layer        | Technology                                                    |
|--------------|---------------------------------------------------------------|
| Frontend     | React 18, Vite, React Router 6, Axios, CSS Modules           |
| Backend      | Spring Boot 3.2.3, Java 17, Spring Data MongoDB, Spring Security |
| Database     | MongoDB 7                                                     |
| Auth         | JWT (HttpOnly cookie `bookhive_token` + Bearer header)        |
| API Docs     | SpringDoc OpenAPI (Swagger UI)                                |
| Infra        | Docker Compose (frontend, backend, mongodb)                   |

### Service URLs

| Service      | URL                            |
|--------------|--------------------------------|
| Frontend     | http://localhost:7547           |
| Backend API  | http://localhost:8080           |
| Swagger UI   | http://localhost:8080/swagger-ui.html |
| Health Check | http://localhost:8080/api/health |

### Test Users

| Username    | Email                        | Password   | Starting Balance |
|-------------|------------------------------|------------|-----------------|
| testuser1   | testuser1@bookhive.test      | Test1234!  | $100.00         |
| testuser2   | testuser2@bookhive.test      | Test1234!  | $100.00         |

### Test Data

- 50 books with fixed IDs (`book-001` through `book-050`)
- 6 genres: Fiction (8), Sci-Fi (9), Non-Fiction (8), Biography (8), Fantasy (8), Mystery (9)
- Price range: $8.99 - $24.99
- Stock range: 7 - 20 units per book
- Seed endpoint: `POST /api/seed` (idempotent)
- Reset endpoint: `POST /api/reset` (drops all, re-seeds)

---

## HomePage — `/`

**Purpose:** Browse and search the book catalogue with genre filtering and pagination.
**Sections:** Search bar, genre filter chips, book grid, pagination controls.
**Data fields:** Book cards showing title, author, price, cover image.
**Actions:** Search input, genre chip filter, add-to-cart buttons per book, pagination (Previous/Next).
**States:** Loading state, empty state ("No books found"), populated grid.
**Navigation:** Reached from sidebar/logo. Links to BookDetailPage via book cards, LoginPage via nav.
**Test IDs:** `home-page`, `search-input`, `genre-chip-*`, `book-grid`, `loading-books`, `no-books`, `pagination`, `prev-page`, `next-page`, `add-to-cart-{id}`, `out-of-stock-{id}`.

## BookDetailPage — `/books/:id`

**Purpose:** View detailed information about a single book and add it to cart.
**Sections:** Cover image, book info (title, author, genre, description, price, stock).
**Data fields:** Title, author, genre, description, price (formatted), stock count.
**Actions:** "Add to Cart" button (visible when logged in and in stock).
**States:** Loading, not found, in-stock (shows add button), out-of-stock.
**Navigation:** Reached from HomePage book cards. Links back via browser navigation.
**Test IDs:** `book-detail-page`, `book-detail-title`, `book-detail-author`, `book-detail-genre`, `book-detail-description`, `book-detail-price`, `book-detail-stock`, `add-to-cart-detail`, `out-of-stock`.

## LoginPage — `/login`

**Purpose:** Authenticate existing users with email and password.
**Sections:** Title, subtitle, login form, signup link.
**Data fields:** Email input, password input.
**Actions:** Submit login form, navigate to signup.
**States:** Default (empty form), error state (shows error message), loading (button disabled).
**Navigation:** Reached from nav bar. Redirects to HomePage on success. Links to SignupPage.
**Test IDs:** `login-page`, `login-form`, `login-email`, `login-password`, `login-submit`, `login-error`, `signup-link`.

## SignupPage — `/signup`

**Purpose:** Register a new user account.
**Sections:** Title, subtitle, signup form, login link.
**Data fields:** Username input, email input, password input (min 8 chars).
**Actions:** Submit signup form, navigate to login.
**States:** Default (empty form), error state, loading.
**Navigation:** Reached from LoginPage link or nav bar. Redirects to HomePage on success. Links to LoginPage.
**Test IDs:** `signup-page`, `signup-form`, `signup-username`, `signup-email`, `signup-password`, `signup-submit`, `signup-error`, `login-link`.

## CartPage — `/cart` (Auth Required)

**Purpose:** View and manage shopping cart items, proceed to checkout.
**Sections:** Cart item rows, total display, checkout button, clear cart button.
**Data fields:** Item name, quantity, price per item, total price.
**Actions:** Increase/decrease quantity, remove item, clear cart, checkout.
**States:** Empty cart ("Your cart is empty"), populated cart with items.
**Navigation:** Reached from nav bar cart icon. Redirects to OrderDetailPage on checkout.
**Test IDs:** `cart-page`, `cart-empty`, `cart-total`, `cart-clear`, `checkout-btn`, `cart-item-{id}`, `cart-qty-{id}`, `cart-qty-plus-{id}`, `cart-qty-minus-{id}`, `cart-remove-{id}`.

## OrdersPage — `/orders` (Auth Required)

**Purpose:** View order history.
**Sections:** Page title, order card list.
**Data fields:** Order ID, status, items summary, total price, date.
**Actions:** Click order card to view details.
**States:** Loading, empty ("No orders yet"), populated list.
**Navigation:** Reached from nav bar. Links to OrderDetailPage.
**Test IDs:** `orders-page`, `no-orders`, `order-card-{id}`, `order-status-{id}`.

## OrderDetailPage — `/orders/:id` (Auth Required)

**Purpose:** View single order details with option to return within 10-minute window.
**Sections:** Order header (ID + status), item list, total, return section with countdown.
**Data fields:** Order ID (last 8 chars), status badge, item titles, quantities, prices, total.
**Actions:** Return order button (within 10-minute window).
**States:** Loading, not found, COMPLETED (with return countdown), RETURNED.
**Navigation:** Reached from OrdersPage.
**Test IDs:** `order-detail-page`, `order-status-{id}`, `order-item-{idx}`, `order-total`, `return-order-{id}`.

## MarketplacePage — `/marketplace`

**Purpose:** Browse second-hand book listings from other users.
**Sections:** Title, listing cards grid.
**Data fields:** Book title, condition, price, seller info.
**Actions:** Buy listing button.
**States:** Loading, empty ("No listings available"), populated grid.
**Navigation:** Reached from nav bar. Links to individual listings.
**Test IDs:** `marketplace-page`, `no-listings`, `listing-buy-{id}`, `listing-condition-badge-{id}`.

## CreateListingPage — `/marketplace/sell` (Auth Required)

**Purpose:** Create a new second-hand book listing.
**Sections:** Title, listing form.
**Data fields:** Book selector (dropdown), condition selector, price input.
**Actions:** Submit listing form.
**States:** Default (empty form), error state, loading.
**Navigation:** Reached from nav bar "Sell" link. Redirects to MarketplacePage on success.
**Test IDs:** `create-listing-page`, `listing-book-select`, `listing-condition`, `listing-price`, `listing-create`, `listing-error`.
**Conditions:** NEW, LIKE_NEW, GOOD, FAIR.

## ProfilePage — `/profile` (Auth Required)

**Purpose:** View user profile information and manage active marketplace listings.
**Sections:** User info (username, email, balance), active listings section.
**Data fields:** Username, email, balance (formatted), listing titles with condition/price/status.
**Actions:** Cancel listing button per active listing.
**States:** No listings ("No active listings"), listings present.
**Navigation:** Reached from nav bar profile link.
**Test IDs:** `profile-page`, `profile-username`, `profile-email`, `profile-balance`, `no-listings`, `my-listing-{id}`, `cancel-listing-{id}`.

---

## Navigation Components

### Sidebar

**Purpose:** Main navigation for desktop view.
**Elements:** Logo/home link, nav links (Login, Sign Up, Cart with badge, Orders, Sell, Profile, Logout).
**Test IDs:** `sidebar-toggle`, `nav-login`, `nav-signup`, `nav-cart`, `nav-orders`, `nav-sell`, `nav-profile`, `logout-btn`, `cart-badge`.

### TopBar

**Purpose:** Top navigation bar with mobile controls.
**Elements:** Hamburger menu toggle, mobile search, mobile cart button.
**Test IDs:** `topbar`.

---

## API Endpoints

### Public (No Auth)
- `GET /api/health` — Health check
- `POST /api/seed` — Seed database (idempotent)
- `POST /api/reset` — Reset database
- `GET /api/books` — List books (paginated, searchable)
- `GET /api/books/{id}` — Get single book
- `GET /api/marketplace` — List marketplace listings

### Auth
- `POST /api/auth/signup` — Register
- `POST /api/auth/login` — Login (returns JWT)
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Current user profile

### Protected (Auth Required)
- `GET /api/cart` — Get cart
- `POST /api/cart/items` — Add to cart
- `PUT /api/cart/items/{id}` — Update quantity
- `DELETE /api/cart/items/{id}` — Remove item
- `DELETE /api/cart` — Clear cart
- `POST /api/orders` — Checkout
- `GET /api/orders` — List orders
- `GET /api/orders/{id}` — Order detail
- `POST /api/orders/{id}/return` — Return order
- `POST /api/marketplace/listings` — Create listing
- `POST /api/marketplace/listings/{id}/buy` — Buy listing
- `DELETE /api/marketplace/listings/{id}` — Cancel listing

---

## Known Issues

_None discovered yet._
