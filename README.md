# BookHive

A full-stack bookstore e-commerce application designed as a realistic target for UI, API, and end-to-end test automation.

One `git clone` + `docker compose up` gets a complete bookstore running with predictable data, stable selectors, and test-friendly endpoints.

## Table of Contents

- [Run from Docker Hub](#run-from-docker-hub)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Frontend](#frontend)
- [Backend API](#backend-api)
- [Authentication](#authentication)
- [Test Data](#test-data)
- [Test Automation Features](#test-automation-features)
- [CI/CD](#cicd)
- [Contributing](#contributing)

## Run from Docker Hub

No need to clone — pull the pre-built images directly:

```yaml
# docker-compose.yml
services:
  frontend:
    image: umutayb/book-hive-frontend:latest
    ports:
      - "7547:80"
    depends_on:
      - backend

  backend:
    image: umutayb/book-hive-backend:latest
    ports:
      - "8080:8080"
    depends_on:
      - mongodb
    environment:
      SPRING_DATA_MONGODB_URI: mongodb://mongodb:27017/bookhive
      JWT_SECRET: change-me-in-production-use-a-strong-random-secret-at-least-64-bytes

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

```bash
docker compose up
curl -X POST http://localhost:8080/api/seed
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:7547 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### Run from Source

```bash
git clone https://github.com/umutayb/book-hive.git
cd book-hive
docker compose up --build
```

Once running, seed the database:

```bash
curl -X POST http://localhost:8080/api/seed
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:7547 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| API Docs (JSON) | http://localhost:8080/api-docs |
| MongoDB | localhost:27017 |

### Local Development (without Docker)

**Backend:**

```bash
cd backend
./mvnw spring-boot:run
```

Requires Java 17+ and a local MongoDB instance on port 27017.

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs on port 3000 and proxies `/api` requests to `localhost:8080`.

## Architecture

```
book-hive/
├── frontend/          React 18 SPA (Vite) → Nginx container on port 7547
├── backend/           Spring Boot 3 API (Maven) → JDK container on port 8080
├── seed-data/         JSON fixtures (50 books)
├── docker-compose.yml Frontend + Backend + MongoDB
└── .github/workflows/ CI/CD pipelines
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router 6, Axios, CSS Modules |
| Backend | Spring Boot 3.2.3, Java 17, Spring Data MongoDB, Spring Security |
| Database | MongoDB 7 |
| API Docs | SpringDoc OpenAPI (Swagger UI) |
| Infrastructure | Docker Compose (3 services) |

### Docker Compose Services

| Service | Image | Port | Description |
|---------|-------|------|-------------|
| `frontend` | Node 20 build + Nginx | 7547:80 | Serves React SPA, proxies API calls to backend |
| `backend` | Eclipse Temurin JDK 17 | 8080:8080 | Spring Boot REST API |
| `mongodb` | mongo:7 | 27017:27017 | Persistent data volume (`mongo-data`) |

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_DATA_MONGODB_URI` | `mongodb://localhost:27017/bookhive` | MongoDB connection string |
| `JWT_SECRET` | `test-secret-key-for-development-only` | JWT signing key |

## Frontend

### Routes

| Path | Page | Auth Required |
|------|------|---------------|
| `/` | Home — browse and search books | No |
| `/books/:id` | Book detail | No |
| `/marketplace` | Browse second-hand listings | No |
| `/marketplace/sell` | Create a listing | Yes |
| `/login` | Login | No |
| `/signup` | Sign up | No |
| `/cart` | Shopping cart | Yes |
| `/orders` | Order history | Yes |
| `/orders/:id` | Order detail with return option | Yes |
| `/profile` | User profile and active listings | Yes |

### State Management

| Context | Purpose | Persistence |
|---------|---------|-------------|
| `AuthContext` | User session, JWT token, login/logout | HttpOnly cookie (`bookhive_token`) |
| `CartContext` | Shopping cart items, add/remove/update | Server-side (API) |
| `ThemeContext` | Dark/light mode toggle | `localStorage` (`bookhive_theme`) |

### Responsive Behaviour

- **Desktop (>768px):** Sidebar navigation
- **Mobile (<=768px):** Hamburger menu, mobile search and cart buttons in top bar

## Backend API

### Admin / Test Helper Endpoints

These require **no authentication** and are designed for test setup/teardown.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/seed` | Populate DB with 50 books + 2 test users (idempotent) |
| `POST` | `/api/reset` | Drop all collections and re-seed to known state |
| `GET` | `/api/health` | Service status + MongoDB connectivity check |

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/login` | Authenticate, returns JWT |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `GET` | `/api/auth/me` | Get current user profile (requires auth) |

### Books Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/books` | List/search books (paginated) |
| `GET` | `/api/books/{id}` | Get single book |

**Query parameters for `GET /api/books`:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `query` | string | — | Text search on title, author, description |
| `genre` | string | — | Filter by genre |
| `page` | int | 0 | Page number (0-indexed) |
| `size` | int | 12 | Items per page |

### Cart Endpoints (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cart` | Get cart items |
| `POST` | `/api/cart/items` | Add item (`bookId`, `quantity`) |
| `PUT` | `/api/cart/items/{id}` | Update item quantity |
| `DELETE` | `/api/cart/items/{id}` | Remove item |
| `DELETE` | `/api/cart` | Clear entire cart |

### Order Endpoints (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/orders` | Checkout — converts cart to order, deducts balance |
| `GET` | `/api/orders` | List user's orders |
| `GET` | `/api/orders/{id}` | Get order details |
| `POST` | `/api/orders/{id}/return` | Return order within 10-minute window |

### Marketplace Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/marketplace` | No | List all active listings |
| `POST` | `/api/marketplace/listings` | Yes | Create listing (`bookId`, `condition`, `price`) |
| `POST` | `/api/marketplace/listings/{id}/buy` | Yes | Buy a listing |
| `DELETE` | `/api/marketplace/listings/{id}` | Yes | Cancel own listing |

**Listing conditions:** `EXCELLENT`, `GOOD`, `FAIR`

## Authentication

Both JWT header and HttpOnly cookie are supported simultaneously:

| Method | Use Case | Details |
|--------|----------|---------|
| `Authorization: Bearer <token>` | API testing | Token returned in login/signup response body |
| HttpOnly cookie (`bookhive_token`) | UI testing | Set automatically on login/signup |

**Token expiration:** 24 hours

**Example — API login:**

```bash
# Login and capture token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser1@bookhive.test","password":"Test1234!"}' \
  | jq -r '.token')

# Use token
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/cart
```

## Test Data

### Test Users

| Username | Email | Password | Starting Balance |
|----------|-------|----------|-----------------|
| `testuser1` | `testuser1@bookhive.test` | `Test1234!` | $100.00 |
| `testuser2` | `testuser2@bookhive.test` | `Test1234!` | $100.00 |

### Books

50 books with fixed IDs (`book-001` through `book-050`) across 6 genres:

| Genre | Count |
|-------|-------|
| Fiction | 8 |
| Sci-Fi | 9 |
| Non-Fiction | 8 |
| Biography | 8 |
| Fantasy | 8 |
| Mystery | 9 |

**Price range:** $8.99 — $24.99  
**Stock range:** 7 — 20 units per book

**Book object structure:**

```json
{
  "id": "book-001",
  "title": "To Kill a Mockingbird",
  "author": "Harper Lee",
  "genre": "Fiction",
  "description": "A gripping portrayal of racial injustice...",
  "price": 12.99,
  "coverImage": "/covers/placeholder-fiction.svg",
  "stock": 15,
  "isbn": "978-0-06-112008-4"
}
```

### Data Models

| Model | Key Fields |
|-------|------------|
| **User** | `id`, `username`, `email`, `passwordHash`, `balance`, `createdAt` |
| **Book** | `id`, `title`, `author`, `genre`, `description`, `price`, `coverImage`, `stock`, `isbn` |
| **CartItem** | `id`, `userId`, `bookId`, `quantity` |
| **Order** | `id`, `userId`, `items[]`, `totalPrice`, `status`, `returnWindow`, `createdAt` |
| **OrderItem** | `bookId`, `bookTitle`, `price`, `quantity` |
| **MarketplaceListing** | `id`, `sellerId`, `bookId`, `condition`, `price`, `status`, `createdAt` |

**Order statuses:** `PENDING`, `COMPLETED`, `RETURNED`  
**Listing statuses:** `ACTIVE`, `SOLD`, `CANCELLED`

## Test Automation Features

### Stable Selectors

Every interactive UI element has a `data-testid` attribute. Examples:

**Navigation:**
`topbar`, `sidebar-toggle`, `nav-login`, `nav-signup`, `nav-cart`, `nav-orders`, `nav-sell`, `nav-profile`, `logout-btn`, `cart-badge`

**Books:**
`book-grid`, `book-detail-title`, `book-detail-price`, `add-to-cart-{id}`, `add-to-cart-detail`, `out-of-stock-{id}`, `search-input`, `genre-chip-*`, `pagination`, `next-page`, `prev-page`

**Cart:**
`cart-page`, `cart-empty`, `cart-total`, `cart-clear`, `checkout-btn`, `cart-item-{id}`, `cart-qty-{id}`, `cart-qty-plus-{id}`, `cart-qty-minus-{id}`, `cart-remove-{id}`

**Orders:**
`orders-page`, `no-orders`, `order-card-{id}`, `order-status-{id}`, `order-item-{idx}`, `return-order-{id}`

**Marketplace:**
`my-listing-{id}`, `cancel-listing-{id}`, `listing-buy-{id}`, `listing-condition-badge-{id}`

**Forms:**
`login-email`, `login-password`, `signup-email`, `listing-book-select`, `listing-condition`, `listing-price`, `listing-create`

**Profile:**
`profile-page`, `profile-username`, `profile-email`, `profile-balance`

### Test-Friendly Design

- **Predictable seed data** — fixed IDs, known credentials, consistent starting state
- **Idempotent seed** — calling `/api/seed` multiple times doesn't duplicate data
- **Full reset** — `/api/reset` drops everything and re-seeds for clean test runs
- **Dual auth** — JWT header for API tests, HttpOnly cookie for UI tests
- **10-minute return window** — testable time-sensitive feature with live countdown
- **Balance tracking** — verifiable financial transactions across purchase, return, and marketplace flows
- **Responsive breakpoints** — test both desktop and mobile layouts at 768px

## CI/CD

### Test on Pull Request

Every PR to `main` triggers `.github/workflows/test.yml`:

- **Backend Tests** — JDK 17 + Maven, runs `./mvnw test` (JUnit 5 with embedded MongoDB)
- **Frontend Build** — Node 20 + `npm ci` + `npm run build` (build verification)

### Docker Publish on Release

Pushing a semver tag triggers `.github/workflows/docker-image.yml`:

```bash
git tag 0.0.1
git push origin 0.0.1
```

This builds and pushes two images to Docker Hub:

| Image | Source |
|-------|--------|
| `umutayb/book-hive-backend` | `backend/Dockerfile` |
| `umutayb/book-hive-frontend` | `frontend/Dockerfile` |

**Required GitHub Secrets:**

| Secret | Description |
|--------|-------------|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password or access token |

## Contributing

### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/umutayb/book-hive.git
   cd book-hive
   ```
3. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. Start the app locally with Docker:
   ```bash
   docker compose up --build
   curl -X POST http://localhost:8080/api/seed
   ```

### Project Structure

```
book-hive/
├── backend/
│   ├── src/main/java/com/bookhive/
│   │   ├── controller/    REST controllers
│   │   ├── service/       Business logic
│   │   ├── repository/    MongoDB repositories
│   │   ├── model/         Data models
│   │   ├── dto/           Request/response DTOs
│   │   ├── security/      JWT auth filter and utilities
│   │   └── config/        Security, Swagger, CORS config
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── books.json
│   ├── src/test/          JUnit 5 tests
│   ├── pom.xml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/         Route-level components
│   │   ├── components/    Reusable UI components
│   │   ├── context/       React contexts (Auth, Cart, Theme)
│   │   ├── services/      API client (Axios)
│   │   └── styles/        Global CSS and variables
│   ├── nginx.conf         Production proxy config
│   ├── package.json
│   └── Dockerfile
├── seed-data/
│   └── books.json         50 books fixture
├── docker-compose.yml
└── .github/workflows/
    ├── test.yml           PR checks
    └── docker-image.yml   Docker Hub publish
```

### Running Tests

**Backend:**

```bash
cd backend
./mvnw test
```

Uses embedded MongoDB — no external database needed.

**Frontend:**

```bash
cd frontend
npm run build
```

### Making Changes

**Backend:**
- Follow existing patterns in `controller/` → `service/` → `repository/`
- Add `@RestController` endpoints with Swagger annotations
- Write JUnit 5 tests in `src/test/`

**Frontend:**
- Add `data-testid` attributes to all interactive elements
- Use CSS Modules for component styles
- Wrap authenticated routes with `ProtectedRoute`
- Use the existing `api.js` service for backend calls

### Commit Messages

Use conventional-style commit messages:

```
feat: add wishlist feature
fix: correct cart total calculation on quantity update
docs: add API rate limiting section to README
test: add order return window edge case tests
```

### Pull Request Process

1. Ensure backend tests pass: `./mvnw test`
2. Ensure frontend builds: `npm run build`
3. Add `data-testid` attributes to any new interactive elements
4. Update seed data if adding new entities
5. Open a PR against `main` — CI will run tests automatically
6. Fill in the PR description with a summary and test plan

### Reporting Issues

Open an issue with:
- Steps to reproduce
- Expected vs actual behaviour
- Browser/environment details (for UI issues)
- API request/response details (for backend issues)
<!-- Live Claude API test -->
<!-- QA live test Fri Apr  3 00:07:12 CEST 2026 -->
<!-- retrigger 1775167773 -->
<!-- live 1775168092 -->
