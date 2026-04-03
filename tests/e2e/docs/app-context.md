# BookHive Application Context

## Overview
BookHive is an e-commerce platform for buying and selling books. It features a catalog of books, user authentication, shopping cart, checkout, order management, and a peer-to-peer marketplace.

## Tech Stack
- **Frontend:** React 18 + Vite + React Router v6 + Axios
- **Backend:** Spring Boot 3.2.3 + MongoDB + JWT Auth
- **Container:** Docker Compose

## Routes

### Public Routes
- `/` — Home page (browse books)
- `/books/:id` — Book detail page
- `/marketplace` — User-to-user marketplace listings
- `/login` — Login page
- `/signup` — Signup page

### Protected Routes (require authentication)
- `/cart` — Shopping cart
- `/orders` — Order history
- `/orders/:id` — Order detail page
- `/marketplace/sell` — Create a marketplace listing
- `/profile` — User profile page

## Page Documentation

### Sidebar (Global Navigation)
**Purpose:** Persistent navigation sidebar visible on all pages
**Sections:** Browse (All Books, Marketplace), Categories (genre filters), Account (varies by auth state)
**Data fields:** User balance (when logged in), cart badge count
**Actions:** Navigation links, genre filter links, theme toggle, login/signup or logout
**States:**
- Logged out: Shows Login and Sign Up links
- Logged in: Shows Cart, Orders, Sell a Book, Profile, Logout, user balance
**Navigation:** Available on all pages
**Known issues:** None discovered

### HomePage — `/`
**Purpose:** Browse the book catalog with search, filter, and pagination
**Sections:** Search bar, genre filter (chips), book grid, pagination controls
**Data fields:** Book cards showing title, author, genre, price
**Actions:** Search by title/author, filter by genre, navigate between pages, click book to view details
**States:**
- Loading: Shows "Loading..." text
- No results: Shows "No books found" message
- Has results: Shows grid of 12 books per page with pagination
**Navigation:** Reached from sidebar → Links to book detail pages
**Known issues:** None discovered

### LoginPage — `/login`
**Purpose:** Authenticate existing users
**Sections:** Form with email and password fields
**Data fields:** Email input, password input
**Actions:** Submit login form, navigate to signup
**States:**
- Default: Empty form
- Loading: Submit button shows "Signing in..."
- Error: Shows error message
**Navigation:** Reached from sidebar Login link → Links to SignupPage
**Known issues:** None discovered

### SignupPage — `/signup`
**Purpose:** Register new users
**Sections:** Form with username, email, and password fields
**Data fields:** Username input, email input, password input (minLength: 8)
**Actions:** Submit signup form, navigate to login
**States:**
- Default: Empty form
- Loading: Submit button shows "Creating account..."
- Error: Shows error message
**Navigation:** Reached from sidebar Sign Up link → Links to LoginPage
**Known issues:** None discovered

### BookDetailPage — `/books/:id`
**Purpose:** View detailed information about a specific book
**Sections:** Book cover placeholder, book info (title, author, genre, description, price, stock)
**Data fields:** Title, author, genre badge, description, price, stock count
**Actions:** Add to cart (when logged in and in stock)
**States:**
- Loading: Shows "Loading..." text
- Not found: Shows "Book not found" message
- Logged out: No add to cart button visible
- Logged in, in stock: Shows "Add to Cart" button
- Out of stock: Shows "Out of Stock" label
**Navigation:** Reached from HomePage book cards
**Known issues:** None discovered

### CartPage — `/cart`
**Purpose:** View and manage shopping cart, proceed to checkout
**Sections:** Cart items list, total, checkout button
**Data fields:** Item titles, quantities, prices, total
**Actions:** Modify quantities, remove items, clear cart, checkout
**States:**
- Empty: Shows "Your cart is empty"
- Has items: Shows items list with total and checkout button
- Checking out: Checkout button shows "Processing..."
**Navigation:** Reached from sidebar Cart link → After checkout, redirects to order detail page
**Known issues:** None discovered

### OrdersPage — `/orders`
**Purpose:** View order history
**Sections:** Orders list
**Data fields:** Order cards with order info
**Actions:** Click to view order details
**States:**
- Loading: Shows "Loading..."
- No orders: Shows "No orders yet"
- Has orders: Shows order cards
**Navigation:** Reached from sidebar Orders link → Links to individual order detail pages
**Known issues:** None discovered

### OrderDetailPage — `/orders/:id`
**Purpose:** View detailed information about a specific order
**Sections:** Order header (ID, status), items list, total, return section
**Data fields:** Order ID (last 8 chars), status badge, items with quantities and prices, total
**Actions:** Return order (within 10 minutes of purchase)
**States:**
- Loading: Shows "Loading..."
- Not found: Shows "Order not found"
- Completed: Shows return countdown and return button (if within window)
- Returned: Shows "RETURNED" status badge
**Navigation:** Reached from OrdersPage or after checkout
**Known issues:** None discovered

### MarketplacePage — `/marketplace`
**Purpose:** Browse user-to-user book listings
**Sections:** Listings grid
**Data fields:** Listing cards with book title, condition, author, price
**Actions:** Buy listing (when logged in)
**States:**
- Loading: Shows "Loading..."
- No listings: Shows "No listings available"
- Has listings: Shows listing cards
**Navigation:** Reached from sidebar Marketplace link
**Known issues:** None discovered

### CreateListingPage — `/marketplace/sell`
**Purpose:** Create a new marketplace listing
**Sections:** Form with book select, condition select, price input
**Data fields:** Book dropdown, condition dropdown (NEW, LIKE_NEW, GOOD, FAIR), price input
**Actions:** Submit to create listing
**States:**
- Default: Empty form
- Loading: Submit button shows "Creating..."
- Error: Shows error message
**Navigation:** Reached from sidebar "Sell a Book" link → After success, redirects to marketplace
**Known issues:** None discovered

### ProfilePage — `/profile`
**Purpose:** View user profile and manage listings
**Sections:** User info, balance display, my listings section
**Data fields:** Username, email, balance, listing cards
**Actions:** Cancel active listings
**States:**
- No listings: Shows "No active listings"
- Has listings: Shows listing cards with cancel buttons for active ones
**Navigation:** Reached from sidebar Profile link
**Known issues:** None discovered
