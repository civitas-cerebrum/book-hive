# BookHive Application Context

> Living knowledge base for the BookHive E2E test suite.
> Updated as pages are inspected and tests are written.

---

## Application Overview

**BookHive** is a full-stack book marketplace application where users can browse, purchase, and resell books.

- **Frontend:** React 18 + Vite + React Router v6 (SPA at `http://localhost:7547`)
- **Backend:** Spring Boot 3.2 + MongoDB + JWT Auth (API at `http://localhost:8080`)
- **Database:** MongoDB 7
- **Deployment:** Docker Compose (frontend, backend, mongodb)

---

## Authentication

- JWT-based authentication with HTTP-only cookies
- Signup requires: username, email, password (min 8 chars)
- Login requires: email, password
- User object: userId, username, email, balance
- Starting balance: provided on account creation

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | No | Register new user |
| POST | `/api/auth/login` | No | Login with email/password |
| POST | `/api/auth/logout` | No | Logout (clear session) |
| GET | `/api/auth/me` | Yes | Get current user profile |

### Books (`/api/books`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/books` | No | List/search books (query, genre, page, size) |
| GET | `/api/books/{id}` | No | Get book details |

### Cart (`/api/cart`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/cart` | Yes | Get user cart |
| POST | `/api/cart/items` | Yes | Add item to cart |
| PUT | `/api/cart/items/{id}` | Yes | Update cart item quantity |
| DELETE | `/api/cart/items/{id}` | Yes | Remove item from cart |
| DELETE | `/api/cart` | Yes | Clear entire cart |

### Orders (`/api/orders`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/orders` | Yes | Checkout cart |
| GET | `/api/orders` | Yes | List user orders |
| GET | `/api/orders/{id}` | Yes | Get order details |
| POST | `/api/orders/{id}/return` | Yes | Return order (10-min window) |

### Marketplace (`/api/marketplace`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/marketplace` | No | List active listings |
| POST | `/api/marketplace/listings` | Yes | Create listing |
| POST | `/api/marketplace/listings/{id}/buy` | Yes | Buy listing |
| DELETE | `/api/marketplace/listings/{id}` | Yes | Cancel own listing |

### Admin (`/api`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/seed` | No | Seed database |
| POST | `/api/reset` | No | Reset and re-seed |
| GET | `/api/health` | No | Health check |

---

## Pages & Routes

### HomePage `/`
**Purpose:** Browse and discover books.
**Sections:** Search bar, genre filter chips, book card grid, pagination.
**Data fields:** Book title, author, genre, price, stock status.
**Actions:** Search by title/author, filter by genre (Fiction, Sci-Fi, Non-Fiction, Biography, Fantasy, Mystery), add to cart, navigate to book detail, paginate (12 per page).
**States:** Loading, books displayed, no results, paginated.
**Navigation:** Reached from sidebar. Links to book detail pages.

### LoginPage `/login`
**Purpose:** Authenticate existing users.
**Sections:** Login form.
**Data fields:** Email input, password input.
**Actions:** Submit login form, navigate to signup.
**States:** Default, loading (button disabled), error message displayed.
**Navigation:** Reached from sidebar. Links to signup. Redirects to home on success.

### SignupPage `/signup`
**Purpose:** Register new users.
**Sections:** Registration form.
**Data fields:** Username input, email input, password input (min 8 chars).
**Actions:** Submit registration form, navigate to login.
**States:** Default, loading (button disabled), error message displayed.
**Navigation:** Reached from sidebar. Links to login. Redirects to home on success.

### BookDetailPage `/books/:id`
**Purpose:** View full book details and add to cart.
**Sections:** Book cover emoji, metadata, description, purchase action.
**Data fields:** Title, author, genre tag, full description, price, stock quantity.
**Actions:** Add to cart (if authenticated and in stock).
**States:** Loading, book loaded, not found, out of stock.
**Navigation:** Reached from home page book cards. Cart button adds item.

### CartPage `/cart` (Protected)
**Purpose:** Review and checkout shopping cart.
**Sections:** Cart item list, summary section.
**Data fields:** Item name, quantity, price per item, cart total.
**Actions:** Update quantity, remove item, clear cart, checkout.
**States:** Empty cart, items loaded, checkout processing.
**Navigation:** Reached from sidebar. Checkout navigates to orders.

### OrdersPage `/orders` (Protected)
**Purpose:** View order history.
**Sections:** Order card list.
**Data fields:** Order ID, status (COMPLETED/RETURNED), total, date.
**Actions:** Click to view order detail.
**States:** No orders, orders listed.
**Navigation:** Reached from sidebar. Links to order detail pages.

### OrderDetailPage `/orders/:id` (Protected)
**Purpose:** View individual order with return option.
**Sections:** Order header, items list, return section.
**Data fields:** Order ID (last 8 chars), status badge, items with quantity/price, total, return countdown.
**Actions:** Return order (within 10-minute window).
**States:** Completed (with return option), returned, return window expired.
**Navigation:** Reached from orders page.

### MarketplacePage `/marketplace`
**Purpose:** Browse peer-to-peer book listings.
**Sections:** Listing card grid.
**Data fields:** Book title, condition, price, seller.
**Actions:** Buy listing (if authenticated).
**States:** No listings, listings displayed.
**Navigation:** Reached from sidebar. Links to create listing.

### CreateListingPage `/marketplace/sell` (Protected)
**Purpose:** List a book for sale on marketplace.
**Sections:** Listing creation form.
**Data fields:** Book dropdown, condition dropdown (NEW, LIKE_NEW, GOOD, FAIR), price input.
**Actions:** Submit listing.
**States:** Default, submitting, error.
**Navigation:** Reached from sidebar. Redirects to marketplace on success.

### ProfilePage `/profile` (Protected)
**Purpose:** View profile and manage marketplace listings.
**Sections:** User info card, balance card, listings section.
**Data fields:** Username, email, balance, listing details.
**Actions:** Cancel active listing.
**States:** No listings, listings displayed.
**Navigation:** Reached from sidebar.

---

## Shared Components

### Sidebar
- Navigation links: All Books, Marketplace, genre filters
- Authenticated: balance display, cart (with badge), orders, sell, profile, logout
- Unauthenticated: login, signup links
- Theme toggle

### TopBar
- Mobile hamburger menu, logo, search button, cart button with badge

### SearchBar
- Text input with search icon, form submission on Enter

### BookCard
- Emoji cover, genre tag, title, author, price, add-to-cart button

### GenreFilter
- Chip buttons: All, Fiction, Sci-Fi, Non-Fiction, Biography, Fantasy, Mystery

---

## Test Data

- Seed data includes 30+ books across genres: Fiction, Sci-Fi, Non-Fiction, Biography, Fantasy, Mystery
- API supports `/api/reset` to restore seed state before tests
- Books have: id, title, author, genre, description, price, coverImage, stock, isbn

---

## Known Issues

(none yet)
