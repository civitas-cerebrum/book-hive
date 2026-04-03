import { test, expect } from '../fixtures/base';

test.describe('Book Detail Page', () => {
  test.describe.configure({ timeout: 60_000 });

  test('should display book details', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'container');
    await steps.verifyPresence('BookDetailPage', 'title');
    await steps.verifyPresence('BookDetailPage', 'author');
    await steps.verifyPresence('BookDetailPage', 'genre');
    await steps.verifyPresence('BookDetailPage', 'price');
  });

  test('should display correct book information for book-001', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyText('BookDetailPage', 'title', 'To Kill a Mockingbird');
    await steps.verifyText('BookDetailPage', 'author', 'Harper Lee');
    await steps.verifyTextContains('BookDetailPage', 'price', '$12.99');
  });

  test('should display stock information', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'stock');
    await steps.verifyTextContains('BookDetailPage', 'stock', 'in stock');
  });

  test('should show Add to Cart button when logged in', async ({ steps }) => {
    const timestamp = Date.now();

    // Create account and login
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `bookdetail${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `bookdetail${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    // Navigate to book detail
    await steps.navigateTo('/books/book-001');
    await steps.verifyPresence('BookDetailPage', 'addToCartBtn');
  });

  test('should not show Add to Cart button when not logged in', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.verifyAbsence('BookDetailPage', 'addToCartBtn');
  });

  test('should add book to cart when clicking Add to Cart', async ({ steps }) => {
    const timestamp = Date.now();

    // Create account and login
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `addtocart${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `addtocart${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    // Navigate to book detail and add to cart
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    // Navigate to cart and verify book is there
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'cartItem');
    await steps.verifyTextContains('CartPage', 'cartItemTitle', 'To Kill a Mockingbird');
  });

  test('should navigate to book detail from homepage book card', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.clickNth('HomePage', 'bookCard', 0);
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('BookDetailPage', 'container');
    await steps.verifyPresence('BookDetailPage', 'title');
  });
});
