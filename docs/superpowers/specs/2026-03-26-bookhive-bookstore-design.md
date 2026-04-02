# BookHive — Bookstore Test Automation Target

## Purpose

A full-stack bookstore e-commerce application designed as a **test automation target**. Users can sign up, browse/search books, manage a shopping cart, purchase, return (within 10 minutes), and resell books via a user-to-user marketplace. Every interactive element carries `data-testid` attributes. The app ships with Swagger docs and test-helper endpoints (`/api/seed`, `/api/reset`) so it can serve as a target for UI tests, API tests, and cross-tests combining both.

## Architecture

**Monorepo** with three docker-compose services:

```
BookHive/
├── frontend/          # React 18 (Vite) → Nginx container
├── backend/           # Spring Boot 3 (Gradle) → JDK container
├── seed-data/         # JSON fixtures
├── docker-compose.yml # frontend + backend + mongodb
└── docs/
```

One `git clone` + `docker-compose up` gets everything running.

## Tech Stack

### Frontend
- React 18 + React Router
- Vite (dev server + build)
- CSS Modules with CSS custom properties for theming
- Axios for HTTP
- Mobile-first responsive design (future React Native potential)

### Backend
- Spring Boot 3, Java 17+
- Spring Data MongoDB
- Spring Security (JWT for API access + JWT stored in HttpOnly cookie for UI session)
- SpringDoc OpenAPI (Swagger UI at `/swagger-ui.html`)
- Gradle build

### Infrastructure
- Docker + docker-compose (3 services)
- `frontend`: Vite builds static files, served by Nginx
- `backend`: Spring Boot fat jar on JDK
- `mongodb`: Official MongoDB image

## Data Model

### User
| Field | Type | Notes |
|-------|------|-------|
| id | String | MongoDB ObjectId |
| username | String | Unique |
| email | String | Unique |
| password | String | BCrypt hashed |
| createdAt | DateTime | |

### Book
| Field | Type | Notes |
|-------|------|-------|
| id | String | MongoDB ObjectId |
| title | String | |
| author | String | |
| genre | String | Fiction, Sci-Fi, Non-Fiction, Biography, etc. |
| description | String | |
| price | Double | |
| coverImage | String | URL or placeholder reference |
| stock | Integer | Decremented on purchase, incremented on return |
| isbn | String | Unique |

### CartItem
| Field | Type | Notes |
|-------|------|-------|
| id | String | MongoDB ObjectId |
| userId | String | References User |
| bookId | String | References Book |
| quantity | Integer | |
| addedAt | DateTime | |

### Order
| Field | Type | Notes |
|-------|------|-------|
| id | String | MongoDB ObjectId |
| userId | String | References User |
| items | Array | [{bookId, quantity, priceAtPurchase}] |
| totalPrice | Double | |
| status | String | COMPLETED or RETURNED |
| purchasedAt | DateTime | Return eligibility: purchasedAt + 10min > now |

### MarketplaceListing
| Field | Type | Notes |
|-------|------|-------|
| id | String | MongoDB ObjectId |
| sellerId | String | References User |
| bookId | String | References Book |
| condition | String | NEW, LIKE_NEW, GOOD, FAIR |
| price | Double | Seller sets price |
| listedAt | DateTime | |
| status | String | ACTIVE, SOLD, CANCELLED |

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/signup | No | Register new user |
| POST | /api/auth/login | No | Login, returns JWT + sets session cookie |
| POST | /api/auth/logout | Yes | Invalidate session |
| GET | /api/auth/me | Yes | Current user profile |

### Books
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/books | No | List/search books (query, genre, pagination) |
| GET | /api/books/{id} | No | Book detail |

### Cart
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/cart | Yes | Get current user's cart |
| POST | /api/cart/items | Yes | Add item to cart |
| PUT | /api/cart/items/{id} | Yes | Update item quantity |
| DELETE | /api/cart/items/{id} | Yes | Remove item from cart |
| DELETE | /api/cart | Yes | Clear entire cart |

### Orders
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/orders | Yes | Checkout (cart → order) |
| GET | /api/orders | Yes | List user's orders |
| GET | /api/orders/{id} | Yes | Order detail |
| POST | /api/orders/{id}/return | Yes | Return order (if within 10min) |

### Marketplace
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/marketplace | No | List active listings |
| POST | /api/marketplace/listings | Yes | Create a listing |
| POST | /api/marketplace/listings/{id}/buy | Yes | Buy a listing |
| DELETE | /api/marketplace/listings/{id} | Yes | Cancel own listing |

### Admin / Test Helpers
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/seed | No | Populate DB with ~50 books + 2 test users |
| POST | /api/reset | No | Drop all collections, re-seed |
| GET | /api/health | No | Service status + DB connectivity |

## UI Pages

### Public
| Route | Page | Key Elements |
|-------|------|-------------|
| `/` | Home / Book Catalog | Search bar, genre filters (sidebar on desktop, chips on mobile), book card grid, pagination |
| `/books/:id` | Book Detail | Cover, title, author, description, price, stock status, add-to-cart button |
| `/marketplace` | Marketplace | Listing cards with condition badge, price, buy button |
| `/login` | Login | Email/password form |
| `/signup` | Sign Up | Username/email/password form |

### Authenticated
| Route | Page | Key Elements |
|-------|------|-------------|
| `/cart` | Shopping Cart | Item list, quantity controls, remove buttons, total, checkout button |
| `/orders` | Order History | Order cards with status, date, total |
| `/orders/:id` | Order Detail | Items list, return button (with countdown if <10min), status |
| `/marketplace/sell` | Create Listing | Book selector, condition dropdown, price input |
| `/profile` | Profile | User info, my active listings |

## Visual Design

### Theme
- **Dark theme** (default): Deep navy background (`#1a1a2e`), card surfaces (`#16213e`), accent red (`#e94560`), link blue (`#4299e1`), muted text (`#a0aec0`)
- **Light theme**: Inverted palette using CSS custom properties
- Toggle persisted in localStorage, accessible via `data-testid="theme-toggle"`

### Layout
- **Desktop**: Persistent sidebar (categories, navigation, account links) + main content area with search bar and book grid
- **Mobile**: Sidebar collapses to hamburger menu (`data-testid="sidebar-toggle"`). Top bar with logo, search icon, cart badge. Categories become horizontal scrollable chips. Book grid switches to 2 columns.

### Responsive Breakpoints
- Mobile: < 768px (hamburger, 2-col grid, chip filters)
- Desktop: >= 768px (sidebar, 3-col grid)

## Business Rules

### Returns
- 10-minute window from `purchasedAt`
- Backend enforces the time check; UI shows countdown timer
- Return button disabled/hidden when window expires
- Returned items: stock incremented, user refunded, order status → RETURNED

### Marketplace
- Any user can list any book (test app — no ownership validation)
- Seller sets price and condition (NEW, LIKE_NEW, GOOD, FAIR)
- When bought: listing status → SOLD, buyer gets an order record (same Order model, same 10-minute return window applies)
- Seller can cancel own ACTIVE listings

### Cart
- Server-side persistence (tied to userId)
- Survives logout/login
- Stock validated on add-to-cart and checkout
- Cleared on successful checkout

### Stock
- Decremented on purchase, incremented on return
- Add-to-cart validates availability
- Checkout fails gracefully if stock insufficient between cart-add and checkout

## Test Automation Features

### Seed Data
- `POST /api/seed` populates:
  - ~50 books across genres with fixed IDs, titles, and prices
  - 2 test users: `testuser1` / `testuser1@bookhive.test` / `Test1234!` and `testuser2` / `testuser2@bookhive.test` / `Test1234!`
- `POST /api/reset` drops all collections and re-seeds (idempotent)

### Testability
- `data-testid` on every interactive element with consistent naming:
  - `sidebar-toggle`, `search-input`, `theme-toggle`
  - `book-card-{id}`, `add-to-cart-{id}`, `cart-badge`
  - `genre-filter-{genre}`, `return-order-{id}`, `checkout-btn`
  - `listing-create`, `listing-buy-{id}`
- Swagger UI at `/swagger-ui.html` with full request/response schemas
- CORS wide open (`*` origin)
- No rate limiting
- Response headers include request timing
- Predictable seed data for deterministic assertions

### Cross-Test Support
- UI actions produce API-verifiable state changes (e.g., add to cart in UI → verify via `GET /api/cart`)
- API state changes reflect in UI (e.g., seed via API → books appear in UI)
- Both JWT (Authorization header) and session cookies supported simultaneously

## Docker Compose

```yaml
services:
  frontend:
    build: ./frontend
    ports: ["3000:80"]       # Nginx serves built React app
    depends_on: [backend]

  backend:
    build: ./backend
    ports: ["8080:8080"]     # Spring Boot API + Swagger
    depends_on: [mongodb]
    environment:
      SPRING_DATA_MONGODB_URI: mongodb://mongodb:27017/bookhive
      JWT_SECRET: test-secret-key-for-development

  mongodb:
    image: mongo:7
    ports: ["27017:27017"]   # Exposed for direct DB assertions in tests
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

Single command to run: `docker-compose up --build`
