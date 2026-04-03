import { test, expect } from '../fixtures/base';

test.describe('BookDetailPage — Authenticated User', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.page.request.post('http://localhost:8080/api/reset');
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');
  });

  test('shows add-to-cart button when logged in', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.waitForState('BookDetailPage', 'container');
    await steps.verifyPresence('BookDetailPage', 'addToCartBtn');
  });

  test('displays all book details for book-002', async ({ steps }) => {
    await steps.navigateTo('/books/book-002');
    await steps.waitForState('BookDetailPage', 'container');
    await steps.verifyText('BookDetailPage', 'title', 'The Great Gatsby');
    await steps.verifyText('BookDetailPage', 'author', 'F. Scott Fitzgerald');
    await steps.verifyText('BookDetailPage', 'genre', 'Fiction');
    await steps.verifyTextContains('BookDetailPage', 'price', '$10.99');
  });

  test('displays Sci-Fi book details', async ({ steps }) => {
    await steps.navigateTo('/books/book-009');
    await steps.waitForState('BookDetailPage', 'container');
    await steps.verifyText('BookDetailPage', 'title', 'Dune');
    await steps.verifyText('BookDetailPage', 'author', 'Frank Herbert');
    await steps.verifyText('BookDetailPage', 'genre', 'Sci-Fi');
    await steps.verifyTextContains('BookDetailPage', 'price', '$16.99');
  });

  test('displays Non-Fiction book details', async ({ steps }) => {
    await steps.navigateTo('/books/book-018');
    await steps.waitForState('BookDetailPage', 'container');
    await steps.verifyTextContains('BookDetailPage', 'genre', 'Non-Fiction');
  });
});
