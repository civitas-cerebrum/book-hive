# BookHive Application Context

## Overview
BookHive is a book e-commerce platform with React frontend and Spring Boot backend (MongoDB).

## Tech Stack
- **Frontend:** React 18, React Router DOM 6, Axios, Vite
- **Backend:** Spring Boot 3.2.3, MongoDB, Spring Security, JWT
- **Auth:** JWT-based authentication

## Application Routes

### Public Routes
- `/` - HomePage - Browse books with search and genre filtering
- `/books/:id` - BookDetailPage - View book details, add to cart (if authenticated)
- `/marketplace` - MarketplacePage - Browse user listings
- `/login` - LoginPage - User authentication
- `/signup` - SignupPage - User registration

### Protected Routes (require authentication)
- `/cart` - CartPage - Shopping cart with checkout
- `/orders` - OrdersPage - View order history
- `/orders/:id` - OrderDetailPage - View order details, return functionality
- `/marketplace/sell` - CreateListingPage - Create marketplace listings
- `/profile` - ProfilePage - User profile, balance, listings management

## Features
- Book browsing with pagination
- Search functionality
- Genre filtering (Fiction, Sci-Fi, Non-Fiction, Biography, Fantasy, Mystery)
- User authentication (login/signup)
- Shopping cart
- Order placement and return (10-minute window)
- Marketplace for user-to-user book sales
- Dark/Light theme toggle
- User balance system

## Pages Documentation

### HomePage — `/`
**Purpose:** Browse and search books in the catalog.
**Sections:** Search bar, Genre filters, Book grid, Pagination.
**Data fields:** Book cards with title, author, genre badge, price; "Add to Cart" buttons when logged in.
**Actions:** Search books, filter by genre, navigate to book detail, add to cart (if authenticated), pagination.
**States:** Loading state, Empty state ("No books found"), Loaded with 12 books per page.
**Navigation:** Entry point → Links to book detail pages, login, signup, marketplace.

### LoginPage — `/login`
**Purpose:** User authentication.
**Sections:** Login form with email/password fields.
**Data fields:** Email input, Password input.
**Actions:** Submit login form, navigate to signup.
**States:** Default state, Loading ("Signing in..."), Error state with message.
**Navigation:** Reached from sidebar → On success redirects to home.

### SignupPage — `/signup`
**Purpose:** New user registration.
**Sections:** Registration form with username/email/password fields.
**Data fields:** Username input, Email input, Password input (min 8 chars).
**Actions:** Submit signup form, navigate to login.
**States:** Default state, Loading ("Creating account..."), Error state with message.
**Navigation:** Reached from sidebar/login page → On success redirects to home.

### BookDetailPage — `/books/:id`
**Purpose:** View detailed information about a specific book.
**Sections:** Book cover, Book info (title, author, genre, description, price, stock).
**Data fields:** Title, Author, Genre badge, Description, Price ($X.XX), Stock count.
**Actions:** Add to cart (if authenticated and in stock).
**States:** Loading, Not found, Loaded with book data, Out of stock.
**Navigation:** Reached from home page book cards → Back to home via sidebar.

### CartPage — `/cart` (Protected)
**Purpose:** Review cart contents and checkout.
**Sections:** Cart items list, Cart summary with total, Actions.
**Data fields:** Item name, quantity, price, total.
**Actions:** Increase/decrease quantity, remove item, clear cart, checkout.
**States:** Empty cart, Cart with items, Processing checkout.
**Navigation:** Reached from sidebar → On checkout redirects to order detail.

### OrdersPage — `/orders` (Protected)
**Purpose:** View order history.
**Sections:** Orders list.
**Data fields:** Order cards with ID, date, status, total.
**Actions:** Click to view order details.
**States:** Loading, No orders, Orders list.
**Navigation:** Reached from sidebar → Links to order detail pages.

### OrderDetailPage — `/orders/:id` (Protected)
**Purpose:** View specific order details with return option.
**Sections:** Order header (ID, status), Items list, Total, Return section.
**Data fields:** Order ID, Status (COMPLETED/RETURNED), Items with quantity and price, Total, Return countdown.
**Actions:** Return order (within 10 minutes of purchase).
**States:** Loading, Not found, Completed with return option, Returned.
**Navigation:** Reached from orders page.

### MarketplacePage — `/marketplace`
**Purpose:** Browse user-to-user book listings.
**Sections:** Listings grid.
**Data fields:** Listing cards with book title, seller, condition, price.
**Actions:** Buy listing (if authenticated).
**States:** Loading, No listings available, Listings grid.
**Navigation:** Reached from sidebar → Links to buy actions.

### CreateListingPage — `/marketplace/sell` (Protected)
**Purpose:** Create a new marketplace listing.
**Sections:** Create listing form.
**Data fields:** Book dropdown (all books), Condition dropdown (NEW/LIKE_NEW/GOOD/FAIR), Price input.
**Actions:** Submit listing.
**States:** Default form, Loading ("Creating..."), Error state.
**Navigation:** Reached from sidebar → On success redirects to marketplace.

### ProfilePage — `/profile` (Protected)
**Purpose:** View user profile and manage listings.
**Sections:** User info, Balance display, My listings.
**Data fields:** Username, Email, Balance ($X.XX), Listing cards.
**Actions:** Cancel active listings.
**States:** Profile with no listings, Profile with listings.
**Navigation:** Reached from sidebar.

## Sidebar Navigation
- **Browse section:** All Books, Marketplace
- **Categories section:** Fiction, Sci-Fi, Non-Fiction, Biography, Fantasy, Mystery (genre filters)
- **Account section (logged out):** Login, Sign Up
- **Account section (logged in):** Balance display, Cart (with badge), Orders, Sell a Book, Profile, Logout
- **Theme toggle:** Light/Dark mode switch

## Known Issues
(To be documented during testing)
