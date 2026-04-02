# BookHive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack bookstore e-commerce test automation target with React frontend, Spring Boot backend, and MongoDB, containerized via docker-compose.

**Architecture:** Monorepo with `frontend/` (React 18 + Vite → Nginx) and `backend/` (Spring Boot 3 + Gradle → JDK) as sibling directories. Three docker-compose services: frontend, backend, mongodb. All API endpoints documented via Swagger. Every UI element carries `data-testid`.

**Tech Stack:** React 18, Vite, React Router, Axios, CSS Modules | Spring Boot 3, Java 17, Spring Data MongoDB, Spring Security (JWT), SpringDoc OpenAPI, Gradle | MongoDB 7, Docker, docker-compose

**Spec:** `docs/superpowers/specs/2026-03-26-bookhive-bookstore-design.md`

---

## File Structure

### Backend (`backend/`)

```
backend/
├── build.gradle
├── settings.gradle
├── Dockerfile
├── src/main/java/com/bookhive/
│   ├── BookHiveApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java          # Spring Security, JWT filter, CORS
│   │   ├── SwaggerConfig.java           # SpringDoc OpenAPI config
│   │   └── WebConfig.java               # Response timing header
│   ├── security/
│   │   ├── JwtUtil.java                 # JWT create/validate/parse
│   │   ├── JwtAuthFilter.java           # OncePerRequestFilter for JWT
│   │   └── UserPrincipal.java           # Authentication principal
│   ├── model/
│   │   ├── User.java                    # @Document
│   │   ├── Book.java                    # @Document
│   │   ├── CartItem.java                # @Document
│   │   ├── Order.java                   # @Document with embedded OrderItem
│   │   ├── OrderItem.java               # Embedded in Order
│   │   └── MarketplaceListing.java      # @Document
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── BookRepository.java
│   │   ├── CartItemRepository.java
│   │   ├── OrderRepository.java
│   │   └── MarketplaceListingRepository.java
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── BookService.java
│   │   ├── CartService.java
│   │   ├── OrderService.java
│   │   ├── MarketplaceService.java
│   │   └── SeedService.java
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── BookController.java
│   │   ├── CartController.java
│   │   ├── OrderController.java
│   │   ├── MarketplaceController.java
│   │   └── AdminController.java         # seed, reset, health
│   └── dto/
│       ├── SignupRequest.java
│       ├── LoginRequest.java
│       ├── AuthResponse.java
│       ├── CartItemRequest.java
│       ├── ListingRequest.java
│       └── ErrorResponse.java
├── src/main/resources/
│   └── application.yml
└── src/test/java/com/bookhive/
    ├── service/
    │   ├── AuthServiceTest.java
    │   ├── BookServiceTest.java
    │   ├── CartServiceTest.java
    │   ├── OrderServiceTest.java
    │   └── MarketplaceServiceTest.java
    └── controller/
        ├── AuthControllerTest.java
        ├── BookControllerTest.java
        ├── CartControllerTest.java
        ├── OrderControllerTest.java
        ├── MarketplaceControllerTest.java
        └── AdminControllerTest.java
```

### Frontend (`frontend/`)

```
frontend/
├── package.json
├── vite.config.js
├── index.html
├── Dockerfile
├── nginx.conf
├── src/
│   ├── main.jsx
│   ├── App.jsx                         # Router setup
│   ├── styles/
│   │   ├── variables.css               # CSS custom properties (themes)
│   │   ├── global.css                  # Reset, base styles
│   │   └── layout.module.css           # Sidebar + main layout
│   ├── context/
│   │   ├── AuthContext.jsx             # JWT state, login/logout/signup
│   │   ├── CartContext.jsx             # Cart state, add/remove/clear
│   │   └── ThemeContext.jsx            # Dark/light toggle, localStorage
│   ├── services/
│   │   └── api.js                      # Axios instance, interceptors
│   ├── components/
│   │   ├── Sidebar.jsx                 # Navigation sidebar
│   │   ├── Sidebar.module.css
│   │   ├── TopBar.jsx                  # Mobile top bar
│   │   ├── TopBar.module.css
│   │   ├── BookCard.jsx                # Book grid card
│   │   ├── BookCard.module.css
│   │   ├── SearchBar.jsx               # Search input
│   │   ├── SearchBar.module.css
│   │   ├── GenreFilter.jsx             # Genre chips/sidebar links
│   │   ├── GenreFilter.module.css
│   │   ├── CartItemRow.jsx             # Cart item with quantity controls
│   │   ├── CartItemRow.module.css
│   │   ├── OrderCard.jsx               # Order summary card
│   │   ├── OrderCard.module.css
│   │   ├── ListingCard.jsx             # Marketplace listing
│   │   ├── ListingCard.module.css
│   │   ├── ReturnCountdown.jsx         # 10-min countdown timer
│   │   ├── ReturnCountdown.module.css
│   │   ├── ProtectedRoute.jsx          # Auth guard
│   │   └── ThemeToggle.jsx             # Dark/light switch
│   └── pages/
│       ├── HomePage.jsx                # Book catalog
│       ├── HomePage.module.css
│       ├── BookDetailPage.jsx
│       ├── BookDetailPage.module.css
│       ├── LoginPage.jsx
│       ├── LoginPage.module.css
│       ├── SignupPage.jsx
│       ├── SignupPage.module.css
│       ├── CartPage.jsx
│       ├── CartPage.module.css
│       ├── OrdersPage.jsx
│       ├── OrdersPage.module.css
│       ├── OrderDetailPage.jsx
│       ├── OrderDetailPage.module.css
│       ├── MarketplacePage.jsx
│       ├── MarketplacePage.module.css
│       ├── CreateListingPage.jsx
│       ├── CreateListingPage.module.css
│       ├── ProfilePage.jsx
│       └── ProfilePage.module.css
```

### Root

```
BookHive/
├── docker-compose.yml
├── .gitignore
├── seed-data/
│   └── books.json                      # ~50 books fixture
├── frontend/
├── backend/
└── docs/
```

---

## Task 1: Project Scaffolding & Infrastructure

**Files:**
- Create: `docker-compose.yml`
- Create: `.gitignore`
- Create: `seed-data/books.json`
- Create: `backend/build.gradle`
- Create: `backend/settings.gradle`
- Create: `backend/Dockerfile`
- Create: `backend/src/main/resources/application.yml`
- Create: `backend/src/main/java/com/bookhive/BookHiveApplication.java`
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/index.html`
- Create: `frontend/Dockerfile`
- Create: `frontend/nginx.conf`
- Create: `frontend/src/main.jsx`

- [ ] **Step 1: Create root `.gitignore`**

```gitignore
# Java
backend/build/
backend/.gradle/
*.class
*.jar

# Node
frontend/node_modules/
frontend/dist/

# IDE
.idea/
.vscode/
*.iml

# OS
.DS_Store
Thumbs.db

# Docker
mongo-data/

# Superpowers
.superpowers/
```

- [ ] **Step 2: Create `seed-data/books.json`**

JSON array of ~50 books with fixed fields: id, title, author, genre, description, price, coverImage, stock, isbn. Genres: Fiction, Sci-Fi, Non-Fiction, Biography, Fantasy, Mystery. Use placeholder cover images. Stock between 5-20. Prices between $5.99-$29.99.

Example structure:
```json
[
  {
    "id": "book-001",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "genre": "Fiction",
    "description": "A novel about the American Dream set in the Jazz Age.",
    "price": 12.99,
    "coverImage": "/covers/placeholder-fiction.svg",
    "stock": 15,
    "isbn": "978-0-7432-7356-5"
  }
]
```

Include 8-9 books per genre across 6 genres. Use real book titles/authors for realistic test data.

- [ ] **Step 3: Create `backend/settings.gradle`**

```groovy
rootProject.name = 'bookhive'
```

- [ ] **Step 4: Create `backend/build.gradle`**

```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.2.3'
    id 'io.spring.dependency-management' version '1.1.4'
}

group = 'com.bookhive'
version = '1.0.0'

java {
    sourceCompatibility = '17'
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-mongodb'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0'
    implementation 'io.jsonwebtoken:jjwt-api:0.12.5'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.5'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.5'
    implementation 'com.fasterxml.jackson.core:jackson-databind'

    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.security:spring-security-test'
    testImplementation 'de.flapdoodle.embed:de.flapdoodle.embed.mongo.spring3x:4.11.0'
}

tasks.named('test') {
    useJUnitPlatform()
}
```

- [ ] **Step 5: Create `backend/src/main/resources/application.yml`**

```yaml
spring:
  data:
    mongodb:
      uri: ${SPRING_DATA_MONGODB_URI:mongodb://localhost:27017/bookhive}

jwt:
  secret: ${JWT_SECRET:test-secret-key-for-development-only}
  expiration: 86400000  # 24 hours

server:
  port: 8080

springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    tags-sorter: alpha
    operations-sorter: alpha
```

- [ ] **Step 6: Create `backend/src/main/java/com/bookhive/BookHiveApplication.java`**

```java
package com.bookhive;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BookHiveApplication {
    public static void main(String[] args) {
        SpringApplication.run(BookHiveApplication.class, args);
    }
}
```

- [ ] **Step 7: Create `backend/Dockerfile`**

```dockerfile
FROM gradle:8.6-jdk17 AS build
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY src ./src
RUN gradle bootJar --no-daemon

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

- [ ] **Step 8: Create `frontend/package.json`**

```json
{
  "name": "bookhive-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "axios": "^1.6.7"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.1.0"
  }
}
```

- [ ] **Step 9: Create `frontend/vite.config.js`**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 10: Create `frontend/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BookHive</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 11: Create `frontend/src/main.jsx`**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/variables.css';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 12: Create `frontend/nginx.conf`**

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /swagger-ui/ {
        proxy_pass http://backend:8080/swagger-ui/;
        proxy_set_header Host $host;
    }

    location /api-docs {
        proxy_pass http://backend:8080/api-docs;
        proxy_set_header Host $host;
    }
}
```

- [ ] **Step 13: Create `frontend/Dockerfile`**

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

- [ ] **Step 14: Create `docker-compose.yml`**

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      - mongodb
    environment:
      SPRING_DATA_MONGODB_URI: mongodb://mongodb:27017/bookhive
      JWT_SECRET: test-secret-key-for-development

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

- [ ] **Step 15: Commit**

```bash
git add .gitignore seed-data/ backend/build.gradle backend/settings.gradle backend/Dockerfile backend/src/main/resources/application.yml backend/src/main/java/com/bookhive/BookHiveApplication.java frontend/package.json frontend/vite.config.js frontend/index.html frontend/Dockerfile frontend/nginx.conf frontend/src/main.jsx docker-compose.yml
git commit -m "feat: scaffold project with backend, frontend, and docker-compose"
```

---

## Task 2: Backend — Models & Repositories

**Files:**
- Create: `backend/src/main/java/com/bookhive/model/User.java`
- Create: `backend/src/main/java/com/bookhive/model/Book.java`
- Create: `backend/src/main/java/com/bookhive/model/CartItem.java`
- Create: `backend/src/main/java/com/bookhive/model/OrderItem.java`
- Create: `backend/src/main/java/com/bookhive/model/Order.java`
- Create: `backend/src/main/java/com/bookhive/model/MarketplaceListing.java`
- Create: `backend/src/main/java/com/bookhive/repository/UserRepository.java`
- Create: `backend/src/main/java/com/bookhive/repository/BookRepository.java`
- Create: `backend/src/main/java/com/bookhive/repository/CartItemRepository.java`
- Create: `backend/src/main/java/com/bookhive/repository/OrderRepository.java`
- Create: `backend/src/main/java/com/bookhive/repository/MarketplaceListingRepository.java`

- [ ] **Step 1: Create `User.java`**

```java
package com.bookhive.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.Instant;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    @Indexed(unique = true)
    private String username;
    @Indexed(unique = true)
    private String email;
    private String password;
    private Instant createdAt;

    public User() {}

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.createdAt = Instant.now();
    }

    // Getters and setters for all fields
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
```

- [ ] **Step 2: Create `Book.java`**

```java
package com.bookhive.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

@Document(collection = "books")
public class Book {
    @Id
    private String id;
    private String title;
    private String author;
    private String genre;
    private String description;
    private double price;
    private String coverImage;
    private int stock;
    @Indexed(unique = true)
    private String isbn;

    public Book() {}

    // Getters and setters for all fields
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }
}
```

- [ ] **Step 3: Create `CartItem.java`**

```java
package com.bookhive.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "cart_items")
public class CartItem {
    @Id
    private String id;
    private String userId;
    private String bookId;
    private int quantity;
    private Instant addedAt;

    public CartItem() {}

    public CartItem(String userId, String bookId, int quantity) {
        this.userId = userId;
        this.bookId = bookId;
        this.quantity = quantity;
        this.addedAt = Instant.now();
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public Instant getAddedAt() { return addedAt; }
    public void setAddedAt(Instant addedAt) { this.addedAt = addedAt; }
}
```

- [ ] **Step 4: Create `OrderItem.java` and `Order.java`**

```java
// OrderItem.java
package com.bookhive.model;

public class OrderItem {
    private String bookId;
    private int quantity;
    private double priceAtPurchase;

    public OrderItem() {}

    public OrderItem(String bookId, int quantity, double priceAtPurchase) {
        this.bookId = bookId;
        this.quantity = quantity;
        this.priceAtPurchase = priceAtPurchase;
    }

    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public double getPriceAtPurchase() { return priceAtPurchase; }
    public void setPriceAtPurchase(double priceAtPurchase) { this.priceAtPurchase = priceAtPurchase; }
}
```

```java
// Order.java
package com.bookhive.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.List;

@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    private String userId;
    private List<OrderItem> items;
    private double totalPrice;
    private String status; // COMPLETED, RETURNED
    private Instant purchasedAt;

    public Order() {}

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
    public double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getPurchasedAt() { return purchasedAt; }
    public void setPurchasedAt(Instant purchasedAt) { this.purchasedAt = purchasedAt; }

    public boolean isReturnEligible() {
        return "COMPLETED".equals(status) &&
               purchasedAt.plusSeconds(600).isAfter(Instant.now());
    }
}
```

- [ ] **Step 5: Create `MarketplaceListing.java`**

```java
package com.bookhive.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "marketplace_listings")
public class MarketplaceListing {
    @Id
    private String id;
    private String sellerId;
    private String bookId;
    private String condition; // NEW, LIKE_NEW, GOOD, FAIR
    private double price;
    private Instant listedAt;
    private String status; // ACTIVE, SOLD, CANCELLED

    public MarketplaceListing() {}

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }
    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }
    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public Instant getListedAt() { return listedAt; }
    public void setListedAt(Instant listedAt) { this.listedAt = listedAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
```

- [ ] **Step 6: Create all repositories**

```java
// UserRepository.java
package com.bookhive.repository;

import com.bookhive.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
```

```java
// BookRepository.java
package com.bookhive.repository;

import com.bookhive.model.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface BookRepository extends MongoRepository<Book, String> {
    List<Book> findByGenre(String genre);
    Page<Book> findByGenre(String genre, Pageable pageable);
    @Query("{'$or': [{'title': {$regex: ?0, $options: 'i'}}, {'author': {$regex: ?0, $options: 'i'}}]}")
    Page<Book> searchByTitleOrAuthor(String query, Pageable pageable);
}
```

```java
// CartItemRepository.java
package com.bookhive.repository;

import com.bookhive.model.CartItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends MongoRepository<CartItem, String> {
    List<CartItem> findByUserId(String userId);
    Optional<CartItem> findByUserIdAndBookId(String userId, String bookId);
    void deleteByUserId(String userId);
}
```

```java
// OrderRepository.java
package com.bookhive.repository;

import com.bookhive.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByUserIdOrderByPurchasedAtDesc(String userId);
}
```

```java
// MarketplaceListingRepository.java
package com.bookhive.repository;

import com.bookhive.model.MarketplaceListing;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MarketplaceListingRepository extends MongoRepository<MarketplaceListing, String> {
    List<MarketplaceListing> findByStatus(String status);
    List<MarketplaceListing> findBySellerId(String sellerId);
}
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/com/bookhive/model/ backend/src/main/java/com/bookhive/repository/
git commit -m "feat: add MongoDB document models and Spring Data repositories"
```

---

## Task 3: Backend — Security (JWT + Config)

**Files:**
- Create: `backend/src/main/java/com/bookhive/security/JwtUtil.java`
- Create: `backend/src/main/java/com/bookhive/security/JwtAuthFilter.java`
- Create: `backend/src/main/java/com/bookhive/security/UserPrincipal.java`
- Create: `backend/src/main/java/com/bookhive/config/SecurityConfig.java`
- Create: `backend/src/main/java/com/bookhive/config/SwaggerConfig.java`
- Create: `backend/src/main/java/com/bookhive/config/WebConfig.java`

- [ ] **Step 1: Create `JwtUtil.java`**

```java
package com.bookhive.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
    private final SecretKey key;
    private final long expiration;

    public JwtUtil(@Value("${jwt.secret}") String secret,
                   @Value("${jwt.expiration}") long expiration) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
    }

    public String generateToken(String userId, String email) {
        return Jwts.builder()
                .subject(userId)
                .claim("email", email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();
    }

    public String getUserId(String token) {
        return parseToken(token).getSubject();
    }

    public boolean isValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
```

- [ ] **Step 2: Create `UserPrincipal.java`**

```java
package com.bookhive.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {
    private final String id;
    private final String email;

    public UserPrincipal(String id, String email) {
        this.id = id;
        this.email = email;
    }

    public String getId() { return id; }
    public String getEmail() { return email; }

    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return Collections.emptyList(); }
    @Override public String getPassword() { return null; }
    @Override public String getUsername() { return email; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
```

- [ ] **Step 3: Create `JwtAuthFilter.java`**

Reads JWT from `Authorization: Bearer <token>` header OR from `bookhive_token` HttpOnly cookie. Sets SecurityContext if valid.

```java
package com.bookhive.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String token = extractToken(request);
        if (token != null && jwtUtil.isValid(token)) {
            Claims claims = jwtUtil.parseToken(token);
            UserPrincipal principal = new UserPrincipal(
                claims.getSubject(), claims.get("email", String.class));
            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, Collections.emptyList());
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        chain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("bookhive_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
```

- [ ] **Step 4: Create `SecurityConfig.java`**

```java
package com.bookhive.config;

import com.bookhive.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(request -> {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOriginPatterns(List.of("*"));
                config.setAllowedMethods(List.of("*"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(true);
                return config;
            }))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/signup", "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/books", "/api/books/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/marketplace").permitAll()
                .requestMatchers("/api/seed", "/api/reset", "/api/health").permitAll()
                .requestMatchers("/swagger-ui/**", "/api-docs/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

- [ ] **Step 5: Create `SwaggerConfig.java`**

```java
package com.bookhive.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("BookHive API")
                .version("1.0")
                .description("Bookstore test automation target API"))
            .addSecurityItem(new SecurityRequirement().addList("Bearer"))
            .schemaRequirement("Bearer", new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT"));
    }
}
```

- [ ] **Step 6: Create `WebConfig.java`**

Adds response timing header for performance assertions.

```java
package com.bookhive.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.io.IOException;

@Configuration
public class WebConfig {
    @Bean
    public Filter timingFilter() {
        return (ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException -> {
            long start = System.currentTimeMillis();
            chain.doFilter(request, response);
            long duration = System.currentTimeMillis() - start;
            ((HttpServletResponse) response).setHeader("X-Response-Time", duration + "ms");
        };
    }
}
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/com/bookhive/security/ backend/src/main/java/com/bookhive/config/
git commit -m "feat: add JWT security, CORS, Swagger, and timing filter"
```

---

## Task 4: Backend — DTOs & Auth Service/Controller

**Files:**
- Create: `backend/src/main/java/com/bookhive/dto/SignupRequest.java`
- Create: `backend/src/main/java/com/bookhive/dto/LoginRequest.java`
- Create: `backend/src/main/java/com/bookhive/dto/AuthResponse.java`
- Create: `backend/src/main/java/com/bookhive/dto/ErrorResponse.java`
- Create: `backend/src/main/java/com/bookhive/service/AuthService.java`
- Create: `backend/src/main/java/com/bookhive/controller/AuthController.java`
- Create: `backend/src/test/java/com/bookhive/service/AuthServiceTest.java`
- Create: `backend/src/test/java/com/bookhive/controller/AuthControllerTest.java`

- [ ] **Step 1: Create DTOs**

```java
// SignupRequest.java
package com.bookhive.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(
    @NotBlank String username,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 6) String password
) {}
```

```java
// LoginRequest.java
package com.bookhive.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank @Email String email,
    @NotBlank String password
) {}
```

```java
// AuthResponse.java
package com.bookhive.dto;

public record AuthResponse(String token, String userId, String username, String email) {}
```

```java
// ErrorResponse.java
package com.bookhive.dto;

public record ErrorResponse(String error, String message) {}
```

- [ ] **Step 2: Write failing test for AuthService**

```java
// AuthServiceTest.java
package com.bookhive.service;

import com.bookhive.dto.LoginRequest;
import com.bookhive.dto.SignupRequest;
import com.bookhive.model.User;
import com.bookhive.repository.UserRepository;
import com.bookhive.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AuthServiceTest {
    @Autowired private AuthService authService;
    @Autowired private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void signup_createsUser() {
        var request = new SignupRequest("testuser", "test@example.com", "password123");
        var response = authService.signup(request);
        assertNotNull(response.token());
        assertEquals("testuser", response.username());
        assertEquals("test@example.com", response.email());
    }

    @Test
    void signup_duplicateEmail_throws() {
        var request = new SignupRequest("user1", "test@example.com", "password123");
        authService.signup(request);
        assertThrows(IllegalArgumentException.class, () ->
            authService.signup(new SignupRequest("user2", "test@example.com", "password456")));
    }

    @Test
    void login_validCredentials_returnsToken() {
        authService.signup(new SignupRequest("testuser", "test@example.com", "password123"));
        var response = authService.login(new LoginRequest("test@example.com", "password123"));
        assertNotNull(response.token());
        assertEquals("testuser", response.username());
    }

    @Test
    void login_wrongPassword_throws() {
        authService.signup(new SignupRequest("testuser", "test@example.com", "password123"));
        assertThrows(IllegalArgumentException.class, () ->
            authService.login(new LoginRequest("test@example.com", "wrongpassword")));
    }
}
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd backend && ./gradlew test --tests "com.bookhive.service.AuthServiceTest" -i`
Expected: FAIL — AuthService class not found

- [ ] **Step 4: Implement `AuthService.java`**

```java
package com.bookhive.service;

import com.bookhive.dto.AuthResponse;
import com.bookhive.dto.LoginRequest;
import com.bookhive.dto.SignupRequest;
import com.bookhive.model.User;
import com.bookhive.repository.UserRepository;
import com.bookhive.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already taken");
        }
        User user = new User(request.username(), request.email(),
                             passwordEncoder.encode(request.password()));
        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail());
    }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && ./gradlew test --tests "com.bookhive.service.AuthServiceTest" -i`
Expected: ALL PASS

- [ ] **Step 6: Create `AuthController.java`**

```java
package com.bookhive.controller;

import com.bookhive.dto.AuthResponse;
import com.bookhive.dto.ErrorResponse;
import com.bookhive.dto.LoginRequest;
import com.bookhive.dto.SignupRequest;
import com.bookhive.model.User;
import com.bookhive.repository.UserRepository;
import com.bookhive.security.UserPrincipal;
import com.bookhive.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Authentication endpoints")
public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/signup")
    @Operation(summary = "Register a new user")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request,
                                    HttpServletResponse response) {
        try {
            AuthResponse auth = authService.signup(request);
            addTokenCookie(response, auth.token());
            return ResponseEntity.ok(auth);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("signup_failed", e.getMessage()));
        }
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
                                   HttpServletResponse response) {
        try {
            AuthResponse auth = authService.login(request);
            addTokenCookie(response, auth.token());
            return ResponseEntity.ok(auth);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(new ErrorResponse("login_failed", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout (clears session cookie)")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("bookhive_token", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserPrincipal principal) {
        return userRepository.findById(principal.getId())
            .map(user -> ResponseEntity.ok(new AuthResponse(null, user.getId(),
                user.getUsername(), user.getEmail())))
            .orElse(ResponseEntity.notFound().build());
    }

    private void addTokenCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("bookhive_token", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(86400);
        response.addCookie(cookie);
    }
}
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/com/bookhive/dto/ backend/src/main/java/com/bookhive/service/AuthService.java backend/src/main/java/com/bookhive/controller/AuthController.java backend/src/test/java/com/bookhive/service/AuthServiceTest.java
git commit -m "feat: add auth service with signup, login, logout, and JWT cookie support"
```

---

## Task 5: Backend — Book Service, Seed Service & Admin Controller

**Files:**
- Create: `backend/src/main/java/com/bookhive/service/BookService.java`
- Create: `backend/src/main/java/com/bookhive/service/SeedService.java`
- Create: `backend/src/main/java/com/bookhive/controller/BookController.java`
- Create: `backend/src/main/java/com/bookhive/controller/AdminController.java`
- Create: `backend/src/test/java/com/bookhive/service/BookServiceTest.java`
- Create: `backend/src/test/java/com/bookhive/controller/AdminControllerTest.java`

- [ ] **Step 1: Write failing test for BookService**

```java
package com.bookhive.service;

import com.bookhive.model.Book;
import com.bookhive.repository.BookRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class BookServiceTest {
    @Autowired private BookService bookService;
    @Autowired private BookRepository bookRepository;

    @BeforeEach
    void setUp() {
        bookRepository.deleteAll();
        Book book = new Book();
        book.setId("book-001");
        book.setTitle("Test Book");
        book.setAuthor("Test Author");
        book.setGenre("Fiction");
        book.setPrice(9.99);
        book.setStock(10);
        book.setIsbn("978-0-0000-0001-0");
        bookRepository.save(book);
    }

    @Test
    void findAll_returnsPage() {
        Page<Book> page = bookService.findAll(null, null, 0, 10);
        assertEquals(1, page.getTotalElements());
    }

    @Test
    void findAll_filterByGenre() {
        Page<Book> page = bookService.findAll(null, "Fiction", 0, 10);
        assertEquals(1, page.getTotalElements());
        Page<Book> empty = bookService.findAll(null, "Sci-Fi", 0, 10);
        assertEquals(0, empty.getTotalElements());
    }

    @Test
    void findAll_searchByQuery() {
        Page<Book> page = bookService.findAll("Test", null, 0, 10);
        assertEquals(1, page.getTotalElements());
    }

    @Test
    void findById_exists() {
        var book = bookService.findById("book-001");
        assertTrue(book.isPresent());
        assertEquals("Test Book", book.get().getTitle());
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && ./gradlew test --tests "com.bookhive.service.BookServiceTest" -i`
Expected: FAIL — BookService not found

- [ ] **Step 3: Implement `BookService.java`**

```java
package com.bookhive.service;

import com.bookhive.model.Book;
import com.bookhive.repository.BookRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class BookService {
    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public Page<Book> findAll(String query, String genre, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        if (query != null && !query.isBlank()) {
            return bookRepository.searchByTitleOrAuthor(query, pageable);
        }
        if (genre != null && !genre.isBlank()) {
            return bookRepository.findByGenre(genre, pageable);
        }
        return bookRepository.findAll(pageable);
    }

    public Optional<Book> findById(String id) {
        return bookRepository.findById(id);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && ./gradlew test --tests "com.bookhive.service.BookServiceTest" -i`
Expected: ALL PASS

- [ ] **Step 5: Implement `SeedService.java`**

Reads `seed-data/books.json` from classpath (copy to resources) or loads from hardcoded data. Seeds 2 test users.

```java
package com.bookhive.service;

import com.bookhive.model.Book;
import com.bookhive.model.User;
import com.bookhive.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.util.List;

@Service
public class SeedService {
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final MarketplaceListingRepository listingRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    public SeedService(BookRepository bookRepository, UserRepository userRepository,
                       CartItemRepository cartItemRepository, OrderRepository orderRepository,
                       MarketplaceListingRepository listingRepository,
                       PasswordEncoder passwordEncoder, ObjectMapper objectMapper) {
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.listingRepository = listingRepository;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
    }

    public void seed() {
        if (bookRepository.count() > 0) return; // already seeded
        seedBooks();
        seedUsers();
    }

    public void reset() {
        bookRepository.deleteAll();
        userRepository.deleteAll();
        cartItemRepository.deleteAll();
        orderRepository.deleteAll();
        listingRepository.deleteAll();
        seedBooks();
        seedUsers();
    }

    private void seedBooks() {
        try {
            var resource = new ClassPathResource("books.json");
            List<Book> books = objectMapper.readValue(
                resource.getInputStream(), new TypeReference<>() {});
            bookRepository.saveAll(books);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load seed data", e);
        }
    }

    private void seedUsers() {
        String encoded = passwordEncoder.encode("Test1234!");
        User user1 = new User("testuser1", "testuser1@bookhive.test", encoded);
        User user2 = new User("testuser2", "testuser2@bookhive.test", encoded);
        userRepository.save(user1);
        userRepository.save(user2);
    }
}
```

Note: Copy `seed-data/books.json` to `backend/src/main/resources/books.json` as well, so it's available on classpath.

- [ ] **Step 6: Create `BookController.java`**

```java
package com.bookhive.controller;

import com.bookhive.model.Book;
import com.bookhive.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/books")
@Tag(name = "Books", description = "Book catalog endpoints")
public class BookController {
    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    @Operation(summary = "List/search books with pagination")
    public Page<Book> findAll(@RequestParam(required = false) String query,
                              @RequestParam(required = false) String genre,
                              @RequestParam(defaultValue = "0") int page,
                              @RequestParam(defaultValue = "12") int size) {
        return bookService.findAll(query, genre, page, size);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get book details by ID")
    public ResponseEntity<Book> findById(@PathVariable String id) {
        return bookService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
```

- [ ] **Step 7: Create `AdminController.java`**

```java
package com.bookhive.controller;

import com.bookhive.service.SeedService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Admin", description = "Test helper endpoints")
public class AdminController {
    private final SeedService seedService;
    private final MongoTemplate mongoTemplate;

    public AdminController(SeedService seedService, MongoTemplate mongoTemplate) {
        this.seedService = seedService;
        this.mongoTemplate = mongoTemplate;
    }

    @PostMapping("/seed")
    @Operation(summary = "Seed database with test data")
    public ResponseEntity<?> seed() {
        seedService.seed();
        return ResponseEntity.ok(Map.of("status", "seeded"));
    }

    @PostMapping("/reset")
    @Operation(summary = "Reset database and re-seed")
    public ResponseEntity<?> reset() {
        seedService.reset();
        return ResponseEntity.ok(Map.of("status", "reset"));
    }

    @GetMapping("/health")
    @Operation(summary = "Health check")
    public ResponseEntity<?> health() {
        try {
            mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
            return ResponseEntity.ok(Map.of("status", "healthy", "db", "connected"));
        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of("status", "unhealthy", "db", "disconnected"));
        }
    }
}
```

- [ ] **Step 8: Commit**

```bash
git add backend/src/main/java/com/bookhive/service/BookService.java backend/src/main/java/com/bookhive/service/SeedService.java backend/src/main/java/com/bookhive/controller/BookController.java backend/src/main/java/com/bookhive/controller/AdminController.java backend/src/test/java/com/bookhive/service/BookServiceTest.java backend/src/main/resources/books.json
git commit -m "feat: add book service, seed/reset endpoints, and book catalog API"
```

---

## Task 6: Backend — Cart Service & Controller

**Files:**
- Create: `backend/src/main/java/com/bookhive/dto/CartItemRequest.java`
- Create: `backend/src/main/java/com/bookhive/service/CartService.java`
- Create: `backend/src/main/java/com/bookhive/controller/CartController.java`
- Create: `backend/src/test/java/com/bookhive/service/CartServiceTest.java`

- [ ] **Step 1: Create `CartItemRequest.java`**

```java
package com.bookhive.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CartItemRequest(
    @NotBlank String bookId,
    @Min(1) int quantity
) {}
```

- [ ] **Step 2: Write failing test for CartService**

```java
package com.bookhive.service;

import com.bookhive.dto.CartItemRequest;
import com.bookhive.model.Book;
import com.bookhive.model.CartItem;
import com.bookhive.repository.BookRepository;
import com.bookhive.repository.CartItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class CartServiceTest {
    @Autowired private CartService cartService;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private BookRepository bookRepository;

    @BeforeEach
    void setUp() {
        cartItemRepository.deleteAll();
        bookRepository.deleteAll();
        Book book = new Book();
        book.setId("book-001");
        book.setTitle("Test Book");
        book.setStock(10);
        book.setPrice(9.99);
        book.setIsbn("978-0-0000-0001-0");
        bookRepository.save(book);
    }

    @Test
    void addItem_createsCartItem() {
        cartService.addItem("user1", new CartItemRequest("book-001", 2));
        var items = cartService.getCart("user1");
        assertEquals(1, items.size());
        assertEquals(2, items.get(0).getQuantity());
    }

    @Test
    void addItem_existingBook_updatesQuantity() {
        cartService.addItem("user1", new CartItemRequest("book-001", 1));
        cartService.addItem("user1", new CartItemRequest("book-001", 3));
        var items = cartService.getCart("user1");
        assertEquals(1, items.size());
        assertEquals(4, items.get(0).getQuantity());
    }

    @Test
    void addItem_insufficientStock_throws() {
        assertThrows(IllegalArgumentException.class, () ->
            cartService.addItem("user1", new CartItemRequest("book-001", 20)));
    }

    @Test
    void clearCart_removesAll() {
        cartService.addItem("user1", new CartItemRequest("book-001", 1));
        cartService.clearCart("user1");
        assertTrue(cartService.getCart("user1").isEmpty());
    }
}
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd backend && ./gradlew test --tests "com.bookhive.service.CartServiceTest" -i`
Expected: FAIL — CartService not found

- [ ] **Step 4: Implement `CartService.java`**

```java
package com.bookhive.service;

import com.bookhive.dto.CartItemRequest;
import com.bookhive.model.Book;
import com.bookhive.model.CartItem;
import com.bookhive.repository.BookRepository;
import com.bookhive.repository.CartItemRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CartService {
    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;

    public CartService(CartItemRepository cartItemRepository, BookRepository bookRepository) {
        this.cartItemRepository = cartItemRepository;
        this.bookRepository = bookRepository;
    }

    public List<CartItem> getCart(String userId) {
        return cartItemRepository.findByUserId(userId);
    }

    public CartItem addItem(String userId, CartItemRequest request) {
        Book book = bookRepository.findById(request.bookId())
            .orElseThrow(() -> new IllegalArgumentException("Book not found"));
        var existing = cartItemRepository.findByUserIdAndBookId(userId, request.bookId());
        int totalQty = existing.map(item -> item.getQuantity() + request.quantity())
                               .orElse(request.quantity());
        if (totalQty > book.getStock()) {
            throw new IllegalArgumentException("Insufficient stock");
        }
        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(totalQty);
            return cartItemRepository.save(item);
        }
        return cartItemRepository.save(new CartItem(userId, request.bookId(), request.quantity()));
    }

    public CartItem updateItem(String userId, String itemId, int quantity) {
        CartItem item = cartItemRepository.findById(itemId)
            .filter(i -> i.getUserId().equals(userId))
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));
        Book book = bookRepository.findById(item.getBookId())
            .orElseThrow(() -> new IllegalArgumentException("Book not found"));
        if (quantity > book.getStock()) {
            throw new IllegalArgumentException("Insufficient stock");
        }
        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    public void removeItem(String userId, String itemId) {
        CartItem item = cartItemRepository.findById(itemId)
            .filter(i -> i.getUserId().equals(userId))
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));
        cartItemRepository.delete(item);
    }

    public void clearCart(String userId) {
        cartItemRepository.deleteByUserId(userId);
    }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && ./gradlew test --tests "com.bookhive.service.CartServiceTest" -i`
Expected: ALL PASS

- [ ] **Step 6: Create `CartController.java`**

```java
package com.bookhive.controller;

import com.bookhive.dto.CartItemRequest;
import com.bookhive.dto.ErrorResponse;
import com.bookhive.model.CartItem;
import com.bookhive.security.UserPrincipal;
import com.bookhive.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@Tag(name = "Cart", description = "Shopping cart endpoints")
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    @Operation(summary = "Get current user's cart")
    public List<CartItem> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        return cartService.getCart(principal.getId());
    }

    @PostMapping("/items")
    @Operation(summary = "Add item to cart")
    public ResponseEntity<?> addItem(@AuthenticationPrincipal UserPrincipal principal,
                                     @Valid @RequestBody CartItemRequest request) {
        try {
            return ResponseEntity.ok(cartService.addItem(principal.getId(), request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("cart_error", e.getMessage()));
        }
    }

    @PutMapping("/items/{id}")
    @Operation(summary = "Update cart item quantity")
    public ResponseEntity<?> updateItem(@AuthenticationPrincipal UserPrincipal principal,
                                        @PathVariable String id,
                                        @RequestBody Map<String, Integer> body) {
        try {
            return ResponseEntity.ok(cartService.updateItem(principal.getId(), id, body.get("quantity")));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("cart_error", e.getMessage()));
        }
    }

    @DeleteMapping("/items/{id}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<?> removeItem(@AuthenticationPrincipal UserPrincipal principal,
                                        @PathVariable String id) {
        try {
            cartService.removeItem(principal.getId(), id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("cart_error", e.getMessage()));
        }
    }

    @DeleteMapping
    @Operation(summary = "Clear entire cart")
    public ResponseEntity<?> clearCart(@AuthenticationPrincipal UserPrincipal principal) {
        cartService.clearCart(principal.getId());
        return ResponseEntity.ok().build();
    }
}
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/com/bookhive/dto/CartItemRequest.java backend/src/main/java/com/bookhive/service/CartService.java backend/src/main/java/com/bookhive/controller/CartController.java backend/src/test/java/com/bookhive/service/CartServiceTest.java
git commit -m "feat: add cart service with add, update, remove, clear operations"
```

---

## Task 7: Backend — Order Service & Controller

**Files:**
- Create: `backend/src/main/java/com/bookhive/service/OrderService.java`
- Create: `backend/src/main/java/com/bookhive/controller/OrderController.java`
- Create: `backend/src/test/java/com/bookhive/service/OrderServiceTest.java`

- [ ] **Step 1: Write failing test for OrderService**

```java
package com.bookhive.service;

import com.bookhive.dto.CartItemRequest;
import com.bookhive.model.Book;
import com.bookhive.model.Order;
import com.bookhive.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class OrderServiceTest {
    @Autowired private OrderService orderService;
    @Autowired private CartService cartService;
    @Autowired private BookRepository bookRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private OrderRepository orderRepository;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        cartItemRepository.deleteAll();
        bookRepository.deleteAll();
        Book book = new Book();
        book.setId("book-001");
        book.setTitle("Test Book");
        book.setStock(10);
        book.setPrice(9.99);
        book.setIsbn("978-0-0000-0001-0");
        bookRepository.save(book);
    }

    @Test
    void checkout_createsOrder() {
        cartService.addItem("user1", new CartItemRequest("book-001", 2));
        Order order = orderService.checkout("user1");
        assertEquals("COMPLETED", order.getStatus());
        assertEquals(19.98, order.getTotalPrice(), 0.01);
        assertEquals(1, order.getItems().size());
        // Cart should be empty after checkout
        assertTrue(cartService.getCart("user1").isEmpty());
        // Stock should be decremented
        assertEquals(8, bookRepository.findById("book-001").get().getStock());
    }

    @Test
    void checkout_emptyCart_throws() {
        assertThrows(IllegalArgumentException.class, () -> orderService.checkout("user1"));
    }

    @Test
    void returnOrder_withinWindow_succeeds() {
        cartService.addItem("user1", new CartItemRequest("book-001", 2));
        Order order = orderService.checkout("user1");
        Order returned = orderService.returnOrder("user1", order.getId());
        assertEquals("RETURNED", returned.getStatus());
        assertEquals(10, bookRepository.findById("book-001").get().getStock());
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && ./gradlew test --tests "com.bookhive.service.OrderServiceTest" -i`
Expected: FAIL — OrderService not found

- [ ] **Step 3: Implement `OrderService.java`**

```java
package com.bookhive.service;

import com.bookhive.model.*;
import com.bookhive.repository.*;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;

    public OrderService(OrderRepository orderRepository, CartItemRepository cartItemRepository,
                        BookRepository bookRepository) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.bookRepository = bookRepository;
    }

    public Order checkout(String userId) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        List<OrderItem> orderItems = cartItems.stream().map(ci -> {
            Book book = bookRepository.findById(ci.getBookId())
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + ci.getBookId()));
            if (book.getStock() < ci.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for: " + book.getTitle());
            }
            book.setStock(book.getStock() - ci.getQuantity());
            bookRepository.save(book);
            return new OrderItem(ci.getBookId(), ci.getQuantity(), book.getPrice());
        }).toList();

        double total = orderItems.stream()
            .mapToDouble(i -> i.getPriceAtPurchase() * i.getQuantity()).sum();

        Order order = new Order();
        order.setUserId(userId);
        order.setItems(orderItems);
        order.setTotalPrice(total);
        order.setStatus("COMPLETED");
        order.setPurchasedAt(Instant.now());

        order = orderRepository.save(order);
        cartItemRepository.deleteByUserId(userId);
        return order;
    }

    public List<Order> getOrders(String userId) {
        return orderRepository.findByUserIdOrderByPurchasedAtDesc(userId);
    }

    public Optional<Order> getOrder(String userId, String orderId) {
        return orderRepository.findById(orderId)
            .filter(o -> o.getUserId().equals(userId));
    }

    public Order returnOrder(String userId, String orderId) {
        Order order = orderRepository.findById(orderId)
            .filter(o -> o.getUserId().equals(userId))
            .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!order.isReturnEligible()) {
            throw new IllegalArgumentException("Return window has expired");
        }
        // Restore stock
        for (OrderItem item : order.getItems()) {
            Book book = bookRepository.findById(item.getBookId())
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));
            book.setStock(book.getStock() + item.getQuantity());
            bookRepository.save(book);
        }
        order.setStatus("RETURNED");
        return orderRepository.save(order);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && ./gradlew test --tests "com.bookhive.service.OrderServiceTest" -i`
Expected: ALL PASS

- [ ] **Step 5: Create `OrderController.java`**

```java
package com.bookhive.controller;

import com.bookhive.dto.ErrorResponse;
import com.bookhive.model.Order;
import com.bookhive.security.UserPrincipal;
import com.bookhive.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Order management endpoints")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @Operation(summary = "Checkout cart into an order")
    public ResponseEntity<?> checkout(@AuthenticationPrincipal UserPrincipal principal) {
        try {
            return ResponseEntity.ok(orderService.checkout(principal.getId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("checkout_error", e.getMessage()));
        }
    }

    @GetMapping
    @Operation(summary = "List user's orders")
    public List<Order> getOrders(@AuthenticationPrincipal UserPrincipal principal) {
        return orderService.getOrders(principal.getId());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details")
    public ResponseEntity<Order> getOrder(@AuthenticationPrincipal UserPrincipal principal,
                                          @PathVariable String id) {
        return orderService.getOrder(principal.getId(), id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/return")
    @Operation(summary = "Return an order (within 10-minute window)")
    public ResponseEntity<?> returnOrder(@AuthenticationPrincipal UserPrincipal principal,
                                         @PathVariable String id) {
        try {
            return ResponseEntity.ok(orderService.returnOrder(principal.getId(), id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("return_error", e.getMessage()));
        }
    }
}
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/bookhive/service/OrderService.java backend/src/main/java/com/bookhive/controller/OrderController.java backend/src/test/java/com/bookhive/service/OrderServiceTest.java
git commit -m "feat: add order service with checkout, return (10-min window), and stock management"
```

---

## Task 8: Backend — Marketplace Service & Controller

**Files:**
- Create: `backend/src/main/java/com/bookhive/dto/ListingRequest.java`
- Create: `backend/src/main/java/com/bookhive/service/MarketplaceService.java`
- Create: `backend/src/main/java/com/bookhive/controller/MarketplaceController.java`
- Create: `backend/src/test/java/com/bookhive/service/MarketplaceServiceTest.java`

- [ ] **Step 1: Create `ListingRequest.java`**

```java
package com.bookhive.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record ListingRequest(
    @NotBlank String bookId,
    @NotBlank String condition,
    @Positive double price
) {}
```

- [ ] **Step 2: Write failing test for MarketplaceService**

```java
package com.bookhive.service;

import com.bookhive.dto.ListingRequest;
import com.bookhive.model.Book;
import com.bookhive.model.MarketplaceListing;
import com.bookhive.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class MarketplaceServiceTest {
    @Autowired private MarketplaceService marketplaceService;
    @Autowired private MarketplaceListingRepository listingRepository;
    @Autowired private BookRepository bookRepository;
    @Autowired private OrderRepository orderRepository;

    @BeforeEach
    void setUp() {
        listingRepository.deleteAll();
        orderRepository.deleteAll();
        bookRepository.deleteAll();
        Book book = new Book();
        book.setId("book-001");
        book.setTitle("Test Book");
        book.setStock(10);
        book.setPrice(9.99);
        book.setIsbn("978-0-0000-0001-0");
        bookRepository.save(book);
    }

    @Test
    void createListing_succeeds() {
        var listing = marketplaceService.createListing("seller1",
            new ListingRequest("book-001", "LIKE_NEW", 7.99));
        assertEquals("ACTIVE", listing.getStatus());
        assertEquals("seller1", listing.getSellerId());
    }

    @Test
    void buyListing_createsOrder() {
        var listing = marketplaceService.createListing("seller1",
            new ListingRequest("book-001", "GOOD", 5.99));
        var order = marketplaceService.buyListing("buyer1", listing.getId());
        assertEquals("COMPLETED", order.getStatus());
        assertEquals(5.99, order.getTotalPrice(), 0.01);
        // Listing should be SOLD
        var updated = listingRepository.findById(listing.getId()).get();
        assertEquals("SOLD", updated.getStatus());
    }

    @Test
    void buyOwnListing_throws() {
        var listing = marketplaceService.createListing("seller1",
            new ListingRequest("book-001", "NEW", 8.99));
        assertThrows(IllegalArgumentException.class, () ->
            marketplaceService.buyListing("seller1", listing.getId()));
    }

    @Test
    void cancelListing_succeeds() {
        var listing = marketplaceService.createListing("seller1",
            new ListingRequest("book-001", "FAIR", 3.99));
        marketplaceService.cancelListing("seller1", listing.getId());
        assertEquals("CANCELLED", listingRepository.findById(listing.getId()).get().getStatus());
    }
}
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd backend && ./gradlew test --tests "com.bookhive.service.MarketplaceServiceTest" -i`
Expected: FAIL — MarketplaceService not found

- [ ] **Step 4: Implement `MarketplaceService.java`**

```java
package com.bookhive.service;

import com.bookhive.dto.ListingRequest;
import com.bookhive.model.*;
import com.bookhive.repository.*;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;

@Service
public class MarketplaceService {
    private final MarketplaceListingRepository listingRepository;
    private final BookRepository bookRepository;
    private final OrderRepository orderRepository;

    public MarketplaceService(MarketplaceListingRepository listingRepository,
                              BookRepository bookRepository, OrderRepository orderRepository) {
        this.listingRepository = listingRepository;
        this.bookRepository = bookRepository;
        this.orderRepository = orderRepository;
    }

    public List<MarketplaceListing> getActiveListings() {
        return listingRepository.findByStatus("ACTIVE");
    }

    public MarketplaceListing createListing(String sellerId, ListingRequest request) {
        bookRepository.findById(request.bookId())
            .orElseThrow(() -> new IllegalArgumentException("Book not found"));
        MarketplaceListing listing = new MarketplaceListing();
        listing.setSellerId(sellerId);
        listing.setBookId(request.bookId());
        listing.setCondition(request.condition());
        listing.setPrice(request.price());
        listing.setListedAt(Instant.now());
        listing.setStatus("ACTIVE");
        return listingRepository.save(listing);
    }

    public Order buyListing(String buyerId, String listingId) {
        MarketplaceListing listing = listingRepository.findById(listingId)
            .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        if (!"ACTIVE".equals(listing.getStatus())) {
            throw new IllegalArgumentException("Listing is not active");
        }
        if (listing.getSellerId().equals(buyerId)) {
            throw new IllegalArgumentException("Cannot buy your own listing");
        }
        listing.setStatus("SOLD");
        listingRepository.save(listing);

        Order order = new Order();
        order.setUserId(buyerId);
        order.setItems(List.of(new OrderItem(listing.getBookId(), 1, listing.getPrice())));
        order.setTotalPrice(listing.getPrice());
        order.setStatus("COMPLETED");
        order.setPurchasedAt(Instant.now());
        return orderRepository.save(order);
    }

    public void cancelListing(String sellerId, String listingId) {
        MarketplaceListing listing = listingRepository.findById(listingId)
            .filter(l -> l.getSellerId().equals(sellerId))
            .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        if (!"ACTIVE".equals(listing.getStatus())) {
            throw new IllegalArgumentException("Can only cancel active listings");
        }
        listing.setStatus("CANCELLED");
        listingRepository.save(listing);
    }

    public List<MarketplaceListing> getSellerListings(String sellerId) {
        return listingRepository.findBySellerId(sellerId);
    }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && ./gradlew test --tests "com.bookhive.service.MarketplaceServiceTest" -i`
Expected: ALL PASS

- [ ] **Step 6: Create `MarketplaceController.java`**

```java
package com.bookhive.controller;

import com.bookhive.dto.ErrorResponse;
import com.bookhive.dto.ListingRequest;
import com.bookhive.model.MarketplaceListing;
import com.bookhive.security.UserPrincipal;
import com.bookhive.service.MarketplaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/marketplace")
@Tag(name = "Marketplace", description = "Second-hand book marketplace")
public class MarketplaceController {
    private final MarketplaceService marketplaceService;

    public MarketplaceController(MarketplaceService marketplaceService) {
        this.marketplaceService = marketplaceService;
    }

    @GetMapping
    @Operation(summary = "List active marketplace listings")
    public List<MarketplaceListing> getListings() {
        return marketplaceService.getActiveListings();
    }

    @PostMapping("/listings")
    @Operation(summary = "Create a new listing")
    public ResponseEntity<?> createListing(@AuthenticationPrincipal UserPrincipal principal,
                                           @Valid @RequestBody ListingRequest request) {
        try {
            return ResponseEntity.ok(marketplaceService.createListing(principal.getId(), request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("listing_error", e.getMessage()));
        }
    }

    @PostMapping("/listings/{id}/buy")
    @Operation(summary = "Buy a marketplace listing")
    public ResponseEntity<?> buyListing(@AuthenticationPrincipal UserPrincipal principal,
                                        @PathVariable String id) {
        try {
            return ResponseEntity.ok(marketplaceService.buyListing(principal.getId(), id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("buy_error", e.getMessage()));
        }
    }

    @DeleteMapping("/listings/{id}")
    @Operation(summary = "Cancel own listing")
    public ResponseEntity<?> cancelListing(@AuthenticationPrincipal UserPrincipal principal,
                                           @PathVariable String id) {
        try {
            marketplaceService.cancelListing(principal.getId(), id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("cancel_error", e.getMessage()));
        }
    }
}
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/com/bookhive/dto/ListingRequest.java backend/src/main/java/com/bookhive/service/MarketplaceService.java backend/src/main/java/com/bookhive/controller/MarketplaceController.java backend/src/test/java/com/bookhive/service/MarketplaceServiceTest.java
git commit -m "feat: add marketplace service with create, buy, cancel listing operations"
```

---

## Task 9: Frontend — Theme, Layout, and API Client

**Files:**
- Create: `frontend/src/styles/variables.css`
- Create: `frontend/src/styles/global.css`
- Create: `frontend/src/styles/layout.module.css`
- Create: `frontend/src/context/ThemeContext.jsx`
- Create: `frontend/src/context/AuthContext.jsx`
- Create: `frontend/src/context/CartContext.jsx`
- Create: `frontend/src/services/api.js`
- Create: `frontend/src/components/ThemeToggle.jsx`
- Create: `frontend/src/App.jsx`

- [ ] **Step 1: Create `variables.css`**

```css
:root {
  /* Dark theme (default) */
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --bg-tertiary: #0f3460;
  --text-primary: #ffffff;
  --text-secondary: #a0aec0;
  --text-muted: #4a5568;
  --accent: #e94560;
  --accent-hover: #d63851;
  --link: #4299e1;
  --border: #1a1a3e;
  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  --sidebar-width: 240px;
  --topbar-height: 60px;
}

[data-theme="light"] {
  --bg-primary: #f8f9fa;
  --bg-secondary: #ffffff;
  --bg-tertiary: #edf2f7;
  --text-primary: #2d3748;
  --text-secondary: #718096;
  --text-muted: #a0aec0;
  --accent: #e94560;
  --accent-hover: #d63851;
  --link: #3182ce;
  --border: #e2e8f0;
  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
```

- [ ] **Step 2: Create `global.css`**

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--link);
  text-decoration: none;
}

button {
  cursor: pointer;
  font-family: inherit;
}

input, select, textarea {
  font-family: inherit;
}
```

- [ ] **Step 3: Create `layout.module.css`**

```css
.layout {
  display: flex;
  min-height: 100vh;
}

.main {
  flex: 1;
  margin-left: var(--sidebar-width);
  padding: 24px;
  transition: margin-left 0.3s ease;
}

@media (max-width: 767px) {
  .main {
    margin-left: 0;
    padding-top: calc(var(--topbar-height) + 16px);
    padding: 16px;
    padding-top: calc(var(--topbar-height) + 16px);
  }
}
```

- [ ] **Step 4: Create `ThemeContext.jsx`**

```jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('bookhive_theme') || 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bookhive_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

- [ ] **Step 5: Create `services/api.js`**

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('bookhive_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bookhive_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

- [ ] **Step 6: Create `AuthContext.jsx`**

```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bookhive_token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('bookhive_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('bookhive_token', res.data.token);
    setUser(res.data);
    return res.data;
  };

  const signup = async (username, email, password) => {
    const res = await api.post('/auth/signup', { username, email, password });
    localStorage.setItem('bookhive_token', res.data.token);
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('bookhive_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

- [ ] **Step 7: Create `CartContext.jsx`**

```jsx
import { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/cart');
      setItems(res.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = async (bookId, quantity = 1) => {
    await api.post('/cart/items', { bookId, quantity });
    await fetchCart();
  };

  const updateItem = async (itemId, quantity) => {
    await api.put(`/cart/items/${itemId}`, { quantity });
    await fetchCart();
  };

  const removeItem = async (itemId) => {
    await api.delete(`/cart/items/${itemId}`);
    await fetchCart();
  };

  const clearCart = async () => {
    await api.delete('/cart');
    setItems([]);
  };

  return (
    <CartContext.Provider value={{
      items, loading, fetchCart, addItem, updateItem, removeItem, clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
```

- [ ] **Step 8: Create `ThemeToggle.jsx`**

```jsx
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      data-testid="theme-toggle"
      onClick={toggleTheme}
      style={{
        background: 'var(--bg-tertiary)',
        border: 'none',
        borderRadius: '12px',
        padding: '4px 8px',
        color: 'var(--text-secondary)',
        fontSize: '14px',
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
```

- [ ] **Step 9: Create `App.jsx` with routing**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import BookDetailPage from './pages/BookDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import MarketplacePage from './pages/MarketplacePage';
import CreateListingPage from './pages/CreateListingPage';
import ProfilePage from './pages/ProfilePage';
import styles from './styles/layout.module.css';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <div className={styles.layout}>
              <Sidebar />
              <TopBar />
              <main className={styles.main}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/books/:id" element={<BookDetailPage />} />
                  <Route path="/marketplace" element={<MarketplacePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                  <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                  <Route path="/marketplace/sell" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 10: Create `ProtectedRoute.jsx`**

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div data-testid="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
```

- [ ] **Step 11: Commit**

```bash
git add frontend/src/
git commit -m "feat: add React app shell with theme, auth, cart contexts and routing"
```

---

## Task 10: Frontend — Sidebar & TopBar Components

**Files:**
- Create: `frontend/src/components/Sidebar.jsx`
- Create: `frontend/src/components/Sidebar.module.css`
- Create: `frontend/src/components/TopBar.jsx`
- Create: `frontend/src/components/TopBar.module.css`

- [ ] **Step 1: Create `Sidebar.module.css`**

```css
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  padding: 20px 16px;
  overflow-y: auto;
  z-index: 100;
  transition: transform 0.3s ease;
}

.logo {
  color: var(--accent);
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 32px;
}

.sectionLabel {
  color: var(--text-muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 24px 0 8px;
}

.navItem {
  display: block;
  padding: 8px 12px;
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 14px;
  transition: all 0.2s;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  text-decoration: none;
}

.navItem:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.navItemActive {
  background: var(--bg-tertiary);
  color: var(--accent);
}

.badge {
  background: var(--accent);
  color: white;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 10px;
  margin-left: 8px;
}

.overlay {
  display: none;
}

@media (max-width: 767px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebarOpen {
    transform: translateX(0);
  }

  .overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99;
  }
}
```

- [ ] **Step 2: Create `Sidebar.jsx`**

```jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ThemeToggle from './ThemeToggle';
import styles from './Sidebar.module.css';
import { useState, useEffect } from 'react';

const GENRES = ['Fiction', 'Sci-Fi', 'Non-Fiction', 'Biography', 'Fantasy', 'Mystery'];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(o => !o);
    window.addEventListener('toggle-sidebar', handler);
    return () => window.removeEventListener('toggle-sidebar', handler);
  }, []);

  const navClass = ({ isActive }) =>
    `${styles.navItem} ${isActive ? styles.navItemActive : ''}`;

  return (
    <>
      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}
      <nav
        data-testid="sidebar"
        className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}
      >
        <div className={styles.logo} data-testid="logo">BookHive</div>

        <div className={styles.sectionLabel}>Browse</div>
        <NavLink to="/" className={navClass} data-testid="nav-all-books" onClick={() => setOpen(false)}>
          All Books
        </NavLink>
        <NavLink to="/marketplace" className={navClass} data-testid="nav-marketplace" onClick={() => setOpen(false)}>
          Marketplace
        </NavLink>

        <div className={styles.sectionLabel}>Categories</div>
        {GENRES.map(genre => (
          <NavLink
            key={genre}
            to={`/?genre=${genre}`}
            className={styles.navItem}
            data-testid={`genre-filter-${genre.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => setOpen(false)}
          >
            {genre}
          </NavLink>
        ))}

        {user && (
          <>
            <div className={styles.sectionLabel}>Account</div>
            <NavLink to="/cart" className={navClass} data-testid="nav-cart" onClick={() => setOpen(false)}>
              Cart
              {items.length > 0 && (
                <span className={styles.badge} data-testid="cart-badge">{items.length}</span>
              )}
            </NavLink>
            <NavLink to="/orders" className={navClass} data-testid="nav-orders" onClick={() => setOpen(false)}>
              Orders
            </NavLink>
            <NavLink to="/marketplace/sell" className={navClass} data-testid="nav-sell" onClick={() => setOpen(false)}>
              Sell a Book
            </NavLink>
            <NavLink to="/profile" className={navClass} data-testid="nav-profile" onClick={() => setOpen(false)}>
              Profile
            </NavLink>
            <button className={styles.navItem} data-testid="logout-btn" onClick={() => { logout(); setOpen(false); }}>
              Logout
            </button>
          </>
        )}

        {!user && (
          <>
            <div className={styles.sectionLabel}>Account</div>
            <NavLink to="/login" className={navClass} data-testid="nav-login" onClick={() => setOpen(false)}>
              Login
            </NavLink>
            <NavLink to="/signup" className={navClass} data-testid="nav-signup" onClick={() => setOpen(false)}>
              Sign Up
            </NavLink>
          </>
        )}

        <div style={{ marginTop: '24px' }}>
          <ThemeToggle />
        </div>
      </nav>
    </>
  );
}
```

- [ ] **Step 3: Create `TopBar.module.css`**

```css
.topbar {
  display: none;
}

@media (max-width: 767px) {
  .topbar {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: var(--topbar-height);
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    z-index: 98;
  }

  .left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .hamburger {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 24px;
    padding: 4px;
  }

  .logo {
    color: var(--accent);
    font-weight: 700;
    font-size: 18px;
  }

  .right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .iconBtn {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 20px;
    position: relative;
  }

  .cartBadge {
    position: absolute;
    top: -6px;
    right: -8px;
    background: var(--accent);
    color: white;
    font-size: 10px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
```

- [ ] **Step 4: Create `TopBar.jsx`**

Note: TopBar and Sidebar share sidebar open state. Use a simple global event or lift state. For simplicity, use a custom event.

```jsx
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import styles from './TopBar.module.css';

export default function TopBar() {
  const { items } = useCart();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    window.dispatchEvent(new CustomEvent('toggle-sidebar'));
  };

  return (
    <div className={styles.topbar} data-testid="topbar">
      <div className={styles.left}>
        <button className={styles.hamburger} data-testid="sidebar-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <span className={styles.logo}>BookHive</span>
      </div>
      <div className={styles.right}>
        <button className={styles.iconBtn} data-testid="mobile-search-btn" onClick={() => navigate('/')}>
          🔍
        </button>
        <button className={styles.iconBtn} data-testid="mobile-cart-btn" onClick={() => navigate('/cart')}>
          🛒
          {items.length > 0 && (
            <span className={styles.cartBadge} data-testid="cart-badge-mobile">{items.length}</span>
          )}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/Sidebar.jsx frontend/src/components/Sidebar.module.css frontend/src/components/TopBar.jsx frontend/src/components/TopBar.module.css
git commit -m "feat: add responsive sidebar and mobile top bar with hamburger menu"
```

---

## Task 11: Frontend — Home Page (Book Catalog)

**Files:**
- Create: `frontend/src/components/BookCard.jsx`
- Create: `frontend/src/components/BookCard.module.css`
- Create: `frontend/src/components/SearchBar.jsx`
- Create: `frontend/src/components/SearchBar.module.css`
- Create: `frontend/src/components/GenreFilter.jsx`
- Create: `frontend/src/components/GenreFilter.module.css`
- Create: `frontend/src/pages/HomePage.jsx`
- Create: `frontend/src/pages/HomePage.module.css`

- [ ] **Step 1: Create `BookCard.module.css`**

```css
.card {
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow);
}

.cover {
  background: var(--bg-tertiary);
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
}

.body {
  padding: 16px;
}

.title {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.author {
  color: var(--text-secondary);
  font-size: 12px;
  margin-bottom: 8px;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: var(--accent);
  font-weight: 700;
  font-size: 16px;
}

.addBtn {
  background: var(--accent);
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 12px;
  transition: background 0.2s;
}

.addBtn:hover {
  background: var(--accent-hover);
}

.addBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.genre {
  display: inline-block;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}
```

- [ ] **Step 2: Create `BookCard.jsx`**

```jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import styles from './BookCard.module.css';

export default function BookCard({ book }) {
  const { user } = useAuth();
  const { addItem } = useCart();

  const handleAdd = async (e) => {
    e.preventDefault();
    await addItem(book.id);
  };

  return (
    <Link to={`/books/${book.id}`} className={styles.card} data-testid={`book-card-${book.id}`}>
      <div className={styles.cover}>📖</div>
      <div className={styles.body}>
        <span className={styles.genre} data-testid={`book-genre-${book.id}`}>{book.genre}</span>
        <div className={styles.title} data-testid={`book-title-${book.id}`}>{book.title}</div>
        <div className={styles.author} data-testid={`book-author-${book.id}`}>{book.author}</div>
        <div className={styles.footer}>
          <span className={styles.price} data-testid={`book-price-${book.id}`}>
            ${book.price.toFixed(2)}
          </span>
          {user && book.stock > 0 && (
            <button
              className={styles.addBtn}
              data-testid={`add-to-cart-${book.id}`}
              onClick={handleAdd}
            >
              Add to Cart
            </button>
          )}
          {book.stock === 0 && (
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }} data-testid={`out-of-stock-${book.id}`}>
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Create `SearchBar.jsx` and `SearchBar.module.css`**

```css
/* SearchBar.module.css */
.wrapper {
  position: relative;
  max-width: 480px;
}

.input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: var(--accent);
}

.icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}
```

```jsx
// SearchBar.jsx
import { useState } from 'react';
import styles from './SearchBar.module.css';

export default function SearchBar({ onSearch }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.wrapper}>
      <span className={styles.icon}>🔍</span>
      <input
        className={styles.input}
        data-testid="search-input"
        type="text"
        placeholder="Search books by title or author..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}
```

- [ ] **Step 4: Create `GenreFilter.jsx` and `GenreFilter.module.css`**

Mobile-only horizontal chip filter (sidebar handles desktop genre nav).

```css
/* GenreFilter.module.css */
.chips {
  display: none;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0;
  -webkit-overflow-scrolling: touch;
}

.chip {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.chipActive {
  background: var(--bg-tertiary);
  color: var(--link);
  border-color: var(--link);
}

@media (max-width: 767px) {
  .chips {
    display: flex;
  }
}
```

```jsx
// GenreFilter.jsx
import styles from './GenreFilter.module.css';

const GENRES = ['All', 'Fiction', 'Sci-Fi', 'Non-Fiction', 'Biography', 'Fantasy', 'Mystery'];

export default function GenreFilter({ active, onChange }) {
  return (
    <div className={styles.chips} data-testid="genre-chips">
      {GENRES.map(genre => (
        <button
          key={genre}
          className={`${styles.chip} ${active === genre || (genre === 'All' && !active) ? styles.chipActive : ''}`}
          data-testid={`genre-chip-${genre.toLowerCase().replace(/\s+/g, '-')}`}
          onClick={() => onChange(genre === 'All' ? null : genre)}
        >
          {genre}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create `HomePage.jsx` and `HomePage.module.css`**

```css
/* HomePage.module.css */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
}

.pageBtn {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
}

.pageBtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pageBtnActive {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.empty {
  text-align: center;
  color: var(--text-secondary);
  padding: 48px;
}

@media (max-width: 767px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}
```

```jsx
// HomePage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import GenreFilter from '../components/GenreFilter';
import styles from './HomePage.module.css';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const query = searchParams.get('query') || '';
  const genre = searchParams.get('genre') || '';

  useEffect(() => {
    setLoading(true);
    const params = { page, size: 12 };
    if (query) params.query = query;
    if (genre) params.genre = genre;

    api.get('/books', { params })
      .then(res => {
        setBooks(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page, query, genre]);

  const handleSearch = (q) => {
    setPage(0);
    setSearchParams(q ? { query: q } : {});
  };

  const handleGenre = (g) => {
    setPage(0);
    setSearchParams(g ? { genre: g } : {});
  };

  return (
    <div data-testid="home-page">
      <div className={styles.header}>
        <SearchBar onSearch={handleSearch} />
      </div>
      <GenreFilter active={genre} onChange={handleGenre} />

      {loading ? (
        <div className={styles.empty} data-testid="loading-books">Loading...</div>
      ) : books.length === 0 ? (
        <div className={styles.empty} data-testid="no-books">No books found</div>
      ) : (
        <>
          <div className={styles.grid} data-testid="book-grid">
            {books.map(book => <BookCard key={book.id} book={book} />)}
          </div>
          {totalPages > 1 && (
            <div className={styles.pagination} data-testid="pagination">
              <button
                className={styles.pageBtn}
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                data-testid="prev-page"
              >
                Previous
              </button>
              <span style={{ color: 'var(--text-secondary)', padding: '8px' }}>
                {page + 1} / {totalPages}
              </span>
              <button
                className={styles.pageBtn}
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                data-testid="next-page"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/BookCard.jsx frontend/src/components/BookCard.module.css frontend/src/components/SearchBar.jsx frontend/src/components/SearchBar.module.css frontend/src/components/GenreFilter.jsx frontend/src/components/GenreFilter.module.css frontend/src/pages/HomePage.jsx frontend/src/pages/HomePage.module.css
git commit -m "feat: add home page with book grid, search, genre filtering, and pagination"
```

---

## Task 12: Frontend — Auth Pages (Login & Signup)

**Files:**
- Create: `frontend/src/pages/LoginPage.jsx`
- Create: `frontend/src/pages/LoginPage.module.css`
- Create: `frontend/src/pages/SignupPage.jsx`
- Create: `frontend/src/pages/SignupPage.module.css`

- [ ] **Step 1: Create shared auth form styles (`LoginPage.module.css`)**

```css
.container {
  max-width: 400px;
  margin: 60px auto;
}

.title {
  font-size: 24px;
  margin-bottom: 8px;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.field input {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;
}

.field input:focus {
  outline: none;
  border-color: var(--accent);
}

.submitBtn {
  background: var(--accent);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  transition: background 0.2s;
}

.submitBtn:hover {
  background: var(--accent-hover);
}

.submitBtn:disabled {
  opacity: 0.6;
}

.error {
  background: rgba(233, 69, 96, 0.1);
  border: 1px solid var(--accent);
  color: var(--accent);
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
}

.link {
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
}
```

- [ ] **Step 2: Create `LoginPage.jsx`**

```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container} data-testid="login-page">
      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.subtitle}>Sign in to your BookHive account</p>

      {error && <div className={styles.error} data-testid="login-error">{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit} data-testid="login-form">
        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" data-testid="login-email" value={email}
                 onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" data-testid="login-password" value={password}
                 onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className={styles.submitBtn} data-testid="login-submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className={styles.link} style={{ marginTop: '16px' }}>
        Don't have an account? <Link to="/signup" data-testid="signup-link">Sign up</Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Create `SignupPage.module.css`** (reuse LoginPage.module.css pattern)

```css
/* Same styles as LoginPage.module.css - import shared or duplicate */
.container { max-width: 400px; margin: 60px auto; }
.title { font-size: 24px; margin-bottom: 8px; }
.subtitle { color: var(--text-secondary); margin-bottom: 32px; }
.form { display: flex; flex-direction: column; gap: 16px; }
.field label { display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 4px; }
.field input { width: 100%; padding: 10px 14px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary); font-size: 14px; }
.field input:focus { outline: none; border-color: var(--accent); }
.submitBtn { background: var(--accent); color: white; border: none; padding: 12px; border-radius: 6px; font-size: 16px; font-weight: 600; }
.submitBtn:hover { background: var(--accent-hover); }
.submitBtn:disabled { opacity: 0.6; }
.error { background: rgba(233, 69, 96, 0.1); border: 1px solid var(--accent); color: var(--accent); padding: 10px 14px; border-radius: 6px; font-size: 13px; }
.link { text-align: center; color: var(--text-secondary); font-size: 14px; }
```

- [ ] **Step 4: Create `SignupPage.jsx`**

```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './SignupPage.module.css';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container} data-testid="signup-page">
      <h1 className={styles.title}>Create an account</h1>
      <p className={styles.subtitle}>Join BookHive to start buying and selling books</p>

      {error && <div className={styles.error} data-testid="signup-error">{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit} data-testid="signup-form">
        <div className={styles.field}>
          <label htmlFor="username">Username</label>
          <input id="username" type="text" data-testid="signup-username" value={username}
                 onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" data-testid="signup-email" value={email}
                 onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" data-testid="signup-password" value={password}
                 onChange={e => setPassword(e.target.value)} required minLength={6} />
        </div>
        <button type="submit" className={styles.submitBtn} data-testid="signup-submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className={styles.link} style={{ marginTop: '16px' }}>
        Already have an account? <Link to="/login" data-testid="login-link">Sign in</Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/LoginPage.jsx frontend/src/pages/LoginPage.module.css frontend/src/pages/SignupPage.jsx frontend/src/pages/SignupPage.module.css
git commit -m "feat: add login and signup pages with form validation and error handling"
```

---

## Task 13: Frontend — Book Detail & Cart Pages

**Files:**
- Create: `frontend/src/pages/BookDetailPage.jsx`
- Create: `frontend/src/pages/BookDetailPage.module.css`
- Create: `frontend/src/components/CartItemRow.jsx`
- Create: `frontend/src/components/CartItemRow.module.css`
- Create: `frontend/src/pages/CartPage.jsx`
- Create: `frontend/src/pages/CartPage.module.css`

- [ ] **Step 1: Create `BookDetailPage.module.css`**

```css
.container { max-width: 800px; margin: 0 auto; }
.header { display: flex; gap: 32px; margin-bottom: 32px; }
.cover { background: var(--bg-tertiary); width: 280px; height: 360px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 72px; flex-shrink: 0; }
.info { flex: 1; }
.title { font-size: 28px; margin-bottom: 8px; }
.author { color: var(--text-secondary); font-size: 16px; margin-bottom: 12px; }
.genre { display: inline-block; background: var(--bg-tertiary); color: var(--text-secondary); font-size: 12px; padding: 4px 12px; border-radius: 4px; margin-bottom: 16px; }
.description { color: var(--text-secondary); line-height: 1.7; margin-bottom: 24px; }
.price { color: var(--accent); font-size: 28px; font-weight: 700; margin-bottom: 16px; }
.stock { color: var(--text-secondary); font-size: 14px; margin-bottom: 16px; }
.addBtn { background: var(--accent); color: white; border: none; padding: 12px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; }
.addBtn:hover { background: var(--accent-hover); }
.addBtn:disabled { opacity: 0.5; cursor: not-allowed; }
.outOfStock { color: var(--accent); font-size: 16px; font-weight: 600; }
@media (max-width: 767px) {
  .header { flex-direction: column; }
  .cover { width: 100%; height: 240px; }
}
```

- [ ] **Step 2: Create `BookDetailPage.jsx`**

```jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import styles from './BookDetailPage.module.css';

export default function BookDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.get(`/books/${id}`)
      .then(res => setBook(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    setAdding(true);
    try { await addItem(book.id); } finally { setAdding(false); }
  };

  if (loading) return <div data-testid="loading">Loading...</div>;
  if (!book) return <div data-testid="not-found">Book not found</div>;

  return (
    <div className={styles.container} data-testid="book-detail-page">
      <div className={styles.header}>
        <div className={styles.cover}>📖</div>
        <div className={styles.info}>
          <h1 className={styles.title} data-testid="book-detail-title">{book.title}</h1>
          <p className={styles.author} data-testid="book-detail-author">{book.author}</p>
          <span className={styles.genre} data-testid="book-detail-genre">{book.genre}</span>
          <p className={styles.description} data-testid="book-detail-description">{book.description}</p>
          <div className={styles.price} data-testid="book-detail-price">${book.price.toFixed(2)}</div>
          <p className={styles.stock} data-testid="book-detail-stock">
            {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
          </p>
          {user && book.stock > 0 ? (
            <button className={styles.addBtn} data-testid="add-to-cart-detail"
                    onClick={handleAdd} disabled={adding}>
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          ) : book.stock === 0 ? (
            <span className={styles.outOfStock} data-testid="out-of-stock">Out of Stock</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `CartItemRow.module.css`**

```css
.row { display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--bg-secondary); border-radius: 8px; border: 1px solid var(--border); }
.info { flex: 1; }
.title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.price { color: var(--accent); font-size: 14px; }
.controls { display: flex; align-items: center; gap: 8px; }
.qtyBtn { background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border); width: 32px; height: 32px; border-radius: 4px; font-size: 16px; display: flex; align-items: center; justify-content: center; }
.qtyBtn:disabled { opacity: 0.4; }
.qty { font-size: 14px; min-width: 24px; text-align: center; }
.removeBtn { background: none; border: none; color: var(--accent); font-size: 13px; padding: 4px 8px; }
.removeBtn:hover { text-decoration: underline; }
```

- [ ] **Step 4: Create `CartItemRow.jsx`**

```jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import styles from './CartItemRow.module.css';

export default function CartItemRow({ item }) {
  const { updateItem, removeItem } = useCart();
  const [book, setBook] = useState(null);

  useEffect(() => {
    api.get(`/books/${item.bookId}`).then(res => setBook(res.data));
  }, [item.bookId]);

  if (!book) return null;

  return (
    <div className={styles.row} data-testid={`cart-item-${item.id}`}>
      <div className={styles.info}>
        <div className={styles.title} data-testid={`cart-item-title-${item.id}`}>{book.title}</div>
        <div className={styles.price} data-testid={`cart-item-price-${item.id}`}>
          ${(book.price * item.quantity).toFixed(2)}
        </div>
      </div>
      <div className={styles.controls}>
        <button className={styles.qtyBtn} data-testid={`cart-qty-minus-${item.id}`}
                onClick={() => updateItem(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
          -
        </button>
        <span className={styles.qty} data-testid={`cart-qty-${item.id}`}>{item.quantity}</span>
        <button className={styles.qtyBtn} data-testid={`cart-qty-plus-${item.id}`}
                onClick={() => updateItem(item.id, item.quantity + 1)}>
          +
        </button>
      </div>
      <button className={styles.removeBtn} data-testid={`cart-remove-${item.id}`}
              onClick={() => removeItem(item.id)}>
        Remove
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Create `CartPage.module.css`**

```css
.container { max-width: 700px; margin: 0 auto; }
.title { font-size: 24px; margin-bottom: 24px; }
.items { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
.footer { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: var(--bg-secondary); border-radius: 8px; border: 1px solid var(--border); }
.total { font-size: 20px; font-weight: 700; }
.totalAmount { color: var(--accent); }
.checkoutBtn { background: var(--accent); color: white; border: none; padding: 12px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; }
.checkoutBtn:hover { background: var(--accent-hover); }
.checkoutBtn:disabled { opacity: 0.6; }
.empty { text-align: center; color: var(--text-secondary); padding: 48px; }
.clearBtn { background: none; border: none; color: var(--text-secondary); font-size: 13px; cursor: pointer; }
.clearBtn:hover { color: var(--accent); }
```

- [ ] **Step 6: Create `CartPage.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import CartItemRow from '../components/CartItemRow';
import styles from './CartPage.module.css';

export default function CartPage() {
  const { items, fetchCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [books, setBooks] = useState({});

  useEffect(() => { fetchCart(); }, [fetchCart]);

  useEffect(() => {
    items.forEach(item => {
      if (!books[item.bookId]) {
        api.get(`/books/${item.bookId}`).then(res =>
          setBooks(prev => ({ ...prev, [item.bookId]: res.data })));
      }
    });
  }, [items]);

  const total = items.reduce((sum, item) => {
    const book = books[item.bookId];
    return sum + (book ? book.price * item.quantity : 0);
  }, 0);

  const handleCheckout = async () => {
    setChecking(true);
    try {
      const res = await api.post('/orders');
      navigate(`/orders/${res.data.id}`);
    } finally {
      setChecking(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.container} data-testid="cart-page">
        <h1 className={styles.title}>Shopping Cart</h1>
        <div className={styles.empty} data-testid="cart-empty">Your cart is empty</div>
      </div>
    );
  }

  return (
    <div className={styles.container} data-testid="cart-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className={styles.title}>Shopping Cart</h1>
        <button className={styles.clearBtn} data-testid="cart-clear" onClick={clearCart}>Clear cart</button>
      </div>
      <div className={styles.items}>
        {items.map(item => <CartItemRow key={item.id} item={item} />)}
      </div>
      <div className={styles.footer}>
        <div className={styles.total}>
          Total: <span className={styles.totalAmount} data-testid="cart-total">${total.toFixed(2)}</span>
        </div>
        <button className={styles.checkoutBtn} data-testid="checkout-btn"
                onClick={handleCheckout} disabled={checking}>
          {checking ? 'Processing...' : 'Checkout'}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/BookDetailPage* frontend/src/components/CartItemRow* frontend/src/pages/CartPage*
git commit -m "feat: add book detail and cart pages with quantity controls and checkout"
```

---

## Task 14: Frontend — Orders & Order Detail Pages

**Files:**
- Create: `frontend/src/components/OrderCard.jsx`
- Create: `frontend/src/components/OrderCard.module.css`
- Create: `frontend/src/pages/OrdersPage.jsx`
- Create: `frontend/src/pages/OrdersPage.module.css`
- Create: `frontend/src/components/ReturnCountdown.jsx`
- Create: `frontend/src/components/ReturnCountdown.module.css`
- Create: `frontend/src/pages/OrderDetailPage.jsx`
- Create: `frontend/src/pages/OrderDetailPage.module.css`

- [ ] **Step 1: Create `OrderCard.module.css`**

```css
.card { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-secondary); border-radius: 8px; border: 1px solid var(--border); cursor: pointer; transition: transform 0.2s; text-decoration: none; color: inherit; }
.card:hover { transform: translateY(-1px); }
.left { display: flex; flex-direction: column; gap: 4px; }
.orderId { font-size: 14px; font-weight: 600; }
.date { color: var(--text-secondary); font-size: 13px; }
.right { display: flex; align-items: center; gap: 16px; }
.total { font-size: 16px; font-weight: 700; color: var(--accent); }
.statusBadge { padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; }
.completed { background: rgba(72, 187, 120, 0.15); color: #48bb78; }
.returned { background: rgba(233, 69, 96, 0.15); color: var(--accent); }
```

- [ ] **Step 2: Create `OrderCard.jsx`**

```jsx
import { Link } from 'react-router-dom';
import styles from './OrderCard.module.css';

export default function OrderCard({ order }) {
  const date = new Date(order.purchasedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  const statusClass = order.status === 'RETURNED' ? styles.returned : styles.completed;

  return (
    <Link to={`/orders/${order.id}`} className={styles.card} data-testid={`order-card-${order.id}`}>
      <div className={styles.left}>
        <div className={styles.orderId}>Order #{order.id.slice(-8)}</div>
        <div className={styles.date}>{date}</div>
        <div>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
      </div>
      <div className={styles.right}>
        <span className={styles.total}>${order.totalPrice.toFixed(2)}</span>
        <span className={`${styles.statusBadge} ${statusClass}`} data-testid={`order-status-${order.id}`}>
          {order.status}
        </span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Create `OrdersPage.module.css`**

```css
.container { max-width: 700px; margin: 0 auto; }
.title { font-size: 24px; margin-bottom: 24px; }
.list { display: flex; flex-direction: column; gap: 12px; }
.empty { text-align: center; color: var(--text-secondary); padding: 48px; }
```

- [ ] **Step 4: Create `OrdersPage.jsx`**

```jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import OrderCard from '../components/OrderCard';
import styles from './OrdersPage.module.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(res => setOrders(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.container} data-testid="orders-page">
      <h1 className={styles.title}>Your Orders</h1>
      {loading ? (
        <div data-testid="loading">Loading...</div>
      ) : orders.length === 0 ? (
        <div className={styles.empty} data-testid="no-orders">No orders yet</div>
      ) : (
        <div className={styles.list}>
          {orders.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create `ReturnCountdown.module.css`**

```css
.countdown { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: rgba(233, 69, 96, 0.1); border: 1px solid var(--accent); border-radius: 6px; font-size: 14px; }
.time { font-weight: 700; color: var(--accent); font-variant-numeric: tabular-nums; }
.expired { color: var(--text-secondary); font-size: 14px; }
```

- [ ] **Step 6: Create `ReturnCountdown.jsx`**

```jsx
import { useState, useEffect } from 'react';
import styles from './ReturnCountdown.module.css';

export default function ReturnCountdown({ purchasedAt }) {
  const [remaining, setRemaining] = useState(() => {
    const deadline = new Date(purchasedAt).getTime() + 600000;
    return Math.max(0, Math.floor((deadline - Date.now()) / 1000));
  });

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setInterval(() => {
      const deadline = new Date(purchasedAt).getTime() + 600000;
      const secs = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [purchasedAt]);

  if (remaining <= 0) {
    return <span className={styles.expired} data-testid="return-expired">Return window expired</span>;
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className={styles.countdown} data-testid="return-countdown">
      Return window: <span className={styles.time}>{mins}:{secs.toString().padStart(2, '0')}</span>
    </div>
  );
}
```

- [ ] **Step 7: Create `OrderDetailPage.module.css`**

```css
.container { max-width: 700px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.title { font-size: 24px; }
.status { padding: 4px 12px; border-radius: 4px; font-size: 14px; font-weight: 600; }
.completed { background: rgba(72, 187, 120, 0.15); color: #48bb78; }
.returned { background: rgba(233, 69, 96, 0.15); color: var(--accent); }
.items { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
.item { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--bg-secondary); border-radius: 6px; border: 1px solid var(--border); }
.itemTitle { font-size: 14px; font-weight: 600; }
.itemQty { color: var(--text-secondary); font-size: 13px; }
.itemPrice { color: var(--accent); font-weight: 600; }
.footer { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: var(--bg-secondary); border-radius: 8px; border: 1px solid var(--border); }
.total { font-size: 20px; font-weight: 700; }
.totalAmount { color: var(--accent); }
.returnBtn { background: var(--accent); color: white; border: none; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; }
.returnBtn:hover { background: var(--accent-hover); }
.returnBtn:disabled { opacity: 0.6; }
.returnSection { margin-top: 24px; display: flex; align-items: center; gap: 16px; }
```

- [ ] **Step 8: Create `OrderDetailPage.jsx`**

```jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ReturnCountdown from '../components/ReturnCountdown';
import styles from './OrderDetailPage.module.css';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [books, setBooks] = useState({});
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`).then(res => {
      setOrder(res.data);
      res.data.items.forEach(item => {
        api.get(`/books/${item.bookId}`).then(r =>
          setBooks(prev => ({ ...prev, [item.bookId]: r.data })));
      });
    }).finally(() => setLoading(false));
  }, [id]);

  const handleReturn = async () => {
    setReturning(true);
    try {
      const res = await api.post(`/orders/${id}/return`);
      setOrder(res.data);
    } finally {
      setReturning(false);
    }
  };

  if (loading) return <div data-testid="loading">Loading...</div>;
  if (!order) return <div data-testid="not-found">Order not found</div>;

  const statusClass = order.status === 'RETURNED' ? styles.returned : styles.completed;
  const deadline = new Date(order.purchasedAt).getTime() + 600000;
  const canReturn = order.status === 'COMPLETED' && Date.now() < deadline;

  return (
    <div className={styles.container} data-testid="order-detail-page">
      <div className={styles.header}>
        <h1 className={styles.title}>Order #{order.id.slice(-8)}</h1>
        <span className={`${styles.status} ${statusClass}`} data-testid={`order-status-${order.id}`}>
          {order.status}
        </span>
      </div>

      <div className={styles.items}>
        {order.items.map((item, idx) => (
          <div key={idx} className={styles.item} data-testid={`order-item-${idx}`}>
            <div>
              <div className={styles.itemTitle}>{books[item.bookId]?.title || 'Loading...'}</div>
              <div className={styles.itemQty}>Qty: {item.quantity}</div>
            </div>
            <div className={styles.itemPrice}>${(item.priceAtPurchase * item.quantity).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.total}>
          Total: <span className={styles.totalAmount} data-testid="order-total">
            ${order.totalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {order.status === 'COMPLETED' && (
        <div className={styles.returnSection}>
          <ReturnCountdown purchasedAt={order.purchasedAt} />
          {canReturn && (
            <button className={styles.returnBtn} data-testid={`return-order-${order.id}`}
                    onClick={handleReturn} disabled={returning}>
              {returning ? 'Returning...' : 'Return Order'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 9: Commit**

```bash
git add frontend/src/components/OrderCard* frontend/src/components/ReturnCountdown* frontend/src/pages/OrdersPage* frontend/src/pages/OrderDetailPage*
git commit -m "feat: add orders page, order detail with return countdown, and order cards"
```

---

## Task 15: Frontend — Marketplace, Create Listing, Profile Pages

**Files:**
- Create: `frontend/src/components/ListingCard.jsx`
- Create: `frontend/src/components/ListingCard.module.css`
- Create: `frontend/src/pages/MarketplacePage.jsx`
- Create: `frontend/src/pages/MarketplacePage.module.css`
- Create: `frontend/src/pages/CreateListingPage.jsx`
- Create: `frontend/src/pages/CreateListingPage.module.css`
- Create: `frontend/src/pages/ProfilePage.jsx`
- Create: `frontend/src/pages/ProfilePage.module.css`

- [ ] **Step 1: Create `ListingCard.module.css`**

```css
.card { background: var(--bg-secondary); border-radius: 8px; border: 1px solid var(--border); padding: 16px; }
.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.title { font-size: 14px; font-weight: 600; }
.condition { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
.NEW { background: rgba(72, 187, 120, 0.15); color: #48bb78; }
.LIKE_NEW { background: rgba(66, 153, 225, 0.15); color: #4299e1; }
.GOOD { background: rgba(236, 201, 75, 0.15); color: #ecc94b; }
.FAIR { background: rgba(160, 174, 192, 0.15); color: #a0aec0; }
.seller { color: var(--text-secondary); font-size: 12px; margin-bottom: 12px; }
.footer { display: flex; justify-content: space-between; align-items: center; }
.price { color: var(--accent); font-size: 18px; font-weight: 700; }
.buyBtn { background: var(--accent); color: white; border: none; padding: 8px 20px; border-radius: 4px; font-size: 13px; }
.buyBtn:hover { background: var(--accent-hover); }
.buyBtn:disabled { opacity: 0.6; }
```

- [ ] **Step 2: Create `ListingCard.jsx`**

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import styles from './ListingCard.module.css';

export default function ListingCard({ listing, onBought }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    api.get(`/books/${listing.bookId}`).then(res => setBook(res.data));
  }, [listing.bookId]);

  const handleBuy = async () => {
    if (!user) { navigate('/login'); return; }
    setBuying(true);
    try {
      const res = await api.post(`/marketplace/listings/${listing.id}/buy`);
      if (onBought) onBought(listing.id);
      navigate(`/orders/${res.data.id}`);
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className={styles.card} data-testid={`listing-card-${listing.id}`}>
      <div className={styles.header}>
        <div className={styles.title} data-testid={`listing-title-${listing.id}`}>
          {book?.title || 'Loading...'}
        </div>
        <span className={`${styles.condition} ${styles[listing.condition]}`}
              data-testid={`listing-condition-badge-${listing.id}`}>
          {listing.condition.replace('_', ' ')}
        </span>
      </div>
      <div className={styles.seller}>by {book?.author || '...'}</div>
      <div className={styles.footer}>
        <span className={styles.price} data-testid={`listing-price-${listing.id}`}>
          ${listing.price.toFixed(2)}
        </span>
        {user && user.userId !== listing.sellerId && (
          <button className={styles.buyBtn} data-testid={`listing-buy-${listing.id}`}
                  onClick={handleBuy} disabled={buying}>
            {buying ? 'Buying...' : 'Buy'}
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `MarketplacePage.module.css`**

```css
.container { max-width: 900px; margin: 0 auto; }
.title { font-size: 24px; margin-bottom: 24px; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.empty { text-align: center; color: var(--text-secondary); padding: 48px; }
@media (max-width: 767px) { .grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
```

- [ ] **Step 4: Create `MarketplacePage.jsx`**

```jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import ListingCard from '../components/ListingCard';
import styles from './MarketplacePage.module.css';

export default function MarketplacePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/marketplace').then(res => setListings(res.data)).finally(() => setLoading(false));
  }, []);

  const handleBought = (id) => {
    setListings(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className={styles.container} data-testid="marketplace-page">
      <h1 className={styles.title}>Marketplace</h1>
      {loading ? (
        <div data-testid="loading">Loading...</div>
      ) : listings.length === 0 ? (
        <div className={styles.empty} data-testid="no-listings">No listings available</div>
      ) : (
        <div className={styles.grid}>
          {listings.map(l => <ListingCard key={l.id} listing={l} onBought={handleBought} />)}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create `CreateListingPage.module.css`**

```css
.container { max-width: 500px; margin: 60px auto; }
.title { font-size: 24px; margin-bottom: 24px; }
.form { display: flex; flex-direction: column; gap: 16px; }
.field label { display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 4px; }
.field select, .field input { width: 100%; padding: 10px 14px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary); font-size: 14px; }
.field select:focus, .field input:focus { outline: none; border-color: var(--accent); }
.submitBtn { background: var(--accent); color: white; border: none; padding: 12px; border-radius: 6px; font-size: 16px; font-weight: 600; }
.submitBtn:hover { background: var(--accent-hover); }
.submitBtn:disabled { opacity: 0.6; }
.error { background: rgba(233, 69, 96, 0.1); border: 1px solid var(--accent); color: var(--accent); padding: 10px 14px; border-radius: 6px; font-size: 13px; }
.success { background: rgba(72, 187, 120, 0.1); border: 1px solid #48bb78; color: #48bb78; padding: 10px 14px; border-radius: 6px; font-size: 13px; }
```

- [ ] **Step 6: Create `CreateListingPage.jsx`**

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './CreateListingPage.module.css';

const CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'];

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [bookId, setBookId] = useState('');
  const [condition, setCondition] = useState('LIKE_NEW');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/books?size=100').then(res => setBooks(res.data.content));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/marketplace/listings', { bookId, condition, price: parseFloat(price) });
      navigate('/marketplace');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container} data-testid="create-listing-page">
      <h1 className={styles.title}>Sell a Book</h1>
      {error && <div className={styles.error} data-testid="listing-error">{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="book">Book</label>
          <select id="book" data-testid="listing-book-select" value={bookId}
                  onChange={e => setBookId(e.target.value)} required>
            <option value="">Select a book...</option>
            {books.map(b => <option key={b.id} value={b.id}>{b.title} - {b.author}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="condition">Condition</label>
          <select id="condition" data-testid="listing-condition" value={condition}
                  onChange={e => setCondition(e.target.value)}>
            {CONDITIONS.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="price">Price ($)</label>
          <input id="price" type="number" step="0.01" min="0.01" data-testid="listing-price"
                 value={price} onChange={e => setPrice(e.target.value)} required />
        </div>
        <button type="submit" className={styles.submitBtn} data-testid="listing-create" disabled={loading}>
          {loading ? 'Creating...' : 'Create Listing'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 7: Create `ProfilePage.module.css`**

```css
.container { max-width: 700px; margin: 0 auto; }
.title { font-size: 24px; margin-bottom: 8px; }
.email { color: var(--text-secondary); margin-bottom: 32px; }
.section { margin-bottom: 32px; }
.sectionTitle { font-size: 18px; margin-bottom: 16px; }
.listings { display: flex; flex-direction: column; gap: 12px; }
.listing { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--bg-secondary); border-radius: 6px; border: 1px solid var(--border); }
.listingInfo { display: flex; flex-direction: column; gap: 2px; }
.listingTitle { font-size: 14px; font-weight: 600; }
.listingMeta { font-size: 12px; color: var(--text-secondary); }
.cancelBtn { background: none; border: 1px solid var(--accent); color: var(--accent); padding: 6px 14px; border-radius: 4px; font-size: 12px; }
.cancelBtn:hover { background: rgba(233, 69, 96, 0.1); }
.empty { color: var(--text-secondary); font-size: 14px; }
```

- [ ] **Step 8: Create `ProfilePage.jsx`**

```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [books, setBooks] = useState({});

  useEffect(() => {
    api.get('/marketplace').then(res => {
      const mine = res.data.filter(l => l.sellerId === user?.userId);
      setListings(mine);
      mine.forEach(l => {
        if (!books[l.bookId]) {
          api.get(`/books/${l.bookId}`).then(r =>
            setBooks(prev => ({ ...prev, [l.bookId]: r.data })));
        }
      });
    });
  }, [user]);

  const handleCancel = async (id) => {
    await api.delete(`/marketplace/listings/${id}`);
    setListings(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className={styles.container} data-testid="profile-page">
      <h1 className={styles.title} data-testid="profile-username">{user?.username}</h1>
      <p className={styles.email} data-testid="profile-email">{user?.email}</p>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>My Listings</h2>
        {listings.length === 0 ? (
          <p className={styles.empty} data-testid="no-listings">No active listings</p>
        ) : (
          <div className={styles.listings}>
            {listings.map(l => (
              <div key={l.id} className={styles.listing} data-testid={`my-listing-${l.id}`}>
                <div className={styles.listingInfo}>
                  <div className={styles.listingTitle}>{books[l.bookId]?.title || '...'}</div>
                  <div className={styles.listingMeta}>
                    {l.condition.replace('_', ' ')} - ${l.price.toFixed(2)} - {l.status}
                  </div>
                </div>
                {l.status === 'ACTIVE' && (
                  <button className={styles.cancelBtn} data-testid={`cancel-listing-${l.id}`}
                          onClick={() => handleCancel(l.id)}>
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Commit**

```bash
git add frontend/src/components/ListingCard* frontend/src/pages/MarketplacePage* frontend/src/pages/CreateListingPage* frontend/src/pages/ProfilePage*
git commit -m "feat: add marketplace, create listing, and profile pages"
```

---

## Task 16: Seed Data & Integration Verification

**Files:**
- Create: `seed-data/books.json` (full 50-book dataset)
- Copy: `backend/src/main/resources/books.json`
- Modify: `backend/build.gradle` (if needed for resource copying)

- [ ] **Step 1: Write full `seed-data/books.json`**

50 books across 6 genres (~8 per genre). Use real titles/authors. Fixed IDs (`book-001` through `book-050`). Prices $5.99-$29.99. Stock 5-20.

- [ ] **Step 2: Copy to backend resources**

```bash
cp seed-data/books.json backend/src/main/resources/books.json
```

- [ ] **Step 3: Run all backend tests**

```bash
cd backend && ./gradlew test -i
```

Expected: ALL PASS

- [ ] **Step 4: Verify frontend builds**

```bash
cd frontend && npm install && npm run build
```

Expected: Build succeeds, `dist/` directory created

- [ ] **Step 5: Verify docker-compose**

```bash
docker-compose build
```

Expected: All three images build successfully

- [ ] **Step 6: Commit**

```bash
git add seed-data/books.json backend/src/main/resources/books.json
git commit -m "feat: add full 50-book seed dataset and verify build"
```

---

## Task 17: Final Integration Test & Cleanup

- [ ] **Step 1: Start the stack**

```bash
docker-compose up -d
```

- [ ] **Step 2: Wait for health check**

```bash
curl -s http://localhost:8080/api/health
```

Expected: `{"status":"healthy","db":"connected"}`

- [ ] **Step 3: Seed the database**

```bash
curl -s -X POST http://localhost:8080/api/seed
```

Expected: `{"status":"seeded"}`

- [ ] **Step 4: Verify books endpoint**

```bash
curl -s http://localhost:8080/api/books?size=5 | jq '.totalElements'
```

Expected: `50`

- [ ] **Step 5: Verify Swagger UI accessible**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/swagger-ui/index.html
```

Expected: `200`

- [ ] **Step 6: Verify frontend accessible**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

Expected: `200`

- [ ] **Step 7: Test signup + login flow via API**

```bash
curl -s -X POST http://localhost:8080/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"username":"testuser","email":"test@test.com","password":"Test1234!"}' | jq '.token'
```

Expected: JWT token string

- [ ] **Step 8: Clean up**

```bash
docker-compose down
```

- [ ] **Step 9: Final commit**

```bash
git add -A
git commit -m "feat: BookHive bookstore test automation target - complete"
```
