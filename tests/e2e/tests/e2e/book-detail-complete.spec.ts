import { test, expect } from '../fixtures/base';

test.describe('Book Detail -- Complete Coverage', () => {
  test.describe.configure({ timeout: 60_000 });

  test('displays all book detail fields for book-001', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.waitForNetworkIdle();

    await steps.verifyPresence('BookDetailPage', 'bookDetailPage');
    await steps.verifyText('BookDetailPage', 'bookTitle', 'To Kill a Mockingbird');
    await steps.verifyText('BookDetailPage', 'bookAuthor', 'Harper Lee');
    await steps.verifyText('BookDetailPage', 'bookGenre', 'Fiction');
    await steps.verifyText('BookDetailPage', 'bookDescription', undefined, { notEmpty: true });
    await steps.verifyTextContains('BookDetailPage', 'bookPrice', '$');
    await steps.verifyTextContains('BookDetailPage', 'stockInfo', 'in stock');
  });

  test('displays all fields for a sci-fi book', async ({ steps }) => {
    await steps.navigateTo('/books/book-009');
    await steps.waitForNetworkIdle();

    await steps.verifyText('BookDetailPage', 'bookTitle', 'Dune');
    await steps.verifyText('BookDetailPage', 'bookAuthor', 'Frank Herbert');
    await steps.verifyText('BookDetailPage', 'bookGenre', 'Sci-Fi');
    await steps.verifyText('BookDetailPage', 'bookDescription', undefined, { notEmpty: true });
    await steps.verifyTextContains('BookDetailPage', 'bookPrice', '$16.99');
  });

  test('add to cart button visible for authenticated user', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/books/book-001');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('BookDetailPage', 'addToCartButton');
    await steps.verifyState('BookDetailPage', 'addToCartButton', 'enabled');
  });

  test('non-existent book shows not found', async ({ steps }) => {
    await steps.navigateTo('/books/nonexistent-id-12345');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('BookDetailPage', 'notFound');
  });

  test('book detail page accessible without login', async ({ steps }) => {
    await steps.navigateTo('/books/book-005');
    await steps.waitForNetworkIdle();
    await steps.verifyText('BookDetailPage', 'bookTitle', 'The Catcher in the Rye');
    await steps.verifyText('BookDetailPage', 'bookAuthor', 'J.D. Salinger');
  });

  test('stock info shows numeric stock count', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.waitForNetworkIdle();
    await steps.verifyText('BookDetailPage', 'stockInfo', undefined, { notEmpty: true });
    const stockText = await steps.getText('BookDetailPage', 'stockInfo');
    expect(stockText).toMatch(/\d+\s+in stock/);
  });
});
