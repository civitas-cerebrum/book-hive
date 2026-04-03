import { test, expect } from '../fixtures/base';

test.describe('Shopping Cart', () => {
  test.describe.configure({ timeout: 60_000 });

  test('should display empty cart message when cart is empty', async ({ steps }) => {
    const timestamp = Date.now();

    // Create account and login
    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `emptycart${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `emptycart${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    // Verify logged in
    await steps.verifyPresence('Sidebar', 'logoutBtn');

    // Navigate to cart
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'container');
    await steps.verifyPresence('CartPage', 'emptyMessage');
    await steps.verifyText('CartPage', 'emptyMessage', 'Your cart is empty');
  });

  test('should display cart page with title', async ({ steps }) => {
    const timestamp = Date.now();

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `carttitle${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `carttitle${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    // Verify logged in
    await steps.verifyPresence('Sidebar', 'logoutBtn');

    await steps.navigateTo('/cart');
    await steps.verifyText('CartPage', 'title', 'Shopping Cart');
  });

  test('should add item to cart from homepage', async ({ steps }) => {
    const timestamp = Date.now();

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `additem${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `additem${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    // Verify logged in
    await steps.verifyPresence('Sidebar', 'logoutBtn');

    // Add item from homepage
    await steps.navigateTo('/');
    await steps.waitForState('HomePage', 'addToCartBtn', 'visible');
    await steps.clickNth('HomePage', 'addToCartBtn', 0);
    await steps.waitForNetworkIdle();

    // Check cart
    await steps.navigateTo('/cart');
    await steps.verifyAbsence('CartPage', 'emptyMessage');
    await steps.verifyPresence('CartPage', 'cartItem');
  });

  test('should show total price in cart', async ({ steps }) => {
    const timestamp = Date.now();

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `carttotal${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `carttotal${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    // Verify logged in
    await steps.verifyPresence('Sidebar', 'logoutBtn');

    // Add item - use book detail page for more reliability
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    // Check total
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'total');
    await steps.verifyTextContains('CartPage', 'total', '$');
  });

  test('should show checkout button when cart has items', async ({ steps }) => {
    const timestamp = Date.now();

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `checkout${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `checkout${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    // Verify logged in
    await steps.verifyPresence('Sidebar', 'logoutBtn');

    // Add item
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    // Check checkout button
    await steps.navigateTo('/cart');
    await steps.verifyPresence('CartPage', 'checkoutBtn');
  });

  test('should clear cart when clicking Clear button', async ({ steps }) => {
    const timestamp = Date.now();

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `clearcart${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `clearcart${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    // Verify logged in
    await steps.verifyPresence('Sidebar', 'logoutBtn');

    // Add item
    await steps.navigateTo('/books/book-001');
    await steps.click('BookDetailPage', 'addToCartBtn');
    await steps.waitForNetworkIdle();

    // Clear cart
    await steps.navigateTo('/cart');
    await steps.click('CartPage', 'clearBtn');
    await steps.waitForNetworkIdle();

    // Verify empty
    await steps.verifyPresence('CartPage', 'emptyMessage');
  });

  test('should navigate to cart from sidebar', async ({ steps }) => {
    const timestamp = Date.now();

    await steps.navigateTo('/signup');
    await steps.fill('SignupPage', 'usernameInput', `navtocart${timestamp}`);
    await steps.fill('SignupPage', 'emailInput', `navtocart${timestamp}@test.com`);
    await steps.fill('SignupPage', 'passwordInput', 'password123');
    await steps.click('SignupPage', 'submitBtn');
    await steps.waitForNetworkIdle();

    // Verify logged in
    await steps.verifyPresence('Sidebar', 'logoutBtn');

    // Navigate using sidebar
    await steps.click('Sidebar', 'navCart');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/cart');
    await steps.verifyPresence('CartPage', 'container');
  });
});
