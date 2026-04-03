# BookHive Application Context

## Overview
BookHive is a full-stack bookstore e-commerce application with React frontend and Spring Boot backend.

## Tech Stack
- **Frontend**: React 18, Vite, React Router 6, Axios
- **Backend**: Spring Boot 3.2.3, Java 17, MongoDB
- **Auth**: JWT with HttpOnly cookies

## Test Users
| Username | Email | Password | Starting Balance |
|----------|-------|----------|------------------|
| testuser1 | testuser1@bookhive.test | Test1234! | $100.00 |
| testuser2 | testuser2@bookhive.test | Test1234! | $100.00 |

## Routes & Pages

### HomePage — `/`
**Purpose:** Browse and search books catalog with pagination and genre filtering.
**Sections:** Search bar, Genre filter chips, Book grid, Pagination controls.
**Data fields:** Book cards showing genre, title, author, price.
**Actions:** Search input, genre chip filters, add to cart buttons, pagination (prev/next), click book card to view detail.
**States:** Loading state, empty state ("No books found"), paginated results (12 per page, 5 pages total with 50 books).
**Navigation:** Reached from sidebar "All Books" link. Links to book detail pages.

### BookDetailPage — `/books/:id`
**Purpose:** View detailed information about a single book and add to cart.
**Sections:** Book cover placeholder, Book info (title, author, genre, description, price, stock).
**Data fields:** Title, Author, Genre badge, Description, Price ($X.XX), Stock count ("X in stock").
**Actions:** Add to Cart button.
**States:** Loading state, Not found state, In stock (shows Add to Cart), Out of stock (shows "Out of Stock" text).
**Navigation:** Reached from book cards on HomePage. No outbound links.

### LoginPage — `/login`
**Purpose:** Authenticate existing users.
**Sections:** Login form with email and password fields.
**Data fields:** Email input, Password input.
**Actions:** Sign In button, Sign up link.
**States:** Default form, Error state (shows error message above form), Loading state (button shows "Signing in...").
**Navigation:** Reached from sidebar "Login" link. Redirects to "/" on success. Links to signup page.

### SignupPage — `/signup`
**Purpose:** Register new user accounts.
**Sections:** Registration form with username, email, and password fields.
**Data fields:** Username input, Email input, Password input.
**Actions:** Create Account button, Sign in link.
**States:** Default form, Error state (shows error message), Loading state (button shows "Creating account...").
**Navigation:** Reached from sidebar "Sign Up" link. Redirects to "/" on success. Links to login page.
**Known issues:** New users start with $0.00 balance, not $100.00 like seeded test users.

### CartPage — `/cart` (Auth Required)
**Purpose:** View and manage shopping cart, proceed to checkout.
**Sections:** Cart header, Cart items list, Cart total, Checkout button.
**Data fields:** Item title, item price, quantity, cart total.
**Actions:** Adjust quantity (+/-), Remove item, Clear cart, Checkout.
**States:** Empty cart ("Your cart is empty"), Cart with items (shows list, total, checkout button).
**Navigation:** Reached from sidebar "Cart" link. Checkout redirects to /orders on success.
**Known issues:** No error message displayed when checkout fails due to insufficient balance.

### OrdersPage — `/orders` (Auth Required)
**Purpose:** View order history.
**Sections:** Orders list header, Order cards.
**Data fields:** Order ID, date, total, status badge.
**Actions:** Click order card to view detail.
**States:** Loading state, No orders state ("No orders yet"), Orders list.
**Navigation:** Reached from sidebar "Orders" link. Links to order detail pages.

### OrderDetailPage — `/orders/:id` (Auth Required)
**Purpose:** View detailed order information with return option.
**Sections:** Order header with status, Order items list, Total, Return section.
**Data fields:** Order ID, status badge, items with title/price/quantity, total amount, return countdown.
**Actions:** Return Order button (within 10-minute window).
**States:** Loading, Not found, Completed (with return button if within window), Returned status.
**Navigation:** Reached from order cards. No outbound links.

### MarketplacePage — `/marketplace`
**Purpose:** Browse second-hand book listings from other users.
**Sections:** Marketplace header, Listing cards grid.
**Data fields:** Book title, condition badge, author, price.
**Actions:** Buy button on each listing.
**States:** Loading state, No listings state, Listings grid.
**Navigation:** Reached from sidebar "Marketplace" link.

### CreateListingPage — `/marketplace/sell` (Auth Required)
**Purpose:** Create a new marketplace listing to sell a book.
**Sections:** Sell a Book form.
**Data fields:** Book dropdown (select from all books), Condition dropdown (NEW, LIKE NEW, GOOD, FAIR), Price input.
**Actions:** Create Listing button.
**States:** Default form, Error state, Loading/submitting state.
**Navigation:** Reached from sidebar "Sell a Book" link. Redirects to /profile on success.

### ProfilePage — `/profile` (Auth Required)
**Purpose:** View user profile and manage active listings.
**Sections:** User info header, Balance display, My Listings section.
**Data fields:** Username, Email, Balance ($X.XX), Listing cards.
**Actions:** Cancel listing button on each active listing.
**States:** No listings ("No active listings"), Has listings (shows listing cards with cancel button).
**Navigation:** Reached from sidebar "Profile" link.

## Components

### Sidebar
**Purpose:** Main navigation and account actions.
**Elements:** Logo, Browse links (All Books, Marketplace), Genre filters (Fiction, Sci-Fi, Non-Fiction, Biography, Fantasy, Mystery), Account section.
**States:** Logged out (shows Login, Sign Up links), Logged in (shows Balance, Cart with badge, Orders, Sell a Book, Profile, Logout).

### TopBar
**Purpose:** Mobile navigation and theme toggle.
**Elements:** Hamburger menu, Mobile search button, Mobile cart button, Theme toggle.
**Responsive:** Hidden on desktop, visible on mobile (<768px).

### BookCard
**Purpose:** Display book summary in grid.
**Elements:** Cover placeholder, Genre badge, Title, Author, Price, Add to Cart button.
**States:** In stock (shows Add to Cart), Out of stock (shows "Out of stock" text).

### ListingCard
**Purpose:** Display marketplace listing.
**Elements:** Book title, Condition badge, Author, Price, Buy button.

## API Endpoints Used

### Public
- `GET /api/books` - List books with pagination and filtering
- `GET /api/books/:id` - Get single book
- `GET /api/marketplace` - List marketplace listings
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/signup` - Register user
- `GET /api/health` - Health check

### Authenticated
- `GET /api/cart` - Get cart items
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update item quantity
- `DELETE /api/cart/items/:id` - Remove item from cart
- `DELETE /api/cart` - Clear cart
- `POST /api/orders` - Create order (checkout)
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get order detail
- `POST /api/orders/:id/return` - Return order
- `POST /api/marketplace/listings` - Create listing
- `DELETE /api/marketplace/listings/:id` - Cancel listing
- `POST /api/marketplace/listings/:id/buy` - Buy listing
- `GET /api/auth/me` - Get current user

## Known Issues

(To be populated during testing)
