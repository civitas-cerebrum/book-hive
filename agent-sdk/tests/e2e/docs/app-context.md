# BookHive Application Context

## Overview
BookHive is an online bookstore application with the following features:
- Browse and search books
- View book details
- Shopping cart functionality
- User authentication (login/signup)
- Checkout process
- Marketplace for used books
- Order history
- User profile

## Tech Stack
- **Frontend**: React SPA (Vite bundler)
- **Backend API**: REST API on port 8080
- **Frontend URL**: http://localhost:7547
- **Database**: Connected (per health check)

## API Endpoints Discovered
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check - returns `{"db":"connected","status":"healthy"}` |
| `/api/books` | GET | Paginated list of books (12 per page, 50 total, 5 pages) |
| `/api/categories` | GET | Book categories |

## Pages Discovered

| Page | URL | Purpose | Key Elements |
|------|-----|---------|--------------|
| Home/Books | `/` | Browse all books with pagination | Search, Book grid, Pagination |
| Book Detail | `/books/:id` | View single book details | Title, Author, Price, Stock, Add to Cart |
| Cart | `/cart` | Shopping cart management | Items, Quantity, Total, Checkout |
| Login | `/login` | User authentication | Email, Password, Sign In |
| Signup | `/signup` | New user registration | Username, Email, Password |
| Marketplace | `/marketplace` | Used book marketplace | Listings |
| Sell a Book | `/marketplace/sell` | Create marketplace listing | (Auth required) |
| Orders | `/orders` | Order history | (Auth required) |
| Profile | `/profile` | User profile | (Auth required) |
| Genre Filter | `/?genre=X` | Filter books by genre | Fiction, Sci-Fi, Non-Fiction, Biography, Fantasy, Mystery |

## User Flows

### 1. Browse Books (Guest)
- Navigate to `/` (homepage)
- View book grid with 12 books per page
- Use pagination (Previous/Next) to navigate pages
- Click genre links to filter (Fiction, Sci-Fi, etc.)
- Use search input to search by title/author

### 2. View Book Detail
- Click on any book card
- View full details: title, author, genre, description, price, stock
- Click "Add to Cart" to add item

### 3. Shopping Cart
- View cart at `/cart`
- See items with price, quantity controls (+/-)
- Remove individual items
- Clear entire cart
- View total
- Click Checkout to proceed

### 4. Authentication
- **Login** (`/login`): Email + Password -> Sign In
- **Signup** (`/signup`): Username + Email + Password -> Create Account
- After login: Nav shows Balance, Cart, Orders, Sell a Book, Profile, Logout

### 5. Authenticated Features
- **Balance**: Display shows user balance ($0.00 by default)
- **Orders**: View order history at `/orders`
- **Profile**: View/edit profile at `/profile`
- **Sell a Book**: Create listings at `/marketplace/sell`

## UI Components

### Navigation (All pages)
- Logo: "BookHive"
- Browse: All Books, Marketplace
- Categories: Fiction, Sci-Fi, Non-Fiction, Biography, Fantasy, Mystery
- Account section:
  - Guest: Login, Sign Up
  - Authenticated: Balance, Cart (with count), Orders, Sell a Book, Profile, Logout
- Theme toggle button (light/dark)

### Book Card
- Book icon emoji
- Genre badge
- Title
- Author
- Price
- "Add to Cart" button (when authenticated)

### Pagination
- Previous button (disabled on page 1)
- Page indicator (e.g., "1 / 5")
- Next button (disabled on last page)

## Test Credentials
- Email: test@example.com (already registered per error message)
- Test password: testpassword123

## Notes
- Application uses emoji placeholder book covers
- Prices appear to have markup (API shows $12.99, UI shows $14.29 for same book)
- Cart persists across page navigation
- Dark/light theme toggle available
