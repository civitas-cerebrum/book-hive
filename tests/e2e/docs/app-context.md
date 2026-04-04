# BookHive Application Context

> Living knowledge base for the BookHive e-commerce application under test.
> Updated as new pages, states, and edge cases are discovered during test development.

## Application Overview

**Type:** Full-stack bookstore e-commerce application
**Frontend:** React 18 SPA (Vite) served via Nginx on port 7547
**Backend:** Spring Boot 3 REST API (Java 17) on port 8080
**Database:** MongoDB 7
**Auth:** JWT (Bearer token + HttpOnly cookie `bookhive_token`)

### URLs

| Service      | URL                         |
|--------------|-----------------------------|
| Frontend     | http://localhost:7547        |
| Backend API  | http://localhost:8080        |
| Swagger UI   | http://localhost:8080/swagger-ui.html |
| Health Check | http://localhost:8080/api/health      |

### Test Users

| Username    | Email                        | Password   | Starting Balance |
|-------------|------------------------------|------------|-----------------|
| testuser1   | testuser1@bookhive.test      | Test1234!  | $100.00         |
| testuser2   | testuser2@bookhive.test      | Test1234!  | $100.00         |

### Test Data

- 50 books with fixed IDs (`book-001` through `book-050`)
- 6 genres: Fiction, Sci-Fi, Non-Fiction, Biography, Fantasy, Mystery
- Price range: $8.99 - $24.99
- Stock range: 7 - 20 units per book
- Seed endpoint: `POST /api/seed` (idempotent)
- Reset endpoint: `POST /api/reset` (drops and re-seeds)

---

## HomePage — `/`

**Purpose:** Browse and search the book catalog.
**Sections:** Search bar, genre filter chips, book grid, pagination controls.
**Data fields:** Book cards showing title, author, price, cover image.
**Actions:** Search by text, filter by genre, paginate, click book card to view details, add to cart directly.
**States:** Default grid (paginated 12 per page), filtered by genre, search results, empty search results.
**Navigation:** Entry point. Links to BookDetailPage via book cards.
**Auth required:** No.

## BookDetailPage — `/books/:id`

**Purpose:** View detailed information about a single book.
**Sections:** Book cover, title, author, price, description, stock status, add-to-cart button.
**Data fields:** title, author, genre, price, description, ISBN, stock count, cover image.
**Actions:** Add to cart (when in stock).
**States:** In stock (add-to-cart enabled), out of stock (button disabled).
**Navigation:** Reached from HomePage book cards. Links back to home via navigation.
**Auth required:** No (but adding to cart requires auth).

## LoginPage — `/login`

**Purpose:** Authenticate existing users.
**Sections:** Login form with email and password fields.
**Data fields:** Email input, password input.
**Actions:** Submit login form.
**States:** Default form, validation errors, successful login (redirect to home).
**Navigation:** Reached from NavigationBar login link. Redirects to `/` on success.
**Auth required:** No.

## SignupPage — `/signup`

**Purpose:** Register new user accounts.
**Sections:** Registration form with username, email, and password fields.
**Data fields:** Username input, email input, password input.
**Actions:** Submit signup form.
**States:** Default form, validation errors, successful registration (redirect to home).
**Navigation:** Reached from NavigationBar signup link. Redirects to `/` on success.
**Auth required:** No.

## CartPage — `/cart`

**Purpose:** View and manage shopping cart items before checkout.
**Sections:** Cart item list, cart total, action buttons (clear, checkout).
**Data fields:** Book title, quantity controls, item price, total price.
**Actions:** Adjust quantity (+/-), remove item, clear cart, checkout.
**States:** Empty cart message, cart with items, post-checkout.
**Navigation:** Reached from NavigationBar cart icon. Links to OrdersPage after checkout.
**Auth required:** Yes.

## OrdersPage — `/orders`

**Purpose:** View order history.
**Sections:** List of order cards.
**Data fields:** Order ID, status, total price, date.
**Actions:** Click order card to view details.
**States:** No orders message, list of orders.
**Navigation:** Reached from NavigationBar. Links to OrderDetailPage.
**Auth required:** Yes.

## OrderDetailPage — `/orders/:id`

**Purpose:** View details of a specific order, with option to return.
**Sections:** Order summary, item list, return button with countdown.
**Data fields:** Order items (book title, quantity, price), total, status, return window countdown.
**Actions:** Return order (within 10-minute window).
**States:** PENDING, COMPLETED (with return window), RETURNED, return window expired.
**Navigation:** Reached from OrdersPage.
**Auth required:** Yes.

## MarketplacePage — `/marketplace`

**Purpose:** Browse second-hand book listings from other users.
**Sections:** Listing cards grid.
**Data fields:** Book title, condition badge, price, seller info.
**Actions:** Buy listing (auth required).
**States:** No listings, active listings.
**Navigation:** Reached from NavigationBar. Links to CreateListingPage.
**Auth required:** No (browsing), Yes (buying).

## CreateListingPage — `/marketplace/sell`

**Purpose:** Create a new second-hand book listing.
**Sections:** Listing form (book select, condition, price).
**Data fields:** Book dropdown, condition dropdown (EXCELLENT/GOOD/FAIR), price input.
**Actions:** Create listing.
**States:** Default form, validation errors, successful creation.
**Navigation:** Reached from NavigationBar sell link.
**Auth required:** Yes.

## ProfilePage — `/profile`

**Purpose:** View user profile and active marketplace listings.
**Sections:** Profile info, active listings.
**Data fields:** Username, email, balance, listing cards.
**Actions:** Cancel own listing.
**States:** No active listings, with active listings.
**Navigation:** Reached from NavigationBar profile link.
**Auth required:** Yes.

---

## API Endpoints Reference

### Admin/Test Helpers (No Auth)

| Method | Endpoint         | Description                     |
|--------|------------------|---------------------------------|
| POST   | /api/seed        | Seed DB with 50 books + 2 users |
| POST   | /api/reset       | Drop and re-seed                |
| GET    | /api/health      | Health check                    |

### Auth

| Method | Endpoint          | Description          |
|--------|-------------------|----------------------|
| POST   | /api/auth/signup  | Register new user    |
| POST   | /api/auth/login   | Login, returns JWT   |
| POST   | /api/auth/logout  | Clear session cookie |
| GET    | /api/auth/me      | Current user profile |

### Books

| Method | Endpoint        | Description                  |
|--------|-----------------|------------------------------|
| GET    | /api/books      | List/search books (paginated)|
| GET    | /api/books/{id} | Get single book              |

### Cart (Auth Required)

| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| GET    | /api/cart             | Get cart items      |
| POST   | /api/cart/items       | Add item            |
| PUT    | /api/cart/items/{id}  | Update quantity     |
| DELETE | /api/cart/items/{id}  | Remove item         |
| DELETE | /api/cart             | Clear entire cart   |

### Orders (Auth Required)

| Method | Endpoint                  | Description             |
|--------|---------------------------|-------------------------|
| POST   | /api/orders               | Checkout cart to order  |
| GET    | /api/orders               | List user orders        |
| GET    | /api/orders/{id}          | Get order details       |
| POST   | /api/orders/{id}/return   | Return order            |

### Marketplace

| Method | Endpoint                             | Auth | Description     |
|--------|--------------------------------------|------|-----------------|
| GET    | /api/marketplace                     | No   | List listings   |
| POST   | /api/marketplace/listings            | Yes  | Create listing  |
| POST   | /api/marketplace/listings/{id}/buy   | Yes  | Buy listing     |
| DELETE | /api/marketplace/listings/{id}       | Yes  | Cancel listing  |

---

## Stable Selectors (data-testid)

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

## Known Issues

_None discovered yet. This section will be updated as testing progresses._
