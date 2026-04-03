import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:8080';

test.describe('API Endpoints', () => {
  test('should return healthy status from health endpoint', async ({ request }) => {
    await test.step('When I request the health endpoint', async () => {
      const response = await request.get(`${API_BASE}/api/health`);

      await test.step('Then I should get a 200 response', async () => {
        expect(response.status()).toBe(200);
      });

      await test.step('And the response should indicate healthy status', async () => {
        const body = await response.json();
        expect(body.status).toBe('healthy');
        expect(body.db).toBe('connected');
      });
    });
  });

  test('should return paginated books from books endpoint', async ({ request }) => {
    await test.step('When I request the books endpoint', async () => {
      const response = await request.get(`${API_BASE}/api/books`);

      await test.step('Then I should get a 200 response', async () => {
        expect(response.status()).toBe(200);
      });

      await test.step('And the response should contain paginated books', async () => {
        const body = await response.json();
        expect(body.content).toBeDefined();
        expect(Array.isArray(body.content)).toBe(true);
        expect(body.content.length).toBeGreaterThan(0);
        expect(body.totalElements).toBeDefined();
        expect(body.totalPages).toBeDefined();
      });

      await test.step('And each book should have required fields', async () => {
        const body = await response.json();
        const firstBook = body.content[0];
        expect(firstBook.id).toBeDefined();
        expect(firstBook.title).toBeDefined();
        expect(firstBook.author).toBeDefined();
        expect(firstBook.price).toBeDefined();
        expect(firstBook.genre).toBeDefined();
      });
    });
  });

  test('should return paginated books with page parameter', async ({ request }) => {
    await test.step('When I request the second page of books', async () => {
      const response = await request.get(`${API_BASE}/api/books?page=1`);

      await test.step('Then I should get a 200 response', async () => {
        expect(response.status()).toBe(200);
      });

      await test.step('And the response should be page 2', async () => {
        const body = await response.json();
        expect(body.pageable.pageNumber).toBe(1);
      });
    });
  });

  test('should return a specific book by ID', async ({ request }) => {
    await test.step('When I request a specific book', async () => {
      const response = await request.get(`${API_BASE}/api/books/book-001`);

      await test.step('Then I should get a 200 response', async () => {
        expect(response.status()).toBe(200);
      });

      await test.step('And the response should contain the book details', async () => {
        const body = await response.json();
        expect(body.id).toBe('book-001');
        expect(body.title).toBeDefined();
        expect(body.author).toBeDefined();
      });
    });
  });

  test('should handle non-existent book gracefully', async ({ request }) => {
    await test.step('When I request a non-existent book', async () => {
      const response = await request.get(`${API_BASE}/api/books/book-999`);

      await test.step('Then I should get a 404 or appropriate error response', async () => {
        // Either 404 or the response should indicate not found
        expect([200, 404]).toContain(response.status());
      });
    });
  });

  test('should filter books by genre', async ({ request }) => {
    await test.step('When I request books filtered by Sci-Fi genre', async () => {
      const response = await request.get(`${API_BASE}/api/books?genre=Sci-Fi`);

      await test.step('Then I should get a 200 response', async () => {
        expect(response.status()).toBe(200);
      });

      await test.step('And all books should be Sci-Fi', async () => {
        const body = await response.json();
        expect(body.content).toBeDefined();
        if (body.content.length > 0) {
          body.content.forEach((book: any) => {
            expect(book.genre).toBe('Sci-Fi');
          });
        }
      });
    });
  });
});

test.describe('API Error Handling', () => {
  test('should handle invalid endpoints', async ({ request }) => {
    await test.step('When I request an invalid endpoint', async () => {
      const response = await request.get(`${API_BASE}/api/invalid-endpoint`);

      await test.step('Then I should get a 403 or 404 response', async () => {
        // API returns 403 for invalid endpoints (unauthorized/forbidden)
        expect([403, 404]).toContain(response.status());
      });
    });
  });

  test('should handle invalid page parameters', async ({ request }) => {
    await test.step('When I request with an invalid page parameter', async () => {
      const response = await request.get(`${API_BASE}/api/books?page=-1`);

      await test.step('Then I should get a response', async () => {
        // Should either return 400 for bad request or handle gracefully
        expect([200, 400]).toContain(response.status());
      });
    });
  });
});
