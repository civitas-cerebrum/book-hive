# BookHive Application Context

## Overview
BookHive is a full-stack bookstore e-commerce application for test automation practice.

## Tech Stack
- **Frontend:** React 18, Vite, React Router 6, Axios
- **Backend:** Spring Boot 3.2.3, Java 17, Spring Data MongoDB
- **Database:** MongoDB 7

## URLs
- Frontend: http://localhost:7547
- Backend: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html

## Test Users
| Email | Password | Balance |
|-------|----------|---------|
| testuser1@bookhive.test | Test1234! | $100.00 |
| testuser2@bookhive.test | Test1234! | $100.00 |

## Pages
| Path | Description | Auth |
|------|-------------|------|
| / | Browse books | No |
| /books/:id | Book detail | No |
| /marketplace | Second-hand listings | No |
| /marketplace/sell | Create listing | Yes |
| /login | Login | No |
| /signup | Signup | No |
| /cart | Shopping cart | Yes |
| /orders | Order history | Yes |
| /orders/:id | Order detail | Yes |
| /profile | User profile | Yes |

## API Endpoints
- POST /api/seed - Seed database
- POST /api/reset - Reset database
- GET /api/health - Health check
- POST /api/auth/login - Login
- POST /api/auth/signup - Signup
- GET /api/books - List books
- GET /api/cart - Get cart
- POST /api/orders - Checkout
- GET /api/marketplace - List listings
