# BookHive Application Context

## Overview
BookHive is a full-stack bookstore e-commerce application with a React frontend and Spring Boot backend. It provides a complete e-commerce experience including book browsing, cart management, checkout, and a peer-to-peer marketplace for selling used books.

## Tech Stack

### Frontend
- **Framework**: React 18.2.0
- **Router**: React Router DOM 6.22.0
- **HTTP Client**: Axios 1.6.7
- **Build Tool**: Vite 5.1.0
- **Port**: 7547

### Backend
- **Framework**: Spring Boot 3.2.3
- **Language**: Java 17
- **Database**: MongoDB 7
- **Authentication**: JWT (jjwt 0.12.5)
- **API Docs**: SpringDoc OpenAPI (Swagger)
- **Port**: 8080

## Application Routes

| Route | Component | Auth Required | Description |
|-------|-----------|---------------|-------------|
| `/` | HomePage | No | Main book catalog with search and genre filter |
| `/books/:id` | BookDetailPage | No | Individual book details with add to cart |
| `/marketplace` | MarketplacePage | No | User-to-user book listings |
| `/login` | LoginPage | No | User login form |
| `/signup` | SignupPage | No | User registration form |
| `/cart` | CartPage | Yes | Shopping cart with quantity management |
| `/orders` | OrdersPage | Yes | Order history list |
| `/orders/:id` | OrderDetailPage | Yes | Individual order details with return option |
| `/marketplace/sell` | CreateListingPage | Yes | Form to create new marketplace listing |
| `/profile` | ProfilePage | Yes | User profile with balance and listings |

## Key Features

### Public Features
- Browse book catalog with pagination (12 books per page)
- Search books by title or author
- Filter by genre (Fiction, Sci-Fi, Non-Fiction, Biography, Fantasy, Mystery)
- View book details (title, author, description, price, stock)
- Browse marketplace listings

### Authenticated Features
- Add to cart from homepage or book detail page
- Manage cart (increase/decrease quantity, remove items, clear cart)
- Checkout and create orders
- View order history
- View order details
- Return orders within 10 minutes of purchase
- Create marketplace listings with book selection, condition, and price
- Cancel active listings
- View/manage profile with balance tracking

## Page Details

### Homepage (`/`)
- **Search bar**: Submit on Enter to search by title/author
- **Genre chips**: Click to filter books by genre
- **Book grid**: Shows 12 books per page with pagination
- **Book cards**: Display title, author, genre badge, price, and "Add to Cart" button (auth only)
- **Pagination**: Previous/Next buttons when multiple pages exist

### Book Detail Page (`/books/:id`)
- Shows full book information including description
- "Add to Cart" button visible only when logged in and book is in stock
- Shows "Out of Stock" indicator when stock is 0
- Shows 404 message for non-existent books

### Login Page (`/login`)
- Email and password fields
- Form validation for required fields
- Error message display for failed login
- Link to signup page

### Signup Page (`/signup`)
- Username, email, and password fields
- Password minimum length: 8 characters
- Error message for duplicate email
- Link to login page

### Cart Page (`/cart`)
- Empty cart message when no items
- Cart item rows with title, price, quantity controls
- Quantity +/- buttons
- Remove individual items
- Clear entire cart button
- Total price display
- Checkout button

### Orders Page (`/orders`)
- Empty orders message when no orders
- Order cards showing order summary
- Click to view order details

### Order Detail Page (`/orders/:id`)
- Order ID (last 8 characters shown)
- Order status badge (COMPLETED or RETURNED)
- Order items with quantities and prices
- Total price
- Return button with countdown timer (10 minute window)
- 404 message for non-existent orders

### Marketplace Page (`/marketplace`)
- No listings message when empty
- Listing cards with book title, condition badge, price
- Buy button (not shown for own listings)

### Create Listing Page (`/marketplace/sell`)
- Book dropdown (loads all books)
- Condition dropdown (NEW, LIKE_NEW, GOOD, FAIR)
- Price input
- Create button

### Profile Page (`/profile`)
- Username and email display
- Balance display
- My Listings section
- Cancel button for active listings

## API Endpoints

### Books
- `GET /api/books` - List books with pagination (page, size, query, genre params)
- `GET /api/books/:id` - Get book details

### Auth
- `POST /api/auth/register` - Register (username, email, password)
- `POST /api/auth/login` - Login (email, password)
- `POST /api/auth/logout` - Logout

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart (bookId)
- `PUT /api/cart/items/:id` - Update item quantity (quantity)
- `DELETE /api/cart/items/:id` - Remove item
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order (checkout)
- `POST /api/orders/:id/return` - Return order

### Marketplace
- `GET /api/marketplace` - List all active listings
- `POST /api/marketplace/listings` - Create listing (bookId, condition, price)
- `POST /api/marketplace/listings/:id/buy` - Buy listing
- `DELETE /api/marketplace/listings/:id` - Cancel listing

### System
- `GET /api/health` - Health check (returns status and db connection)
- `POST /api/seed` - Seed database with sample data

## Test Data

The app uses seeded data with 50 books across genres:
- Book IDs follow pattern: `book-001` through `book-050`
- Genres: Fiction, Sci-Fi, Non-Fiction, Biography, Fantasy, Mystery
- Prices range from $8.99 to $16.99
- Stock varies from 7 to 20 items

## UI Components

### Sidebar (`[data-testid='sidebar']`)
- Logo
- Browse section (All Books, Marketplace)
- Categories section (genre filters)
- Account section (varies by auth state)
  - Logged out: Login, Sign Up
  - Logged in: Balance, Cart, Orders, Sell a Book, Profile, Logout
- Theme toggle

### Common Test IDs
All interactive elements have `data-testid` attributes for reliable test automation.
See `page-repository.json` for complete selector reference.
