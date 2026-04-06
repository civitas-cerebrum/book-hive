# BookHive — Application Context

## Application Overview
BookHive is a full-stack bookstore e-commerce application with a React 18 SPA frontend and Spring Boot 3 backend, backed by MongoDB. It supports browsing books, shopping cart, checkout, order management, a second-hand marketplace, and user authentication.

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

## Test Users
| Username | Email | Password | Starting Balance |
|----------|-------|----------|-----------------|
| testuser1 | testuser1@bookhive.test | Test1234! | $100.00 |
| testuser2 | testuser2@bookhive.test | Test1234! | $100.00 |

## Authentication
- JWT token via `Authorization: Bearer <token>` header (API testing)
- HttpOnly cookie `bookhive_token` (UI testing, set automatically on login/signup)
- Token expiration: 24 hours

## Test Helper Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/seed | Populate DB with 50 books + 2 test users (idempotent) |
| POST | /api/reset | Drop all collections and re-seed |
| GET | /api/health | Service status + MongoDB connectivity |

---

## HomePage — `/`
**Purpose:** Browse and search the book catalog with genre filtering and pagination.
**Sections:** Search bar, genre filter chips, book grid, pagination controls.
**Data fields:** Book cards showing title, author, price, cover image.
**Actions:** Search by text, filter by genre (Fiction, Sci-Fi, Non-Fiction, Biography, Fantasy, Mystery), paginate (next/prev), click book card to view detail.
**States:** Loading state, empty state (no books matching query), populated book grid.
**Navigation:** Entry point; links to BookDetailPage via book cards, genre filters update the grid.

## BookDetailPage — `/books/:id`
**Purpose:** Display detailed information about a single book.
**Sections:** Book cover, title, author, genre badge, description, price, stock status, add-to-cart action.
**Data fields:** Title, author, genre, description, price ($XX.XX), stock count.
**Actions:** Add to cart (requires auth and stock > 0).
**States:** Loading, not found (invalid ID), in-stock (shows add button), out-of-stock (shows out-of-stock indicator).
**Navigation:** Reached from HomePage book cards; add-to-cart updates cart context.

## LoginPage — `/login`
**Purpose:** Authenticate existing users with email and password.
**Sections:** Login form, error display, signup link.
**Data fields:** Email input, password input.
**Actions:** Submit login form, navigate to signup page.
**States:** Default form, loading during submission, error state (invalid credentials).
**Navigation:** Reached from Navigation sidebar; redirects to HomePage on success; links to SignupPage.

## SignupPage — `/signup`
**Purpose:** Register new user accounts.
**Sections:** Signup form, error display, login link.
**Data fields:** Username input (min 3 chars, no HTML), email input, password input (min 8 chars).
**Actions:** Submit signup form, navigate to login page.
**States:** Default form, loading during submission, error state (validation errors, duplicate email).
**Navigation:** Reached from Navigation sidebar or LoginPage; redirects to HomePage on success; links to LoginPage.

## CartPage — `/cart` (Auth Required)
**Purpose:** View and manage shopping cart items, proceed to checkout.
**Sections:** Cart items list, cart total, action buttons.
**Data fields:** Cart item rows (book title, quantity, price), total price.
**Actions:** Update quantity (plus/minus), remove item, clear entire cart, checkout (creates order).
**States:** Empty cart, populated cart with items.
**Navigation:** Reached from Navigation sidebar; checkout redirects to OrderDetailPage.

## OrdersPage — `/orders` (Auth Required)
**Purpose:** View order history.
**Sections:** Order cards list.
**Data fields:** Order cards showing order ID, status, total, date.
**Actions:** Click order card to view details.
**States:** Loading, no orders (empty state), list of order cards.
**Navigation:** Reached from Navigation sidebar; links to OrderDetailPage.

## OrderDetailPage — `/orders/:id` (Auth Required)
**Purpose:** View detailed order information with return option.
**Sections:** Order status, order items, total, return button with countdown.
**Data fields:** Order status badge, individual order items (title, price, quantity), total price.
**Actions:** Return order (within 10-minute window).
**States:** Loading, not found, completed order (with return countdown if within window), returned order.
**Navigation:** Reached from OrdersPage or CartPage checkout.

## MarketplacePage — `/marketplace`
**Purpose:** Browse second-hand book listings from other users.
**Sections:** Listing cards grid.
**Data fields:** Listing cards showing book title, seller, condition badge, price, buy button.
**Actions:** Buy a listing (requires auth).
**States:** Loading, no listings (empty state), grid of listing cards.
**Navigation:** Reached from Navigation sidebar; links to individual listings.

## CreateListingPage — `/marketplace/sell` (Auth Required)
**Purpose:** Create a new marketplace listing to sell a book.
**Sections:** Listing form with book selection, condition, and price.
**Data fields:** Book dropdown, condition dropdown (EXCELLENT, GOOD, FAIR), price input.
**Actions:** Select book, select condition, enter price, create listing.
**States:** Default form, error state (validation errors), loading.
**Navigation:** Reached from Navigation sidebar; redirects to MarketplacePage on success.

## ProfilePage — `/profile` (Auth Required)
**Purpose:** View user profile information and manage active listings.
**Sections:** Profile info, active listings section.
**Data fields:** Username, email, balance.
**Actions:** Cancel active listings.
**States:** Profile loaded, no active listings, active listings displayed.
**Navigation:** Reached from Navigation sidebar.

---

## Seed Data
- 50 books with fixed IDs (book-001 through book-050)
- 6 genres: Fiction (8), Sci-Fi (9), Non-Fiction (8), Biography (8), Fantasy (8), Mystery (9)
- Price range: $8.99 - $24.99
- Stock range: 7 - 20 units per book

## Known Issues
(None discovered yet — will be updated during test execution)
